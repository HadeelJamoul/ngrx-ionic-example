import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(Key: string): T | null {
    const raw = localStorage.getItem(Key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  //Because the value might not be string, we need to stringify it before saving it to localStorage

  set<T>(Key: string, value: T): void {
    localStorage.setItem(Key, JSON.stringify(value));
  }

  remove(Key: string): void {
    localStorage.removeItem(Key);
  }
}
