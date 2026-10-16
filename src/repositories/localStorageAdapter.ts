const STORAGE_PREFIX = "ft:";

export class LocalStorageAdapter {
  get<T>(key: string): T | null {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    const item = localStorage.getItem(fullKey);
    if (item === null) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      localStorage.removeItem(fullKey);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    localStorage.setItem(fullKey, JSON.stringify(value));
  }

  remove(key: string): void {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    localStorage.removeItem(fullKey);
  }

  has(key: string): boolean {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    return localStorage.getItem(fullKey) !== null;
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
