import { useState, useEffect, useCallback, useMemo } from 'react';
import { SchoolShift, SchoolAlarm, SoundItem, ActiveAlarmTrigger, DayOfWeek } from './types';
import {
  loadShifts,
  saveShifts,
  loadAlarms,
  saveAlarms,
  loadCustomSounds,
  saveCustomSounds,
  getAllSounds,
  loadMasterVolume,
  saveMasterVolume,
  loadSchoolLocation,
  saveSchoolLocation,
  loadProfileAvatar,
  saveProfileAvatar,
} from './utils/storage';
import { playSound, stopAllSounds, unlockAudioContext } from './utils/soundEngine';

import { PhoneStatusBar } from './components/PhoneStatusBar';
import { TopProfileBar } from './components/TopProfileBar';
import { HeroTasksCard } from './components/HeroTasksCard';
import { BentoStatsCards } from './components/BentoStatsCards';
import { EmergencyCard } from './components/EmergencyCard';
import { UpcomingEventsList } from './components/UpcomingEventsList';
import { AlarmActionDrawer } from './components/AlarmActionDrawer';
import { AppMenuDrawer } from './components/AppMenuDrawer';
import { EmergencyConfirmModal } from './components/EmergencyModal';
import { AlarmFormModal } from './components/AlarmFormModal';
import { JornadasModal } from './components/JornadasModal';
import { SoundsModal } from './components/SoundsModal';
import { AllAlarmsModal } from './components/AllAlarmsModal';
import { ActiveAlarmBanner } from './components/ActiveAlarmBanner';
import { LocationEditModal } from './components/LocationEditModal';
import { ProfileImageModal } from './components/ProfileImageModal';

import { Smartphone, Maximize2, Volume2, Plus } from 'lucide-react';

export default function App() {
  // State from LocalStorage
  const [shifts, setShifts] = useState<SchoolShift[]>(() => loadShifts());
  const [alarms, setAlarms] = useState<SchoolAlarm[]>(() => loadAlarms());
  const [customSounds, setCustomSounds] = useState<SoundItem[]>(() => loadCustomSounds());
  const [volume, setVolume] = useState<number>(() => loadMasterVolume());
  const [location, setLocation] = useState<string>(() => loadSchoolLocation());
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => loadProfileAvatar());

  // App UI state
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isEmergencyConfirmOpen, setIsEmergencyConfirmOpen] = useState(false);
  const [activeAlarmTrigger, setActiveAlarmTrigger] = useState<ActiveAlarmTrigger | null>(null);

  // Modals & Drawers
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isJornadasModalOpen, setIsJornadasModalOpen] = useState(false);
  const [isSoundsModalOpen, setIsSoundsModalOpen] = useState(false);
  const [isAllAlarmsModalOpen, setIsAllAlarmsModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [seeAllExpanded, setSeeAllExpanded] = useState(false);

  // Alarm action drawer
  const [selectedAlarmForAction, setSelectedAlarmForAction] = useState<SchoolAlarm | null>(null);
  const [alarmToEdit, setAlarmToEdit] = useState<SchoolAlarm | null>(null);
  const [preselectedShiftId, setPreselectedShiftId] = useState<string | null>(null);
  const [playingPreviewAlarmId, setPlayingPreviewAlarmId] = useState<string | null>(null);

  // View mode: Phone Mockup Frame vs Full Responsive
  const [viewMode, setViewMode] = useState<'phone' | 'full'>('phone');

  // Unified sounds list (built-in + uploaded MP3s)
  const allSounds = useMemo(() => getAllSounds(customSounds), [customSounds]);

  // Real-time clock for top status bar
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setCurrentTimeFormatted(`${h}:${m}`);
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  // Persist shifts
  const handleSaveShift = useCallback((newShift: SchoolShift) => {
    setShifts((prev) => {
      const exists = prev.some((s) => s.id === newShift.id);
      const updated = exists
        ? prev.map((s) => (s.id === newShift.id ? newShift : s))
        : [...prev, newShift];
      saveShifts(updated);
      return updated;
    });
  }, []);

  const handleDeleteShift = useCallback((shiftId: string) => {
    setShifts((prev) => {
      const updated = prev.filter((s) => s.id !== shiftId);
      saveShifts(updated);
      return updated;
    });
  }, []);

  // Persist alarms
  const handleSaveAlarm = useCallback((newAlarm: SchoolAlarm) => {
    setAlarms((prev) => {
      const exists = prev.some((a) => a.id === newAlarm.id);
      const updated = exists
        ? prev.map((a) => (a.id === newAlarm.id ? newAlarm : a))
        : [...prev, newAlarm];
      saveAlarms(updated);
      return updated;
    });
  }, []);

  const handleToggleAlarm = useCallback((alarmId: string) => {
    setAlarms((prev) => {
      const updated = prev.map((a) => (a.id === alarmId ? { ...a, enabled: !a.enabled } : a));
      saveAlarms(updated);
      return updated;
    });
  }, []);

  const handleDeleteAlarm = useCallback((alarmId: string) => {
    setAlarms((prev) => {
      const updated = prev.filter((a) => a.id !== alarmId);
      saveAlarms(updated);
      return updated;
    });
  }, []);

  // Persist custom MP3 sounds
  const handleAddCustomSound = useCallback((sound: SoundItem) => {
    setCustomSounds((prev) => {
      const updated = [...prev, sound];
      saveCustomSounds(updated);
      return updated;
    });
  }, []);

  const handleDeleteCustomSound = useCallback((soundId: string) => {
    setCustomSounds((prev) => {
      const updated = prev.filter((s) => s.id !== soundId);
      saveCustomSounds(updated);
      return updated;
    });
  }, []);

  // Volume change
  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol);
    saveMasterVolume(vol);
  }, []);

  // Audio interactions
  const handleUnlockAudio = useCallback(() => {
    unlockAudioContext();
    setAudioUnlocked(true);
  }, []);

  // Emergency triggers
  const handleConfirmEmergency = useCallback(() => {
    unlockAudioContext();
    setAudioUnlocked(true);
    setIsEmergencyActive(true);

    const triggerInfo: ActiveAlarmTrigger = {
      id: 'emergency-manual',
      title: '¡ALARMA DE EMERGENCIA Y EVACUACIÓN!',
      soundName: 'Sirena Continua al 100%',
      soundType: 'emergencia',
      isEmergency: true,
      timeStarted: Date.now(),
    };
    setActiveAlarmTrigger(triggerInfo);
    playSound('emergencia', undefined, 1.0, true);
  }, []);

  const handleStopAll = useCallback(() => {
    stopAllSounds();
    setIsEmergencyActive(false);
    setActiveAlarmTrigger(null);
    setPlayingPreviewAlarmId(null);
  }, []);

  // Preview sound for an alarm
  const handlePreviewAlarmSound = useCallback(
    async (alarm: SchoolAlarm) => {
      if (playingPreviewAlarmId === alarm.id) {
        stopAllSounds();
        setPlayingPreviewAlarmId(null);
        return;
      }

      handleUnlockAudio();
      stopAllSounds();
      setPlayingPreviewAlarmId(alarm.id);

      const soundItem = allSounds.find((s) => s.id === alarm.soundId);
      const soundType = soundItem ? soundItem.type : alarm.soundType;

      try {
        const duration = await playSound(
          soundType,
          soundItem?.dataUrl,
          volume,
          soundType === 'emergencia'
        );
        setTimeout(() => {
          setPlayingPreviewAlarmId((curr) => (curr === alarm.id ? null : curr));
        }, duration * 1000);
      } catch {
        setPlayingPreviewAlarmId(null);
      }
    },
    [playingPreviewAlarmId, allSounds, volume, handleUnlockAudio]
  );

  // Active jornada calculation
  const activeShift = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay() as DayOfWeek;
    const hoursStr = String(now.getHours()).padStart(2, '0');
    const minutesStr = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hoursStr}:${minutesStr}`;

    return (
      shifts.find(
        (s) =>
          s.days.includes(currentDay) &&
          currentTimeStr >= s.startTime &&
          currentTimeStr <= s.endTime
      ) ||
      shifts[0] ||
      null
    );
  }, [shifts]);

  // Jornada Progress percentage (72% like in reference!)
  const shiftProgressPercent = useMemo(() => {
    if (!activeShift) return 72; // Default realistic visual
    const [startH, startM] = activeShift.startTime.split(':').map(Number);
    const [endH, endM] = activeShift.endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    if (nowMins < startMins) return 0;
    if (nowMins > endMins) return 100;
    const total = endMins - startMins;
    if (total <= 0) return 72;
    return Math.round(((nowMins - startMins) / total) * 100);
  }, [activeShift]);

  // Next Alarm calculation
  const nextAlarmInfo = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay() as DayOfWeek;
    const currentMinutesTotal = now.getHours() * 60 + now.getMinutes();

    const todaysActiveAlarms = alarms.filter(
      (a) => a.enabled && a.days.includes(currentDay)
    );

    if (todaysActiveAlarms.length === 0) return null;

    const upcoming = todaysActiveAlarms
      .map((a) => {
        const [h, m] = a.time.split(':').map(Number);
        return {
          ...a,
          minutesDiff: h * 60 + m - currentMinutesTotal,
        };
      })
      .filter((a) => a.minutesDiff >= 0)
      .sort((a, b) => a.minutesDiff - b.minutesDiff);

    if (upcoming.length > 0) {
      return upcoming[0];
    }
    return null;
  }, [alarms]);

  // Real-time alarm checking loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDay = now.getDay() as DayOfWeek;
      const hoursStr = String(now.getHours()).padStart(2, '0');
      const minutesStr = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hoursStr}:${minutesStr}`;
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const dateNum = String(now.getDate()).padStart(2, '0');
      const triggerDateKey = `${year}-${month}-${dateNum}-${currentTimeStr}`;

      alarms.forEach((alarm) => {
        if (!alarm.enabled) return;
        if (!alarm.days.includes(currentDay)) return;
        if (alarm.time !== currentTimeStr) return;
        if (alarm.lastTriggeredDate === triggerDateKey) return;

        alarm.lastTriggeredDate = triggerDateKey;
        saveAlarms([...alarms]);

        const soundItem = allSounds.find((s) => s.id === alarm.soundId);
        const soundType = soundItem ? soundItem.type : alarm.soundType;
        const soundName = soundItem ? soundItem.name : 'Timbre Escolar';
        const isEmergency = soundType === 'emergencia';

        setActiveAlarmTrigger({
          id: alarm.id,
          title: alarm.title,
          soundName,
          soundType,
          isEmergency,
          timeStarted: Date.now(),
        });

        playSound(soundType, soundItem?.dataUrl, volume, isEmergency).then((duration) => {
          setTimeout(() => {
            setActiveAlarmTrigger((curr) => (curr?.id === alarm.id ? null : curr));
          }, duration * 1000);
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, allSounds, volume]);

  const activeAlarmsCount = alarms.filter((a) => a.enabled).length;

  return (
    <div
      id="control-time-app-root"
      onClick={handleUnlockAudio}
      className="min-h-screen bg-[#0e0f13] text-white flex flex-col items-center justify-start p-2 sm:p-6 select-none selection:bg-orange-500 selection:text-black font-sans"
    >
      {/* Top View Mode Switcher for Desktop convenience */}
      <div className="w-full max-w-sm mb-3 hidden sm:flex items-center justify-between text-xs text-zinc-400 px-2">
        <span className="font-semibold text-zinc-300">Control Time • Mobile Dashboard</span>
        <div className="flex items-center bg-[#1b1c22] p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setViewMode('phone')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              viewMode === 'phone' ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Marco Móvil</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('full')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              viewMode === 'full' ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Pantalla Completa</span>
          </button>
        </div>
      </div>

      {/* Active Alarm Banner */}
      <ActiveAlarmBanner activeAlarm={activeAlarmTrigger} onStop={handleStopAll} />

      {/* Emergency Modal Confirmation */}
      <EmergencyConfirmModal
        isOpen={isEmergencyConfirmOpen}
        onClose={() => setIsEmergencyConfirmOpen(false)}
        onConfirm={handleConfirmEmergency}
        isEmergencyActive={isEmergencyActive}
        onStopEmergency={handleStopAll}
      />

      {/* Alarm Action Drawer (Tap 3 dots on any alarm) */}
      <AlarmActionDrawer
        alarm={selectedAlarmForAction}
        shift={shifts.find((s) => s.id === selectedAlarmForAction?.shiftId)}
        sound={allSounds.find((s) => s.id === selectedAlarmForAction?.soundId)}
        isOpen={!!selectedAlarmForAction}
        isPlaying={playingPreviewAlarmId === selectedAlarmForAction?.id}
        onClose={() => setSelectedAlarmForAction(null)}
        onToggleSound={() => selectedAlarmForAction && handlePreviewAlarmSound(selectedAlarmForAction)}
        onToggleEnabled={() => {
          if (selectedAlarmForAction) {
            handleToggleAlarm(selectedAlarmForAction.id);
            setSelectedAlarmForAction({
              ...selectedAlarmForAction,
              enabled: !selectedAlarmForAction.enabled,
            });
          }
        }}
        onEdit={() => {
          if (selectedAlarmForAction) {
            setAlarmToEdit(selectedAlarmForAction);
            setPreselectedShiftId(selectedAlarmForAction.shiftId);
            setSelectedAlarmForAction(null);
            setIsAlarmModalOpen(true);
          }
        }}
        onDelete={() => {
          if (selectedAlarmForAction) {
            handleDeleteAlarm(selectedAlarmForAction.id);
            setSelectedAlarmForAction(null);
          }
        }}
      />

      {/* Menu Drawer */}
      <AppMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenCreateShift={() => setIsJornadasModalOpen(true)}
        onOpenCreateAlarm={() => {
          setAlarmToEdit(null);
          setPreselectedShiftId(activeShift ? activeShift.id : null);
          setIsAlarmModalOpen(true);
        }}
        onOpenAllAlarms={() => setIsAllAlarmsModalOpen(true)}
        onOpenEmergency={() => setIsEmergencyConfirmOpen(true)}
        onOpenSounds={() => setIsSoundsModalOpen(true)}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isAudioUnlocked={audioUnlocked}
        onUnlockAudio={handleUnlockAudio}
      />

      {/* Create / Edit Alarm Modal */}
      <AlarmFormModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        onSaveAlarm={handleSaveAlarm}
        shifts={shifts}
        sounds={allSounds}
        alarmToEdit={alarmToEdit}
        defaultShiftId={preselectedShiftId}
        volume={volume}
      />

      {/* Jornadas Management Modal */}
      <JornadasModal
        isOpen={isJornadasModalOpen}
        onClose={() => setIsJornadasModalOpen(false)}
        shifts={shifts}
        alarms={alarms}
        onSaveShift={handleSaveShift}
        onDeleteShift={handleDeleteShift}
      />

      {/* Sounds and MP3 Modal */}
      <SoundsModal
        isOpen={isSoundsModalOpen}
        onClose={() => setIsSoundsModalOpen(false)}
        customSounds={customSounds}
        onAddCustomSound={handleAddCustomSound}
        onDeleteCustomSound={handleDeleteCustomSound}
        volume={volume}
      />

      {/* All Alarms Modal */}
      <AllAlarmsModal
        isOpen={isAllAlarmsModalOpen}
        onClose={() => setIsAllAlarmsModalOpen(false)}
        alarms={alarms}
        shifts={shifts}
        sounds={allSounds}
        volume={volume}
        onToggleAlarm={handleToggleAlarm}
        onEditAlarm={(alarm) => {
          setAlarmToEdit(alarm);
          setPreselectedShiftId(alarm.shiftId);
          setIsAlarmModalOpen(true);
        }}
        onDeleteAlarm={handleDeleteAlarm}
        onOpenCreateAlarm={() => {
          setAlarmToEdit(null);
          setPreselectedShiftId(activeShift ? activeShift.id : null);
          setIsAlarmModalOpen(true);
        }}
      />

      {/* Location Edit Modal */}
      <LocationEditModal
        isOpen={isLocationModalOpen}
        currentLocation={location}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={(newLoc) => {
          setLocation(newLoc);
          saveSchoolLocation(newLoc);
        }}
      />

      {/* Profile Avatar / School Logo Modal */}
      <ProfileImageModal
        isOpen={isAvatarModalOpen}
        currentAvatar={avatarUrl}
        onClose={() => setIsAvatarModalOpen(false)}
        onSaveAvatar={(newAvatar) => {
          setAvatarUrl(newAvatar);
          saveProfileAvatar(newAvatar);
        }}
      />

      {/* The Device Frame / Mobile App Viewport (Identical to reference screenshot) */}
      <div
        className={`w-full transition-all duration-300 ${
          viewMode === 'phone'
            ? 'max-w-[395px] bg-[#141418] rounded-[50px] border-[10px] border-[#222329] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden relative pb-4 ring-1 ring-white/10'
            : 'max-w-md md:max-w-2xl bg-[#141418] rounded-3xl border border-zinc-800 p-2 sm:p-4 shadow-xl'
        }`}
      >
        {/* iOS Dynamic Island Status Bar (Exact replica of screenshot top) */}
        <PhoneStatusBar currentTime={currentTimeFormatted} />

        {/* Profile Bar: Avatar interactivo + Control Time + Sede / Jornada actual */}
        <TopProfileBar
          appName="Control Time"
          institution={location}
          shiftName={activeShift ? activeShift.name : 'Sin Jornada'}
          avatarUrl={avatarUrl}
          onChangeAvatar={() => setIsAvatarModalOpen(true)}
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenNotifications={() => setIsAllAlarmsModalOpen(true)}
          hasActiveNotifications={activeAlarmsCount > 0}
          onQuickEmergency={() => setIsEmergencyConfirmOpen(true)}
          isAudioReady={audioUnlocked}
        />

        {/* Scrollable Dashboard Body */}
        <div className="px-4 space-y-3.5 mt-1">
          {/* 1. Hero Tasks Card with 72%, +5%, and striped orange progress bar */}
          <HeroTasksCard
            activeShift={activeShift}
            progressPercent={shiftProgressPercent}
            percentageText={`${shiftProgressPercent}%`}
            trendText="+5%"
            nextAlarmSummary={
              nextAlarmInfo
                ? `Próximo: ${nextAlarmInfo.time} • ${nextAlarmInfo.title}`
                : 'Sin timbres pendientes hoy'
            }
            onOpenShiftDetails={() => setIsJornadasModalOpen(true)}
          />

          {/* 2. Tarjetas Bento en contexto: Ubicación y Fecha / Hora en tiempo real */}
          <BentoStatsCards
            location={location}
            onEditLocation={() => setIsLocationModalOpen(true)}
            onClockClick={() => setIsAllAlarmsModalOpen(true)}
          />

          {/* 3. Emergency Evacuation Card */}
          <EmergencyCard
            isEmergencyActive={isEmergencyActive}
            onOpenConfirm={() => setIsEmergencyConfirmOpen(true)}
            onStopEmergency={handleStopAll}
          />

          {/* 4. "Upcoming events" Section with "See all" */}
          <UpcomingEventsList
            alarms={alarms}
            shifts={shifts}
            sounds={allSounds}
            playingAlarmId={playingPreviewAlarmId}
            onPreviewSound={handlePreviewAlarmSound}
            onSelectAlarmAction={(alarm) => setSelectedAlarmForAction(alarm)}
            onSeeAllClick={() => setSeeAllExpanded((prev) => !prev)}
            seeAllOpen={seeAllExpanded}
          />

          {/* 5. Quick Action Button Bar */}
          <div className="pt-2 grid grid-cols-2 gap-2.5">
            <button
              id="btn-quick-new-alarm"
              type="button"
              onClick={() => {
                setAlarmToEdit(null);
                setPreselectedShiftId(activeShift ? activeShift.id : null);
                setIsAlarmModalOpen(true);
              }}
              className="py-3 px-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Crear Alarma</span>
            </button>

            <button
              id="btn-quick-manage-shifts"
              type="button"
              onClick={() => setIsJornadasModalOpen(true)}
              className="py-3 px-3 rounded-2xl bg-[#202128] hover:bg-[#272832] border border-zinc-800 text-white font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Crear Jornadas</span>
            </button>
          </div>
        </div>

        {/* iPhone Home Bar Indicator (white rounded pill at bottom center) */}
        <div className="mt-4 pt-1 flex justify-center">
          <div className="w-32 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
