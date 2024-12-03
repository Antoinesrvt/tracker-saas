import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { createServerSupabase } from '../shared/supabase'
import { createApiResponse, ApiError } from '../shared/api-handler'
import type { 
  SearchRequest, 
  SearchResponse, 
  SearchQueryParams,
  SearchResult 
} from '../shared/types/search.ts'
import type { SupabaseClient } from '@supabase/supabase-js'

const requestSchema = z.object({
  query: z.string().min(2),
  workspace_id: z.string().uuid(),
  types: z.array(
    z.enum(['goals', 'tasks', 'milestones', 'resources'])
  ).optional(),
  filters: z.record(z.any()).optional(),
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(100).default(20)
})

serve((req: Request) => {
  return createApiResponse(async () => {
    const supabase = createServerSupabase()
    const body = await req.json() as SearchRequest
    const validatedBody = requestSchema.parse(body)

    // Check workspace access
    const { data: hasAccess } = await supabase.rpc('has_team_access', {
      target_type: 'workspace',
      target_id: validatedBody.workspace_id,
      required_roles: ['owner', 'admin', 'member', 'viewer']
    })

    if (!hasAccess) {
      throw new ApiError('Insufficient permissions', 403)
    }

    const searchTypes = validatedBody.types || ['goals', 'tasks', 'milestones', 'resources']
    const offset = (validatedBody.page - 1) * validatedBody.per_page

    const results = await Promise.all(
      searchTypes.map(type =>
        searchEntities(supabase, {
          type,
          query: validatedBody.query,
          workspace_id: validatedBody.workspace_id,
          filters: validatedBody.filters,
          limit: validatedBody.per_page,
          offset
        })
      )
    )

    const response: SearchResponse = {
      results: results.reduce(
        (acc, curr, idx) => ({
          ...acc,
          [searchTypes[idx]]: curr
        }),
        {}
      ),
      pagination: {
        page: validatedBody.page,
        per_page: validatedBody.per_page,
        total: results.reduce((sum, curr) => sum + curr.total, 0)
      }
    }

    return response
  })
})

async function searchEntities(
  supabase: SupabaseClient,
  params: SearchQueryParams
): Promise<SearchResult<any>> {
  const searchQuery = supabase
    .from(params.type)
    .select('*', { count: 'exact' })
    .textSearch(
      'fts',
      params.query,
      {
        config: 'english',
        type: 'websearch'
      }
    )
    .eq('workspace_id', params.workspace_id)
    .range(params.offset, params.offset + params.limit - 1)

  // Apply additional filters
  if (params.filters?.[params.type]) {
    Object.entries(params.filters[params.type]).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        searchQuery.in(key, value)
      } else {
        searchQuery.eq(key, value)
      }
    })
  }

  const { data, error, count } = await searchQuery

  if (error) throw new ApiError(error.message)

  return {
    items: data || [],
    total: count || 0
  }
}