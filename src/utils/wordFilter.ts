export interface ConstraintSet {
  position: number;
  character: string;
}

export interface SearchParams {
  availableLetters: string;
  minLength?: number;
  maxLength?: number;
  constraints: ConstraintSet[];
}

let wordCache: string[] | null = null;

export async function loadWords(): Promise<string[]> {
  if (wordCache) return wordCache;

  const response = await fetch('/words.txt');
  const text = await response.text();
  wordCache = text
    .split('\n')
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 0);
  
  return wordCache;
}

export function filterWords(words: string[], params: SearchParams): string[] {
  const letters = params.availableLetters.toLowerCase().split('').filter(Boolean);
  const minLen = params.minLength || 1;
  const maxLen = params.maxLength || 6;

  return words.filter(word => {
    if (word.length < minLen || word.length > maxLen) return false;

    // Check if word can be made from available letters
    const letterCount = new Map<string, number>();
    letters.forEach(l => {
      letterCount.set(l, (letterCount.get(l) || 0) + 1);
    });

    for (const char of word) {
      const count = letterCount.get(char);
      if (count === undefined || count <= 0) return false;
      letterCount.set(char, count - 1);
    }

    // Check position constraints
    for (const constraint of params.constraints) {
      if (constraint.character && word[constraint.position - 1] !== constraint.character.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}
