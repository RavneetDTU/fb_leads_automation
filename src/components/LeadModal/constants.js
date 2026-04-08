// ── Branch names for dropdown ──
export const BRANCH_NAMES = [
  'BLUFF', 'BRACKENFELL', 'CAPE TOWN', 'CASCADES', 'CENTURION',
  'HILLCREST', 'HOWICK', 'JEFFREYS BAY', 'KLOOF', 'LA LUCIA',
  'LANGEBAAN', 'LONGBEACH', 'MARGATE', 'MAYVILLE', 'MOFFETT',
  'MUSGRAVE', 'NORTHGATE', 'NORWOOD', 'ONLINE', 'SCOTTBURGH',
  'SHELLY', 'SOMERSET', 'SUMMERSTRAND', 'TOKAI', 'UMHLANGA',
  'VREDENBURG', 'WESTVILLE', 'WINDERMERE',
];

// ── Event types for calendar booking ──
export const EVENT_TYPES = [
  { value: 'hearing-aid-test', label: 'Hearing Aid Test', duration: 45 },
  { value: 'wax-removal', label: 'Wax Removal Test', duration: 30 },
];

// ── Store list for calendar booking ──
export const STORE_LIST = BRANCH_NAMES.map(name => ({ value: name, label: name }));

// ── Status Options ──
export const STATUS_OPTIONS = [
  'Not Interested',
  'Booked Appointment',
  'Booked Appointment (Full)',
  'Please Call Later',
  'Will Call Us',
  'No Show',
  'Too Young',
  'Too Far',
  'Other - Refer to Notes',
  'Interested - Not Right Now'
];

// ── Tab definitions ──
export const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'notes', label: 'Notes' },
  { id: 'calls', label: 'Calls' },
  { id: 'whatsapp', label: 'Whatsapp' },
  { id: 'questions', label: 'Questions' },
  { id: 'booking', label: 'Book Event' },
  { id: 'sendConversion', label: 'Send Conversion' },
];
