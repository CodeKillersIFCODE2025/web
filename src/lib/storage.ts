const KEY = "agenda_items_v2";

export function readJSON<T>(key = KEY): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON<T>(data: T, key = KEY) {
  localStorage.setItem(key, JSON.stringify(data));
}
