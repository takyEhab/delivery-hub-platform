/**
 * Normalizes phone numbers to standard format:
 * - Strips all spaces, dashes, parentheses, dots, and non-breaking spaces
 * - Converts Arabic-Indic digits (٠-٩) to ASCII digits (0-9)
 * - Standardizes Egyptian mobile numbers (+20, 0020, 20) to 01xxxxxxxxx
 */
export function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  let cleaned = String(rawPhone).replace(/[\s\u00A0\u200B\-\(\)\.]/g, '').trim();
  cleaned = cleaned.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  if (/^(\+20|0020|20)(1[0125]\d{8})$/.test(cleaned)) {
    cleaned = '0' + cleaned.replace(/^(\+20|0020|20)/, '');
  }
  return cleaned;
}

/**
 * Progressive enhancement helper for the Web Contact Picker API
 * Supported in modern mobile browsers (Chrome for Android, Edge Mobile, etc.)
 */
export function isContactPickerSupported() {
  return (
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    !!navigator.contacts &&
    typeof navigator.contacts.select === 'function'
  );
}

/**
 * The Contact Picker API specification strictly forbids passing properties
 * that are not returned by getProperties() — it throws a fatal TypeError.
 * This helper dynamically negotiates only the properties the device supports.
 */
export async function getSupportedContactProperties() {
  const desired = ['name', 'tel', 'address'];
  if (
    isContactPickerSupported() &&
    typeof navigator.contacts.getProperties === 'function'
  ) {
    try {
      const supported = await navigator.contacts.getProperties();
      const filtered = desired.filter((p) => supported.includes(p));
      if (filtered.length > 0) return filtered;
    } catch (e) {
      console.warn('Failed to query navigator.contacts.getProperties():', e);
    }
  }
  return ['name', 'tel'];
}

function parseContact(contact) {
  const rawName = (Array.isArray(contact.name) && contact.name[0]) || contact.name || '';
  const rawPhone = (Array.isArray(contact.tel) && contact.tel[0]) || contact.tel || '';
  const normalized = normalizePhone(rawPhone);

  let address = '';
  if (contact.address) {
    const addr = Array.isArray(contact.address) ? contact.address[0] : contact.address;
    if (typeof addr === 'string') {
      address = addr.trim();
    } else if (typeof addr === 'object' && addr !== null) {
      address = [addr.addressLine, addr.city, addr.region, addr.postalCode]
        .filter(Boolean)
        .join(', ')
        .trim();
    }
  }

  const cleanName = typeof rawName === 'string' ? rawName.trim() : '';

  return {
    name: cleanName || normalized || 'Contact',
    phone: normalized || rawPhone.trim(),
    address: address || null,
  };
}

export async function selectContact() {
  if (!isContactPickerSupported()) {
    throw new Error('Contact Picker API is not supported in this browser.');
  }

  try {
    const props = await getSupportedContactProperties();
    const contacts = await navigator.contacts.select(props, { multiple: false });

    if (!contacts || contacts.length === 0) {
      return null;
    }

    const parsed = parseContact(contacts[0]);
    return parsed.phone ? parsed : null;
  } catch (err) {
    if (err.name === 'AbortError') {
      return null; // User cancelled picker
    }
    throw err;
  }
}

export async function selectMultipleContacts() {
  if (!isContactPickerSupported()) {
    throw new Error('Contact Picker API is not supported in this browser.');
  }

  try {
    const props = await getSupportedContactProperties();
    const contacts = await navigator.contacts.select(props, { multiple: true });

    if (!contacts || contacts.length === 0) {
      return [];
    }

    const parsedContacts = contacts
      .map(parseContact)
      .filter((c) => c.phone && c.phone.length >= 3);

    // Deduplicate by normalized phone number within the selected batch
    const seenPhones = new Set();
    const uniqueBatch = [];

    for (const c of parsedContacts) {
      const key = normalizePhone(c.phone);
      if (!seenPhones.has(key)) {
        seenPhones.add(key);
        uniqueBatch.push(c);
      }
    }

    return uniqueBatch;
  } catch (err) {
    if (err.name === 'AbortError') {
      return []; // User cancelled picker
    }
    throw err;
  }
}
