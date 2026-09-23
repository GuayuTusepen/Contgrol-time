import React, { useState, useEffect } from 'react';
import { MapPin, Clock, MoreVertical } from 'lucide-react';

interface BentoStatsCardsProps {
  location: string;
  onEditLocation: () => void;
  onClockClick?: () => void;
}

export const BentoStatsCards: React.FC<BentoStatsCardsProps> = ({
  location,
  onEditLocation,
  onClockClick,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Reloj digital en tiempo real: se actualiza exactamente cada segundo
  useEffect(() => {
    const updateTime = () => setCurrentDate(new Date());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Formateo de horas, minutos y segundos
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  const timeHoursMinutes = `${hours}:${minutes}`;

  // Formato de fecha en español (ej. "Vie, 18 Sep")
  const formattedDay = currentDate.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="w-full grid grid-cols-2 gap-3.5 select-none">
      {/* TARJETA 1 (Izquierda): UBICACIÓN DE LA ESCUELA */}
      <div
        id="bento-card-left"
        onClick={onEditLocation}
        className="bg-[#202128] hover:bg-[#25262f] border border-zinc-800/80 rounded-[26px] p-4 transition-all shadow-md active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[142px] group"
      >
        {/* Encabezado: Squircle blanco con icono + botón 3 puntos */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-[14px] bg-white flex items-center justify-center text-black shadow-sm group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5 stroke-[2.4] text-zinc-950" />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditLocation();
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
            title="Cambiar sede escolar"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido: Nombre y tipo de sede */}
        <div className="mt-3">
          <span className="text-[13px] font-semibold text-zinc-400 block tracking-tight">
            Ubicación
          </span>
          <div className="mt-0.5">
            <h3
              className="text-lg sm:text-xl font-black text-white font-sans tracking-tight truncate leading-tight group-hover:text-orange-400 transition-colors"
              title={location || 'Sede Central'}
            >
              {location || 'Sede Central'}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px] font-semibold">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sede activa</span>
            </span>
            <span className="text-orange-400 group-hover:underline font-bold">
              Editar
            </span>
          </div>
        </div>
      </div>

      {/* TARJETA 2 (Derecha): RELOJ DIGITAL EN TIEMPO REAL CON SEGUNDOS */}
      <div
        id="bento-card-right"
        onClick={onClockClick}
        className="bg-[#202128] hover:bg-[#25262f] border border-zinc-800/80 rounded-[26px] p-4 transition-all shadow-md active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[142px] group"
      >
        {/* Encabezado: Squircle blanco con icono + botón 3 puntos */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-[14px] bg-white flex items-center justify-center text-black shadow-sm group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5 stroke-[2.4] text-zinc-950" />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onClockClick) onClockClick();
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
            title="Ver información de horario"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido: Reloj digital con segundos dinámicos que cambian cada segundo */}
        <div className="mt-3">
          <span className="text-[13px] font-semibold text-zinc-400 block tracking-tight">
            Hora de la Escuela
          </span>
          <div className="flex items-baseline gap-1 mt-0.5 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
              {timeHoursMinutes}
            </span>
            <span className="text-sm sm:text-base font-bold text-orange-400 font-mono tracking-tight">
              :{seconds}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px] font-semibold">
            <span className="text-zinc-300 capitalize truncate font-medium">
              {formattedDay}
            </span>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>EN VIVO</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
