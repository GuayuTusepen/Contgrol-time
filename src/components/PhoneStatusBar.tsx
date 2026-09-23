import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface PhoneStatusBarProps {
  currentTime?: string;
}

export const PhoneStatusBar: React.FC<PhoneStatusBarProps> = ({ currentTime = '9:41' }) => {
  return (
    <div className="w-full pt-3 px-7 pb-2 flex items-center justify-between text-white select-none z-20">
      {/* Time Left */}
      <span className="text-[14px] font-semibold tracking-tight font-sans pl-1">
        {currentTime}
      </span>

      {/* Dynamic Island Notch */}
      <div className="w-24 h-[22px] bg-black rounded-full flex items-center justify-end px-2.5 gap-1.5 shadow-inner border border-zinc-900/80">
        <div className="w-2.5 h-2.5 rounded-full bg-[#0d0f15] border border-zinc-800" />
        <div className="w-2 h-2 rounded-full bg-[#162238] border border-blue-900/50" />
      </div>

      {/* Icons Right: Cellular, WiFi, Battery */}
      <div className="flex items-center gap-1.5 pr-1">
        <Signal className="w-3.5 h-3.5 fill-current stroke-none" />
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
        <div className="w-5 h-2.5 border border-white/80 rounded-[4px] p-0.5 flex items-center">
          <div className="h-full w-full bg-white rounded-[2px]" />
        </div>
      </div>
    </div>
  );
};
