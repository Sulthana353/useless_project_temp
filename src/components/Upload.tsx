import React, { useRef, useState } from 'react';
import { UploadCloud, Sparkles, Moon } from 'lucide-react';

interface UploadProps {
  onImageSelected: (fileOrUrl: File | string) => void;
  isProcessing: boolean;
}

const SAMPLES = [
  {
    title: 'Night Streetlights',
    url: '/samples/streetlights.png',
  },
  {
    title: 'Highway Headlights',
    url: '/samples/headlights.png',
  },
  {
    title: 'Cafe String Lights',
    url: '/samples/fairylights.png',
  },
];

export const Upload: React.FC<UploadProps> = ({ onImageSelected, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = (url: string) => {
    setSelectedFile(url);
    setPreviewUrl(url);
  };

  const handleMoonifyClick = () => {
    if (selectedFile) {
      onImageSelected(selectedFile);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center animate-in fade-in duration-300">
      {/* Upload Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer backdrop-blur-md relative overflow-hidden ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
            : previewUrl
            ? 'border-indigo-500/50 bg-space-900/80'
            : 'border-white/15 bg-space-900/60 hover:border-white/30 hover:bg-space-850/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {previewUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative max-h-56 max-w-full rounded-2xl overflow-hidden border border-white/20 shadow-xl">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="max-h-56 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-lunar-400 font-mono">
              Photo selected. Click <span className="text-cyan-300 font-bold">MOONIFY</span> below or drop a different photo.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-space-800 border border-white/10 flex items-center justify-center text-cyan-400 shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-white">
                Drop a photo here
              </p>
              <p className="text-sm text-lunar-400 mt-1">
                or <span className="text-cyan-400 underline underline-offset-4 font-medium">click to upload</span>
              </p>
            </div>
            <p className="text-xs text-lunar-500 font-mono">
              JPG, JPEG, PNG, or WebP
            </p>
          </div>
        )}
      </div>

      {/* Single Prominent Button: MOONIFY */}
      <div className="w-full mt-6">
        <button
          onClick={handleMoonifyClick}
          disabled={!selectedFile || isProcessing}
          className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-mono font-extrabold text-lg tracking-widest uppercase shadow-2xl shadow-indigo-500/30 flex items-center justify-center space-x-3 transition-all transform active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed group"
        >
          {isProcessing ? (
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>MOONIFYING EVERYTHING...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Moon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>MOONIFY</span>
            </div>
          )}
        </button>
      </div>

      {/* Preset sample images */}
      <div className="mt-8 pt-6 border-t border-white/10 w-full">
        <p className="text-xs uppercase tracking-widest text-lunar-500 font-mono mb-3">
          Or try a sample photo:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {SAMPLES.map((sample) => (
            <button
              key={sample.url}
              onClick={() => handleSampleClick(sample.url)}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-lunar-300 hover:text-white border border-white/10 text-xs font-mono transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
