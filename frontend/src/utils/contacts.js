/**
 * Progressive enhancement helper for the Web Contact Picker API
 * Supported in modern mobile browsers (Chrome for Android, Edge Mobile, etc.)
 */

export function isContactPickerSupported() {
  return 'contacts' in navigator && 'ContactsManager' in window;
}

function parseContact(contact) {
  const name = (contact.name && contact.name[0]) || '';
  const phone = (contact.tel && contact.tel[0]) || '';
  let address = '';

  if (contact.address && contact.address[0]) {
    const addr = contact.address[0];
    if (typeof addr === 'string') {
      address = addr;
    } else if (typeof addr === 'object') {
      address = [addr.addressLine, addr.city, addr.region, addr.postalCode]
        .filter(Boolean)
        .join(', ');
    }
  }

  return {
    name: name.trim() || phone.trim() || 'Contact',
    phone: phone.trim(),
    address: address.trim() || null,
  };
}

export async function selectContact() {
  if (!isContactPickerSupported()) {
    throw new Error('Contact Picker API is not supported in this browser.');
  }

  try {
    const props = ['name', 'tel', 'address'];
    const contacts = await navigator.contacts.select(props, { multiple: false });

    if (!contacts || contacts.length === 0) {
      return null;
    }

    return parseContact(contacts[0]);
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
    const props = ['name', 'tel', 'address'];
    const contacts = await navigator.contacts.select(props, { multiple: true });

    if (!contacts || contacts.length === 0) {
      return [];
    }

    return contacts
      .map(parseContact)
      .filter((c) => c.phone && c.phone.length > 0);
  } catch (err) {
    if (err.name === 'AbortError') {
      return null; // User cancelled picker
    }
    throw err;
  }
}
