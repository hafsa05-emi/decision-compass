import type { Criterion, Alternative, MCDMResult } from '@/utils/mcdm';

export type WeightingMode = 'direct' | 'ahp' | 'equal';
export type MCDMMethod = 'wsm' | 'wpm' | 'waspas' | 'topsis' | 'vikor';

export interface DecisionProblem {
  projectName: string;
  numAlternatives: number;
  numCriteria: number;
  criteria: Criterion[];
  alternatives: Alternative[];
  weightingMode: WeightingMode;
  ahpMatrix: number[][];
  selectedMethod: MCDMMethod | null;
  results: MCDMResult[] | null;
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Problem Definition', description: 'Define your decision problem' },
  { id: 2, title: 'Criteria Setup', description: 'Configure evaluation criteria' },
  { id: 3, title: 'Data Entry', description: 'Enter alternative values' },
  { id: 4, title: 'Method Selection', description: 'Choose MCDM algorithm' },
  { id: 5, title: 'Results', description: 'View rankings & analysis' },
];

export const MCDM_METHODS: {
  id: MCDMMethod;
  name: string;
  description: string;
  tooltip: string;
}[] = [
  {
    id: 'wsm',
    name: 'WSM',
    description: 'Weighted Sum Model',
    tooltip: 'Simple additive weighting. Best for criteria with the same unit of measure.',
  },
  {
    id: 'wpm',
    name: 'WPM',
    description: 'Weighted Product Model',
    tooltip: 'Multiplicative weighting. Good for comparing ratios between alternatives.',
  },
  {
    id: 'waspas',
    name: 'WASPAS',
    description: 'Weighted Aggregated Sum Product',
    tooltip: 'Combines WSM and WPM for more robust results. λ=0.5 by default.',
  },
  {
    id: 'topsis',
    name: 'TOPSIS',
    description: 'Ideal Solution Proximity',
    tooltip: 'Finds the alternative closest to ideal and farthest from negative-ideal.',
  },
  {
    id: 'vikor',
    name: 'VIKOR',
    description: 'Compromise Ranking',
    tooltip: 'Focuses on ranking alternatives by closeness to the ideal. Best for conflicting criteria.',
  },
];
