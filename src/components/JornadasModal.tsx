import React, { useState } from 'react';
import { SchoolShift, SchoolAlarm, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { X, Plus, CalendarDays, Edit3, Trash2, Check, Clock } from 'lucide-react';

interface JornadasModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: SchoolShift[];
  alarms: SchoolAlarm[];
  onSaveShift: (shift: SchoolShift) => void;
  onDeleteShift: (shiftId: string) => void;
}

const PRESET_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#eab308'];

export const JornadasModal: React.FC<JornadasModalProps> = ({
  isOpen,
  onClose,
  shifts,
  alarms,
  onSaveShift,
  onDeleteShift,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('12:30');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOpenNew = () => {
    setEditingId(null);
    setName('');
    setStartTime('07:00');
    setEndTime('12:30');
    setSelectedDays([1, 2, 3, 4, 5]);
    setColor(PRESET_COLORS[shifts.length % PRESET_COLORS.length]);
    setErrorMsg(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (shift: SchoolShift) => {
    setEditingId(shift.id);
    setName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setSelectedDays(shift.days);
    setColor(shift.color || PRESET_COLORS[0]);
    setErrorMsg(null);
    setIsEditing(true);
  };

  const handleToggleDay = (dayId: DayOfWeek) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length === 1) return;
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Ingresa un nombre para la jornada');
      return;
    }
    if (!startTime || !endTime || startTime >= endTime) {
      setErrorMsg('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    const newShift: SchoolShift = {
      id: editingId || `shift-${Date.now()}`,
      name: name.trim(),
      startTime,
      endTime,
      days: selectedDays,
      color,
    };

    onSaveShift(newShift);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#1c1d24] border border-zinc-800 rounded-[32px] p-6 shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-zinc-900 shadow-sm">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Gestionar Jornadas</h3>
                <p className="text-xs text-zinc-400">Rangos y horarios escolares</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form or List */}
          <div className="mt-4 overflow-y-auto max-h-[60vh] pr-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-950/60 border border-red-800/60 text-red-300 rounded-xl text-xs">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nombre de la jornada
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Jornada Mañana"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#14151a] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Hora Inicio
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#14151a] border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Hora Fin
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#14151a] border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* Days */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Días activos
                  </label>
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS_OF_WEEK.map((d) => {
                      const isSelected = selectedDays.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleToggleDay(d.id)}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-orange-500 border-orange-500 text-black'
                              : 'bg-[#14151a] border-zinc-800 text-zinc-400'
                          }`}
                        >
                          {d.short}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Color representativo
                  </label>
                  <div className="flex gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: c }}
                      >
                        {color === c && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-400 text-black shadow-md shadow-orange-500/20"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {shifts.map((shift) => {
                  const shiftAlarms = alarms.filter((a) => a.shiftId === shift.id);
                  return (
                    <div
                      key={shift.id}
                      className="p-3.5 bg-[#212229] border border-zinc-800/80 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: shift.color || '#f97316' }}
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{shift.name}</h4>
                          <span className="text-xs font-mono text-zinc-400">
                            {shift.startTime} - {shift.endTime} • {shiftAlarms.length} alarmas
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(shift)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Eliminar la jornada "${shift.name}"?`)) {
                              onDeleteShift(shift.id);
                            }
                          }}
                          className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleOpenNew}
                  className="w-full py-3 rounded-2xl border border-dashed border-zinc-700 hover:border-orange-500/50 text-orange-400 hover:text-orange-300 text-xs font-bold flex items-center justify-center gap-2 transition-all mt-3"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Nueva Jornada</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
