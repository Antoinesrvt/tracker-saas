 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { ResourceService } from '@/lib/services/resource.service';
 import { useAuth } from '@/lib/providers/auth-provider';
 import type { Resource } from '@/lib/services/resource.service';
 import { useState, useCallback } from 'react';
 
 // Get a single resource
 export function useResource(id: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new ResourceService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['resource', id],
     queryFn: () => service.getResource(id),
     enabled: !!id
   });
 }

 // Get resources for a specific target (goal, task, etc.)
 export function useTargetResources(targetType: string, targetId: string) {
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new ResourceService({ userId: user.id, teamAccess });

   return useQuery({
     queryKey: ['target-resources', targetType, targetId],
     queryFn: () => service.getTargetResources(targetType, targetId),
     enabled: !!(targetType && targetId)
   });
 }

 // Upload a new resource
 export function useUploadResource() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new ResourceService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: ({
       file,
       metadata
     }: {
       file: File;
       metadata: Parameters<ResourceService['uploadResource']>[1];
     }) => service.uploadResource(file, metadata),
     onSuccess: (data, variables) => {
       // Invalidate relevant queries
       queryClient.invalidateQueries({
         queryKey: [
           'target-resources',
           variables.metadata.target_type,
           variables.metadata.target_id
         ]
       });
       if (data.data?.id) {
         queryClient.invalidateQueries({
           queryKey: ['resource', data.data.id]
         });
       }
     }
   });
 }

 // Delete a resource
 export function useDeleteResource() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new ResourceService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: (resourceId: string) => service.deleteResource(resourceId),
     onSuccess: (_, resourceId) => {
       queryClient.invalidateQueries({ queryKey: ['resource', resourceId] });
       // Invalidate all target-resources queries as we don't know the target type/id here
       queryClient.invalidateQueries({
         predicate: (query) => query.queryKey[0] === 'target-resources'
       });
     }
   });
 }

 // Update resource metadata
 export function useUpdateResourceMetadata() {
   const queryClient = useQueryClient();
   const { user, teamAccess } = useAuth();
   if (!user) throw new Error('User not found');
   const service = new ResourceService({ userId: user.id, teamAccess });

   return useMutation({
     mutationFn: ({
       id,
       updates
     }: {
       id: string;
       updates: Parameters<ResourceService['updateResourceMetadata']>[1];
     }) => service.updateResourceMetadata(id, updates),
     onSuccess: (data) => {
       if (data.data) {
         queryClient.invalidateQueries({
           queryKey: ['resource', data.data.id]
         });
         queryClient.invalidateQueries({
           queryKey: [
             'target-resources',
             data.data.target_type,
             data.data.target_id
           ]
         });
       }
     }
   });
 }

 // Custom hook for file upload with progress
 export function useFileUpload() {
   const upload = useUploadResource();
   const [progress, setProgress] = useState(0);

   const uploadWithProgress = useCallback(
     async (
       file: File,
       metadata: Parameters<ResourceService['uploadResource']>[1]
     ) => {
       try {
         // Reset progress
         setProgress(0);

         // Create upload observer
         const uploadObserver = {
           next: (progress: number) => {
             setProgress(progress);
           },
           error: (error: Error) => {
             throw error;
           },
           complete: () => {
             setProgress(100);
           }
         };

         // Start upload with progress tracking
         return await upload.mutateAsync({
           file,
           metadata,
           observer: uploadObserver
         });
       } catch (error) {
         setProgress(0);
         throw error;
       }
     },
     [upload]
   );

   return {
     uploadWithProgress,
     progress,
     isUploading: upload.isLoading
   };
 }

 // Hook for handling resource sharing
 export function useResourceSharing() {
   const updateMetadata = useUpdateResourceMetadata();

   const shareResource = useCallback(
     async (
       resourceId: string,
       shareWith: {
         users?: string[];
         teams?: string[];
         visibility?: Resource['visibility'];
       }
     ) => {
       return updateMetadata.mutateAsync({
         id: resourceId,
         updates: {
           shared_with: shareWith,
           visibility: shareWith.visibility || 'team'
         }
       });
     },
     [updateMetadata]
   );

   return {
     shareResource,
     isSharing: updateMetadata.isLoading,
     error: updateMetadata.error
   };
 }