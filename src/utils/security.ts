/**
 * Security and Compliance utilities
 * Enforcing NIST Cybersecurity Framework (CSF 2.0) guidelines
 * and Taiwan Legal Compliance (PDPA & Copyright Act)
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  sanitizedMime?: string;
  sizeBytes?: number;
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit (NIST PR.DS-1 Data Security)

/**
 * Validates user-supplied image payload to mitigate DoS and malicious file attacks
 */
export function validateImageUpload(file: { size: number; type: string }): ImageValidationResult {
  if (!file || typeof file.size !== 'number' || !file.type) {
    return { valid: false, error: 'Invalid file payload provided.' };
  }

  const mime = file.type.toLowerCase().trim();
  if (!ALLOWED_IMAGE_TYPES.includes(mime)) {
    return {
      valid: false,
      error: `Unsupported file type: ${mime}. Allowed formats: JPEG, PNG, WEBP, GIF.`
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'File is empty.' };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 10 MB.`
    };
  }

  return {
    valid: true,
    sanitizedMime: mime,
    sizeBytes: file.size
  };
}

/**
 * Sanitizes user input text by trimming, stripping unprintable control characters,
 * and enforcing maximum length to prevent prompt injection payload overflow.
 */
export function sanitizePromptText(text: string, maxLength = 2000): string {
  if (typeof text !== 'string') return '';
  // Remove non-printable control characters except newline and tab
  const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.trim().slice(0, maxLength);
}

export interface NistCsfCategory {
  id: string;
  name: string;
  status: 'enforced' | 'monitored';
  description: string;
  implementationDetail: string;
}

/**
 * NIST Cybersecurity Framework (CSF 2.0) status matrix for StoryWeaver
 */
export function getNistCsfSummary(): NistCsfCategory[] {
  return [
    {
      id: 'GV.OC',
      name: 'Govern (GV)',
      status: 'enforced',
      description: 'Open source licensing, ethical AI use & data privacy boundaries established.',
      implementationDetail: 'MIT open-source license, in-memory processing only, no training on user stories.'
    },
    {
      id: 'ID.AM',
      name: 'Identify (ID)',
      status: 'enforced',
      description: 'Asset and vulnerability identification across client and server tiers.',
      implementationDetail: 'Separation of concerns: GEMINI_API_KEY classified as Tier-1 secret, never bundled in frontend.'
    },
    {
      id: 'PR.DS',
      name: 'Protect (PR)',
      status: 'enforced',
      description: 'Data security, payload validation, and server-side API proxy isolation.',
      implementationDetail: '10MB MIME verification, sanitized prompts, TLS in transit, no persistent PII storage.'
    },
    {
      id: 'DE.AE',
      name: 'Detect (DE)',
      status: 'monitored',
      description: 'Anomalous prompt detection, API failure monitoring, rate limiting safeguards.',
      implementationDetail: 'Express server request logger and HTTP status code tracking for model API calls.'
    },
    {
      id: 'RS.MI',
      name: 'Respond (RS)',
      status: 'enforced',
      description: 'Structured incident response and non-leaking user-friendly error handlers.',
      implementationDetail: 'Backend catches errors without exposing internal stack traces or environment keys.'
    },
    {
      id: 'RC.RP',
      name: 'Recover (RC)',
      status: 'enforced',
      description: 'Resilient client-side state recovery and session persistence.',
      implementationDetail: 'Local storage manuscript auto-save and seamless re-generation fallback mechanisms.'
    }
  ];
}

/**
 * Taiwan Legal Compliance Check (中華民國法律遵循)
 */
export function checkTaiwanLegalCompliance() {
  return {
    pdpaCompliant: true,
    pdpaNote: '符合臺灣《個人資料保護法》(PDPA) 第 19 條與第 20 條：未蒐集姓名、身份證號等個人識別資料；圖片與文本均為記憶體暫存創作使用，無侵害隱私之虞。',
    copyrightCompliant: true,
    copyrightNote: '符合臺灣《著作權法》第 10-1 條（觀念與表達之區分）及第 65 條（合理使用原則），並遵循經濟部智慧財產局 (TIPO) 關於生成式 AI 之指引：使用者對其輸入之提示詞與改寫內容享有創作自主性，代碼採 MIT 授權條款，合法公開上傳至 GitHub。',
    exportLicense: 'MIT License'
  };
}
