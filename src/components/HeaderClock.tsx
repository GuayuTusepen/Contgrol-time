import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { unlockAudioContext } from '../utils/soundEngine';

interface HeaderClockProps {
  volume: number;
  onVolumeChange: (vol: number) => void;
  nextAlarmInfo: { title: string; time: string; minutesRemaining: number } | null;
  audioUnlocked: boolean;
  onUnlockAudio: () => void;
  onTriggerEmergency: () => void;
}

export const HeaderClock: React.FC<HeaderClockProps> = ({
  volume,
  onVolumeChange,
  nextAlarmInfo,
  audioUnlocked,
  onUnlockAudio,
  onTriggerEmergency,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateString = currentTime.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Centered App Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="font-black text-xl tracking-tighter">CT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Control Time
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Sistema Automatizado de Alarmas y Timbres Escolares
          </p>
        </div>

        {/* Live Clock & Status Bar */}
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Current Time Display */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl sm:text-5xl font-bold tracking-wider text-white">
                {timeString}
              </span>
              <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                En vivo
              </span>
            </div>
            <span className="text-xs sm:text-sm text-slate-400 capitalize mt-1">
              {dateString}
            </span>
          </div>

          {/* Next Alarm Banner */}
          <div className="flex-1 max-w-md w-full bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <span className="text-lg">🔔</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Próxima Alarma
              </p>
              {nextAlarmInfo ? (
                <p className="text-sm font-bold text-white truncate">
                  {nextAlarmInfo.time} — {nextAlarmInfo.title}{' '}
                  <span className="text-xs font-normal text-amber-300 ml-1">
                    ({nextAlarmInfo.minutesRemaining === 0 ? 'En este minuto' : `en ${nextAlarmInfo.minutesRemaining} min`})
                  </span>
                </p>
              ) : (
                <p className="text-sm font-medium text-slate-400">
                  No hay más alarmas activas programadas hoy
                </p>
              )}
            </div>
          </div>

          {/* Quick Controls: Audio Status, Volume, and Direct Emergency Trigger */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            {/* Audio Context Status / Unlock */}
            {!audioUnlocked ? (
              <button
                id="btn-unlock-audio"
                type="button"
                onClick={() => {
                  unlockAudioContext();
                  onUnlockAudio();
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow"
                title="Haz clic para activar el reproductor de sonido en este navegador"
              >
                <span>🔊</span> Activar Audio
              </button>
            ) : (
              <div className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Audio Listo</span>
              </div>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-blue-400" />
              )}
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                title={`Volumen: ${Math.round(volume * 100)}%`}
              />
              <span className="text-xs font-mono text-slate-300 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Emergency Header Quick Trigger */}
            <button
              id="header-btn-emergency"
              type="button"
              onClick={onTriggerEmergency}
              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-1.5 shadow-md shadow-red-600/30 hover:shadow-red-600/50 active:scale-95"
            >
              <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
              <span>Emergencia</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
