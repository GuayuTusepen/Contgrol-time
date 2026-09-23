import React, { useState, useRef } from 'react';
import { SoundItem, SoundType } from '../types';
import { BUILTIN_SOUNDS } from '../data/defaultData';
import { Volume2, Play, Square, Upload, Trash2, Music, CheckCircle2, AlertCircle } from 'lucide-react';
import { playSound, stopAllSounds } from '../utils/soundEngine';

interface SoundsManagerSectionProps {
  customSounds: SoundItem[];
  onAddCustomSound: (sound: SoundItem) => void;
  onDeleteCustomSound: (soundId: string) => void;
  volume: number;
}

export const SoundsManagerSection: React.FC<SoundsManagerSectionProps> = ({
  customSounds,
  onAddCustomSound,
  onDeleteCustomSound,
  volume,
}) => {
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePlaySound = async (sound: SoundItem) => {
    if (playingSoundId === sound.id) {
      stopAllSounds();
      setPlayingSoundId(null);
      return;
    }

    stopAllSounds();
    setPlayingSoundId(sound.id);

    try {
      const duration = await playSound(
        sound.type,
        sound.dataUrl,
        volume,
        sound.type === 'emergencia'
      );
      setTimeout(() => {
        setPlayingSoundId((prev) => (prev === sound.id ? null : prev));
      }, duration * 1000);
    } catch {
      setPlayingSoundId(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAudioFile(file);
  };

  const processAudioFile = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    // Validate mime type or extension
    const isMp3 =
      file.type === 'audio/mpeg' ||
      file.type === 'audio/mp3' ||
      file.name.toLowerCase().endsWith('.mp3');

    if (!isMp3) {
      setUploadError('Por favor selecciona un archivo de audio en formato MP3 (.mp3).');
      return;
    }

    // Check size limit (max 3MB for localStorage safety)
    const maxBytes = 3 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(
        `El archivo supera los 3 MB (${(file.size / (1024 * 1024)).toFixed(
          1
        )} MB). Para almacenar en Local Storage sin saturar la memoria del navegador, por favor usa audios más cortos o comprimidos.`
      );
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setUploadError('No se pudo leer el archivo de audio.');
        setIsUploading(false);
        return;
      }

      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const newCustomSound: SoundItem = {
        id: `custom-snd-${Date.now()}`,
        name: cleanName,
        type: 'custom',
        isBuiltIn: false,
        description: `Sonido MP3 personalizado (${(file.size / 1024).toFixed(0)} KB)`,
        dataUrl,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
      };

      onAddCustomSound(newCustomSound);
      setIsUploading(false);
      setUploadSuccess(`¡Audio "${cleanName}" añadido exitosamente a Local Storage!`);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        setUploadSuccess(null);
      }, 4000);
    };

    reader.onerror = () => {
      setUploadError('Ocurrió un error al cargar el archivo de audio.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div id="recuadro-sonidos" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Timbres del Colegio y Sonidos MP3
            </h2>
            <p className="text-xs text-slate-500">
              Prueba los 7 sonidos escolares incorporados o sube tus propios archivos MP3 (guardados en Local Storage)
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,.mp3"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload-mp3"
          />
          <button
            id="btn-upload-mp3-trigger"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Procesando...' : 'Cargar Sonido MP3'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {uploadError && (
        <div className="my-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Built-in Sounds Grid */}
      <div className="mt-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          7 Sonidos Predeterminados del Colegio
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BUILTIN_SOUNDS.map((sound) => {
            const isPlaying = playingSoundId === sound.id;
            const isEmergency = sound.type === 'emergencia';

            return (
              <div
                key={sound.id}
                id={`builtin-sound-${sound.id}`}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isEmergency
                    ? 'bg-red-50/50 border-red-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        isEmergency
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isEmergency ? 'Sirena Máxima' : 'Timbre Escolar'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      ~{sound.durationSec}s
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                    {sound.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {sound.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Sintetizado Web Audio
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePlaySound(sound)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      isPlaying
                        ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse'
                        : isEmergency
                        ? 'bg-red-600 text-white hover:bg-red-700 border-red-700'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Detener</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Escuchar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Uploaded MP3 Sounds */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sonidos Personalizados en Local Storage ({customSounds.length})
          </h3>
          <span className="text-xs text-slate-400">
            Formato MP3 almacenado en el navegador
          </span>
        </div>

        {customSounds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {customSounds.map((sound) => {
              const isPlaying = playingSoundId === sound.id;

              return (
                <div
                  key={sound.id}
                  id={`custom-sound-${sound.id}`}
                  className="p-3.5 rounded-xl border border-violet-200 bg-violet-50/40 hover:bg-white hover:border-violet-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-violet-100 text-violet-800 flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        <span>MP3 Local</span>
                      </span>
                      {sound.fileSize && (
                        <span className="text-[11px] font-mono text-slate-400">
                          {sound.fileSize}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1 truncate">
                      {sound.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                      {sound.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-violet-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar el sonido "${sound.name}" de Local Storage?`)) {
                          onDeleteCustomSound(sound.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Eliminar este MP3"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlaySound(sound)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Detener</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Reproducir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Music className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-600">
              Aún no has subido audios MP3 personalizados.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Puedes subir cualquier himno escolar, melodía o campanada grabada en formato MP3 para asignarla a tus alarmas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
