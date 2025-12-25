import { Lightbulb, Grid3X3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DecisionProblem } from '@/types/decision';

interface Step1Props {
  problem: DecisionProblem;
  updateProblem: (updates: Partial<DecisionProblem>) => void;
}

export function Step1ProblemDefinition({ problem, updateProblem }: Step1Props) {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Define Your Decision Problem</h2>
        <p className="text-muted-foreground">
          Start by giving your project a name and defining the matrix size.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl mx-auto">
        {/* Project Name */}
        <Card className="glass-panel">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-primary" />
              Project Name
            </CardTitle>
            <CardDescription>
              Give your decision problem a descriptive name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              id="projectName"
              placeholder="e.g., Choosing a Supplier, Best Location Analysis"
              value={problem.projectName}
              onChange={(e) => updateProblem({ projectName: e.target.value })}
              className="text-base"
            />
          </CardContent>
        </Card>

        {/* Matrix Size */}
        <Card className="glass-panel">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Grid3X3 className="w-5 h-5 text-primary" />
              Matrix Dimensions
            </CardTitle>
            <CardDescription>
              Define how many alternatives and criteria you have
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numAlternatives">Alternatives (rows)</Label>
                <Input
                  id="numAlternatives"
                  type="number"
                  min={2}
                  max={20}
                  value={problem.numAlternatives}
                  onChange={(e) =>
                    updateProblem({ numAlternatives: Math.max(2, parseInt(e.target.value) || 2) })
                  }
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">Options to choose from</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numCriteria">Criteria (columns)</Label>
                <Input
                  id="numCriteria"
                  type="number"
                  min={2}
                  max={15}
                  value={problem.numCriteria}
                  onChange={(e) =>
                    updateProblem({ numCriteria: Math.max(2, parseInt(e.target.value) || 2) })
                  }
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">Factors to evaluate</p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground">
                You will create a <span className="font-semibold text-foreground">{problem.numAlternatives} × {problem.numCriteria}</span> decision matrix
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
