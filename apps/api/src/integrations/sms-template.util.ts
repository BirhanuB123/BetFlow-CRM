export type InterpolationResult = {
  body: string;
  missing: string[];
};

/**
  Interpolates placeholder variables formatted as {variableName} in a template string.
  Returns the interpolated body string and an array of missing placeholder variable names.
 */
export function interpolateTemplate(
  template: string,
  data: Record<string, string | number | undefined | null>,
): InterpolationResult {
  if (!template) {
    return { body: '', missing: [] };
  }

  const missingSet = new Set<string>();

  const body = template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    const val = data[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val);
    }
    missingSet.add(key);
    return match;
  });

  return {
    body,
    missing: Array.from(missingSet),
  };
}
