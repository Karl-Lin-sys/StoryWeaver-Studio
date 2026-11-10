import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, X, Database, Terminal, FileCode2 } from 'lucide-react';
import { getNistCsfSummary } from '../utils/security';

interface NistCsfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NistCsfModal: React.FC<NistCsfModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const csfCategories = getNistCsfSummary();

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-base flex items-center gap-2">
                <span>NIST Cybersecurity Framework 2.0</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Enforced
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Security Architecture & Input Sanitization Report
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close NIST modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 leading-relaxed">
            <p className="font-semibold mb-1">Architecture Guarantee (PR.AC-1 & PR.DS-1):</p>
            All Gemini API calls are strictly handled on the backend Express server. The Gemini API key is never bundled, leaked, or accessible to the browser client. Images are processed ephemerally in RAM and never stored without user consent.
          </div>

          <div className="space-y-3">
            {csfCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 hover:border-stone-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-stone-800 text-amber-300 border border-stone-700">
                      {cat.id}
                    </span>
                    <span className="font-bold text-stone-200 text-sm">{cat.name}</span>
                  </div>
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                  </span>
                </div>
                <p className="text-stone-300 text-xs mb-1.5">{cat.description}</p>
                <div className="p-2 rounded bg-stone-900 border border-stone-850 font-mono text-[11px] text-stone-400">
                  {cat.implementationDetail}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2 text-stone-300">
            <h4 className="font-semibold text-stone-200 text-xs flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Input Validation Specifications:</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-stone-400 text-[11px]">
              <li>Max Payload Limit: 10 MB per image to defend against buffer exhaustion.</li>
              <li>MIME Whitelist: image/jpeg, image/png, image/webp, image/gif.</li>
              <li>Prompt Sanitization: Stripping null bytes and non-printable control codes.</li>
              <li>Security Headers: nosniff, SAMEORIGIN, strict-origin-when-cross-origin.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
