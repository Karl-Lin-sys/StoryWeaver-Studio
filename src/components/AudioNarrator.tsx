import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw, Download, Sparkles, Loader2, Music, Sliders } from 'lucide-react';

interface AudioNarratorProps {
  storyText: string;
  defaultVoice?: string;
  defaultStyle?: string;
}

export const VOICES = [
  { name: 'Kore', label: 'Kore (Warm & Lyrical)', desc: 'Nuanced, mythic, soulful cadence' },
  { name: 'Fenrir', label: 'Fenrir (Deep & Resonant)', desc: 'Gravelly, brooding, dramatic intensity' },
  { name: 'Puck', label: 'Puck (Nimble & Whimsical)', desc: 'Curious, lively, theatrical storytelling' },
  { name: 'Zephyr', label: 'Zephyr (Serene & Cinematic)', desc: 'Smooth, poetic, reflective stillness' },
  { name: 'Charon', label: 'Charon (Solemn & Somber)', desc: 'Dark, ancient, commanding gravity' }
];

export const STYLES = [
  'Expressive, immersive literary audiobook narrator with evocative cadence, clear emotion, and dramatic pacing',
  'Breathless suspense, whispered urgency, and palpable dread in every syllable',
  'Ancient bard chanting a forgotten myth by fireside, solemn and awe-filled',
  'Gritty noir detective monologue with low gravelly voice and weary cynicism',
  'Cozy, whimsical bedtime fable with melodic gentleness and warm comfort'
];

export const AudioNarrator: React.FC<AudioNarratorProps> = ({
  storyText,
  defaultVoice = 'Kore',
  defaultStyle
}) => {
  const [selectedVoice, setSelectedVoice] = useState(defaultVoice);
  const [selectedStyle, setSelectedStyle] = useState(defaultStyle || STYLES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // When storyText changes, invalidate old audio so user generates fresh narration
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setAudioUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setErrorMessage(null);
  }, [storyText]);

  // Update default voice if prop changes
  useEffect(() => {
    if (defaultVoice) setSelectedVoice(defaultVoice);
  }, [defaultVoice]);

  useEffect(() => {
    if (defaultStyle) setSelectedStyle(defaultStyle);
  }, [defaultStyle]);

  const handleGenerateAudio = async () => {
    if (!storyText.trim()) {
      setErrorMessage('Please generate or enter a story paragraph before reading aloud.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: storyText,
          voiceName: selectedVoice,
          speakerStyle: selectedStyle
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to synthesize narration audio.');
      }

      setAudioUrl(data.audioData);

      // Initialize audio object
      if (audioRef.current) {
        audioRef.current.src = data.audioData;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.warn('Auto-play blocked or failed:', err);
        });
      }
    } catch (err: any) {
      console.error('Audio generation error:', err);
      setErrorMessage(err.message || 'Could not synthesize audio narration.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) {
      handleGenerateAudio();
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Audio playback error:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const changeSpeed = () => {
    const rates = [0.8, 1.0, 1.25, 1.5];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-stone-900/90 border border-amber-900/40 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={() => {
          setIsPlaying(false);
          setErrorMessage('Audio playback encountered an error.');
        }}
      />

      {/* Top Header & Read Aloud Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-100 text-sm">Expressive Narration</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                gemini-3.8-flash-tts
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Voice: <span className="text-amber-200 font-medium">{selectedVoice}</span> • {duration > 0 ? `${formatTime(duration)} narration ready` : 'High-fidelity 24kHz audio'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-stone-100 bg-stone-800/80 hover:bg-stone-800 border border-stone-700 transition-colors flex items-center gap-1.5"
            title="Configure voice style and persona"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Voice Studio</span>
          </button>

          {!audioUrl ? (
            <button
              onClick={handleGenerateAudio}
              disabled={isLoading || !storyText}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={togglePlayPause}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-700 transition-colors cursor-pointer"
                title="Restart narration"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={changeSpeed}
                className="px-2 py-1 rounded-lg text-xs font-mono font-bold text-amber-300 bg-stone-800 border border-stone-700 hover:border-amber-500/50 transition-colors cursor-pointer"
                title="Change playback speed"
              >
                {playbackRate}x
              </button>

              <a
                href={audioUrl}
                download="story-narration.wav"
                className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 border border-stone-700 transition-colors"
                title="Download WAV audio file"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Voice Configuration Drawer */}
      {showConfig && (
        <div className="mt-3 pt-3 border-t border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="block text-stone-400 mb-1 font-medium">Select Voice Actor</label>
            <div className="grid grid-cols-2 gap-1.5">
              {VOICES.map((v) => (
                <button
                  key={v.name}
                  onClick={() => {
                    setSelectedVoice(v.name);
                    setAudioUrl(null);
                  }}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    selectedVoice === v.name
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-200'
                      : 'bg-stone-800/60 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="font-semibold">{v.name}</div>
                  <div className="text-[10px] text-stone-400 truncate">{v.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-stone-400 mb-1 font-medium">Dramatic Cadence & Atmosphere</label>
            <select
              value={selectedStyle}
              onChange={(e) => {
                setSelectedStyle(e.target.value);
                setAudioUrl(null);
              }}
              className="w-full p-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 focus:outline-none focus:border-amber-500 text-xs"
            >
              {STYLES.map((st, i) => (
                <option key={i} value={st}>
                  {st.length > 60 ? st.slice(0, 57) + '...' : st}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-stone-400">
              Gemini 3.8 Flash TTS synthesizes human-like voice inflection, breathing, and emotional delivery.
            </p>
          </div>
        </div>
      )}

      {/* Audio Playback Progress Bar & Waveform Pulse */}
      {audioUrl && (
        <div className="mt-3 pt-2 border-t border-stone-800/80">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-stone-400 w-9 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                aria-label="Audio progress"
                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <span className="text-[11px] font-mono text-stone-400 w-9">
              {formatTime(duration)}
            </span>

            {/* Pulsing Audio Waves Indicator */}
            <div className="flex items-center gap-0.5 px-2 py-1 bg-stone-800/60 rounded">
              <span className={`w-0.5 bg-amber-400 rounded-full transition-all duration-150 ${isPlaying ? 'h-3 animate-pulse' : 'h-1'}`}></span>
              <span className={`w-0.5 bg-amber-400 rounded-full transition-all duration-150 delay-75 ${isPlaying ? 'h-4 animate-pulse' : 'h-2'}`}></span>
              <span className={`w-0.5 bg-amber-400 rounded-full transition-all duration-150 delay-150 ${isPlaying ? 'h-2 animate-pulse' : 'h-1'}`}></span>
              <span className={`w-0.5 bg-amber-400 rounded-full transition-all duration-150 delay-100 ${isPlaying ? 'h-3.5 animate-pulse' : 'h-1.5'}`}></span>
            </div>
          </div>
        </div>
      )}

      {/* Error alert banner */}
      {errorMessage && (
        <div className="mt-2.5 p-2 bg-red-950/60 border border-red-800/50 rounded-lg text-red-300 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200 text-sm font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
