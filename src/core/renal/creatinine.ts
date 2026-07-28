interface CockcroftInput {
  age: number;
  weightKg: number;
  serumCreatinine: number;
  gender: 'Laki-laki' | 'Perempuan';
}

export function calculateCockcroftGault(input: CockcroftInput): number | null {
  const { age, weightKg, serumCreatinine, gender } = input;
  
  if (!age || !weightKg || !serumCreatinine || serumCreatinine <= 0) {
    return null;
  }

  let clcr = ((140 - age) * weightKg) / (72 * serumCreatinine);
  
  if (gender === 'Perempuan') {
    clcr *= 0.85;
  }

  return Number(clcr.toFixed(2));
}