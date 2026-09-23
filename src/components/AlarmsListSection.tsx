import React, { useState } from 'react';
import { SchoolAlarm, SchoolShift, SoundItem, DAYS_OF_WEEK } from '../types';
import { Bell, BellOff, Edit3, Trash2, Play, Square, Filter, Plus } from 'lucide-react';
import { playSound, stopAllSounds } from '../utils/soundEngine';

interface AlarmsListSectionProps {
  alarms: SchoolAlarm[];
  shifts: SchoolShift[];
  sounds: SoundItem[];
  volume: number;
  onToggleAlarm: (alarmId: string) => void;
  onEditAlarm: (alarm: SchoolAlarm) => void;
  onDeleteAlarm: (alarmId: string) => void;
  onOpenCreateAlarm: () => void;
}

export const AlarmsListSection: React.FC<AlarmsListSectionProps> = ({
  alarms,
  shifts,
  sounds,
  volume,
  onToggleAlarm,
  onEditAlarm,
  onDeleteAlarm,
  onOpenCreateAlarm,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('all');
  const [playingAlarmId, setPlayingAlarmId] = useState<string | null>(null);

  const activeAlarmsCount = alarms.filter((a) => a.enabled).length;
  const inactiveAlarmsCount = alarms.filter((a) => !a.enabled).length;

  const filteredAlarms = alarms.filter((alarm) => {
    if (filterTab === 'active' && !alarm.enabled) return false;
    if (filterTab === 'inactive' && alarm.enabled) return false;
    if (selectedShiftFilter !== 'all' && alarm.shiftId !== selectedShiftFilter) return false;
    return true;
  }).sort((a, b) => a.time.localeCompare(b.time));

  const handlePreviewSound = async (alarm: SchoolAlarm) => {
    if (playingAlarmId === alarm.id) {
      stopAllSounds();
      setPlayingAlarmId(null);
      return;
    }

    stopAllSounds();
    const soundItem = sounds.find((s) => s.id === alarm.soundId);
    setPlayingAlarmId(alarm.id);

    try {
      const soundType = soundItem ? soundItem.type : alarm.soundType;
      const customUrl = soundItem?.dataUrl;
      const duration = await playSound(soundType, customUrl, volume, soundType === 'emergencia');

      setTimeout(() => {
        setPlayingAlarmId((prev) => (prev === alarm.id ? null : prev));
      }, duration * 1000);
    } catch {
      setPlayingAlarmId(null);
    }
  };

  return (
    <div id="recuadro-ver-alarmas" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Ver y Administrar Alarmas
              </h2>
              <p className="text-xs text-slate-500">
                Monitorea qué timbres están activados o desactivados, pruébalos y edítalos
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-open-create-alarm"
          type="button"
          onClick={onOpenCreateAlarm}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Alarma</span>
        </button>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 my-5">
        {/* Status Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({alarms.length})
          </button>
          <button
            id="tab-filter-active"
            type="button"
            onClick={() => setFilterTab('active')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              filterTab === 'active'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Activadas ({activeAlarmsCount})</span>
          </button>
          <button
            id="tab-filter-inactive"
            type="button"
            onClick={() => setFilterTab('inactive')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              filterTab === 'inactive'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
            <span>Desactivadas ({inactiveAlarmsCount})</span>
          </button>
        </div>

        {/* Filter by Jornada */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="select-filter-shift"
            value={selectedShiftFilter}
            onChange={(e) => setSelectedShiftFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="all">Todas las Jornadas</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alarms List */}
      <div className="space-y-3">
        {filteredAlarms.map((alarm) => {
          const shift = shifts.find((s) => s.id === alarm.shiftId);
          const soundItem = sounds.find((s) => s.id === alarm.soundId);
          const isPlaying = playingAlarmId === alarm.id;

          return (
            <div
              key={alarm.id}
              id={`alarm-row-${alarm.id}`}
              className={`rounded-xl border p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                alarm.enabled
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/60 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Left Column: Time & Main Info */}
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                {/* Time Display */}
                <div
                  className={`w-20 sm:w-24 text-center py-2 px-2.5 rounded-xl font-mono font-black text-xl sm:text-2xl shrink-0 ${
                    alarm.enabled
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {alarm.time}
                </div>

                {/* Alarm Details */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {alarm.title}
                    </h3>

                    {/* Jornada Badge */}
                    {shift ? (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white shrink-0"
                        style={{ backgroundColor: shift.color || '#2563eb' }}
                      >
                        {shift.name}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-600">
                        Sin jornada
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        alarm.enabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {alarm.enabled ? 'Activada' : 'Desactivada'}
                    </span>
                  </div>

                  {/* Sound Name & Repeat Days */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <span>🎵</span> {soundItem ? soundItem.name : 'Timbre Escolar'}
                    </span>

                    <span className="text-slate-300">•</span>

                    {/* Days representation */}
                    <div className="flex items-center gap-1">
                      {DAYS_OF_WEEK.map((d) => {
                        const isDayActive = alarm.days.includes(d.id);
                        return (
                          <span
                            key={d.id}
                            className={`text-[10px] font-bold px-1 rounded ${
                              isDayActive
                                ? 'bg-slate-800 text-white'
                                : 'text-slate-300'
                            }`}
                          >
                            {d.short.charAt(0)}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {alarm.notes && (
                    <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                      {alarm.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Actions (Preview sound, Toggle on/off, Edit, Delete) */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Preview Button */}
                <button
                  id={`btn-play-alarm-${alarm.id}`}
                  type="button"
                  onClick={() => handlePreviewSound(alarm)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isPlaying
                      ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Reproducir sonido asignado a esta alarma"
                >
                  {isPlaying ? (
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

                {/* Toggle Active Switch */}
                <button
                  id={`toggle-alarm-${alarm.id}`}
                  type="button"
                  onClick={() => onToggleAlarm(alarm.id)}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                    alarm.enabled
                      ? 'text-emerald-700 hover:bg-emerald-50'
                      : 'text-slate-400 hover:bg-slate-100'
                  }`}
                  title={alarm.enabled ? 'Desactivar alarma' : 'Activar alarma'}
                >
                  {alarm.enabled ? (
                    <Bell className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <BellOff className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {/* Edit Button */}
                <button
                  id={`btn-edit-alarm-${alarm.id}`}
                  type="button"
                  onClick={() => onEditAlarm(alarm)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Editar alarma"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  id={`btn-delete-alarm-${alarm.id}`}
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar la alarma "${alarm.title}" (${alarm.time})?`)) {
                      onDeleteAlarm(alarm.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Eliminar alarma"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredAlarms.length === 0 && (
          <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              No hay alarmas para el filtro seleccionado.
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {filterTab === 'active'
                ? 'No tienes alarmas activadas en este momento.'
                : filterTab === 'inactive'
                ? 'No tienes alarmas desactivadas en este momento.'
                : 'Comienza creando una nueva alarma escolar para tu jornada.'}
            </p>
            <button
              type="button"
              onClick={onOpenCreateAlarm}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Programar Nueva Alarma</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
