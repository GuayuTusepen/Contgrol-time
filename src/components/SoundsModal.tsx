import React, { useState, useRef } from 'react';
import { SoundItem } from '../types';
import { BUILTIN_SOUNDS } from '../data/defaultData';
import { X, Music, Upload, Play, Square, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { playSound, stopAllSounds } from '../utils/soundEngine';

interface SoundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customSounds: SoundItem[];
  onAddCustomSound: (sound: SoundItem) => void;
  onDeleteCustomSound: (soundId: string) => void;
  volume: number;
}

export const SoundsModal: React.FC<SoundsModalProps> = ({
  isOpen,
  onClose,
  customSounds,
  onAddCustomSound,
  onDeleteCustomSound,
  volume,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePlaySound = async (sound: SoundItem) => {
    if (playingId === sound.id) {
      stopAllSounds();
      setPlayingId(null);
      return;
    }

    stopAllSounds();
    setPlayingId(sound.id);

    try {
      const duration = await playSound(
        sound.type,
        sound.dataUrl,
        volume,
        sound.type === 'emergencia'
      );
      setTimeout(() => {
        setPlayingId((curr) => (curr === sound.id ? null : curr));
      }, duration * 1000);
    } catch {
      setPlayingId(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const isMp3 = file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3');
    if (!isMp3) {
      setErrorMsg('Selecciona un archivo MP3 válido (.mp3)');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('El archivo debe pesar menos de 3 MB para guardarse en Local Storage');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const newSound: SoundItem = {
        id: `custom-${Date.now()}`,
        name: cleanName,
        type: 'custom',
        isBuiltIn: false,
        description: `Audio MP3 personalizado (${(file.size / 1024).toFixed(0)} KB)`,
        dataUrl,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
      };

      onAddCustomSound(newSound);
      setSuccessMsg(`"${cleanName}" guardado en Local Storage`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#1c1d24] border border-zinc-800 rounded-[32px] p-6 shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-zinc-900 shadow-sm">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Timbres y Sonidos MP3</h3>
                <p className="text-xs text-zinc-400">Predeterminados y almacenamiento local</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                stopAllSounds();
                onClose();
              }}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mt-3 p-3 bg-red-950/60 border border-red-800/60 text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Content */}
          <div className="mt-4 overflow-y-auto max-h-[55vh] space-y-2.5 pr-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Timbres Escolares del Sistema
            </span>

            {BUILTIN_SOUNDS.map((snd) => {
              const isPlaying = playingId === snd.id;
              const isEmerg = snd.type === 'emergencia';

              return (
                <div
                  key={snd.id}
                  className="p-3 bg-[#212229] border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{snd.name}</h4>
                    <p className="text-[10px] text-zinc-400 truncate">{snd.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlaySound(snd)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                      isPlaying
                        ? 'bg-amber-400 text-black animate-pulse'
                        : isEmerg
                        ? 'bg-red-600 hover:bg-red-500 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'Parar' : 'Oír'}</span>
                  </button>
                </div>
              );
            })}

            {/* Custom MP3s */}
            <div className="pt-3 border-t border-zinc-800">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-2">
                Audios MP3 en Local Storage ({customSounds.length})
              </span>

              {customSounds.map((snd) => {
                const isPlaying = playingId === snd.id;
                return (
                  <div
                    key={snd.id}
                    className="p-3 bg-[#212229] border border-orange-500/20 rounded-2xl flex items-center justify-between gap-3 mb-2"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">🎵 {snd.name}</h4>
                      <p className="text-[10px] text-zinc-400">{snd.fileSize}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onDeleteCustomSound(snd.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePlaySound(snd)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                          isPlaying
                            ? 'bg-amber-400 text-black animate-pulse'
                            : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                        }`}
                      >
                        {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isPlaying ? 'Parar' : 'Oír'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/mpeg,.mp3"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-2xl border border-dashed border-zinc-700 hover:border-orange-500 text-orange-400 text-xs font-bold flex items-center justify-center gap-2 mt-2"
              >
                <Upload className="w-4 h-4" />
                <span>Cargar nuevo audio MP3</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
