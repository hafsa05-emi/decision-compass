import { useState, useCallback } from 'react';
import type { DecisionProblem, WeightingMode, MCDMMethod } from '@/types/decision';
import type { Criterion, Alternative, MCDMResult } from '@/utils/mcdm';
import {
  calculateWSM,
  calculateWPM,
  calculateWASPAS,
  calculateTOPSIS,
  calculateVIKOR,
  createPairwiseMatrix,
} from '@/utils/mcdm';

const generateId = () => Math.random().toString(36).substring(2, 9);

const createInitialProblem = (): DecisionProblem => ({
  projectName: '',
  numAlternatives: 3,
  numCriteria: 3,
  criteria: [],
  alternatives: [],
  weightingMode: 'direct',
  ahpMatrix: [],
  selectedMethod: null,
  results: null,
});

export function useDecisionWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [problem, setProblem] = useState<DecisionProblem>(createInitialProblem());

  const updateProblem = useCallback((updates: Partial<DecisionProblem>) => {
    setProblem(prev => ({ ...prev, ...updates }));
  }, []);

  const initializeMatrix = useCallback(() => {
    const criteria: Criterion[] = Array(problem.numCriteria)
      .fill(null)
      .map((_, i) => ({
        id: generateId(),
        name: `Criterion ${i + 1}`,
        type: 'benefit',
        weight: 1 / problem.numCriteria,
      }));

    const alternatives: Alternative[] = Array(problem.numAlternatives)
      .fill(null)
      .map((_, i) => ({
        id: generateId(),
        name: `Alternative ${i + 1}`,
        values: Array(problem.numCriteria).fill(0),
      }));

    const ahpMatrix = createPairwiseMatrix(problem.numCriteria);

    setProblem(prev => ({
      ...prev,
      criteria,
      alternatives,
      ahpMatrix,
    }));
  }, [problem.numCriteria, problem.numAlternatives]);

  const updateCriterion = useCallback((index: number, updates: Partial<Criterion>) => {
    setProblem(prev => {
      const newCriteria = [...prev.criteria];
      newCriteria[index] = { ...newCriteria[index], ...updates };
      return { ...prev, criteria: newCriteria };
    });
  }, []);

  const updateAlternative = useCallback((index: number, updates: Partial<Alternative>) => {
    setProblem(prev => {
      const newAlternatives = [...prev.alternatives];
      newAlternatives[index] = { ...newAlternatives[index], ...updates };
      return { ...prev, alternatives: newAlternatives };
    });
  }, []);

  const updateAlternativeValue = useCallback((altIndex: number, critIndex: number, value: number) => {
    setProblem(prev => {
      const newAlternatives = [...prev.alternatives];
      const newValues = [...newAlternatives[altIndex].values];
      newValues[critIndex] = value;
      newAlternatives[altIndex] = { ...newAlternatives[altIndex], values: newValues };
      return { ...prev, alternatives: newAlternatives };
    });
  }, []);

  const updateWeights = useCallback((weights: number[]) => {
    setProblem(prev => {
      const newCriteria = prev.criteria.map((c, i) => ({
        ...c,
        weight: weights[i] ?? c.weight,
      }));
      return { ...prev, criteria: newCriteria };
    });
  }, []);

  const setWeightingMode = useCallback((mode: WeightingMode) => {
    setProblem(prev => {
      if (mode === 'equal') {
        const equalWeight = 1 / prev.criteria.length;
        const newCriteria = prev.criteria.map(c => ({ ...c, weight: equalWeight }));
        return { ...prev, weightingMode: mode, criteria: newCriteria };
      }
      return { ...prev, weightingMode: mode };
    });
  }, []);

  const updateAHPMatrix = useCallback((matrix: number[][]) => {
    setProblem(prev => ({ ...prev, ahpMatrix: matrix }));
  }, []);

  const selectMethod = useCallback((method: MCDMMethod) => {
    setProblem(prev => ({ ...prev, selectedMethod: method }));
  }, []);

  const calculateResults = useCallback((): MCDMResult[] => {
    const { alternatives, criteria, selectedMethod } = problem;
    
    if (!selectedMethod || alternatives.length === 0 || criteria.length === 0) {
      return [];
    }

    let results: MCDMResult[];

    switch (selectedMethod) {
      case 'wsm':
        results = calculateWSM(alternatives, criteria);
        break;
      case 'wpm':
        results = calculateWPM(alternatives, criteria);
        break;
      case 'waspas':
        results = calculateWASPAS(alternatives, criteria);
        break;
      case 'topsis':
        results = calculateTOPSIS(alternatives, criteria);
        break;
      case 'vikor':
        results = calculateVIKOR(alternatives, criteria);
        break;
      default:
        results = [];
    }

    setProblem(prev => ({ ...prev, results }));
    return results;
  }, [problem]);

  const nextStep = useCallback(() => {
    if (currentStep === 1) {
      initializeMatrix();
    }
    if (currentStep === 4) {
      calculateResults();
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  }, [currentStep, initializeMatrix, calculateResults]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setProblem(createInitialProblem());
  }, []);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return problem.projectName.trim() !== '' && 
               problem.numAlternatives >= 2 && 
               problem.numCriteria >= 2;
      case 2:
        const weightsSum = problem.criteria.reduce((sum, c) => sum + c.weight, 0);
        return problem.criteria.every(c => c.name.trim() !== '') &&
               Math.abs(weightsSum - 1) < 0.01;
      case 3:
        return problem.alternatives.every(a => 
          a.name.trim() !== '' && 
          a.values.every(v => !isNaN(v))
        );
      case 4:
        return problem.selectedMethod !== null;
      default:
        return true;
    }
  }, [currentStep, problem]);

  return {
    currentStep,
    problem,
    updateProblem,
    updateCriterion,
    updateAlternative,
    updateAlternativeValue,
    updateWeights,
    setWeightingMode,
    updateAHPMatrix,
    selectMethod,
    calculateResults,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
    canProceed,
  };
}
