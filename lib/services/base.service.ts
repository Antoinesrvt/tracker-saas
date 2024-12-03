import { createClient } from '@/lib/supabase/client';
import type { ServiceContext, ServiceResponse } from '@/types/service.types';
import { LinkableObjectType, TargetType } from '@/types/linkable-objects';

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

  protected async linkObject<T extends LinkableObjectType>(
    object: T,
    targetType: TargetType,
    targetId: string
  ): Promise<ServiceResponse<T>> {
    try {
      await this.checkAccess(targetType, targetId);
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from(object.type + 's') // e.g., 'comments', 'updates'
        .insert({
          ...object,
          target_type: targetType,
          target_id: targetId,
          created_by: this.context.userId
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  protected async getLinkedObjects<T extends LinkableObjectType>(
    targetType: TargetType,
    targetId: string,
    objectType: T['type']
  ): Promise<ServiceResponse<T[]>> {
    try {
      await this.checkAccess(targetType, targetId);
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from(objectType + 's')
        .select('*')
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}