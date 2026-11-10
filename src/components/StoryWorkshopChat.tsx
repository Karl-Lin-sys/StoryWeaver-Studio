import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Compass, Zap, Theater, Trash2, Cpu, Loader2 } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export type WorkshopRole = 'editor' | 'worldbuilder' | 'rapid' | 'expander';

interface StoryWorkshopChatProps {
  storyContext?: {
    title: string;
    genre: string;
    openingParagraph: string;
    setting?: string;
    mood?: string;
  };
  onApplyProseToStory?: (newProse: string) => void;
}

export const ROLES: { id: WorkshopRole; label: string; icon: any; model: 'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'; desc: string }[] = [
  {
    id: 'editor',
    label: 'Literary Editor',
    icon: BookOpen,
    model: 'gemini-3.8-flash',
    desc: 'Analyzes prose cadence, sensory rhythm, sentence structure, and tone.'
  },
  {
    id: 'worldbuilder',
    label: 'World Architect',
    icon: Compass,
    model: 'gemini-4-argon',
    desc: 'Deep multi-layered lore, faction dynamics, and ancient mysteries.'
  },
  {
    id: 'expander',
    label: 'Scene Weaver',
    icon: Theater,
    model: 'gemini-3.8-flash',
    desc: 'Ghostwrites the next scene beat, dialogue, and rising conflicts.'
  },
  {
    id: 'rapid',
    label: 'Rapid Sparks',
    icon: Zap,
    model: 'gemini-3.1-flash-lite',
    desc: 'Fast brainstorms: immediate plot twists, sensory motifs, and quick fixes.'
  }
];

export const StoryWorkshopChat: React.FC<StoryWorkshopChatProps> = ({
  storyContext,
  onApplyProseToStory
}) => {
  const [selectedRole, setSelectedRole] = useState<WorkshopRole>('editor');
  const [selectedModel, setSelectedModel] = useState<'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'model',
      content: `Welcome to your **Literary Workshop**! I am your co-author and prose advisor.\n\nOnce an image is analyzed, I can:\n- **Deepen the scene** with sensory details\n- **Expand the story** with the next paragraph or dialogue\n- **Build world lore** with faction histories and magic rules\n\nWhat would you like to explore next in this world?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // When role changes, set recommended default model
  const handleRoleSelect = (roleId: WorkshopRole) => {
    setSelectedRole(roleId);
    const roleConfig = ROLES.find(r => r.id === roleId);
    if (roleConfig) {
      setSelectedModel(roleConfig.model);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    setErrorNotice(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!customText) setInputPrompt('');
    setIsLoading(true);

    try {
      const serializedContext = storyContext
        ? `Title: ${storyContext.title}\nGenre: ${storyContext.genre}\nSetting: ${storyContext.setting || 'Not specified'}\nMood: ${storyContext.mood || 'Atmospheric'}\nCurrent Opening Paragraph:\n"${storyContext.openingParagraph}"`
        : '';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          systemRole: selectedRole,
          modelChoice: selectedModel,
          storyContext: serializedContext
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to receive reply from Gemini.');
      }

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorNotice(err.message || 'Chat service encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `Chat history reset. How would you like to develop the narrative next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel
      }
    ]);
  };

  const QUICK_PROMPTS = [
    'Write the next paragraph continuing this exact scene.',
    'Introduce an unexpected character stepping into the frame.',
    'Add 3 tactile sensory details to heighten the tension.',
    'What ancient secret is buried right under the protagonist\'s feet?'
  ];

  return (
    <div className="flex flex-col h-full bg-stone-900/90 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Header & Role Navigation */}
      <div className="p-3.5 border-b border-stone-800 bg-stone-950/60">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-100 text-sm flex items-center gap-2">
                <span>Gemini Story Workshop</span>
              </h3>
              <p className="text-[11px] text-stone-400">
                Multi-turn co-author thread • Context-grounded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <div className="flex items-center gap-1 bg-stone-800/90 border border-stone-700 rounded-lg p-0.5 text-[11px]">
              <Cpu className="w-3 h-3 text-amber-400 ml-1.5" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                aria-label="Gemini model selection"
                className="bg-transparent text-amber-300 font-mono py-0.5 pr-2 pl-1 rounded focus:outline-none cursor-pointer"
              >
                <option value="gemini-4-argon" className="bg-stone-900 text-stone-100">gemini-4-argon (Complex)</option>
                <option value="gemini-3.8-flash" className="bg-stone-900 text-stone-100">gemini-3.8-flash (General)</option>
                <option value="gemini-3.1-flash-lite" className="bg-stone-900 text-stone-100">gemini-3.1-flash-lite (Fast)</option>
              </select>
            </div>

            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Clear conversation history"
              aria-label="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Roles tab row */}
        <div className="grid grid-cols-4 gap-1.5">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r.id)}
                title={r.desc}
                className={`py-1.5 px-2 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-sm'
                    : 'bg-stone-800/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                <span className="text-[10px] font-medium leading-none truncate max-w-full">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Story context pill indicator */}
      {storyContext?.title && (
        <div className="px-3.5 py-1.5 bg-stone-950/40 border-b border-stone-800/60 text-[11px] text-stone-400 flex items-center justify-between">
          <span className="truncate">
            Manuscript: <strong className="text-amber-200">{storyContext.title}</strong> ({storyContext.genre})
          </span>
          <span className="text-[10px] text-stone-400 font-mono">Active</span>
        </div>
      )}

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-amber-600/90 text-stone-950 font-medium rounded-tr-xs'
                    : 'bg-stone-800/90 border border-stone-700/60 text-stone-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                <div className={`mt-2 flex items-center justify-between gap-2 text-[10px] ${isUser ? 'text-stone-900/70' : 'text-stone-400'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.modelUsed && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-stone-900/60 text-amber-300 border border-amber-500/20">
                      {msg.modelUsed}
                    </span>
                  )}
                  {!isUser && onApplyProseToStory && msg.content.length > 80 && (
                    <button
                      onClick={() => onApplyProseToStory(msg.content)}
                      className="text-amber-300 hover:text-amber-100 underline decoration-amber-500/40 text-[10px] font-medium ml-auto cursor-pointer"
                      title="Use this generated text in your story draft"
                    >
                      Use as draft
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-stone-800/80 border border-stone-700/60 rounded-2xl p-3 text-stone-300 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span className="text-[11px] text-stone-400">
                {selectedModel === 'gemini-4-argon' ? 'Deep reasoning with gemini-4-argon...' : `${selectedModel} weaving response...`}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts suggestions */}
      <div className="px-3 pt-2 pb-1 border-t border-stone-800/80 bg-stone-950/40 overflow-x-auto flex gap-1.5 no-scrollbar">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            disabled={isLoading}
            className="text-[10px] px-2.5 py-1 rounded-full bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-700/70 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Error alert */}
      {errorNotice && (
        <div className="px-3 py-1.5 bg-red-950/70 text-red-300 border-t border-red-800/50 text-[11px] flex items-center justify-between">
          <span>{errorNotice}</span>
          <button onClick={() => setErrorNotice(null)} className="text-red-400 hover:text-white font-bold ml-2">×</button>
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask the ${ROLES.find(r => r.id === selectedRole)?.label} to polish, continue, or create lore... (Shift+Enter for newline)`}
              rows={2}
              className="w-full resize-none p-2.5 text-xs bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer shrink-0"
            title="Send prompt to Gemini"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
