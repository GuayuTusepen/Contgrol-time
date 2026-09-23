import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Trash2, Check, Image as ImageIcon } from 'lucide-react';

interface ProfileImageModalProps {
  isOpen: boolean;
  currentAvatar: string | null;
  onClose: () => void;
  onSaveAvatar: (newAvatar: string | null) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
];

export const ProfileImageModal: React.FC<ProfileImageModalProps> = ({
  isOpen,
  currentAvatar,
  onClose,
  onSaveAvatar,
}) => {
  const [preview, setPreview] = useState<string | null>(currentAvatar);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (PNG o JPG).');
      return;
    }

    // Max 4MB
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('La imagen es muy pesada. Por favor selecciona una menor a 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.onerror = () => {
      setErrorMsg('Error al leer el archivo de imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    onSaveAvatar(preview);
    onClose();
  };

  const handleRemove = () => {
    setPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        id="modal-profile-image"
        className="w-full max-w-sm bg-[#1c1d24] border border-zinc-800 rounded-[32px] p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-zinc-900 shadow-sm">
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Foto de Perfil / Logo</h3>
              <p className="text-xs text-zinc-400">Personaliza la imagen del sistema</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Preview */}
        <div className="mt-4 flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg overflow-hidden flex items-center justify-center bg-[#121316]">
              {preview ? (
                <img
                  src={preview}
                  alt="Vista previa de perfil"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#202128] flex items-center justify-center text-orange-400 font-black text-2xl">
                  CT
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
              title="Cambiar foto"
            >
              <Upload className="w-6 h-6" />
            </button>
          </div>
          <span className="text-xs text-zinc-400 mt-2 font-medium">
            {preview ? 'Vista previa seleccionada' : 'Sin imagen personalizada (Iniciales)'}
          </span>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-zinc-800 hover:border-zinc-700 bg-[#14151a]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-1.5">
            <Upload className="w-6 h-6 text-orange-400" />
            <span className="text-xs font-semibold text-white">
              Haz clic o arrastra una imagen aquí
            </span>
            <span className="text-[11px] text-zinc-500">
              Formatos soportados: PNG o JPG (máx. 4MB)
            </span>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 text-center mt-2 bg-rose-500/10 py-1.5 px-3 rounded-lg border border-rose-500/20">
            {errorMsg}
          </p>
        )}

        {/* Preset quick selection */}
        <div className="mt-3">
          <span className="text-[11px] text-zinc-400 font-semibold block mb-1.5">
            O selecciona una opción predeterminada:
          </span>
          <div className="flex items-center justify-center gap-2.5">
            {PRESET_AVATARS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPreview(preset)}
                className={`w-9 h-9 rounded-full p-0.5 transition-all overflow-hidden border-2 ${
                  preview === preset ? 'border-orange-500 scale-110' : 'border-transparent hover:scale-105'
                }`}
              >
                <img
                  src={preset}
                  alt={`Opción ${idx + 1}`}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
            <button
              type="button"
              onClick={handleRemove}
              className={`w-9 h-9 rounded-full bg-[#14151a] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition-all ${
                preview === null ? 'border-orange-500 text-orange-400' : ''
              }`}
              title="Restaurar a iniciales CT"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-400 text-black shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Guardar Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
