/**
 * InteractiveChartEditor - Chart with natural language editing
 *
 * Allows users to edit charts by typing natural language instructions:
 * - "Make it blue"
 * - "Change to line chart"
 * - "Add a legend"
 */

import { useState } from 'react';
import { SimpleChart, ChartConfig } from './SimpleChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Download, Loader2, Maximize2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface InteractiveChartEditorProps {
  data: any[];
  columns: string[];
  initialConfig: ChartConfig;
  compact?: boolean; // If true, shows smaller preview
}

export const InteractiveChartEditor = ({
  data,
  columns,
  initialConfig,
  compact = false,
}: InteractiveChartEditorProps) => {
  const [config, setConfig] = useState<ChartConfig>(initialConfig);
  const [editInstruction, setEditInstruction] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showFullEditor, setShowFullEditor] = useState(false);
  const { accessToken } = useAuth();
  const { toast } = useToast();

  const handleRegenerate = async () => {
    if (!editInstruction.trim()) {
      toast({
        title: 'Enter instruction',
        description: 'Please describe how you want to change the chart',
        variant: 'destructive',
      });
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await fetch('/api/regenerate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          current_config: config,
          columns,
          data: data.slice(0, 10), // Send first 10 rows for efficiency
          edit_instruction: editInstruction,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate chart');
      }

      const newConfig = await response.json();
      setConfig(newConfig);
      setEditInstruction('');
      toast({
        title: 'Chart updated!',
        description: 'Your chart has been regenerated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to regenerate chart',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement chart export as PNG/SVG
    toast({
      title: 'Export',
      description: 'Chart export coming soon!',
    });
  };

  const height = compact ? 250 : 400;

  return (
    <>
      <Card className="p-4 space-y-4">
        {/* Chart Preview */}
        <SimpleChart
          data={data}
          columns={columns}
          config={config}
          height={height}
        />

        {/* Control Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {!compact && (
            <>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="e.g., 'make it blue', 'change to line chart'"
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isRegenerating) {
                      handleRegenerate();
                    }
                  }}
                  disabled={isRegenerating}
                />
                <Button
                  onClick={handleRegenerate}
                  disabled={isRegenerating || !editInstruction.trim()}
                  size="sm"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 mr-2" />
                      Update
                    </>
                  )}
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </>
          )}

          {compact && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullEditor(true)}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Customize
            </Button>
          )}
        </div>

        {/* Quick Examples (only in full view) */}
        {!compact && (
          <div className="flex gap-2 flex-wrap">
            <p className="text-xs text-muted-foreground w-full">Quick edits:</p>
            {[
              'Make it blue',
              'Change to line chart',
              'Change to pie chart',
              'Remove legend',
            ].map((example) => (
              <Button
                key={example}
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setEditInstruction(example)}
                disabled={isRegenerating}
              >
                {example}
              </Button>
            ))}
          </div>
        )}
      </Card>

      {/* Full Editor Dialog (for compact mode) */}
      {compact && (
        <Dialog open={showFullEditor} onOpenChange={setShowFullEditor}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chart Editor</DialogTitle>
            </DialogHeader>
            <InteractiveChartEditor
              data={data}
              columns={columns}
              initialConfig={config}
              compact={false}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
