import React, { useState, useEffect } from 'react';
import { Feather, Shield, Scale, HelpCircle, Sparkles, BookOpen, Volume2, MessageSquare, AlertCircle } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { ManuscriptEditor } from './components/ManuscriptEditor';
import { StoryWorkshopChat } from './components/StoryWorkshopChat';
import { NistCsfModal } from './components/NistCsfModal';
import { TaiwanLegalModal } from './components/TaiwanLegalModal';
import { CanadianEnglishExplainerModal } from './components/CanadianEnglishExplainerModal';
import { PRESET_SCENES, PresetScene } from './data/samplePresets';
import { StoryAnalysisData } from './utils/story';

export default function App() {
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(PRESET_SCENES[0].imageUrl);
  const [selectedGenre, setSelectedGenre] = useState<string>(PRESET_SCENES[0].genre);
  const [selectedTone, setSelectedTone] = useState<string>(PRESET_SCENES[0].tone);

  const [analysisData, setAnalysisData] = useState<StoryAnalysisData | null>(
    PRESET_SCENES[0].cachedAnalysis || null
  );
  const [customOpening, setCustomOpening] = useState<string>(
    PRESET_SCENES[0].cachedAnalysis?.story.openingParagraph || ''
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Modals state
  const [isNistModalOpen, setIsNistModalOpen] = useState(false);
  const [isTaiwanModalOpen, setIsTaiwanModalOpen] = useState(false);
  const [isCanadianModalOpen, setIsCanadianModalOpen] = useState(false);

  // Convert preset image URL to base64 on mount so the user can re-analyze immediately
  useEffect(() => {
    async function preloadInitialPresetImage() {
      try {
        const response = await fetch(PRESET_SCENES[0].imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImageBase64(reader.result as string);
          setSelectedMimeType(blob.type || 'image/jpeg');
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.warn('Preload image failed:', err);
      }
    }
    preloadInitialPresetImage();
  }, []);

  const handleImageSelected = (base64: string, mime: string, previewUrl: string) => {
    setSelectedImageBase64(base64);
    setSelectedMimeType(mime);
    setImagePreviewUrl(previewUrl);
    setGlobalError(null);
  };

  const handleSelectPreset = (preset: PresetScene) => {
    setImagePreviewUrl(preset.imageUrl);
    setSelectedGenre(preset.genre);
    setSelectedTone(preset.tone);
    setGlobalError(null);

    if (preset.cachedAnalysis) {
      setAnalysisData(preset.cachedAnalysis);
      setCustomOpening(preset.cachedAnalysis.story.openingParagraph);
    }

    // Convert to base64 in background for manual re-analysis
    fetch(preset.imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImageBase64(reader.result as string);
          setSelectedMimeType(blob.type || 'image/jpeg');
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => console.warn('Could not load preset blob:', err));
  };

  const handleAnalyzeAndGhostwrite = async (options: { genre: string; tone: string }) => {
    if (!selectedImageBase64) {
      setGlobalError('Please select or upload a scene image first.');
      return;
    }

    setIsAnalyzing(true);
    setGlobalError(null);

    try {
      const response = await fetch('/api/analyze-and-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImageBase64,
          mimeType: selectedMimeType,
          genre: options.genre,
          tone: options.tone
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to analyze scene and ghostwrite story.');
      }

      setAnalysisData(result.data);
      setCustomOpening(result.data.story.openingParagraph);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setGlobalError(err.message || 'An error occurred during scene analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    if (analysisData) {
      setAnalysisData({
        ...analysisData,
        story: {
          ...analysisData.story,
          title: newTitle
        }
      });
    }
  };

  const handleApplyProseFromChat = (newProse: string) => {
    setCustomOpening(newProse);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation Bar */}
      <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-900/40">
              <Feather className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-100">
                  StoryWeaver Studio
                </h1>
                <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
                  Gemini 4 Argon & TTS
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Visual Scene Analysis • Ghostwritten Openings • Expressive Narration • Literary Chat
              </p>
            </div>
          </div>

          {/* Action Modals Nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNistModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 hover:text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View NIST Cybersecurity Framework compliance"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">NIST CSF 2.0</span>
            </button>

            <button
              onClick={() => setIsTaiwanModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 hover:text-blue-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View Taiwan Legal & GitHub compliance"
            >
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">臺灣法律合規</span>
            </button>

            <button
              onClick={() => setIsCanadianModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-amber-900/40 text-amber-300 hover:text-amber-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Explain in Canadian English for little buddies"
            >
              <span className="text-sm leading-none">🍁</span>
              <span className="hidden sm:inline">Canadian English</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Error Banner */}
      {globalError && (
        <div className="bg-red-950/80 border-b border-red-800/60 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-red-400 hover:text-white font-bold ml-4 text-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Scene & Image Uploader */}
        <div className="lg:col-span-4 flex flex-col gap-5 sticky top-20">
          <ImageUploader
            onImageSelected={handleImageSelected}
            onAnalyzeTrigger={handleAnalyzeAndGhostwrite}
            onSelectPreset={handleSelectPreset}
            selectedPreview={imagePreviewUrl}
            isAnalyzing={isAnalyzing}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            selectedTone={selectedTone}
            setSelectedTone={setSelectedTone}
          />
        </div>

        {/* Center Column: The Story Manuscript & Expressive TTS */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {analysisData ? (
            <ManuscriptEditor
              analysis={analysisData}
              customOpening={customOpening}
              onOpeningChange={setCustomOpening}
              onTitleChange={handleTitleChange}
              isAnalyzing={isAnalyzing}
            />
          ) : (
            <div className="bg-stone-900/60 border border-dashed border-stone-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-200 mb-1">
                Your Story Manuscript Awaits
              </h3>
              <p className="text-xs text-stone-400 max-w-sm">
                Upload a scene image or pick an inspiration preset to have Gemini 4 Argon ghostwrite the world’s opening paragraph.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Turn Story Workshop Chat */}
        <div className="lg:col-span-3 h-[720px] flex flex-col sticky top-20">
          <StoryWorkshopChat
            storyContext={
              analysisData
                ? {
                    title: analysisData.story.title,
                    genre: analysisData.story.genre,
                    openingParagraph: customOpening || analysisData.story.openingParagraph,
                    setting: analysisData.visualAnalysis.setting,
                    mood: analysisData.visualAnalysis.mood
                  }
                : undefined
            }
            onApplyProseToStory={handleApplyProseFromChat}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950/60 py-4 px-6 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>NIST CSF 2.0 & Taiwan PDPA Compliant Architecture</span>
          </div>

          <p className="text-stone-400 text-[11px]">
            Powered by Google Gemini 4 Argon (Vision & Narrative) • Gemini 3.8 Flash TTS (Audio Narration) • MIT Licensed
          </p>
        </div>
      </footer>

      {/* Modals */}
      <NistCsfModal isOpen={isNistModalOpen} onClose={() => setIsNistModalOpen(false)} />
      <TaiwanLegalModal isOpen={isTaiwanModalOpen} onClose={() => setIsTaiwanModalOpen(false)} />
      <CanadianEnglishExplainerModal isOpen={isCanadianModalOpen} onClose={() => setIsCanadianModalOpen(false)} />
    </div>
  );
}
