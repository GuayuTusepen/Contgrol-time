import React from 'react';
import {
  X,
  CalendarDays,
  PlusCircle,
  Bell,
  Siren,
  Music,
  Volume2,
  Sliders,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface AppMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateShift: () => void;
  onOpenCreateAlarm: () => void;
  onOpenAllAlarms: () => void;
  onOpenEmergency: () => void;
  onOpenSounds: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isAudioUnlocked: boolean;
  onUnlockAudio: () => void;
}

export const AppMenuDrawer: React.FC<AppMenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCreateShift,
  onOpenCreateAlarm,
  onOpenAllAlarms,
  onOpenEmergency,
  onOpenSounds,
  volume,
  onVolumeChange,
  isAudioUnlocked,
  onUnlockAudio,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xs bg-[#191a20] h-full p-5 flex flex-col justify-between border-l border-zinc-800 shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-black font-black text-sm">
                CT
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Control Time</h3>
                <span className="text-[11px] text-zinc-400">Opciones del Sistema</span>
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

          {/* Menu Items */}
          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateShift();
              }}
              className="w-full p-3 rounded-2xl bg-[#212229] hover:bg-[#282933] text-white flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-zinc-900 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block">Crear Jornadas</span>
                  <span className="text-[10px] text-zinc-400">Gestionar rangos y horarios</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateAlarm();
              }}
              className="w-full p-3 rounded-2xl bg-[#212229] hover:bg-[#282933] text-white flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-zinc-900 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block">Crear Alarmas</span>
                  <span className="text-[10px] text-zinc-400">Sonido, hora y días</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAllAlarms();
              }}
              className="w-full p-3 rounded-2xl bg-[#212229] hover:bg-[#282933] text-white flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-zinc-900 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block">Ver Alarmas</span>
                  <span className="text-[10px] text-zinc-400">Activadas y desactivadas</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSounds();
              }}
              className="w-full p-3 rounded-2xl bg-[#212229] hover:bg-[#282933] text-white flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-zinc-900 flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block">Sonidos y MP3</span>
                  <span className="text-[10px] text-zinc-400">Timbres y Local Storage</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

            {/* Emergency Evacuation */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEmergency();
              }}
              className="w-full p-3 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-white flex items-center justify-between transition-all mt-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center animate-pulse">
                  <Siren className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-red-300 block">Alarma de Emergencia</span>
                  <span className="text-[10px] text-red-400">Evacuación al punto de control</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Footer: Volume slider + Audio engine unlock */}
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-orange-400" />
              <span>Volumen Maestro</span>
            </div>
            <span className="font-mono text-white">{Math.round(volume * 100)}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />

          {!isAudioUnlocked && (
            <button
              type="button"
              onClick={onUnlockAudio}
              className="w-full py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>🔊 Habilitar Audio en Navegador</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
