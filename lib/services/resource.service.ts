import { BaseService } from './base.service';
import { createClient } from '@/lib/supabase/client';
import type { ServiceResponse } from '@/types/service.types';
import type { LinkableObject } from '@/types/linkable-objects';

// Define Resource specific interface
export interface Resource extends LinkableObject {
  type: 'resource';
  title: string;
  description?: string;
  file_type: 'file' | 'link' | 'document';
  url: string;
  size?: number;
  metadata: Record<string, any>;
  visibility: 'public' | 'team' | 'private';
  tags?: string[];
}

export class ResourceService extends BaseService {
  // Existing methods remain the same
  async getResource(id: string): Promise<ServiceResponse<Resource>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Enhanced method using base service
  async getTargetResources(
    targetType: TargetType,
    targetId: string
  ): Promise<ServiceResponse<Resource[]>> {
    return this.getLinkedObjects<Resource>(targetType, targetId, 'resource');
  }

  // Enhanced upload method
  async uploadResource(
    file: File,
    metadata: {
      targetType: TargetType;
      targetId: string;
      title: string;
      visibility?: Resource['visibility'];
      tags?: string[];
    }
  ): Promise<ServiceResponse<Resource>> {
    try {
      const supabase = createClient();
      
      // Upload file to storage
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(`${metadata.targetId}/${file.name}`, file);

      if (uploadError) throw uploadError;

      // Create resource record using base service
      const resource: Partial<Resource> = {
        type: 'resource',
        title: metadata.title,
        file_type: 'file',
        url: fileData.path,
        size: file.size,
        visibility: metadata.visibility || 'team',
        tags: metadata.tags,
        metadata: {
          originalName: file.name,
          mimeType: file.type
        }
      };

      return this.linkObject(resource as Resource, metadata.targetType, metadata.targetId);
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

    async deleteResource(id: string): Promise<ServiceResponse<boolean>> {
     try {
       const supabase = createClient();

       // Get resource to check access and get storage path
       const { data: resource, error: getError } = await supabase
         .from('resources')
         .select('*')
         .eq('id', id)
         .single();

       if (getError) throw getError;

       await this.checkAccess(resource.target_type, resource.target_id, [
         'owner',
         'admin'
       ]);

       // Delete from storage if it's a file
       if (resource.link && !resource.link.startsWith('http')) {
         const { error: storageError } = await supabase.storage
           .from('resources')
           .remove([resource.link]);

         if (storageError) throw storageError;
       }

       // Delete resource record
       const { error: deleteError } = await supabase
         .from('resources')
         .delete()
         .eq('id', id);

       if (deleteError) throw deleteError;
       return { data: true, error: null };
     } catch (error) {
       return { data: false, error: error as Error };
     }
   }

   async updateResourceMetadata(
     id: string,
     updates: Partial<
       Pick<
         Resource,
         'title' | 'tags' | 'visibility' | 'shared_with' | 'metadata'
       >
     >
   ): Promise<ServiceResponse<Resource>> {
     try {
       const supabase = createClient();

       // Get resource to check access
       const { data: resource, error: getError } = await supabase
         .from('resources')
         .select('target_type, target_id')
         .eq('id', id)
         .single();

       if (getError) throw getError;

       await this.checkAccess(resource.target_type, resource.target_id, [
         'owner',
         'admin'
       ]);

       const { data, error } = await supabase
         .from('resources')
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
 }

 export function getResourceType(mimeType: string): Resource['type'] {
   if (mimeType.startsWith('image/')) return 'image';
   if (mimeType.startsWith('video/')) return 'video';
   if (mimeType.startsWith('application/pdf')) return 'document';
   return 'file';
 }
