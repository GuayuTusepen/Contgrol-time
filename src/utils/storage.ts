import { SchoolShift, SchoolAlarm, SoundItem } from '../types';
import { DEFAULT_SHIFTS, DEFAULT_ALARMS, BUILTIN_SOUNDS } from '../data/defaultData';

const SHIFTS_KEY = 'control_time_shifts_v1';
const ALARMS_KEY = 'control_time_alarms_v1';
const CUSTOM_SOUNDS_KEY = 'control_time_custom_sounds_v1';
const VOLUME_KEY = 'control_time_volume_v1';
const LOCATION_KEY = 'control_time_school_location_v1';
const AVATAR_KEY = 'control_time_avatar_v1';

export function loadProfileAvatar(): string | null {
  try {
    return localStorage.getItem(AVATAR_KEY);
  } catch {
    return null;
  }
}

export function saveProfileAvatar(avatarDataUrl: string | null): void {
  try {
    if (avatarDataUrl) {
      localStorage.setItem(AVATAR_KEY, avatarDataUrl);
    } else {
      localStorage.removeItem(AVATAR_KEY);
    }
  } catch {
    // ignore
  }
}

export function loadSchoolLocation(): string {
  try {
    const saved = localStorage.getItem(LOCATION_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // ignore
  }
  return 'Sede Central';
}

export function saveSchoolLocation(loc: string): void {
  try {
    localStorage.setItem(LOCATION_KEY, loc);
  } catch {
    // ignore
  }
}

export function loadShifts(): SchoolShift[] {
  try {
    const saved = localStorage.getItem(SHIFTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading shifts:', e);
  }
  saveShifts(DEFAULT_SHIFTS);
  return DEFAULT_SHIFTS;
}

export function saveShifts(shifts: SchoolShift[]): void {
  try {
    localStorage.setItem(SHIFTS_KEY, JSON.stringify(shifts));
  } catch (e) {
    console.error('Error saving shifts:', e);
  }
}

export function loadAlarms(): SchoolAlarm[] {
  try {
    const saved = localStorage.getItem(ALARMS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading alarms:', e);
  }
  saveAlarms(DEFAULT_ALARMS);
  return DEFAULT_ALARMS;
}

export function saveAlarms(alarms: SchoolAlarm[]): void {
  try {
    localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
  } catch (e) {
    console.error('Error saving alarms:', e);
  }
}

export function loadCustomSounds(): SoundItem[] {
  try {
    const saved = localStorage.getItem(CUSTOM_SOUNDS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading custom sounds:', e);
  }
  return [];
}

export function saveCustomSounds(sounds: SoundItem[]): void {
  try {
    localStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(sounds));
  } catch (e) {
    console.error('Error saving custom sounds:', e);
  }
}

export function getAllSounds(customSounds: SoundItem[]): SoundItem[] {
  return [...BUILTIN_SOUNDS, ...customSounds];
}

export function loadMasterVolume(): number {
  try {
    const saved = localStorage.getItem(VOLUME_KEY);
    if (saved) {
      const num = parseFloat(saved);
      if (!isNaN(num) && num >= 0 && num <= 1) return num;
    }
  } catch {
    // ignore
  }
  return 0.85;
}

export function saveMasterVolume(vol: number): void {
  try {
    localStorage.setItem(VOLUME_KEY, vol.toString());
  } catch {
    // ignore
  }
}
