/**
 * Normalizes phone numbers to standard format:
 * - Strips all spaces, dashes, parentheses, dots, and non-breaking spaces
 * - Converts Arabic-Indic digits (٠-٩) to ASCII digits (0-9)
 * - Standardizes Egyptian mobile numbers (+20, 0020, 20) to 01xxxxxxxxx
 */
function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  let cleaned = String(rawPhone).replace(/[\s\u00A0\u200B\-\(\)\.]/g, '').trim();
  cleaned = cleaned.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  if (/^(\+20|0020|20)(1[0125]\d{8})$/.test(cleaned)) {
    cleaned = '0' + cleaned.replace(/^(\+20|0020|20)/, '');
  }
  return cleaned;
}

module.exports = { normalizePhone };
