export function normalizeStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function stringifyStringArray(value: unknown): string {
  return JSON.stringify(normalizeStringArray(value));
}

export function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return normalizeStringArray(value);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? normalizeStringArray(parsed) : [];
    } catch (error) {
      console.warn("Failed to parse string array", error);
      return [];
    }
  }
  return [];
}
