export function redactPII(text: string): string {
  if (!text) return text;
  
  // Redact 10-digit phone numbers
  const phonePattern = /\b\d{10}\b/g;
  let redacted = text.replace(phonePattern, '[REDACTED]');
  
  // Redact names - this is harder without NER, but the request says "redact names and phone numbers"
  // Usually this means if it's a specific field. If it's general text, we can redact based on obvious patterns
  // or just use this for the specific fields before display.
  
  return redacted;
}

export function redactName(name: string): string {
    if (!name) return "";
    return "[REDACTED]";
}
