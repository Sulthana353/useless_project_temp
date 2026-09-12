import React, { useState } from 'react';
import { Upload } from './components/Upload';
import { ImageComparison } from './components/ImageComparison';
import { moonifyImage, downloadCanvas, MoonifyResult } from './cv/moonify';

export const App: React.FC = () => {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [moonifiedUrl, setMoonifiedUrl] = useState<string | null>(null);
  const [result, setResult] = useState<MoonifyResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load and Moonify image
  const handleImageSelected = async (fileOrUrl: File | string) => {
    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const imageLoaded = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error('Image failed to load: ' + e));
      });

      if (typeof fileOrUrl === 'string') {
        img.src = fileOrUrl;
        setOriginalUrl(fileOrUrl);
      } else {
        const objectUrl = URL.createObjectURL(fileOrUrl);
        img.src = objectUrl;
        setOriginalUrl(objectUrl);
      }

      const loadedImg = await imageLoaded;
      const res = await moonifyImage(loadedImg);

      setResult(res);
      setMoonifiedUrl(res.moonifiedCanvas.toDataURL('image/png'));
    } catch (err) {
      console.error('[Moonify] Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.moonifiedCanvas) {
      downloadCanvas(result.moonifiedCanvas, `moonified-${Date.now()}.png`);
    }
  };

  const handleUploadAnother = () => {
    setOriginalUrl(null);
    setMoonifiedUrl(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-indigo-500/30">
      {/* 1. Header with exact requested title and subtitle */}
      <header className="text-center pt-4 sm:pt-8 pb-6 sm:pb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mx-auto mb-4 border border-white/20 shadow-[0_0_35px_rgba(255,255,255,0.2)]">
          <img src="/moon.png" alt="Moon" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-wider text-white font-mono uppercase">
          MOONIFY
        </h1>
        <p className="text-base sm:text-lg text-slate-400 font-normal mt-2">
          “Every spherical light deserves to be the Moon.”
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center">
        {!moonifiedUrl || !originalUrl ? (
          /* 2. Minimal Upload Zone with prominent MOONIFY button */
          <Upload
            onImageSelected={handleImageSelected}
            isProcessing={isProcessing}
          />
        ) : (
          /* 3. Exactly Two Side-by-Side Equal Panels */
          <ImageComparison
            originalUrl={originalUrl}
            moonifiedUrl={moonifiedUrl}
            count={result ? result.count : 0}
            onDownload={handleDownload}
            onUploadAnother={handleUploadAnother}
          />
        )}
      </main>

      {/* Clean, minimal footer */}
      <footer className="py-6 text-xs text-slate-600 font-mono text-center">
        MOONIFY • EVERYTHING SPHERICAL BECOMES THE MOON.
      </footer>
    </div>
  );
};

export default App;
