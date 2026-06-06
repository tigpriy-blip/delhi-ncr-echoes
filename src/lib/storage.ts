// Tiny typed localStorage wrappers. SSR-safe.

export const ls = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  remove(key: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
  getBool(key: string): boolean {
    return this.get(key) === "true";
  },
  setBool(key: string, value: boolean) {
    this.set(key, value ? "true" : "false");
  },
  getNum(key: string, fallback = 0): number {
    const v = this.get(key);
    if (v === null) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  },
  getJSON<T>(key: string, fallback: T): T {
    const v = this.get(key);
    if (v === null) return fallback;
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  },
  setJSON(key: string, value: unknown) {
    this.set(key, JSON.stringify(value));
  },
};

export const ss = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
};
