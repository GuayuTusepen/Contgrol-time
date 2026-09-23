import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Volume2, XCircle, Siren } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEmergencyActive: boolean;
  onStopEmergency: () => void;
}

export const EmergencySection: React.FC<{
  onOpenConfirm: () => void;
  isEmergencyActive: boolean;
  onStopEmergency: () => void;
}> = ({ onOpenConfirm, isEmergencyActive, onStopEmergency }) => {
  return (
    <div
      id="emergency-card"
      className={`rounded-2xl p-6 transition-all border-2 ${
        isEmergencyActive
          ? 'bg-red-950/90 border-red-500 text-white shadow-2xl shadow-red-600/50 animate-pulse'
          : 'bg-red-50/70 border-red-200 text-slate-900 hover:border-red-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isEmergencyActive
                ? 'bg-red-600 text-white animate-bounce'
                : 'bg-red-100 text-red-600'
            }`}
          >
            <Siren className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-red-900">
                Alarma de Emergencia Escolar
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase bg-red-600 text-white tracking-wider">
                Prioridad Máxima
              </span>
            </div>
            <p className="text-xs sm:text-sm text-red-700/90 mt-1 max-w-xl leading-relaxed">
              Activa inmediatamente la sirena de evacuación al <strong>100% de volumen</strong>{' '}
              independientemente de la jornada activa para acudir al <strong>punto de control y encuentro</strong>.
            </p>
          </div>
        </div>

        <div>
          {isEmergencyActive ? (
            <button
              id="btn-stop-emergency-active"
              type="button"
              onClick={onStopEmergency}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5 text-red-600" />
              <span>Detener Alarma de Emergencia</span>
            </button>
          ) : (
            <button
              id="btn-trigger-emergency-confirm"
              type="button"
              onClick={onOpenConfirm}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 hover:shadow-red-600/50 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5 text-white" />
              <span>Activar Alarma de Emergencia</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const EmergencyConfirmModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="emergency-confirm-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 relative overflow-hidden">
        {/* Top Warning Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              ¿Confirmar Alarma de Emergencia?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocolo de evacuación y punto de control
            </p>
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-red-900 text-xs sm:text-sm space-y-2 mb-6">
          <p className="font-semibold flex items-center gap-1.5 text-red-700">
            <Volume2 className="w-4 h-4 text-red-600 shrink-0" />
            Esta alarma sonará al 100% de volumen de forma inmediata.
          </p>
          <p className="text-slate-600 text-xs">
            Se anulan temporalmente los límites de jornadas y se emitirá la sirena continua de evacuación para dirigir a toda la comunidad escolar a los puntos de encuentro seguros.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            id="btn-emergency-cancel"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors"
          >
            No, Cancelar
          </button>
          <button
            id="btn-emergency-accept"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>Sí, Activar Alarma</span>
          </button>
        </div>
      </div>
    </div>
  );
};
