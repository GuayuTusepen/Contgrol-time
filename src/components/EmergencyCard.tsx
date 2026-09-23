import React from 'react';
import { Siren, ShieldAlert, VolumeX, AlertTriangle } from 'lucide-react';

interface EmergencyCardProps {
  isEmergencyActive: boolean;
  onOpenConfirm: () => void;
  onStopEmergency: () => void;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({
  isEmergencyActive,
  onOpenConfirm,
  onStopEmergency,
}) => {
  return (
    <div
      id="home-emergency-card"
      className={`w-full rounded-[24px] p-4 transition-all border relative overflow-hidden ${
        isEmergencyActive
          ? 'bg-red-950/90 border-red-500 shadow-2xl shadow-red-600/50 animate-pulse'
          : 'bg-[#202128] hover:bg-[#25262f] border-zinc-800/80'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* White Squircle with Siren icon */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isEmergencyActive
                ? 'bg-red-600 text-white animate-bounce'
                : 'bg-white text-red-600'
            }`}
          >
            <Siren className="w-5 h-5 text-red-600" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-white tracking-tight truncate">
                Alarma de Emergencia
              </h3>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-600/30 border border-red-500/40 text-red-400 shrink-0">
                Evacuación
              </span>
            </div>
            <p className="text-[12px] text-zinc-400 font-medium truncate mt-0.5">
              Punto de control • Máxima prioridad
            </p>
          </div>
        </div>

        {/* Action button */}
        {isEmergencyActive ? (
          <button
            type="button"
            onClick={onStopEmergency}
            className="px-3.5 py-2 rounded-xl bg-white text-red-600 hover:bg-zinc-100 font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <VolumeX className="w-4 h-4" />
            <span>Detener</span>
          </button>
        ) : (
          <button
            id="btn-trigger-emergency-home"
            type="button"
            onClick={onOpenConfirm}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Activar</span>
          </button>
        )}
      </div>
    </div>
  );
};
