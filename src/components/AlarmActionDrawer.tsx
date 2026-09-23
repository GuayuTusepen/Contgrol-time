import React from 'react';
import { SchoolAlarm, SchoolShift, SoundItem } from '../types';
import {
  X,
  Play,
  Square,
  Bell,
  BellOff,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Music,
} from 'lucide-react';

interface AlarmActionDrawerProps {
  alarm: SchoolAlarm | null;
  shift?: SchoolShift;
  sound?: SoundItem;
  isOpen: boolean;
  isPlaying: boolean;
  onClose: () => void;
  onToggleSound: () => void;
  onToggleEnabled: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const AlarmActionDrawer: React.FC<AlarmActionDrawerProps> = ({
  alarm,
  shift,
  sound,
  isOpen,
  isPlaying,
  onClose,
  onToggleSound,
  onToggleEnabled,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !alarm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-[#1c1d24] border border-zinc-800 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-zinc-900 shadow-sm">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{alarm.title}</h3>
              <p className="text-xs text-zinc-400 font-mono font-semibold">
                {alarm.time} • {shift?.name || 'Jornada'}
              </p>
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

        {/* Sound info */}
        <div className="bg-[#14151a] p-3.5 rounded-2xl border border-zinc-800/80 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Music className="w-4 h-4 text-orange-400" />
            <div className="text-xs">
              <span className="text-zinc-400 block text-[10px]">Sonido asignado</span>
              <span className="text-white font-semibold">{sound?.name || 'Timbre Escolar'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleSound}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isPlaying
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Parar' : 'Probar'}</span>
          </button>
        </div>

        {/* Action list */}
        <div className="space-y-2">
          {/* Toggle On/Off */}
          <button
            type="button"
            onClick={onToggleEnabled}
            className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between font-bold text-xs transition-all ${
              alarm.enabled
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {alarm.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span>{alarm.enabled ? 'Alarma Activada' : 'Alarma Desactivada'}</span>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold">
              {alarm.enabled ? 'Activa' : 'Pausada'}
            </span>
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={onEdit}
            className="w-full py-3 px-4 rounded-2xl bg-[#23242b] hover:bg-[#2c2d36] text-white flex items-center gap-2.5 font-bold text-xs transition-all"
          >
            <Edit3 className="w-4 h-4 text-zinc-400" />
            <span>Editar detalles y horario</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="w-full py-3 px-4 rounded-2xl bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center gap-2.5 font-bold text-xs transition-all border border-red-900/40"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Eliminar esta alarma</span>
          </button>
        </div>
      </div>
    </div>
  );
};
