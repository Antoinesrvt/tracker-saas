 import { ErrorResponse, ApiResponse } from './types';

 export class ApiError extends Error {
   constructor(
     message: string,
     public status: number = 400,
     public details?: unknown
   ) {
     super(message);
   }
 }

 export const handleApiError = (error: unknown): ErrorResponse => {
   console.error('API Error:', error);

   if (error instanceof ApiError) {
     return {
       error: error.message,
       details: error.details,
       status: error.status
     };
   }

   if (error instanceof Error) {
     return {
       error: error.message,
       status: 500
     };
   }

   return {
     error: 'An unexpected error occurred',
     status: 500
   };
 };

 export const createApiResponse = async <T>(
   handler: () => Promise<T>
 ): Promise<Response> => {
   try {
     const data = await handler();
     const response: ApiResponse<T> = {
       data,
       status: 200
     };
     return new Response(JSON.stringify(response), {
       headers: { 'Content-Type': 'application/json' },
       status: 200
     });
   } catch (error) {
     const errorResponse = handleApiError(error);
     return new Response(JSON.stringify(errorResponse), {
       headers: { 'Content-Type': 'application/json' },
       status: errorResponse.status
     });
   }
 };