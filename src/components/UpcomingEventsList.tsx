import React from 'react';
import { SchoolAlarm, SchoolShift, SoundItem } from '../types';
import {
  FileEdit,
  Star,
  Coffee,
  Bell,
  MoreVertical,
  Play,
  Square,
  BookOpen,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface UpcomingEventsListProps {
  alarms: SchoolAlarm[];
  shifts: SchoolShift[];
  sounds: SoundItem[];
  playingAlarmId: string | null;
  onPreviewSound: (alarm: SchoolAlarm) => void;
  onSelectAlarmAction: (alarm: SchoolAlarm) => void;
  onSeeAllClick: () => void;
  seeAllOpen: boolean;
}

// Map alarm titles/types to the distinct icons shown in the reference (pencil, star, coffee, etc.)
const getAlarmIcon = (alarm: SchoolAlarm, index: number) => {
  const lower = alarm.title.toLowerCase();
  if (lower.includes('recreo') || lower.includes('descanso') || lower.includes('almuerzo')) {
    return <Coffee className="w-5 h-5 stroke-[2.2]" />;
  }
  if (lower.includes('formacion') || lower.includes('acto') || lower.includes('evento')) {
    return <Star className="w-5 h-5 stroke-[2.2]" />;
  }
  if (lower.includes('inicio') || lower.includes('clase') || lower.includes('bloque')) {
    return <FileEdit className="w-5 h-5 stroke-[2.2]" />;
  }
  if (lower.includes('fin') || lower.includes('salida')) {
    return <GraduationCap className="w-5 h-5 stroke-[2.2]" />;
  }

  // Fallbacks matching aesthetic
  const icons = [
    <FileEdit key="1" className="w-5 h-5 stroke-[2.2]" />,
    <Star key="2" className="w-5 h-5 stroke-[2.2]" />,
    <Coffee key="3" className="w-5 h-5 stroke-[2.2]" />,
    <BookOpen key="4" className="w-5 h-5 stroke-[2.2]" />,
  ];
  return icons[index % icons.length];
};

export const UpcomingEventsList: React.FC<UpcomingEventsListProps> = ({
  alarms,
  shifts,
  sounds,
  playingAlarmId,
  onPreviewSound,
  onSelectAlarmAction,
  onSeeAllClick,
  seeAllOpen,
}) => {
  // Sort alarms by time
  const sortedAlarms = [...alarms].sort((a, b) => a.time.localeCompare(b.time));
  const displayedAlarms = seeAllOpen ? sortedAlarms : sortedAlarms.slice(0, 4);

  return (
    <div className="w-full space-y-3">
      {/* Section Header: "Upcoming events" + "See all" */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[17px] font-bold text-white tracking-tight">
          Upcoming events
        </h3>
        <button
          type="button"
          onClick={onSeeAllClick}
          className="text-[13px] font-bold text-[#f97316] hover:text-[#fb923c] transition-colors cursor-pointer"
        >
          {seeAllOpen ? 'Show less' : 'See all'}
        </button>
      </div>

      {/* Cards List matching "Project Review", "Workforce Summit", "Monthly meeting" */}
      <div className="space-y-2.5">
        {displayedAlarms.map((alarm, index) => {
          const shift = shifts.find((s) => s.id === alarm.shiftId);
          const sound = sounds.find((s) => s.id === alarm.soundId);
          const isPlaying = playingAlarmId === alarm.id;

          return (
            <div
              key={alarm.id}
              id={`upcoming-alarm-card-${alarm.id}`}
              onClick={() => onSelectAlarmAction(alarm)}
              className={`w-full bg-[#202128] hover:bg-[#25262f] border border-zinc-800/70 rounded-[22px] p-3.5 sm:p-4 transition-all shadow-sm flex items-center justify-between gap-3.5 cursor-pointer active:scale-[0.99] ${
                !alarm.enabled ? 'opacity-50' : ''
              }`}
            >
              {/* Left Side: White Squircle Icon + Title and Subtitle */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Crisp White Squircle Icon Container */}
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-zinc-900 shadow-sm shrink-0">
                  {getAlarmIcon(alarm, index)}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-[15px] font-bold text-white truncate tracking-tight">
                    {alarm.title}
                  </h4>
                  <p className="text-[12px] text-zinc-400 font-medium truncate mt-0.5">
                    <span className="font-mono text-zinc-300 font-semibold">{alarm.time}</span>
                    {shift ? ` • ${shift.name}` : ''}
                    {sound ? ` • ${sound.name}` : ''}
                  </p>
                </div>
              </div>

              {/* Right Side: Quick Play Sound or 3 Dots Menu */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewSound(alarm);
                  }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isPlaying
                      ? 'bg-amber-400 text-black shadow-sm animate-pulse'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  title="Oír timbre"
                >
                  {isPlaying ? (
                    <Square className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAlarmAction(alarm);
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Opciones de alarma"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {displayedAlarms.length === 0 && (
          <div className="bg-[#202128] border border-zinc-800/80 rounded-[22px] p-6 text-center text-xs text-zinc-400">
            No hay alarmas programadas aún.
          </div>
        )}
      </div>
    </div>
  );
};
