export interface LocationData {
  name: string;
  location: string;
  help: boolean;
  phone?: string;
  mapLabel?: string;
}

export type DataCollection = Record<string, LocationData>;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function filterLocations(data: DataCollection, query: string): Array<{ key: string; data: LocationData }> {
  if (!query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase();

  return Object.keys(data)
    .filter(key => {
      const location = data[key];
      return (
        key.toLowerCase().includes(lowerQuery) ||
        location.name.toLowerCase().includes(lowerQuery) ||
        location.location.toLowerCase().includes(lowerQuery)
      );
    })
    .map(key => ({ key, data: data[key] }));
}

export function getRecentLocations(data: DataCollection, recentIds: string[]): Array<{ key: string; data: LocationData }> {
  return recentIds
    .filter(id => Boolean(data[id]))
    .map(id => ({ key: id, data: data[id] }));
}

export function pushRecentLocation(current: string[], id: string, max = 5): string[] {
  const deduped = [id, ...current.filter(item => item !== id)];
  return deduped.slice(0, max);
}

export function buildNavigateUrl(location: string, mapLabel?: string): string {
  const query = mapLabel?.trim() ? mapLabel : location;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function canCallLocation(phone?: string): boolean {
  return Boolean(phone?.trim());
}

export function readRecentIds(storageLike: StorageLike | null, key: string): string[] {
  if (!storageLike) {
    return [];
  }

  try {
    const value = storageLike.getItem(key);
    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every(item => typeof item === 'string') ? parsed : [];
  } catch {
    return [];
  }
}

export function writeRecentIds(storageLike: StorageLike | null, key: string, ids: string[]): boolean {
  if (!storageLike) {
    return false;
  }

  try {
    storageLike.setItem(key, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}

interface ClipboardLike {
  writeText(text: string): Promise<void>;
}

interface NavigatorLike {
  clipboard?: ClipboardLike;
}

export async function copyTextToClipboard(navigatorLike: NavigatorLike, text: string): Promise<{ ok: boolean }> {
  if (!navigatorLike.clipboard) {
    return { ok: false };
  }

  try {
    await navigatorLike.clipboard.writeText(text);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
