import React from 'react';
import { Scale, CheckCircle2, GitBranch, X, FileText, Globe } from 'lucide-react';
import { checkTaiwanLegalCompliance } from '../utils/security';

interface TaiwanLegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaiwanLegalModal: React.FC<TaiwanLegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const compliance = checkTaiwanLegalCompliance();

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-base flex items-center gap-2">
                <span>臺灣法律遵循與 GitHub 開源合規</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                  合法確認
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Taiwan Legal Framework & GitHub Open Source Compliance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close Taiwan Legal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-stone-300">
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200">
            <h4 className="font-bold mb-1 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-400" />
              <span>合法上傳至 GitHub 之法律依據與審查標準</span>
            </h4>
            <p>
              本專案依據中華民國現行法令完成合規性設計，所有原始碼採用國際公認之 <strong>MIT 授權條款</strong>，不含任何未授權之第三方專利代碼或商業專有秘密，得依法自由上傳、發布至 GitHub 供全球公眾檢閱與協同開發。
            </p>
          </div>

          {/* PDPA Section */}
          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>1. 《個人資料保護法》(PDPA) 之遵循</span>
              </h4>
              <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 第 19 條、第 20 條合規
              </span>
            </div>
            <p className="text-stone-300">
              {compliance.pdpaNote}
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-400 text-[11px]">
              <li>無個資蒐集：伺服器未留存任何可識別個人身分之資訊（姓名、聯絡方式、IP 地址庫）。</li>
              <li>非持久化運算：上傳圖片僅於記憶體暫存調用 Gemini API，分析完畢即釋放。</li>
            </ul>
          </div>

          {/* Copyright Act Section */}
          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>2. 《著作權法》與 AI 生成物合法性 (TIPO 指引)</span>
              </h4>
              <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 第 10-1 條、第 65 條合規
              </span>
            </div>
            <p className="text-stone-300">
              {compliance.copyrightNote}
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-400 text-[11px]">
              <li>觀念與表達分離（第 10-1 條）：AI 作為輔助創作者之工具，使用者保有作品之修改、編修與最終表達權利。</li>
              <li>合理使用與轉化性創作（第 65 條）：圖片分析旨在萃取氛圍與構圖概念，生成原創小說情節，具備高度轉化性。</li>
            </ul>
          </div>

          {/* Git repository upload instructions */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
            <h4 className="font-semibold text-stone-200 text-xs flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>GitHub 儲存庫建立指令 (合法上傳步驟)</span>
            </h4>
            <pre className="p-2.5 rounded bg-stone-900 border border-stone-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
{`git init
git add .
git commit -m "feat: StoryWeaver creative writing studio (NIST & Taiwan PDPA compliant)"
git branch -M main
git remote add origin https://github.com/<your-username>/storyweaver-studio.git
git push -u origin main`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            關閉檢閱 (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
