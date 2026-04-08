
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCcw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { DiseaseDetectionResult } from '../types';
import { useTranslation } from '../src/hooks/useTranslation';
import { detectCropDisease } from '../geminiService';

export const Scanner: React.FC = () => {
  const { t, lang } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-run detection when language changes if we have an image
  useEffect(() => {
    if (image && !loading) {
      const base64 = image.split(',')[1];
      processImage(base64);
    }
  }, [lang]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        processImage(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const detection = await detectCropDisease(base64, lang);
      setResult(detection);
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {!image ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer aspect-square bg-white dark:bg-zinc-800 rounded-3xl border-4 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-4 transition-all hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10"
          >
            <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:scale-110 transition-transform">
              <Upload className="w-12 h-12 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{t('upload_image')}</p>
              <p className="text-zinc-500 text-sm">{t('upload_gallery')}</p>
            </div>
          </div>

          <div 
            className="group aspect-square bg-white dark:bg-zinc-800 rounded-3xl border-4 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-4 cursor-not-allowed opacity-60"
          >
            <div className="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Camera className="w-12 h-12 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{t('camera_coming_soon')}</p>
              <p className="text-zinc-500 text-sm">{t('take_photo_directly')}</p>
            </div>
          </div>
          <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square">
              <img src={image} className="w-full h-full object-cover" alt="Selected leaf" />
              {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white">
                  <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-lg font-bold animate-pulse">{t('scanning')}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {result ? (
                <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-xl space-y-6 border border-zinc-200 dark:border-zinc-700 h-full overflow-y-auto max-h-[500px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{t('results_title')}</h3>
                      <h2 className="text-3xl font-extrabold text-green-700 dark:text-green-400">{result.diseaseName}</h2>
                      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-300">{result.cropName}</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-2xl text-center min-w-[100px]">
                      <p className="text-xs font-bold text-green-600 dark:text-green-400">{t('confidence')}</p>
                      <p className="text-2xl font-black text-green-700 dark:text-green-300">{(result.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl">
                    <p className="text-sm leading-relaxed">{result.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="flex items-center gap-2 font-bold text-emerald-600 mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        {t('solution')}
                      </h4>
                      <ul className="grid gap-2">
                        {result.solution.map((item, i) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-2 font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        {t('prevention')}
                      </h4>
                      <ul className="grid gap-2">
                        {result.prevention.map((item, i) => (
                          <li key={i} className="text-sm flex gap-2 text-zinc-600 dark:text-zinc-400">
                            <span className="text-zinc-400 font-bold">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button 
                    onClick={reset}
                    className="w-full py-4 mt-4 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    {t('scan_again')}
                  </button>
                </div>
              ) : error ? (
                <div className="p-8 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-3xl border border-red-200 dark:border-red-800 flex flex-col items-center justify-center gap-4 h-full">
                  <AlertCircle className="w-12 h-12" />
                  <p className="text-xl font-bold">{error}</p>
                  <button onClick={reset} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold">{t('try_again')}</button>
                </div>
              ) : (
                <div className="p-8 bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-700 h-full flex flex-col items-center justify-center text-center gap-4">
                   <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center animate-pulse">
                      <Sparkles className="w-8 h-8 text-zinc-300" />
                   </div>
                   <p className="text-zinc-500">{t('waiting_for_ai')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
