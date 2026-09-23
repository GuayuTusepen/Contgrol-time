import React from 'react';
import { ActiveAlarmTrigger } from '../types';
import { Bell, ShieldAlert, VolumeX } from 'lucide-react';

interface ActiveAlarmBannerProps {
  activeAlarm: ActiveAlarmTrigger | null;
  onStop: () => void;
}

export const ActiveAlarmBanner: React.FC<ActiveAlarmBannerProps> = ({
  activeAlarm,
  onStop,
}) => {
  if (!activeAlarm) return null;

  const isEmergency = activeAlarm.isEmergency;

  return (
    <div
      id="active-alarm-overlay"
      className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-2xl p-4 shadow-2xl border-2 animate-in slide-in-from-top duration-200 ${
        isEmergency
          ? 'bg-red-600 border-white text-white shadow-red-900/60 ring-4 ring-red-500/50 animate-pulse'
          : 'bg-slate-900 border-blue-400 text-white shadow-slate-950/60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isEmergency
                ? 'bg-white text-red-600 animate-bounce'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {isEmergency ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <Bell className="w-6 h-6 animate-bounce" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                  isEmergency
                    ? 'bg-white text-red-700'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {isEmergency ? 'EMERGENCIA GENERAL' : 'TIMBRE ESCOLAR EN CURSO'}
              </span>
            </div>
            <h3 className="text-base font-black tracking-tight mt-0.5 leading-tight">
              {activeAlarm.title}
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                isEmergency ? 'text-red-100 font-bold' : 'text-slate-300'
              }`}
            >
              Sonando: {activeAlarm.soundName}
            </p>
          </div>
        </div>

        <button
          id="btn-dismiss-active-alarm"
          type="button"
          onClick={onStop}
          className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
            isEmergency
              ? 'bg-white text-red-700 hover:bg-red-100 shadow-md'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title="Silenciar sonido inmediatamente"
        >
          <VolumeX className="w-4 h-4" />
          <span>Silenciar</span>
        </button>
      </div>

      {/* Audio Wave Visualizer Simulation */}
      <div className="flex items-center justify-center gap-1 mt-3 pt-2 border-t border-white/20">
        {[40, 70, 100, 60, 90, 45, 80, 55, 95, 75, 50, 85].map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isEmergency ? 'bg-white' : 'bg-blue-400'
            }`}
            style={{
              height: `${Math.max(6, Math.min(24, (h * (i % 2 === 0 ? 1 : 0.8))))}px`,
              animation: `pulse 0.6s infinite alternate ${i * 0.08}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
