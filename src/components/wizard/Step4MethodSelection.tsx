import { Check, Info } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MCDM_METHODS, type MCDMMethod } from '@/types/decision';

interface Step4Props {
  selectedMethod: MCDMMethod | null;
  selectMethod: (method: MCDMMethod) => void;
}

export function Step4MethodSelection({ selectedMethod, selectMethod }: Step4Props) {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Choose Your Method</h2>
        <p className="text-muted-foreground">
          Select the MCDM algorithm that best fits your decision problem.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {MCDM_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <Tooltip key={method.id}>
              <TooltipTrigger asChild>
                <Card
                  className={cn('method-card', isSelected && 'selected')}
                  onClick={() => selectMethod(method.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{method.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {method.description}
                        </CardDescription>
                      </div>
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                        )}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
                      <Info className="w-3 h-3" />
                      Hover for details
                    </div>
                  </CardHeader>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>{method.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="max-w-2xl mx-auto p-4 rounded-lg bg-muted/50 border border-border/50">
        <h4 className="text-sm font-medium mb-2">Method Comparison</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>WSM/WPM:</strong> Simple, good for single-scale criteria</li>
          <li><strong>WASPAS:</strong> Combines WSM & WPM for robustness</li>
          <li><strong>TOPSIS:</strong> Best for finding solutions closest to ideal</li>
          <li><strong>VIKOR:</strong> Best for compromise solutions with conflicting criteria</li>
        </ul>
      </div>
    </div>
  );
}
