 import { BaseService } from './base.service';
 import { createClient } from '@/lib/supabase/client';
 import type { ServiceResponse } from '@/types/service.types';

 export interface Resource {
   id: string;
   title: string;
   type: 'file' | 'link' | 'document' | 'image' | 'video';
   target_type: 'goal' | 'milestone' | 'task' | 'workspace';
   target_id: string;
   link: string;
   encryption_key?: string;
   size?: number;
   mime_type?: string;
   preview_url?: string;
   version: number;
   tags: string[];
   shared_with: Record<string, any>;
   visibility: 'public' | 'private' | 'team' | 'organization';
   metadata: Record<string, any>;
   creator_id: string;
   organization_id: string;
   created_at: string;
   updated_at: string;
 }

 export class ResourceService extends BaseService {
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

   async getTargetResources(
     targetType: string,
     targetId: string
   ): Promise<ServiceResponse<Resource[]>> {
     try {
       await this.checkAccess(targetType, targetId);

       const supabase = createClient();
       const { data, error } = await supabase
         .from('resources')
         .select('*')
         .eq('target_type', targetType)
         .eq('target_id', targetId)
         .order('created_at', { ascending: false });

       if (error) throw error;
       return { data, error: null };
     } catch (error) {
       return { data: null, error: error as Error };
     }
   }

   async uploadResource(
     file: File,
     metadata: {
       title: string;
       target_type: string;
       target_id: string;
       organization_id: string;
       tags?: string[];
       visibility?: Resource['visibility'];
     }
   ): Promise<ServiceResponse<Resource>> {
     try {
       await this.checkAccess(metadata.target_type, metadata.target_id);

       const supabase = createClient();

       // Upload file to storage
       const { data: uploadData, error: uploadError } = await supabase.storage
         .from('resources')
         .upload(`${metadata.organization_id}/${crypto.randomUUID()}`, file);

       if (uploadError) throw uploadError;

       // Create resource record
       const { data: resource, error: resourceError } = await supabase
         .from('resources')
         .insert([
           {
             title: metadata.title,
             type: getResourceType(file.type),
             target_type: metadata.target_type,
             target_id: metadata.target_id,
             link: uploadData.path,
             size: file.size,
             mime_type: file.type,
             tags: metadata.tags || [],
             visibility: metadata.visibility || 'team',
             creator_id: this.context.userId,
             organization_id: metadata.organization_id,
             metadata: {
               original_name: file.name,
               last_modified: file.lastModified
             }
           }
         ])
         .select()
         .single();

       if (resourceError) throw resourceError;
       return { data: resource, error: null };
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

 function getResourceType(mimeType: string): Resource['type'] {
   if (mimeType.startsWith('image/')) return 'image';
   if (mimeType.startsWith('video/')) return 'video';
   if (mimeType.startsWith('application/pdf')) return 'document';
   return 'file';
 }