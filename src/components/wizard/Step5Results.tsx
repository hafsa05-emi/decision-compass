import { Trophy, Download, BarChart3, Radar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { DecisionProblem, MCDMMethod } from '@/types/decision';
import type { MCDMResult } from '@/utils/mcdm';
import { exportToCSV, downloadCSV, linearNormalize } from '@/utils/mcdm';
import { MCDM_METHODS } from '@/types/decision';

interface Step5Props {
  problem: DecisionProblem;
  resetWizard: () => void;
}

export function Step5Results({ problem, resetWizard }: Step5Props) {
  const { results, selectedMethod, criteria, alternatives } = problem;
  const methodInfo = MCDM_METHODS.find((m) => m.id === selectedMethod);

  if (!results || results.length === 0) {
    return (
      <div className="animate-fade-in text-center py-12">
        <p className="text-muted-foreground">No results available. Please complete all previous steps.</p>
      </div>
    );
  }

  const handleExport = () => {
    const csv = exportToCSV(results, methodInfo?.name || 'MCDM');
    downloadCSV(csv, `${problem.projectName || 'decision'}_results.csv`);
  };

  // Prepare bar chart data
  const barChartData = results.map((r) => ({
    name: r.alternativeName,
    score: selectedMethod === 'vikor' ? 1 - r.score : r.score, // Invert VIKOR for visualization
    rank: r.rank,
  }));

  // Prepare radar chart data for top 3
  const top3 = results.slice(0, 3);
  const types = criteria.map((c) => c.type);
  const normalizedMatrix = linearNormalize(
    alternatives.map((a) => a.values),
    types
  );

  const radarData = criteria.map((crit, j) => {
    const dataPoint: Record<string, string | number> = { criterion: crit.name || `C${j + 1}` };
    top3.forEach((result) => {
      const altIndex = alternatives.findIndex((a) => a.id === result.alternativeId);
      if (altIndex >= 0) {
        dataPoint[result.alternativeName] = normalizedMatrix[altIndex][j];
      }
    });
    return dataPoint;
  });

  const radarColors = ['hsl(239, 84%, 67%)', 'hsl(173, 58%, 39%)', 'hsl(38, 92%, 50%)'];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Results & Analysis</h2>
        <p className="text-muted-foreground">
          {methodInfo?.name} rankings for "{problem.projectName}"
        </p>
      </div>

      {/* Winner Card */}
      <Card className="glass-panel border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Ranked Alternative</p>
              <h3 className="text-2xl font-bold">{results[0].alternativeName}</h3>
              <p className="text-sm text-muted-foreground">
                Score: <span className="font-mono">{results[0].score.toFixed(4)}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="glass-panel">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-primary" />
              Complete Rankings
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium">Rank</th>
                  <th className="text-left p-3 text-sm font-medium">Alternative</th>
                  <th className="text-right p-3 text-sm font-medium">
                    {selectedMethod === 'vikor' ? 'Q Score' : 'Score'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={result.alternativeId}
                    className={cn(
                      'border-b border-border/50 transition-colors hover:bg-muted/50',
                      index === 0 && 'bg-primary/5'
                    )}
                  >
                    <td className="p-3">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                          index === 0 && 'bg-primary text-primary-foreground',
                          index === 1 && 'bg-muted text-foreground',
                          index === 2 && 'bg-muted text-foreground',
                          index > 2 && 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        {result.rank}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{result.alternativeName}</td>
                    <td className="p-3 text-right font-mono">{result.score.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="glass-panel">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              Score Comparison
            </CardTitle>
            <CardDescription>Visual comparison of all alternatives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="glass-panel">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Radar className="w-5 h-5 text-primary" />
              Top 3 Performance Profile
            </CardTitle>
            <CardDescription>Normalized performance across criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="criterion"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 1]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                  />
                  {top3.map((result, idx) => (
                    <RechartsRadar
                      key={result.alternativeId}
                      name={result.alternativeName}
                      dataKey={result.alternativeName}
                      stroke={radarColors[idx]}
                      fill={radarColors[idx]}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={resetWizard} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Start New Analysis
        </Button>
      </div>
    </div>
  );
}
