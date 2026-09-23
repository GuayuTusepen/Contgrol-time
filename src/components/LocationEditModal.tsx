import React, { useState, useEffect } from 'react';
import { X, MapPin, Check } from 'lucide-react';

interface LocationEditModalProps {
  isOpen: boolean;
  currentLocation: string;
  onClose: () => void;
  onSave: (newLocation: string) => void;
}

const PRESET_LOCATIONS = [
  'Sede Central',
  'Sede Primaria',
  'Sede Bachillerato',
  'Campus Norte',
  'Pabellón A',
  'Patio Principal',
];

export const LocationEditModal: React.FC<LocationEditModalProps> = ({
  isOpen,
  currentLocation,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState(currentLocation);

  useEffect(() => {
    setValue(currentLocation);
  }, [currentLocation, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSave(value.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-[#1c1d24] border border-zinc-800 rounded-[32px] p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-zinc-900 shadow-sm">
              <MapPin className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Editar Ubicación</h3>
              <p className="text-xs text-zinc-400">Sede o espacio escolar</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Nombre de la Sede / Ubicación
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ej. Sede Central, Campus Norte..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#14151a] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-orange-500"
              autoFocus
              required
            />
          </div>

          <div>
            <span className="text-xs text-zinc-400 font-semibold block mb-2">
              Sugerencias rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    value === preset
                      ? 'bg-orange-500 border-orange-500 text-black font-bold'
                      : 'bg-[#14151a] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-400 text-black shadow-md shadow-orange-500/20 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
