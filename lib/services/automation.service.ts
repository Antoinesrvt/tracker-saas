import { BaseService } from './base.service';
import { createClient } from '@/lib/supabase/client';
import type { ServiceResponse } from '@/types/service.types';

export interface Automation {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  trigger_type: 'event' | 'schedule' | 'condition';
  trigger_config: {
    event?: string;
    cron?: string;
    condition?: Record<string, any>;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  is_active: boolean;
  last_run?: string;
  run_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
}

export class AutomationService extends BaseService {
  async getWorkspaceAutomations(
    workspaceId: string
  ): Promise<ServiceResponse<Automation[]>> {
    try {
      await this.checkAccess('workspace', workspaceId);

      const supabase = createClient();
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createAutomation(
    automation: Partial<Automation>
  ): Promise<ServiceResponse<Automation>> {
    try {
      await this.checkAccess('workspace', automation.workspace_id!, [
        'owner',
        'admin'
      ]);

      const supabase = createClient();
      const { data, error } = await supabase
        .from('automations')
        .insert([automation])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateAutomation(
    id: string,
    updates: Partial<Automation>
  ): Promise<ServiceResponse<Automation>> {
    try {
      const supabase = createClient();

      // Get automation to check access
      const { data: automation, error: getError } = await supabase
        .from('automations')
        .select('workspace_id')
        .eq('id', id)
        .single();

      if (getError) throw getError;
      await this.checkAccess('workspace', automation.workspace_id, [
        'owner',
        'admin'
      ]);

      const { data, error } = await supabase
        .from('automations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteAutomation(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const supabase = createClient();

      // Get automation to check access
      const { data: automation, error: getError } = await supabase
        .from('automations')
        .select('workspace_id')
        .eq('id', id)
        .single();

      if (getError) throw getError;
      await this.checkAccess('workspace', automation.workspace_id, [
        'owner',
        'admin'
      ]);

      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: error as Error };
    }
  }

  async executeAutomation(id: string): Promise<ServiceResponse<any>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke(
        'task-automation',
        {
          body: {
            automation_id: id,
            action_type: 'execute'
          }
        }
      );

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getAutomationHistory(id: string): Promise<ServiceResponse<any[]>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('automation_runs')
        .select('*')
        .eq('automation_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
