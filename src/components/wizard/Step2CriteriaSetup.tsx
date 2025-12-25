import { useState } from 'react';
import { TrendingUp, TrendingDown, Scale, Info, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { DecisionProblem, WeightingMode } from '@/types/decision';
import type { Criterion, CriterionType } from '@/utils/mcdm';
import { calculateAHP, updatePairwiseMatrix } from '@/utils/mcdm';

interface Step2Props {
  problem: DecisionProblem;
  updateCriterion: (index: number, updates: Partial<Criterion>) => void;
  updateWeights: (weights: number[]) => void;
  setWeightingMode: (mode: WeightingMode) => void;
  updateAHPMatrix: (matrix: number[][]) => void;
}

const AHP_SCALE = [
  { value: 1, label: 'Equal' },
  { value: 3, label: 'Moderate' },
  { value: 5, label: 'Strong' },
  { value: 7, label: 'Very Strong' },
  { value: 9, label: 'Extreme' },
];

export function Step2CriteriaSetup({
  problem,
  updateCriterion,
  updateWeights,
  setWeightingMode,
  updateAHPMatrix,
}: Step2Props) {
  const [ahpResult, setAhpResult] = useState<{ cr: number; isConsistent: boolean } | null>(null);

  const weightsSum = problem.criteria.reduce((sum, c) => sum + c.weight, 0);
  const isWeightsSumValid = Math.abs(weightsSum - 1) < 0.01;

  const handleWeightChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateCriterion(index, { weight: numValue });
  };

  const handleAHPCellChange = (row: number, col: number, value: number) => {
    const newMatrix = updatePairwiseMatrix(problem.ahpMatrix, row, col, value);
    updateAHPMatrix(newMatrix);
  };

  const calculateAHPWeights = () => {
    const result = calculateAHP(problem.ahpMatrix);
    setAhpResult({ cr: result.consistencyRatio, isConsistent: result.isConsistent });
    if (result.weights.length > 0) {
      updateWeights(result.weights);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Configure Your Criteria</h2>
        <p className="text-muted-foreground">
          Name each criterion and specify whether higher or lower values are better.
        </p>
      </div>

      {/* Criteria List */}
      <Card className="glass-panel">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="w-5 h-5 text-primary" />
            Criteria Definition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {problem.criteria.map((criterion, index) => (
              <div
                key={criterion.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <span className="text-sm font-medium text-muted-foreground w-8">
                  C{index + 1}
                </span>
                <Input
                  placeholder="Criterion name"
                  value={criterion.name}
                  onChange={(e) => updateCriterion(index, { name: e.target.value })}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant={criterion.type === 'benefit' ? 'default' : 'outline'}
                        onClick={() => updateCriterion(index, { type: 'benefit' })}
                        className="gap-1"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Benefit
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Higher values are better (maximize)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant={criterion.type === 'cost' ? 'default' : 'outline'}
                        onClick={() => updateCriterion(index, { type: 'cost' })}
                        className="gap-1"
                      >
                        <TrendingDown className="w-4 h-4" />
                        Cost
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Lower values are better (minimize)</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weighting Mode */}
      <Card className="glass-panel">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            Weighting Method
          </CardTitle>
          <CardDescription>Choose how to determine the importance of each criterion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={problem.weightingMode}
            onValueChange={(value) => setWeightingMode(value as WeightingMode)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <Label
              htmlFor="equal"
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                problem.weightingMode === 'equal'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <RadioGroupItem value="equal" id="equal" />
              <div>
                <p className="font-medium">Equal Weights</p>
                <p className="text-xs text-muted-foreground">All criteria weighted equally</p>
              </div>
            </Label>

            <Label
              htmlFor="direct"
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                problem.weightingMode === 'direct'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <RadioGroupItem value="direct" id="direct" />
              <div>
                <p className="font-medium">Direct Input</p>
                <p className="text-xs text-muted-foreground">Enter weights manually</p>
              </div>
            </Label>

            <Label
              htmlFor="ahp"
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                problem.weightingMode === 'ahp'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <RadioGroupItem value="ahp" id="ahp" />
              <div>
                <p className="font-medium">AHP Mode</p>
                <p className="text-xs text-muted-foreground">Pairwise comparisons</p>
              </div>
            </Label>
          </RadioGroup>

          {/* Direct Input Mode */}
          {problem.weightingMode === 'direct' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid gap-3">
                {problem.criteria.map((criterion, index) => (
                  <div key={criterion.id} className="flex items-center gap-3">
                    <span className="text-sm w-32 truncate">{criterion.name || `Criterion ${index + 1}`}</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={criterion.weight}
                      onChange={(e) => handleWeightChange(index, e.target.value)}
                      className="w-24 font-mono text-right"
                    />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${criterion.weight * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {(criterion.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
              <div
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg text-sm',
                  isWeightsSumValid
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                )}
              >
                {isWeightsSumValid ? (
                  <>✓ Weights sum to {(weightsSum * 100).toFixed(1)}%</>
                ) : (
                  <>⚠ Weights must sum to 100% (currently {(weightsSum * 100).toFixed(1)}%)</>
                )}
              </div>
            </div>
          )}

          {/* AHP Mode */}
          {problem.weightingMode === 'ahp' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                <Info className="w-4 h-4 mt-0.5 text-primary" />
                <p>
                  Compare criteria pairwise: How much more important is the row criterion compared to the column?
                  Values: 1=Equal, 3=Moderate, 5=Strong, 7=Very Strong, 9=Extreme
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-sm font-medium"></th>
                      {problem.criteria.map((c, j) => (
                        <th key={j} className="p-2 text-center text-sm font-medium truncate max-w-20">
                          {c.name || `C${j + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {problem.criteria.map((rowCrit, i) => (
                      <tr key={i}>
                        <td className="p-2 text-sm font-medium truncate max-w-24">
                          {rowCrit.name || `C${i + 1}`}
                        </td>
                        {problem.criteria.map((_, j) => (
                          <td key={j} className="p-1">
                            {i === j ? (
                              <div className="data-cell text-center bg-muted">1</div>
                            ) : i < j ? (
                              <select
                                value={problem.ahpMatrix[i]?.[j] || 1}
                                onChange={(e) => handleAHPCellChange(i, j, parseFloat(e.target.value))}
                                className="w-full p-2 border rounded text-sm bg-background"
                              >
                                {[1/9, 1/7, 1/5, 1/3, 1, 3, 5, 7, 9].map((v) => (
                                  <option key={v} value={v}>
                                    {v >= 1 ? v : `1/${Math.round(1/v)}`}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="data-cell text-center text-muted-foreground">
                                {(problem.ahpMatrix[i]?.[j] || 1).toFixed(2)}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Button onClick={calculateAHPWeights} className="gap-2">
                  <Scale className="w-4 h-4" />
                  Calculate Weights
                </Button>

                {ahpResult && (
                  <div
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg text-sm',
                      ahpResult.isConsistent
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    )}
                  >
                    {ahpResult.isConsistent ? (
                      <>✓ Consistency Ratio: {(ahpResult.cr * 100).toFixed(1)}% (acceptable)</>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        CR: {(ahpResult.cr * 100).toFixed(1)}% exceeds 10% threshold. Please revise comparisons.
                      </>
                    )}
                  </div>
                )}
              </div>

              {ahpResult && (
                <div className="grid gap-2">
                  <p className="text-sm font-medium">Calculated Weights:</p>
                  {problem.criteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm w-32 truncate">{c.name || `C${i + 1}`}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${c.weight * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono w-16 text-right">
                        {(c.weight * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
