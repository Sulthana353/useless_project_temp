import React from 'react';
import { Download, UploadCloud } from 'lucide-react';

interface ImageComparisonProps {
  originalUrl: string;
  moonifiedUrl: string;
  count: number;
  onDownload: () => void;
  onUploadAnother: () => void;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  originalUrl,
  moonifiedUrl,
  count,
  onDownload,
  onUploadAnother,
}) => {
  return (
    <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in duration-500">
      {/* Exactly Two Equal Side-by-Side Panels */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* LEFT: ORIGINAL */}
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col bg-space-900/60 shadow-xl">
          <div className="px-5 py-3 border-b border-white/10 bg-space-950/70 flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-lunar-300">
              ORIGINAL
            </span>
            <span className="text-[10px] font-mono text-lunar-500">
              Source Photo
            </span>
          </div>
          <div className="p-3 sm:p-4 flex-1 flex items-center justify-center bg-space-950/40 min-h-[320px] max-h-[65vh]">
            <img
              src={originalUrl}
              alt="Original"
              className="w-full h-full max-h-[60vh] object-contain rounded-xl block"
            />
          </div>
        </div>

        {/* RIGHT: MOONIFIED */}
        <div className="glass-panel rounded-3xl border border-indigo-500/30 overflow-hidden flex flex-col bg-space-900/60 shadow-2xl">
          <div className="px-5 py-3 border-b border-indigo-500/20 bg-indigo-950/40 flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-indigo-300">
              MOONIFIED
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              All Spheres Replaced
            </span>
          </div>
          <div className="p-3 sm:p-4 flex-1 flex items-center justify-center bg-space-950/40 min-h-[320px] max-h-[65vh]">
            <img
              src={moonifiedUrl}
              alt="Moonified"
              className="w-full h-full max-h-[60vh] object-contain rounded-xl block"
            />
          </div>
        </div>
      </div>

      {/* Result Status & Deadpan Microcopy */}
      <div className="text-center pt-2">
        <h3 className="text-xl sm:text-2xl font-extrabold font-mono tracking-wider text-white">
          MOONIFICATION COMPLETE
        </h3>
        <p className="text-sm sm:text-base text-cyan-300 font-mono mt-1">
          {count} spherical {count === 1 ? 'object has' : 'objects have'} been converted into Moons.
        </p>
      </div>

      {/* Action Buttons: Download PNG & Upload Another */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-2">
        <button
          onClick={onDownload}
          className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-mono font-bold text-sm tracking-wider uppercase shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Download PNG</span>
        </button>

        <button
          onClick={onUploadAnother}
          className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-space-850 hover:bg-space-800 text-lunar-300 hover:text-white border border-white/10 font-mono text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <UploadCloud className="w-4 h-4 text-lunar-400" />
          <span>Upload Another</span>
        </button>
      </div>
    </div>
  );
};
