import { Table, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { DecisionProblem } from '@/types/decision';
import type { Alternative } from '@/utils/mcdm';

interface Step3Props {
  problem: DecisionProblem;
  updateAlternative: (index: number, updates: Partial<Alternative>) => void;
  updateAlternativeValue: (altIndex: number, critIndex: number, value: number) => void;
}

export function Step3DataEntry({
  problem,
  updateAlternative,
  updateAlternativeValue,
}: Step3Props) {
  const handleValueChange = (altIndex: number, critIndex: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateAlternativeValue(altIndex, critIndex, numValue);
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Enter Your Data</h2>
        <p className="text-muted-foreground">
          Fill in the performance values for each alternative across all criteria.
        </p>
      </div>

      <Card className="glass-panel">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Table className="w-5 h-5 text-primary" />
            Decision Matrix
          </CardTitle>
          <CardDescription>
            Use Tab to navigate between cells. All values should be numeric.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b border-border">
                    <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Pencil className="w-4 h-4" />
                      Alternative
                    </span>
                  </th>
                  {problem.criteria.map((criterion, j) => (
                    <th key={j} className="p-2 border-b border-border text-center min-w-[100px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <p className="text-sm font-medium truncate max-w-[120px]">
                              {criterion.name || `C${j + 1}`}
                            </p>
                            <span
                              className={cn(
                                'text-xs',
                                criterion.type === 'benefit'
                                  ? 'text-success'
                                  : 'text-warning'
                              )}
                            >
                              {criterion.type === 'benefit' ? '↑ Max' : '↓ Min'}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Weight: {(criterion.weight * 100).toFixed(1)}%</p>
                          <p>{criterion.type === 'benefit' ? 'Higher is better' : 'Lower is better'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {problem.alternatives.map((alternative, i) => (
                  <tr key={alternative.id} className="group">
                    <td className="p-1">
                      <Input
                        value={alternative.name}
                        onChange={(e) =>
                          updateAlternative(i, { name: e.target.value })
                        }
                        className="font-medium border-transparent hover:border-border focus:border-primary"
                        placeholder={`Alternative ${i + 1}`}
                      />
                    </td>
                    {problem.criteria.map((_, j) => (
                      <td key={j} className="p-1">
                        <div className="data-cell">
                          <input
                            type="number"
                            step="any"
                            value={alternative.values[j] || ''}
                            onChange={(e) =>
                              handleValueChange(i, j, e.target.value)
                            }
                            placeholder="0"
                            className="w-full"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
            <h4 className="text-sm font-medium mb-2">Quick Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Press <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">Tab</kbd> to move to the next cell</li>
              <li>• All values should be in the same unit for each criterion</li>
              <li>• Larger matrices may take longer to process</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
