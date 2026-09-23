import React, { useState, useEffect } from 'react';
import { SchoolAlarm, SchoolShift, SoundItem, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { Play, Square, X, AlertCircle } from 'lucide-react';
import { playSound, stopAllSounds } from '../utils/soundEngine';

interface AlarmFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAlarm: (alarm: SchoolAlarm) => void;
  shifts: SchoolShift[];
  sounds: SoundItem[];
  alarmToEdit?: SchoolAlarm | null;
  defaultShiftId?: string | null;
  volume: number;
}

const PRESET_ROLES = [
  { label: 'Inicio de Jornada', soundType: 'inicio_jornada', title: 'Entrada e Inicio de Clases' },
  { label: 'Salida a Recreo', soundType: 'salida_recreo', title: 'Salida a Recreo y Descanso' },
  { label: 'Entrada de Recreo', soundType: 'entrada_recreo', title: 'Fin de Recreo / Regreso a Clases' },
  { label: 'Cambio de Clases', soundType: 'cambio_clases', title: 'Cambio de Materia / Docente' },
  { label: 'Formación Escolar', soundType: 'formacion_escolar', title: 'Formación Cívica y Asambleas' },
  { label: 'Fin de Jornada', soundType: 'fin_jornada', title: 'Salida y Cierre de Jornada' },
];

export const AlarmFormModal: React.FC<AlarmFormModalProps> = ({
  isOpen,
  onClose,
  onSaveAlarm,
  shifts,
  sounds,
  alarmToEdit,
  defaultShiftId,
  volume,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [shiftId, setShiftId] = useState('');
  const [selectedSoundId, setSelectedSoundId] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]);
  const [enabled, setEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form when opened
  useEffect(() => {
    if (isOpen) {
      if (alarmToEdit) {
        setTitle(alarmToEdit.title);
        setTime(alarmToEdit.time);
        setShiftId(alarmToEdit.shiftId);
        setSelectedSoundId(alarmToEdit.soundId);
        setSelectedDays(alarmToEdit.days);
        setEnabled(alarmToEdit.enabled);
        setNotes(alarmToEdit.notes || '');
      } else {
        // Defaults for new alarm
        setTitle('Inicio de Clases');
        setTime('07:00');
        const initialShift = defaultShiftId || (shifts[0] ? shifts[0].id : '');
        setShiftId(initialShift);
        setSelectedSoundId(sounds[0] ? sounds[0].id : '');
        setSelectedDays([1, 2, 3, 4, 5]);
        setEnabled(true);
        setNotes('');
      }
      setErrorMessage(null);
    } else {
      stopAllSounds();
      setIsPlayingPreview(false);
    }
  }, [isOpen, alarmToEdit, defaultShiftId, shifts, sounds]);

  if (!isOpen) return null;

  const currentShift = shifts.find((s) => s.id === shiftId);
  const selectedSound = sounds.find((s) => s.id === selectedSoundId);

  // Check if alarm time is within shift range
  const isTimeOutsideShift = currentShift && (time < currentShift.startTime || time > currentShift.endTime);

  const handleToggleDay = (dayId: DayOfWeek) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length === 1) return;
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
  };

  const handleApplyPreset = (preset: (typeof PRESET_ROLES)[0]) => {
    setTitle(preset.title);
    const matchedSound = sounds.find((s) => s.type === preset.soundType);
    if (matchedSound) {
      setSelectedSoundId(matchedSound.id);
    }
  };

  const handlePreviewSound = async () => {
    if (isPlayingPreview) {
      stopAllSounds();
      setIsPlayingPreview(false);
      return;
    }

    if (!selectedSound) return;

    setIsPlayingPreview(true);
    try {
      const duration = await playSound(
        selectedSound.type,
        selectedSound.dataUrl,
        volume,
        selectedSound.type === 'emergencia'
      );
      setTimeout(() => {
        setIsPlayingPreview(false);
      }, duration * 1000);
    } catch {
      setIsPlayingPreview(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Por favor ingresa un título para la alarma.');
      return;
    }
    if (!time) {
      setErrorMessage('Por favor selecciona la hora en la que debe sonar.');
      return;
    }
    if (!shiftId) {
      setErrorMessage('Debes seleccionar o crear una jornada primero.');
      return;
    }
    if (!selectedSoundId || !selectedSound) {
      setErrorMessage('Por favor selecciona el sonido que debe reproducirse.');
      return;
    }
    if (selectedDays.length === 0) {
      setErrorMessage('Debes seleccionar al menos un día de la semana.');
      return;
    }

    const newAlarm: SchoolAlarm = {
      id: alarmToEdit ? alarmToEdit.id : `alarm-${Date.now()}`,
      title: title.trim(),
      time,
      shiftId,
      soundId: selectedSoundId,
      soundType: selectedSound.type,
      days: selectedDays,
      enabled,
      notes: notes.trim(),
    };

    onSaveAlarm(newAlarm);
    stopAllSounds();
    onClose();
  };

  return (
    <div
      id="alarm-form-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="alarm-form-modal-content"
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {alarmToEdit ? 'Editar Alarma Escolar' : 'Programar Nueva Alarma'}
            </h3>
            <p className="text-xs text-slate-500">
              Configura hora, jornada, días de repetición y timbre a reproducir
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Plantillas Rápidas
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ROLES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alarm Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nombre / Motivo de la Alarma *
            </label>
            <input
              id="alarm-input-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Salida al Recreo de Primaria"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Time & Jornada Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Hora de Sonar (HH:mm) *
              </label>
              <input
                id="alarm-input-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Jornada Asignada *
              </label>
              <select
                id="alarm-select-shift"
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime} a {s.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Range Alert if alarm time is outside shift range */}
          {isTimeOutsideShift && currentShift && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Aviso de Rango:</strong> La hora elegida ({time}) está fuera del rango de la jornada{' '}
                <em>{currentShift.name}</em> ({currentShift.startTime} a {currentShift.endTime}).
              </div>
            </div>
          )}

          {/* Sound Selector + Preview Button */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Sonido / Timbre a Reproducir *
            </label>
            <div className="flex gap-2">
              <select
                id="alarm-select-sound"
                value={selectedSoundId}
                onChange={(e) => setSelectedSoundId(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none truncate"
                required
              >
                <optgroup label="Sonidos Predeterminados del Colegio">
                  {sounds
                    .filter((s) => s.isBuiltIn)
                    .map((snd) => (
                      <option key={snd.id} value={snd.id}>
                        {snd.name}
                      </option>
                    ))}
                </optgroup>
                {sounds.some((s) => !s.isBuiltIn) && (
                  <optgroup label="Sonidos Personalizados (MP3)">
                    {sounds
                      .filter((s) => !s.isBuiltIn)
                      .map((snd) => (
                        <option key={snd.id} value={snd.id}>
                          🎵 {snd.name}
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>

              <button
                id="btn-preview-sound-form"
                type="button"
                onClick={handlePreviewSound}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 border ${
                  isPlayingPreview
                    ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
                title="Escuchar muestra del timbre"
              >
                {isPlayingPreview ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Detener</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Probar</span>
                  </>
                )}
              </button>
            </div>
            {selectedSound && (
              <p className="text-[11px] text-slate-500 mt-1 italic">
                {selectedSound.description}
              </p>
            )}
          </div>

          {/* Days of Week */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Días que debe Sonar *
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDays([1, 2, 3, 4, 5])}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Lun a Vie
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedDays([0, 1, 2, 3, 4, 5, 6])}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Todos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleToggleDay(day.id)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {day.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="alarm-input-enabled"
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-xs font-bold text-slate-800">
              {enabled ? 'Alarma Activada' : 'Alarma Desactivada'}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                stopAllSounds();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              id="btn-save-alarm-submit"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
            >
              {alarmToEdit ? 'Guardar Cambios' : 'Crear Alarma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
