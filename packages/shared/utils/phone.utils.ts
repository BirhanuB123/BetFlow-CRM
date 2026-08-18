/**
 * Phone number normalization & Diaspora origin classification utilities.
 */

export type LeadOriginInfo = {
  isDiaspora: boolean;
  originCountry: string;
  flag: string;
  countryCode: string;
};

/**
 * Normalizes local (09..., 07...) and international phone numbers to standard E.164 format.
 * Examples:
 * - "0911223344" -> "+251911223344"
 * - "0711223344" -> "+251711223344"
 * - "251911223344" -> "+251911223344"
 * - "+1 (404) 555-0199" -> "+14045550199"
 */
export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const raw = phone.trim();
  if (!raw) return null;

  // Remove whitespace, dashes, parentheses, dots
  let cleaned = raw.replace(/[\s\-\(\)\.]/g, '');

  // Handle leading "00" e.g. 00251... or 001...
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // Handle local Ethiopian 09... or 07... (9 or 10 digits total)
  if (/^0[97]\d{8}$/.test(cleaned)) {
    return '+251' + cleaned.slice(1);
  }

  // Handle 2519... or 2517... without +
  if (/^251[97]\d{8}$/.test(cleaned)) {
    return '+' + cleaned;
  }

  // If already starts with +, ensure it's digits after +
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.slice(1).replace(/\D/g, '');
    return '+' + digitsOnly;
  }

  // Fallback: strip any remaining non-digits
  const digits = cleaned.replace(/\D/g, '');
  if (!digits) return null;

  // If 9 digits starting with 9 or 7 (e.g. 911223344)
  if (digits.length === 9 && (digits.startsWith('9') || digits.startsWith('7'))) {
    return '+251' + digits;
  }

  return '+' + digits;
}

/**
 * Classifies lead origin based on country code in normalized phone number.
 */
export function classifyLeadOrigin(phone?: string | null): LeadOriginInfo {
  const normalized = normalizePhone(phone);

  if (!normalized) {
    return {
      isDiaspora: false,
      originCountry: 'Unknown / Local',
      flag: '🌐',
      countryCode: 'UNKNOWN',
    };
  }

  if (normalized.startsWith('+251')) {
    return {
      isDiaspora: false,
      originCountry: 'Ethiopia',
      flag: '🇪🇹',
      countryCode: '+251',
    };
  }

  if (normalized.startsWith('+1')) {
    return {
      isDiaspora: true,
      originCountry: 'North America (USA/Canada)',
      flag: '🇺🇸',
      countryCode: '+1',
    };
  }

  if (normalized.startsWith('+44')) {
    return {
      isDiaspora: true,
      originCountry: 'United Kingdom',
      flag: '🇬🇧',
      countryCode: '+44',
    };
  }

  if (normalized.startsWith('+49')) {
    return {
      isDiaspora: true,
      originCountry: 'Germany',
      flag: '🇩🇪',
      countryCode: '+49',
    };
  }

  if (normalized.startsWith('+33')) {
    return {
      isDiaspora: true,
      originCountry: 'France',
      flag: '🇫🇷',
      countryCode: '+33',
    };
  }

  if (normalized.startsWith('+971')) {
    return {
      isDiaspora: true,
      originCountry: 'UAE (Dubai)',
      flag: '🇦🇪',
      countryCode: '+971',
    };
  }

  if (normalized.startsWith('+966')) {
    return {
      isDiaspora: true,
      originCountry: 'Saudi Arabia',
      flag: '🇸🇦',
      countryCode: '+966',
    };
  }

  if (normalized.startsWith('+61')) {
    return {
      isDiaspora: true,
      originCountry: 'Australia',
      flag: '🇦🇺',
      countryCode: '+61',
    };
  }

  return {
    isDiaspora: true,
    originCountry: 'International Diaspora',
    flag: '🌍',
    countryCode: normalized.slice(0, 4),
  };
}
