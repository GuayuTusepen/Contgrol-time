import React from 'react';
import { Bell, Camera } from 'lucide-react';

interface TopProfileBarProps {
  appName: string;
  institution?: string;
  shiftName?: string;
  avatarUrl?: string | null;
  onChangeAvatar?: () => void;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  hasActiveNotifications: boolean;
  onQuickEmergency: () => void;
  isAudioReady: boolean;
}

export const TopProfileBar: React.FC<TopProfileBarProps> = ({
  appName,
  institution,
  shiftName,
  avatarUrl,
  onChangeAvatar,
  onOpenMenu,
  onOpenNotifications,
  hasActiveNotifications,
  isAudioReady,
}) => {
  // Construir el subtítulo con correlación entre la institución/ubicación y la jornada actual
  const subtitleText = [institution, shiftName].filter(Boolean).join(' • ') || 'Sistema Escolar';

  return (
    <div className="w-full px-5 pt-2 pb-3 flex items-center justify-between z-10 select-none">
      {/* Left: Avatar + Title & Subtitle */}
      <div className="flex items-center gap-3">
        {/* Avatar interactivo para cambiar foto de perfil o logo institucional */}
        <div
          id="btn-profile-avatar"
          onClick={onChangeAvatar}
          className="relative group cursor-pointer"
          title="Haz clic para cambiar la foto de perfil o logo"
        >
          <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-orange-500 shadow-md group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center bg-[#121316]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar / Logo Institucional"
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#1c1d24] flex items-center justify-center text-orange-400 font-bold text-sm">
                CT
              </div>
            )}

            {/* Hover overlay indicator */}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          {/* Audio ready green indicator */}
          <span
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#141418] ${
              isAudioReady ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            title={isAudioReady ? 'Audio Activo' : 'Haz clic para activar audio'}
          />
        </div>

        <div className="min-w-0 max-w-[200px] sm:max-w-xs">
          <h1 className="text-[17px] font-bold text-white tracking-tight leading-tight truncate">
            {appName}
          </h1>
          <p className="text-[12px] text-zinc-400 font-medium truncate" title={subtitleText}>
            {subtitleText}
          </p>
        </div>
      </div>

      {/* Right: Bell with orange dot + Hamburger Menu */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell Button */}
        <button
          id="btn-top-notifications"
          type="button"
          onClick={onOpenNotifications}
          className="relative w-10 h-10 rounded-2xl bg-[#23242b] hover:bg-[#2c2d36] text-zinc-300 hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer border border-zinc-800/60"
          title="Notificaciones y Timbres"
        >
          <Bell className="w-4 h-4" />
          {hasActiveNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500" />
          )}
        </button>

        {/* Custom 3-Line Hamburger Menu Button */}
        <button
          id="btn-top-menu"
          type="button"
          onClick={onOpenMenu}
          className="w-10 h-10 rounded-2xl bg-[#23242b] hover:bg-[#2c2d36] text-zinc-300 hover:text-white flex flex-col items-center justify-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer border border-zinc-800/60"
          title="Menú de Opciones"
        >
          <span className="w-4 h-0.5 bg-zinc-300 rounded-full" />
          <span className="w-2.5 h-0.5 bg-zinc-300 rounded-full self-start ml-3" />
          <span className="w-4 h-0.5 bg-zinc-300 rounded-full" />
        </button>
      </div>
    </div>
  );
};
