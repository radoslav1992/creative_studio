'use client';

import { useState } from 'react';
import { Sparkles, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';

interface PromptEnhancerProps {
  prompt: string;
  category: 'video' | 'image';
  onEnhanced: (enhancedPrompt: string) => void;
  disabled?: boolean;
}

export function PromptEnhancer({ prompt, category, onEnhanced, disabled }: PromptEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!prompt.trim()) {
      toast.error('Моля, въведете промпт преди да го подобрите');
      return;
    }

    setIsEnhancing(true);
    setOriginalPrompt(prompt);

    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), category }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Грешка при подобряване на промпта');
      }

      onEnhanced(data.enhancedPrompt);
      toast.success('Промптът е подобрен с Gemini Flash');
    } catch (error: any) {
      toast.error('Грешка при подобряване', {
        description: error.message,
      });
      setOriginalPrompt(null);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleRevert = () => {
    if (originalPrompt !== null) {
      onEnhanced(originalPrompt);
      setOriginalPrompt(null);
      toast('Промптът е възстановен');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleEnhance}
        disabled={disabled || isEnhancing || !prompt.trim()}
        className={clsx(
          'nb-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all',
          isEnhancing
            ? 'bg-sunny-200 border-ink text-ink cursor-wait shadow-brutal-sm'
            : 'bg-sunny-100 border-ink text-ink hover:bg-sunny-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-brutal-sm'
        )}
      >
        {isEnhancing ? (
          <>
            <div className="w-3 h-3 border-[1.5px] border-ink/30 border-t-ink rounded-full animate-spin" />
            Подобряване...
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3" />
            Подобри с AI
          </>
        )}
      </button>

      {originalPrompt !== null && !isEnhancing && (
        <button
          type="button"
          onClick={handleRevert}
          className="nb-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border-2 border-ink text-ink-muted hover:bg-cream-200 hover:text-ink transition-all shadow-brutal-sm"
        >
          <Undo2 className="w-3 h-3" />
          Върни оригинала
        </button>
      )}
    </div>
  );
}
