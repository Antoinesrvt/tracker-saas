 import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { createServerSupabase } from '../shared/supabase.ts'
import { createApiResponse, ApiError } from '../shared/api-handler.ts'

const requestSchema = z.object({
  integration_type: z.enum(['github', 'jira', 'slack', 'gitlab', 'azure_devops']),
  event_type: z.string(),
  payload: z.record(z.any()),
  workspace_id: z.string().uuid(),
  signature: z.string()
})

serve((req: Request) => {
  return createApiResponse(async () => {
    const supabase = createServerSupabase()
    const body = await req.json()
    const validatedBody = requestSchema.parse(body)

    // Verify webhook signature
    if (!verifyWebhookSignature(validatedBody.signature, JSON.stringify(validatedBody.payload))) {
      throw new ApiError('Invalid webhook signature', 401)
    }

    // Process webhook based on integration type
    switch (validatedBody.integration_type) {
      case 'github':
        return await handleGithubWebhook(supabase, validatedBody)
      case 'jira':
        return await handleJiraWebhook(supabase, validatedBody)
      case 'slack':
        return await handleSlackWebhook(supabase, validatedBody)
      case 'gitlab':
        return await handleGitlabWebhook(supabase, validatedBody)
      case 'azure_devops':
        return await handleAzureDevOpsWebhook(supabase, validatedBody)
      default:
        throw new ApiError('Unsupported integration type')
    }
  })
})

async function handleGithubWebhook(supabase: any, data: any) {
  const { event_type, payload, workspace_id } = data

  // Handle different GitHub events
  switch (event_type) {
    case 'pull_request':
      return await handleGithubPR(supabase, payload, workspace_id)
    case 'push':
      return await handleGithubPush(supabase, payload, workspace_id)
    case 'issues':
      return await handleGithubIssue(supabase, payload, workspace_id)
    default:
      throw new ApiError('Unsupported GitHub event type')
  }
}

// Implementation of other webhook handlers...