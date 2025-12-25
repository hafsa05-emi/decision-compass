// Multi-Criteria Decision Making Algorithms

export type CriterionType = 'benefit' | 'cost';

export interface Criterion {
  id: string;
  name: string;
  type: CriterionType;
  weight: number;
}

export interface Alternative {
  id: string;
  name: string;
  values: number[];
}

export interface MCDMResult {
  alternativeId: string;
  alternativeName: string;
  score: number;
  rank: number;
  details?: Record<string, number>;
}

// Normalize weights to sum to 1
export function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return weights.map(() => 1 / weights.length);
  return weights.map(w => w / sum);
}

// Linear normalization (for WSM, WPM, WASPAS, VIKOR)
export function linearNormalize(
  matrix: number[][],
  criteriaTypes: CriterionType[]
): number[][] {
  const numCriteria = criteriaTypes.length;
  const numAlternatives = matrix.length;
  
  const normalized: number[][] = matrix.map(() => new Array(numCriteria).fill(0));
  
  for (let j = 0; j < numCriteria; j++) {
    const column = matrix.map(row => row[j]);
    const max = Math.max(...column);
    const min = Math.min(...column);
    
    for (let i = 0; i < numAlternatives; i++) {
      if (max === min) {
        normalized[i][j] = 1;
      } else if (criteriaTypes[j] === 'benefit') {
        normalized[i][j] = (matrix[i][j] - min) / (max - min);
      } else {
        normalized[i][j] = (max - matrix[i][j]) / (max - min);
      }
    }
  }
  
  return normalized;
}

// Vector normalization (for TOPSIS)
export function vectorNormalize(matrix: number[][]): number[][] {
  const numCriteria = matrix[0]?.length || 0;
  const numAlternatives = matrix.length;
  
  const normalized: number[][] = matrix.map(() => new Array(numCriteria).fill(0));
  
  for (let j = 0; j < numCriteria; j++) {
    const sumSquares = matrix.reduce((sum, row) => sum + row[j] * row[j], 0);
    const denominator = Math.sqrt(sumSquares);
    
    for (let i = 0; i < numAlternatives; i++) {
      normalized[i][j] = denominator === 0 ? 0 : matrix[i][j] / denominator;
    }
  }
  
  return normalized;
}

// WSM - Weighted Sum Model
export function calculateWSM(
  alternatives: Alternative[],
  criteria: Criterion[]
): MCDMResult[] {
  const matrix = alternatives.map(a => a.values);
  const weights = normalizeWeights(criteria.map(c => c.weight));
  const types = criteria.map(c => c.type);
  
  const normalized = linearNormalize(matrix, types);
  
  const scores = normalized.map((row, i) => {
    const score = row.reduce((sum, val, j) => sum + val * weights[j], 0);
    return {
      alternativeId: alternatives[i].id,
      alternativeName: alternatives[i].name,
      score,
      rank: 0,
    };
  });
  
  scores.sort((a, b) => b.score - a.score);
  scores.forEach((s, i) => (s.rank = i + 1));
  
  return scores;
}

// WPM - Weighted Product Model
export function calculateWPM(
  alternatives: Alternative[],
  criteria: Criterion[]
): MCDMResult[] {
  const matrix = alternatives.map(a => a.values);
  const weights = normalizeWeights(criteria.map(c => c.weight));
  const types = criteria.map(c => c.type);
  
  const scores = matrix.map((row, i) => {
    let score = 1;
    for (let j = 0; j < criteria.length; j++) {
      const exponent = types[j] === 'benefit' ? weights[j] : -weights[j];
      score *= Math.pow(row[j], exponent);
    }
    return {
      alternativeId: alternatives[i].id,
      alternativeName: alternatives[i].name,
      score,
      rank: 0,
    };
  });
  
  scores.sort((a, b) => b.score - a.score);
  scores.forEach((s, i) => (s.rank = i + 1));
  
  return scores;
}

// WASPAS - Weighted Aggregated Sum Product Assessment
export function calculateWASPAS(
  alternatives: Alternative[],
  criteria: Criterion[],
  lambda: number = 0.5
): MCDMResult[] {
  const wsmResults = calculateWSM(alternatives, criteria);
  const wpmResults = calculateWPM(alternatives, criteria);
  
  const scores = alternatives.map((alt, i) => {
    const wsmScore = wsmResults.find(r => r.alternativeId === alt.id)?.score || 0;
    const wpmScore = wpmResults.find(r => r.alternativeId === alt.id)?.score || 0;
    
    // Normalize WPM score to be comparable with WSM
    const maxWpm = Math.max(...wpmResults.map(r => r.score));
    const normalizedWpm = maxWpm === 0 ? 0 : wpmScore / maxWpm;
    
    const score = lambda * wsmScore + (1 - lambda) * normalizedWpm;
    
    return {
      alternativeId: alt.id,
      alternativeName: alt.name,
      score,
      rank: 0,
      details: { wsm: wsmScore, wpm: normalizedWpm },
    };
  });
  
  scores.sort((a, b) => b.score - a.score);
  scores.forEach((s, i) => (s.rank = i + 1));
  
  return scores;
}

// TOPSIS - Technique for Order of Preference by Similarity to Ideal Solution
export function calculateTOPSIS(
  alternatives: Alternative[],
  criteria: Criterion[]
): MCDMResult[] {
  const matrix = alternatives.map(a => a.values);
  const weights = normalizeWeights(criteria.map(c => c.weight));
  const types = criteria.map(c => c.type);
  
  // Step 1: Vector normalization
  const normalized = vectorNormalize(matrix);
  
  // Step 2: Weighted normalized matrix
  const weighted = normalized.map(row =>
    row.map((val, j) => val * weights[j])
  );
  
  // Step 3: Determine ideal and negative-ideal solutions
  const numCriteria = criteria.length;
  const idealPositive: number[] = new Array(numCriteria);
  const idealNegative: number[] = new Array(numCriteria);
  
  for (let j = 0; j < numCriteria; j++) {
    const column = weighted.map(row => row[j]);
    if (types[j] === 'benefit') {
      idealPositive[j] = Math.max(...column);
      idealNegative[j] = Math.min(...column);
    } else {
      idealPositive[j] = Math.min(...column);
      idealNegative[j] = Math.max(...column);
    }
  }
  
  // Step 4: Calculate separation measures
  const scores = weighted.map((row, i) => {
    let sPlus = 0;
    let sMinus = 0;
    
    for (let j = 0; j < numCriteria; j++) {
      sPlus += Math.pow(row[j] - idealPositive[j], 2);
      sMinus += Math.pow(row[j] - idealNegative[j], 2);
    }
    
    sPlus = Math.sqrt(sPlus);
    sMinus = Math.sqrt(sMinus);
    
    // Step 5: Calculate closeness coefficient
    const score = sPlus + sMinus === 0 ? 0 : sMinus / (sPlus + sMinus);
    
    return {
      alternativeId: alternatives[i].id,
      alternativeName: alternatives[i].name,
      score,
      rank: 0,
      details: { sPlus, sMinus },
    };
  });
  
  scores.sort((a, b) => b.score - a.score);
  scores.forEach((s, i) => (s.rank = i + 1));
  
  return scores;
}

// VIKOR - VlseKriterijumska Optimizacija I Kompromisno Resenje
export function calculateVIKOR(
  alternatives: Alternative[],
  criteria: Criterion[],
  v: number = 0.5 // Weight for maximum group utility
): MCDMResult[] {
  const matrix = alternatives.map(a => a.values);
  const weights = normalizeWeights(criteria.map(c => c.weight));
  const types = criteria.map(c => c.type);
  const numCriteria = criteria.length;
  
  // Determine best and worst values for each criterion
  const fStar: number[] = new Array(numCriteria);
  const fMinus: number[] = new Array(numCriteria);
  
  for (let j = 0; j < numCriteria; j++) {
    const column = matrix.map(row => row[j]);
    if (types[j] === 'benefit') {
      fStar[j] = Math.max(...column);
      fMinus[j] = Math.min(...column);
    } else {
      fStar[j] = Math.min(...column);
      fMinus[j] = Math.max(...column);
    }
  }
  
  // Calculate S (utility) and R (regret) for each alternative
  const sValues: number[] = [];
  const rValues: number[] = [];
  
  for (let i = 0; i < alternatives.length; i++) {
    let s = 0;
    let r = 0;
    
    for (let j = 0; j < numCriteria; j++) {
      const denominator = fStar[j] - fMinus[j];
      const term = denominator === 0 ? 0 : (weights[j] * (fStar[j] - matrix[i][j])) / denominator;
      s += term;
      r = Math.max(r, term);
    }
    
    sValues.push(s);
    rValues.push(r);
  }
  
  // Calculate Q (compromise index)
  const sStar = Math.min(...sValues);
  const sMinus = Math.max(...sValues);
  const rStar = Math.min(...rValues);
  const rMinus = Math.max(...rValues);
  
  const scores = alternatives.map((alt, i) => {
    const sNorm = sMinus - sStar === 0 ? 0 : (sValues[i] - sStar) / (sMinus - sStar);
    const rNorm = rMinus - rStar === 0 ? 0 : (rValues[i] - rStar) / (rMinus - rStar);
    
    const q = v * sNorm + (1 - v) * rNorm;
    
    return {
      alternativeId: alt.id,
      alternativeName: alt.name,
      score: q,
      rank: 0,
      details: { S: sValues[i], R: rValues[i], Q: q },
    };
  });
  
  // VIKOR ranks by Q ascending (lower is better)
  scores.sort((a, b) => a.score - b.score);
  scores.forEach((s, i) => (s.rank = i + 1));
  
  return scores;
}

// AHP - Analytic Hierarchy Process for weight calculation
export interface AHPResult {
  weights: number[];
  consistencyRatio: number;
  isConsistent: boolean;
  eigenVector: number[];
}

const RANDOM_INDEX: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

export function calculateAHP(pairwiseMatrix: number[][]): AHPResult {
  const n = pairwiseMatrix.length;
  
  if (n === 0) {
    return { weights: [], consistencyRatio: 0, isConsistent: true, eigenVector: [] };
  }
  
  // Calculate column sums
  const columnSums = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      columnSums[j] += pairwiseMatrix[i][j];
    }
  }
  
  // Normalize the matrix
  const normalizedMatrix = pairwiseMatrix.map((row, i) =>
    row.map((val, j) => (columnSums[j] === 0 ? 0 : val / columnSums[j]))
  );
  
  // Calculate priority vector (eigenvector approximation)
  const eigenVector = normalizedMatrix.map(row =>
    row.reduce((sum, val) => sum + val, 0) / n
  );
  
  // Calculate lambda max
  let lambdaMax = 0;
  for (let j = 0; j < n; j++) {
    let weightedSum = 0;
    for (let i = 0; i < n; i++) {
      weightedSum += pairwiseMatrix[i][j] * eigenVector[i];
    }
    lambdaMax += weightedSum / eigenVector[j];
  }
  lambdaMax /= n;
  
  // Calculate Consistency Index and Ratio
  const ci = (lambdaMax - n) / (n - 1);
  const ri = RANDOM_INDEX[n] || 1.49;
  const cr = ri === 0 ? 0 : ci / ri;
  
  return {
    weights: eigenVector,
    consistencyRatio: cr,
    isConsistent: cr <= 0.1,
    eigenVector,
  };
}

// Generate initial AHP pairwise matrix (all 1s on diagonal)
export function createPairwiseMatrix(size: number): number[][] {
  return Array(size)
    .fill(null)
    .map((_, i) =>
      Array(size)
        .fill(null)
        .map((_, j) => (i === j ? 1 : 1))
    );
}

// Update pairwise matrix (ensures reciprocal values)
export function updatePairwiseMatrix(
  matrix: number[][],
  row: number,
  col: number,
  value: number
): number[][] {
  const newMatrix = matrix.map(r => [...r]);
  newMatrix[row][col] = value;
  newMatrix[col][row] = 1 / value;
  return newMatrix;
}

// Export results to CSV
export function exportToCSV(results: MCDMResult[], methodName: string): string {
  const headers = ['Rank', 'Alternative', 'Score'];
  const rows = results.map(r => [r.rank, r.alternativeName, r.score.toFixed(4)]);
  
  const csv = [
    `${methodName} Results`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');
  
  return csv;
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
