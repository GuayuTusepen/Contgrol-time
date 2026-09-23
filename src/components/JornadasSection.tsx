import React, { useState } from 'react';
import { SchoolShift, SchoolAlarm, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { Plus, Clock, Calendar, Trash2, Edit3, Check, X, BellPlus } from 'lucide-react';

interface JornadasSectionProps {
  shifts: SchoolShift[];
  alarms: SchoolAlarm[];
  onSaveShift: (shift: SchoolShift) => void;
  onDeleteShift: (shiftId: string) => void;
  onQuickAddAlarmToShift: (shift: SchoolShift) => void;
}

const PRESET_COLORS = [
  '#2563eb', // Blue
  '#d97706', // Amber
  '#16a34a', // Green
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
];

export const JornadasSection: React.FC<JornadasSectionProps> = ({
  shifts,
  alarms,
  onSaveShift,
  onDeleteShift,
  onQuickAddAlarmToShift,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('12:30');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]);
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingShiftId(null);
    setName('');
    setStartTime('07:00');
    setEndTime('12:30');
    setSelectedDays([1, 2, 3, 4, 5]);
    setDescription('');
    setColor(PRESET_COLORS[shifts.length % PRESET_COLORS.length]);
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const handleEdit = (shift: SchoolShift) => {
    setEditingShiftId(shift.id);
    setName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setSelectedDays(shift.days);
    setDescription(shift.description || '');
    setColor(shift.color || PRESET_COLORS[0]);
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const handleToggleDay = (dayId: DayOfWeek) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length === 1) return; // Keep at least one day
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
  };

  const handleSelectWeekdays = () => {
    setSelectedDays([1, 2, 3, 4, 5]);
  };

  const handleSelectAllDays = () => {
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Por favor introduce el nombre de la jornada.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMsg('Introduce la hora de inicio y de fin.');
      return;
    }
    if (startTime >= endTime) {
      setErrorMsg('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }
    if (selectedDays.length === 0) {
      setErrorMsg('Selecciona al menos un día.');
      return;
    }

    const newShift: SchoolShift = {
      id: editingShiftId || `shift-${Date.now()}`,
      name: name.trim(),
      startTime,
      endTime,
      days: selectedDays,
      description: description.trim(),
      color,
    };

    onSaveShift(newShift);
    setIsFormOpen(false);
    setErrorMsg(null);
  };

  return (
    <div id="recuadro-jornadas" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Crear y Gestionar Jornadas
              </h2>
              <p className="text-xs text-slate-500">
                Define las jornadas escolares (rango horario) para asignar y delimitar sus alarmas
              </p>
            </div>
          </div>
        </div>

        {!isFormOpen && (
          <button
            id="btn-new-shift"
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Jornada</span>
          </button>
        )}
      </div>

      {/* Form (inline collapsible) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="my-5 p-5 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              {editingShiftId ? 'Editar Jornada Escolar' : 'Crear Nueva Jornada'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Shift Name */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Jornada *
              </label>
              <input
                id="shift-input-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Jornada Mañana, Jornada Única..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Time Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hora Inicio *
              </label>
              <input
                id="shift-input-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hora Fin *
              </label>
              <input
                id="shift-input-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Days Selection */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Días de Aplicación *
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectWeekdays}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Lun a Vie
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleSelectAllDays}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Todos
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleToggleDay(day.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color & Description */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Color Distintivo
              </label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? '#0f172a' : 'transparent',
                    }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción / Notas (Opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Nivel Secundaria y Bachillerato"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              id="btn-save-shift"
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {editingShiftId ? 'Actualizar Jornada' : 'Guardar Jornada'}
            </button>
          </div>
        </form>
      )}

      {/* Shifts List / Cards */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map((shift) => {
          const shiftAlarms = alarms.filter((a) => a.shiftId === shift.id);
          const activeShiftAlarms = shiftAlarms.filter((a) => a.enabled);

          return (
            <div
              key={shift.id}
              id={`shift-card-${shift.id}`}
              className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: shift.color }}
                    />
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {shift.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(shift)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      title="Editar Jornada"
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
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Eliminar Jornada"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Range Tag */}
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 rounded-md px-2.5 py-1 w-fit mb-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {shift.startTime} — {shift.endTime}
                  </span>
                </div>

                {/* Days */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {DAYS_OF_WEEK.map((d) => {
                    const isSet = shift.days.includes(d.id);
                    return (
                      <span
                        key={d.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          isSet
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200/60 text-slate-400 line-through'
                        }`}
                      >
                        {d.short}
                      </span>
                    );
                  })}
                </div>

                {shift.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {shift.description}
                  </p>
                )}
              </div>

              {/* Footer with alarms count & quick add */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between mt-2">
                <span className="text-xs text-slate-600 font-medium">
                  <strong>{activeShiftAlarms.length}</strong> de {shiftAlarms.length} alarmas activas
                </span>

                <button
                  type="button"
                  onClick={() => onQuickAddAlarmToShift(shift)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 flex items-center gap-1 transition-colors"
                  title="Crear alarma configurada dentro de este rango"
                >
                  <BellPlus className="w-3.5 h-3.5" />
                  <span>+ Alarma</span>
                </button>
              </div>
            </div>
          );
        })}

        {shifts.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-sm font-medium">No hay jornadas creadas todavía.</p>
            <button
              type="button"
              onClick={handleOpenNew}
              className="mt-2 text-xs font-bold text-blue-600 hover:underline"
            >
              Crear la primera jornada escolar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
