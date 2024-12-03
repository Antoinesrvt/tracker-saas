 export interface ErrorResponse {
   error: string;
   details?: unknown;
   status: number;
 }

 export interface SuccessResponse<T> {
   data: T;
   status: number;
 }

 export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

 export const isErrorResponse = (
   response: unknown
 ): response is ErrorResponse => {
   return (
     typeof response === 'object' && response !== null && 'error' in response
   );
 };