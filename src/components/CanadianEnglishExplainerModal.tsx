import React from 'react';
import { Sparkles, Heart, Smile, X, BookOpen, Volume2 } from 'lucide-react';

interface CanadianEnglishExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CanadianEnglishExplainerModal: React.FC<CanadianEnglishExplainerModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-amber-900/40 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl">
              🍁
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-base flex items-center gap-2">
                <span>Storytime for Little Buddies, Eh!</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-medium">
                  Canadian English
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Simple explanation so even a 4-year-old can smile!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close Canadian English modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-stone-200">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm font-medium">
            "Hey there, little buddy! Pull on your warm toque, grab some pancakes with pure maple syrup, and sit right here by the campfire. Let me tell you what this neat machine does, eh!"
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg shrink-0 mt-0.5">
                🖼️
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-xs mb-1">Step 1: You Show a Picture!</h4>
                <p className="text-stone-300 text-[11px]">
                  You show the friendly robot a neat picture—maybe a secret rainy alley or a castle floating high up in the puffy clouds.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg shrink-0 mt-0.5">
                🪄
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-xs mb-1">Step 2: The Robot Makes Up a Bedtime Story!</h4>
                <p className="text-stone-300 text-[11px]">
                  The robot (named Gemini 4 Argon) puts on its thinking cap! It looks at the colors and writes the exciting first page of a storybook, right out of thin air.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg shrink-0 mt-0.5">
                🎙️
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-xs mb-1">Step 3: It Reads It Out Loud to You!</h4>
                <p className="text-stone-300 text-[11px]">
                  Press the big glowing button, and a cozy voice reads the whole tale out loud, sweet and exciting like your favourite cartoon!
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg shrink-0 mt-0.5">
                🛡️
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-xs mb-1">Step 4: Super Safe & Friendly (NIST Shield & Taiwan Rules)!</h4>
                <p className="text-stone-300 text-[11px]">
                  No sneaky bad guys allowed, buddy! The secret keys stay locked in the castle vault, your pictures stay safe, and it follows all the good rules in Taiwan and the whole world. Neat, eh?
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-[11px] text-stone-400 text-center italic">
            "Now you’re ready to make stories bigger than Lake Superior, don'tcha know!" 🇨🇦
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors cursor-pointer"
          >
            Beauty! Let's Write Stories!
          </button>
        </div>
      </div>
    </div>
  );
};
