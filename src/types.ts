export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAYS_OF_WEEK: { id: DayOfWeek; short: string; label: string }[] = [
  { id: 1, short: 'Lun', label: 'Lunes' },
  { id: 2, short: 'Mar', label: 'Martes' },
  { id: 3, short: 'Mié', label: 'Miércoles' },
  { id: 4, short: 'Jue', label: 'Jueves' },
  { id: 5, short: 'Vie', label: 'Viernes' },
  { id: 6, short: 'Sáb', label: 'Sábado' },
  { id: 0, short: 'Dom', label: 'Domingo' },
];

export type SoundType =
  | 'inicio_jornada'
  | 'fin_jornada'
  | 'salida_recreo'
  | 'entrada_recreo'
  | 'cambio_clases'
  | 'formacion_escolar'
  | 'emergencia'
  | 'custom';

export interface SoundItem {
  id: string;
  name: string;
  type: SoundType;
  isBuiltIn: boolean;
  description: string;
  durationSec?: number;
  dataUrl?: string; // For custom MP3 stored in LocalStorage
  fileSize?: string;
}

export interface SchoolShift {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  days: DayOfWeek[];
  description?: string;
  color: string;
}

export interface SchoolAlarm {
  id: string;
  title: string;
  time: string; // HH:mm
  shiftId: string; // Linked Jornada
  soundId: string; // Selected sound id
  soundType: SoundType;
  days: DayOfWeek[];
  enabled: boolean;
  notes?: string;
  lastTriggeredDate?: string; // YYYY-MM-DD-HH-mm to prevent duplicate triggers
}

export interface ActiveAlarmTrigger {
  id: string;
  title: string;
  soundName: string;
  soundType: SoundType;
  isEmergency: boolean;
  timeStarted: number;
}
