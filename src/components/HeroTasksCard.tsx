import React from 'react';
import { FileText, MoreVertical, ChevronRight } from 'lucide-react';
import { SchoolShift } from '../types';

interface HeroTasksCardProps {
  activeShift: SchoolShift | null;
  progressPercent: number;
  percentageText?: string;
  trendText?: string;
  nextAlarmSummary?: string;
  onOpenShiftDetails: () => void;
}

export const HeroTasksCard: React.FC<HeroTasksCardProps> = ({
  activeShift,
  progressPercent,
  percentageText = `${progressPercent}%`,
  trendText = '+5%',
  nextAlarmSummary,
  onOpenShiftDetails,
}) => {
  const shiftName = activeShift ? activeShift.name : 'Jornada Escolar';

  return (
    <div
      id="hero-tasks-card"
      onClick={onOpenShiftDetails}
      className="w-full bg-[#202128] hover:bg-[#24252e] border border-zinc-800/80 rounded-[28px] p-5 transition-all shadow-lg active:scale-[0.99] cursor-pointer relative overflow-hidden"
    >
      {/* Top Row: White Squircle Icon + Title + 3 Dots */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* White Squircle Icon Container - Exactly matching screenshot */}
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-zinc-900 shadow-sm">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-white tracking-tight">
              {shiftName}
            </h2>
            {activeShift && (
              <span className="text-[11px] font-medium text-zinc-400 block -mt-0.5">
                {activeShift.startTime} - {activeShift.endTime}
              </span>
            )}
          </div>
        </div>

        {/* Three dots action icon */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenShiftDetails();
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Row: 72% + ↑ +5% */}
      <div className="flex items-baseline justify-between mb-3 px-0.5">
        <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-sans">
          {percentageText}
        </span>
        <div className="flex items-center gap-1 text-[13px] font-semibold text-zinc-400">
          <span>↑</span>
          <span>{trendText}</span>
        </div>
      </div>

      {/* Signature Striped Progress Bar */}
      <div className="w-full h-3.5 bg-[#2b2d36] rounded-full overflow-hidden flex p-0.5 border border-zinc-700/40">
        {/* Filled Orange Bar */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-700 shadow-sm"
          style={{ width: `${Math.max(8, Math.min(100, progressPercent))}%` }}
        />
        {/* Unfilled Striped Diagonal Pattern (matching screenshot) */}
        <div className="flex-1 h-full progress-striped-bg rounded-r-full opacity-60" />
      </div>

      {/* Footer hint */}
      {nextAlarmSummary && (
        <div className="mt-3.5 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="truncate">{nextAlarmSummary}</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1" />
        </div>
      )}
    </div>
  );
};
