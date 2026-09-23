import React, { useState } from 'react';
import { SchoolAlarm, SchoolShift, SoundItem } from '../types';
import { X, Plus, Bell, BellOff, Play, Square, Edit3, Trash2 } from 'lucide-react';
import { playSound, stopAllSounds } from '../utils/soundEngine';

interface AllAlarmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarms: SchoolAlarm[];
  shifts: SchoolShift[];
  sounds: SoundItem[];
  volume: number;
  onToggleAlarm: (alarmId: string) => void;
  onEditAlarm: (alarm: SchoolAlarm) => void;
  onDeleteAlarm: (alarmId: string) => void;
  onOpenCreateAlarm: () => void;
}

export const AllAlarmsModal: React.FC<AllAlarmsModalProps> = ({
  isOpen,
  onClose,
  alarms,
  shifts,
  sounds,
  volume,
  onToggleAlarm,
  onEditAlarm,
  onDeleteAlarm,
  onOpenCreateAlarm,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredAlarms = alarms.filter((a) => {
    if (filter === 'active') return a.enabled;
    if (filter === 'inactive') return !a.enabled;
    return true;
  }).sort((a, b) => a.time.localeCompare(b.time));

  const handlePlaySound = async (alarm: SchoolAlarm) => {
    if (playingId === alarm.id) {
      stopAllSounds();
      setPlayingId(null);
      return;
    }

    stopAllSounds();
    const soundItem = sounds.find((s) => s.id === alarm.soundId);
    setPlayingId(alarm.id);

    try {
      const soundType = soundItem ? soundItem.type : alarm.soundType;
      const duration = await playSound(
        soundType,
        soundItem?.dataUrl,
        volume,
        soundType === 'emergencia'
      );
      setTimeout(() => {
        setPlayingId((curr) => (curr === alarm.id ? null : curr));
      }, duration * 1000);
    } catch {
      setPlayingId(null);
    }
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
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ver Alarmas</h3>
                <p className="text-xs text-zinc-400">Listado completo y estado</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                stopAllSounds();
                onClose();
              }}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-[#14151a] p-1 rounded-2xl border border-zinc-800/80 mt-4">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todas ({alarms.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filter === 'active' ? 'bg-zinc-800 text-orange-400' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Activadas ({alarms.filter((a) => a.enabled).length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('inactive')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filter === 'inactive' ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Inactivas ({alarms.filter((a) => !a.enabled).length})
            </button>
          </div>

          {/* List */}
          <div className="mt-4 overflow-y-auto max-h-[50vh] space-y-2.5 pr-1">
            {filteredAlarms.map((alarm) => {
              const shift = shifts.find((s) => s.id === alarm.shiftId);
              const sound = sounds.find((s) => s.id === alarm.soundId);
              const isPlaying = playingId === alarm.id;

              return (
                <div
                  key={alarm.id}
                  className={`p-3 bg-[#212229] border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-3 ${
                    !alarm.enabled ? 'opacity-50' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{alarm.title}</h4>
                      {shift && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: shift.color || '#f97316' }}
                        />
                      )}
                    </div>
                    <span className="text-xs font-mono font-semibold text-orange-400 block mt-0.5">
                      {alarm.time} • {sound?.name || 'Timbre'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePlaySound(alarm)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isPlaying ? 'bg-amber-400 text-black animate-pulse' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleAlarm(alarm.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        alarm.enabled ? 'text-orange-400' : 'text-zinc-600'
                      }`}
                      title={alarm.enabled ? 'Desactivar' : 'Activar'}
                    >
                      {alarm.enabled ? <Bell className="w-4 h-4 fill-orange-400" /> : <BellOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditAlarm(alarm);
                      }}
                      className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar la alarma "${alarm.title}"?`)) {
                          onDeleteAlarm(alarm.id);
                        }
                      }}
                      className="w-8 h-8 rounded-xl text-zinc-400 hover:text-red-400 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredAlarms.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-500">
                No hay alarmas en esta vista.
              </div>
            )}
          </div>
        </div>

        {/* Footer Add */}
        <div className="pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateAlarm();
            }}
            className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Programar Nueva Alarma</span>
          </button>
        </div>
      </div>
    </div>
  );
};
