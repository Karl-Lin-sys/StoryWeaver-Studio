import React, { useState } from 'react';
import { BookMarked, Edit3, Check, Copy, Download, Sparkles, Compass, Eye, RefreshCw, Feather } from 'lucide-react';
import { StoryAnalysisData, calculateWordCount, estimateReadingTime, formatStoryMarkdown } from '../utils/story';
import { AudioNarrator } from './AudioNarrator';

interface ManuscriptEditorProps {
  analysis: StoryAnalysisData;
  customOpening: string;
  onOpeningChange: (text: string) => void;
  onTitleChange: (title: string) => void;
  isAnalyzing: boolean;
}

export const ManuscriptEditor: React.FC<ManuscriptEditorProps> = ({
  analysis,
  customOpening,
  onOpeningChange,
  onTitleChange,
  isAnalyzing
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'analysis'>('story');

  const activeOpening = customOpening || analysis.story.openingParagraph;
  const wordCount = calculateWordCount(activeOpening);
  const readingTime = estimateReadingTime(activeOpening);

  const handleCopy = () => {
    const text = `${analysis.story.title}\n\n${activeOpening}\n\n---\nWorld Lore: ${analysis.story.worldLoreSnippet}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = formatStoryMarkdown(analysis, activeOpening);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-manuscript.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-5">
      {/* Top Bar: Tabs & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('story')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'story'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Story Manuscript</span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Visual Analysis & Mood</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400 font-mono text-[11px] hidden sm:inline">
            {wordCount} words • ~{readingTime} min read
          </span>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isEditing
                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
            title="Edit story paragraph text"
          >
            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Done Editing' : 'Edit Draft'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-stone-100 hover:bg-stone-700 border border-stone-700 transition-colors cursor-pointer"
            title="Copy manuscript to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-amber-400 hover:bg-stone-700 border border-stone-700 transition-colors cursor-pointer"
            title="Export manuscript as Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeTab === 'story' ? (
        <div className="flex flex-col gap-5">
          {/* Story Title & Meta tags */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400/90 uppercase tracking-widest">
              <span>{analysis.story.genre}</span>
              <span>•</span>
              <span>{analysis.visualAnalysis.mood}</span>
            </div>

            <input
              type="text"
              value={analysis.story.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 bg-transparent border-b border-transparent hover:border-stone-700 focus:border-amber-500 focus:outline-none transition-colors"
              placeholder="Story Title..."
            />
          </div>

          {/* Manuscript Parchment Box with Opening Paragraph */}
          <div className="relative p-6 sm:p-8 rounded-xl bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 border border-amber-900/30 shadow-inner">
            <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[10px] font-mono text-amber-500/70">
              <Sparkles className="w-3 h-3" /> Ghostwritten by Gemini 4 Argon
            </div>

            {isEditing ? (
              <textarea
                value={activeOpening}
                onChange={(e) => onOpeningChange(e.target.value)}
                rows={7}
                className="w-full bg-stone-900/80 p-3 rounded-lg border border-amber-500/40 text-stone-100 font-serif text-base sm:text-lg leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Type your story opening..."
              />
            ) : (
              <div className="font-serif text-stone-200 text-base sm:text-lg leading-relaxed drop-cap tracking-wide select-text">
                {activeOpening}
              </div>
            )}
          </div>

          {/* Expressive AI Voice Narration Player (Gemini 3.8 Flash TTS) */}
          <AudioNarrator
            storyText={activeOpening}
            defaultVoice={analysis.suggestedVoice.voiceName}
            defaultStyle={analysis.suggestedVoice.styleInstruction}
          />

          {/* World Lore & Narrative Hooks Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
              <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5" />
                <span>World Lore Snippet</span>
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed font-serif italic">
                "{analysis.story.worldLoreSnippet}"
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
              <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Narrative Hooks & Next Beats</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-300">
                {analysis.story.narrativeHooks.map((hook, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold shrink-0">›</span>
                    <span>{hook}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Visual Analysis Breakdown View */
        <div className="flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800">
              <span className="text-[11px] text-stone-400 block mb-1">Visual Mood & Emotional Atmosphere</span>
              <p className="text-sm font-semibold text-amber-200">{analysis.visualAnalysis.mood}</p>
              <p className="text-stone-300 mt-1">{analysis.visualAnalysis.atmosphere}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800">
              <span className="text-[11px] text-stone-400 block mb-1">Identified World Setting</span>
              <p className="text-sm font-semibold text-amber-200">{analysis.visualAnalysis.setting}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-stone-400 text-[10px]">Palette:</span>
                <div className="flex items-center gap-1.5">
                  {analysis.visualAnalysis.colorPalette.map((col, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full border border-stone-700 shadow-sm"
                      style={{ backgroundColor: col }}
                      title={col}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
            <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
              Sensory Details Detected in Scene
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.visualAnalysis.sensoryDetails.map((detail, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-stone-900/60 border border-stone-850 flex items-center gap-2 text-stone-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
            <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
              Key Scene Focal Points
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.visualAnalysis.keyFocalPoints.map((fp, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-stone-200 text-xs">
                  {fp}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
