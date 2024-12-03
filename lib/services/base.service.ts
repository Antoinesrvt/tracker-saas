 import { createClient } from '@/lib/supabase/client';
 import type { ServiceContext, ServiceResponse } from '@/types/service.types';

 export abstract class BaseService {
   protected context: ServiceContext;

   constructor(context: ServiceContext) {
     this.context = context;
   }

   protected async hasAccess(
     resourceType: string,
     resourceId: string,
     requiredRoles: string[] = ['owner', 'admin', 'member']
   ): Promise<boolean> {
     const supabase = createClient();
     const { data, error } = await supabase.rpc('has_team_access', {
       target_type: resourceType,
       target_id: resourceId,
       required_roles: requiredRoles
     });

     if (error) throw error;
     return data;
   }

   protected async checkAccess(
     resourceType: string,
     resourceId: string,
     requiredRoles: string[] = ['owner', 'admin', 'member']
   ): Promise<void> {
     const hasAccess = await this.hasAccess(
       resourceType,
       resourceId,
       requiredRoles
     );
     if (!hasAccess) {
       throw new Error('Insufficient permissions');
     }
   }
 }