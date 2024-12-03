 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { OrganizationService } from '@/lib/services/organization.service'
import { useAuth } from '@/lib/providers/auth-provider'
import type { Organization } from '@/types/service.types'

export function useOrganization(id: string) {
  const { user, teamAccess } = useAuth()
  if (!user) throw new Error('User not found')
  const service = new OrganizationService({ userId: user.id, teamAccess })

  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => service.getOrganization(id),
    enabled: !!id
  })
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient()
  const { user, teamAccess } = useAuth()
  if (!user) throw new Error('User not found')
  const service = new OrganizationService({ userId: user.id, teamAccess })

  return useMutation({
    mutationFn: ({ 
      id, 
      settings 
    }: { 
      id: string
      settings: Parameters<OrganizationService['updateOrganizationSettings']>[1]
    }) => service.updateOrganizationSettings(id, settings),
    onSuccess: (data) => {
      if (data.data?.id) {
        queryClient.invalidateQueries({ queryKey: ['organization', data.data.id] })
      }
    }
  })
}

// Add hooks for subscription management, team management, etc.