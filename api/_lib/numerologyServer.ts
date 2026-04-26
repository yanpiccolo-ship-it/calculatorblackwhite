// Server-side port of the numerology calculator (Pythagorean system).
// Mirrors src/lib/numerology.ts so the backend can recompute all numbers
// from name + birth date when generating a report.

const letterValues: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const MASTER_NUMBERS = new Set([11, 22, 33, 44]);

function reduce(num: number): number {
  let n = num;
  while (n > 9 && !MASTER_NUMBERS.has(n)) {
    n = n.toString().split('').reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

function letterValue(ch: string): number {
  return letterValues[ch.toLowerCase()] ?? 0;
}

function normalize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '');
}

export function destinyNumber(name: string): number {
  const sum = normalize(name)
    .split('')
    .reduce((s, c) => s + letterValue(c), 0);
  return reduce(sum);
}

export function soulNumber(name: string): number {
  const sum = normalize(name)
    .split('')
    .filter((c) => VOWELS.has(c.toLowerCase()))
    .reduce((s, c) => s + letterValue(c), 0);
  return reduce(sum);
}

export function personalityNumber(name: string): number {
  const sum = normalize(name)
    .split('')
    .filter((c) => !VOWELS.has(c.toLowerCase()))
    .reduce((s, c) => s + letterValue(c), 0);
  return reduce(sum);
}

export function expressionNumber(name: string): number {
  return destinyNumber(name);
}

export function lifePathNumber(birthDate: Date): number {
  const day = birthDate.getUTCDate();
  const month = birthDate.getUTCMonth() + 1;
  const year = birthDate.getUTCFullYear();
  const sum =
    reduce(day) + reduce(month) +
    reduce(year.toString().split('').reduce((s, d) => s + Number(d), 0));
  return reduce(sum);
}

export function personalYearNumber(birthDate: Date, forYear?: number): number {
  const targetYear = forYear ?? new Date().getUTCFullYear();
  const day = birthDate.getUTCDate();
  const month = birthDate.getUTCMonth() + 1;
  const ySum = targetYear.toString().split('').reduce((s, d) => s + Number(d), 0);
  return reduce(reduce(day) + reduce(month) + reduce(ySum));
}

// Karmic numbers detected from intermediate sums
export function karmicNumbers(name: string, birthDate: Date): number[] {
  const out = new Set<number>();
  const candidates: number[] = [];
  const total = normalize(name)
    .split('')
    .reduce((s, c) => s + letterValue(c), 0);
  candidates.push(total);

  const day = birthDate.getUTCDate();
  candidates.push(day);

  for (const c of candidates) {
    if ([13, 14, 16, 19].includes(c)) out.add(c);
  }
  return [...out];
}

export interface NumerologyProfile {
  fullName: string;
  birthDate: string; // ISO YYYY-MM-DD
  lifePath: number;
  destiny: number;
  soul: number;
  personality: number;
  expression: number;
  personalYear: number;
  karmic: number[];
  isMaster: boolean;
}

export function buildProfile(fullName: string, birthDateIso: string): NumerologyProfile {
  const bd = new Date(`${birthDateIso}T00:00:00Z`);
  if (Number.isNaN(bd.getTime())) {
    throw new Error(`Invalid birth date: ${birthDateIso}`);
  }
  const lifePath = lifePathNumber(bd);
  return {
    fullName,
    birthDate: birthDateIso,
    lifePath,
    destiny: destinyNumber(fullName),
    soul: soulNumber(fullName),
    personality: personalityNumber(fullName),
    expression: expressionNumber(fullName),
    personalYear: personalYearNumber(bd),
    karmic: karmicNumbers(fullName, bd),
    isMaster: MASTER_NUMBERS.has(lifePath),
  };
}
