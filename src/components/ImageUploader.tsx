import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, CheckCircle2, AlertTriangle, Wand2, Compass } from 'lucide-react';
import { validateImageUpload, MAX_IMAGE_SIZE_BYTES } from '../utils/security';
import { PRESET_SCENES, PresetScene } from '../data/samplePresets';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mime: string, previewUrl: string) => void;
  onAnalyzeTrigger: (options: { genre: string; tone: string }) => void;
  onSelectPreset: (preset: PresetScene) => void;
  selectedPreview: string | null;
  isAnalyzing: boolean;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
}

export const GENRES = [
  'Cyberpunk Noir',
  'High Fantasy / Mythic',
  'Steampunk Gothic',
  'Cosmic Horror / Weird Fiction',
  'Solarpunk / Utopian Sci-Fi',
  'Historical Mystery',
  'Post-Apocalyptic Survival'
];

export const TONES = [
  'Atmospheric & Evocative',
  'Suspenseful & Foreboding',
  'Lyrical & Dreamlike',
  'Gritty & Visceral',
  'Melancholic & Reflective'
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onAnalyzeTrigger,
  onSelectPreset,
  selectedPreview,
  isAnalyzing,
  selectedGenre,
  setSelectedGenre,
  selectedTone,
  setSelectedTone
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; sizeKb: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    setValidationError(null);

    // NIST CSF Validation
    const validation = validateImageUpload({ size: file.size, type: file.type });
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid file.');
      return;
    }

    setFileDetails({
      name: file.name,
      sizeKb: Math.round(file.size / 1024)
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelected(result, validation.sanitizedMime || file.type, result);
      }
    };
    reader.onerror = () => {
      setValidationError('Failed to read file from local device.');
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
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-stone-100 text-sm">Visual Inspiration Source</h2>
            <p className="text-xs text-stone-400">Upload any setting image or pick an inspiration preset</p>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> NIST PR.DS-1 Validated
        </span>
      </div>

      {/* Upload Drop Zone / Active Preview */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl transition-all overflow-hidden flex flex-col items-center justify-center min-h-[220px] ${
          dragOver
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-stone-700/80 hover:border-amber-500/50 bg-stone-950/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          id="scene-image-input"
        />

        {selectedPreview ? (
          <div className="relative w-full h-[240px] group">
            <img
              src={selectedPreview}
              alt="Visual scene setting"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
              <span className="text-xs text-stone-200 truncate">
                {fileDetails ? `${fileDetails.name} (${fileDetails.sizeKb} KB)` : 'Active Scene Image'}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-xs rounded bg-stone-900/90 text-amber-300 border border-amber-500/30 hover:bg-stone-800 cursor-pointer"
              >
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-stone-800/80 border border-stone-700 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-stone-200 mb-1">
              Drag & drop your setting photo here
            </p>
            <p className="text-xs text-stone-400 mb-4">
              Supports JPEG, PNG, WEBP up to 10 MB (in-memory processing only)
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              Browse Local Photos
            </button>
          </div>
        )}
      </div>

      {/* Validation error notice */}
      {validationError && (
        <div className="p-2.5 bg-red-950/70 border border-red-800/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Quick Inspiration Presets */}
      <div>
        <label className="text-xs font-medium text-stone-400 mb-2 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Or Choose an Curated Setting Inspiration</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_SCENES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="group p-2 rounded-xl bg-stone-950/60 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 transition-all text-left flex flex-col gap-1 cursor-pointer"
            >
              <div className="w-full h-14 rounded-lg overflow-hidden relative">
                <img
                  src={preset.imageUrl}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <span className="absolute bottom-1 right-1 text-[9px] px-1 py-0.5 rounded bg-stone-900/80 text-amber-300 font-mono">
                  {preset.genre.split(' ')[0]}
                </span>
              </div>
              <span className="text-xs font-medium text-stone-200 truncate group-hover:text-amber-200">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Literary Influences: Genre & Tone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-800/80">
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Story Genre</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full p-2 rounded-lg bg-stone-950/80 border border-stone-700 text-stone-200 focus:outline-none focus:border-amber-500 text-xs"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Tonal Ambience</label>
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            className="w-full p-2 rounded-lg bg-stone-950/80 border border-stone-700 text-stone-200 focus:outline-none focus:border-amber-500 text-xs"
          >
            {TONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={() => onAnalyzeTrigger({ genre: selectedGenre, tone: selectedTone })}
        disabled={isAnalyzing || !selectedPreview}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isAnalyzing ? (
          <>
            <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
            <span>Analyzing Scene with Gemini 4 Argon...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            <span>Analyze Mood & Ghostwrite Opening</span>
          </>
        )}
      </button>
    </div>
  );
};
