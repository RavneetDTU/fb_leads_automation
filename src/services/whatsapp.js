import { config } from '../config';

const BASE_URL = config.leadsApiBaseUrl;

// ─────────────────────────────────────────────────────────────
// Helper: normalise a phone number to include country code.
// Rules:
//   - Already has country code (len > 10, doesn't start with 0) → use as-is
//   - Starts with 0 (local SA-style) → strip leading 0, prepend '27'
//   - 10 digits starting with non-0 (e.g. '8212345678') → prepend '27'
// The contacts API already returns numbers with country codes, so this
// helper is ONLY used for the send-template call from DailyLeads.
// ─────────────────────────────────────────────────────────────
export function normalisePhone(raw) {
    if (!raw) return '';
    // Remove all spaces, dashes, parentheses
    let phone = String(raw).replace(/[\s\-().+]/g, '');

    console.log('[whatsappService] normalisePhone input:', raw, '→ cleaned:', phone);

    // If already looks like an international number (> 10 digits or starts with 27/country code)
    if (phone.length > 10 && !phone.startsWith('0')) {
        console.log('[whatsappService] normalisePhone: already has country code →', phone);
        return phone;
    }

    // Strip leading 0 and prepend South Africa country code
    if (phone.startsWith('0')) {
        phone = '27' + phone.slice(1);
        console.log('[whatsappService] normalisePhone: stripped leading 0, added 27 →', phone);
        return phone;
    }

    // 10-digit number without leading 0 → assume ZA, prepend 27
    if (phone.length === 10) {
        phone = '27' + phone;
        console.log('[whatsappService] normalisePhone: 10-digit, prepended 27 →', phone);
        return phone;
    }

    // Fallback – return as-is
    console.log('[whatsappService] normalisePhone: fallback, returning as-is →', phone);
    return phone;
}

// ─────────────────────────────────────────────────────────────
// 1. Send Template Message
//    POST /whatsapp/send-template
//    Body: { campaign_id, phone }
//    Note: phone must include country code.
// ─────────────────────────────────────────────────────────────
export async function sendTemplateMessage(campaignId, rawPhone) {
    const phone = normalisePhone(rawPhone);

    console.log('[whatsappService] sendTemplateMessage → campaign_id:', campaignId, '| phone:', phone);

    const url = `${BASE_URL}/whatsapp/send-template`;
    const body = { campaign_id: String(campaignId), phone };

    console.log('[whatsappService] sendTemplateMessage → POST', url, body);

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[whatsappService] sendTemplateMessage failed:', response.status, errorText);
        throw new Error(`Send template failed (${response.status}): ${errorText}`);
    }

    const data = await response.json().catch(() => ({}));
    console.log('[whatsappService] sendTemplateMessage success:', data);
    return data;
}

// ─────────────────────────────────────────────────────────────
// 2. Get Contacts (for WhatsApp sidebar)
//    GET /whatsapp/contacts
//    Returns array of contact objects.
// ─────────────────────────────────────────────────────────────
export async function getContacts() {
    const url = `${BASE_URL}/whatsapp/contacts`;
    console.log('[whatsappService] getContacts → GET', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[whatsappService] getContacts failed:', response.status, errorText);
        throw new Error(`Get contacts failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('[whatsappService] getContacts success — total contacts:', data.length);
    return data;
}

// ─────────────────────────────────────────────────────────────
// 3. Get Messages by Phone Number
//    GET /whatsapp/messages/:phone
//    Note: phone comes from the contacts API and already has country code.
// ─────────────────────────────────────────────────────────────
export async function getMessages(phone) {
    const url = `${BASE_URL}/whatsapp/messages/${phone}`;
    console.log('[whatsappService] getMessages → GET', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[whatsappService] getMessages failed:', response.status, errorText);
        throw new Error(`Get messages failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('[whatsappService] getMessages success — phone:', phone, '| total messages:', data.length);
    return data;
}

// ─────────────────────────────────────────────────────────────
// 4. Send Session Message (typed message from chat input)
//    POST /whatsapp/send-message
//    Body: { phone, message_text }
//    Note: phone comes from the selected contact (already has country code).
// ─────────────────────────────────────────────────────────────
export async function sendMessage(phone, messageText) {
    const url = `${BASE_URL}/whatsapp/send-message`;
    const body = { phone, message_text: messageText };

    console.log('[whatsappService] sendMessage → POST', url);
    console.log('[whatsappService] sendMessage → request body:', body);

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[whatsappService] sendMessage failed:', response.status, errorText);
        throw new Error(`Send message failed (${response.status}): ${errorText}`);
    }

    const data = await response.json().catch(() => ({}));
    console.log('[whatsappService] sendMessage success:', data);
    return data;
}

// ─────────────────────────────────────────────────────────────
// 5. Sync Old Chats for a contact
//    POST /whatsapp/sync-chats/:phone
//    Note: phone comes from the selected contact (already has country code).
// ─────────────────────────────────────────────────────────────
export async function syncChats(phone) {
    const url = `${BASE_URL}/whatsapp/sync-chats/${phone}`;

    console.log('[whatsappService] syncChats → POST', url, '| phone:', phone);

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[whatsappService] syncChats failed:', response.status, errorText);
        throw new Error(`Sync chats failed (${response.status}): ${errorText}`);
    }

    const data = await response.json().catch(() => ({}));
    console.log('[whatsappService] syncChats success:', data);
    return data;
}
