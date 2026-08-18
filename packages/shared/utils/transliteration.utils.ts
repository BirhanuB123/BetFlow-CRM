/**
 * Amharic <-> English transliteration dictionary and phonetic search helpers
 * tailored for Ethiopian real estate leads, names, subcities, and locations.
 */

const TRANSLITERATION_MAP: Record<string, string[]> = {
  // Subcities & Locations
  bole: ['ቦሌ', 'bole'],
  ቦሌ: ['bole', 'ቦሌ'],
  kazanchis: ['ካዛንችስ', 'kazanchis'],
  ካዛንችስ: ['kazanchis', 'ካዛንችስ'],
  cmc: ['ሲኤምሲ', 'cmc'],
  ሲኤምሲ: ['cmc', 'ሲኤምሲ'],
  yeka: ['የካ', 'yeka'],
  የካ: ['yeka', 'የካ'],
  arada: ['አራዳ', 'arada'],
  አራዳ: ['arada', 'አራዳ'],
  kirkos: ['ኪርቆስ', 'kirkos'],
  ኪርቆስ: ['kirkos', 'ኪርቆስ'],
  gullele: ['ጉለሌ', 'gullele'],
  ጉለሌ: ['gullele', 'ጉለሌ'],
  akaki: ['አቃቂ', 'akaki'],
  አቃቂ: ['akaki', 'አቃቂ'],
  kality: ['ቃሊቲ', 'kality'],
  ቃሊቲ: ['kality', 'ቃሊቲ'],
  sarbet: ['ሳርቤት', 'sarbet'],
  ሳርቤት: ['sarbet', 'ሳርቤት'],
  beshale: ['በሻሌ', 'beshale'],
  በሻሌ: ['beshale', 'በሻሌ'],
  summit: ['ሰሚት', 'summit'],
  ሰሚት: ['summit', 'ሰሚት'],
  gotera: ['ጎተራ', 'gotera'],
  ጎተራ: ['gotera', 'ጎተራ'],
  ayat: ['አያት', 'ayat'],
  አያት: ['ayat', 'አያት'],
  lebu: ['ለቡ', 'lebu'],
  ለቡ: ['lebu', 'ለቡ'],
  piassa: ['ፒያሳ', 'piassa'],
  ፒያሳ: ['piassa', 'ፒያሳ'],
  gerji: ['ገርጂ', 'gerji'],
  ገርጂ: ['gerji', 'ገርጂ'],
  megenagna: ['መገናኛ', 'megenagna'],
  መገናኛ: ['megenagna', 'መገናኛ'],
  addis: ['አዲስ', 'addis'],
  አዲስ: ['addis', 'አዲስ'],

  // Common Ethiopian Names
  abebe: ['አበበ', 'abebe'],
  አበበ: ['abebe', 'አበበ'],
  kebede: ['ከበደ', 'kebede'],
  ከበደ: ['kebede', 'ከበደ'],
  taye: ['ታዬ', 'taye'],
  ታዬ: ['taye', 'ታዬ'],
  alazar: ['አልአዛር', 'alazar'],
  አልአዛር: ['alazar', 'አልአዛር'],
  tesfaye: ['ተስፋዬ', 'tesfaye'],
  ተስፋዬ: ['tesfaye', 'ተስፋዬ'],
  tewodros: ['ቴዎድሮስ', 'tewodros'],
  ቴዎድሮስ: ['tewodros', 'ቴዎድሮስ'],
  haile: ['ኃይሌ', 'ሀይሌ', 'haile'],
  ኃይሌ: ['haile', 'ኃይሌ'],
  solomon: ['ሰለሞን', 'solomon'],
  ሰለሞን: ['solomon', 'ሰለሞን'],
  birhanu: ['ብርሃኑ', 'birhanu'],
  ብርሃኑ: ['birhanu', 'ብርሃኑ'],
  mulugeta: ['ሙሉጌታ', 'mulugeta'],
  ሙሉጌታ: ['mulugeta', 'ሙሉጌታ'],
};

/**
 * Given a search term, returns all phonetically equivalent tokens (Amharic and English).
 */
export function getTransliteratedVariants(term?: string | null): string[] {
  if (!term) return [];
  const normalized = term.trim().toLowerCase();
  if (!normalized) return [];

  const variants = new Set<string>([normalized]);

  // Check full word match
  if (TRANSLITERATION_MAP[normalized]) {
    TRANSLITERATION_MAP[normalized].forEach((v) => variants.add(v.toLowerCase()));
  }

  // Check sub-tokens
  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (TRANSLITERATION_MAP[word]) {
      TRANSLITERATION_MAP[word].forEach((v) => variants.add(v.toLowerCase()));
    }
  }

  return Array.from(variants);
}
