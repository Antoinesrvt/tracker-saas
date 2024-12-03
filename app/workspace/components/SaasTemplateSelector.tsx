import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

export const SaasTemplateSelector = ({ workspaceId }: { workspaceId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const handleCreateSaasTemplate = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('instantiate_saas_template', {
          workspace_id: workspaceId,
          template_name: 'saas_launch',
          project_name: 'My SAAS Project',
          user_id: 'current-user-id' // You'll need to provide this
        });

      if (error) throw error;

      // Handle success (e.g., redirect to the workspace view)
      console.log('Template created:', data);
    } catch (error) {
      console.error('Error creating template:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>SAAS Launch Template</CardTitle>
        <CardDescription>
          Complete template for launching a SAAS product from scratch
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm space-y-2">
            <h4 className="font-medium">Includes:</h4>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>Product Development</li>
              <li>Market Research</li>
              <li>Business Operations</li>
              <li>Legal & Compliance</li>
              <li>Pre-defined milestones</li>
              <li>Task templates</li>
            </ul>
          </div>
          <Button 
            onClick={handleCreateSaasTemplate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Creating...' : 'Use Template'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 