import React, { useState } from 'react';
import { Sparkles, Brain, Loader2 } from 'lucide-react';
import { generateGeminiContent } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface AIInsightPanelProps {
  balances: any[];
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ balances }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const balanceStr = balances.map(b => 
        `${b.balance} ${b.asset_type === 'native' ? 'XLM' : b.asset_code}`
      ).join(', ');
      
      const prompt = `As a Stellar blockchain expert, provide a brief, professional analysis of this account's portfolio: ${balanceStr || 'No assets found'}. Suggest one strategic move or insight about the Stellar ecosystem relevant to these assets. Keep it under 100 words. IMPORTANT: Do not use any markdown formatting, asterisks (*), or bold symbols. Use plain text only.`;
      
      const response = await generateGeminiContent(prompt);
      if (response) {
        setInsight(response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate insight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hw-widget space-y-4 border border-hw-accent/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-hw-accent" />
          <h3 className="hw-label text-hw-accent">AI Intelligence</h3>
        </div>
        <button
          onClick={generateInsight}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-hw-accent text-hw-card rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-hw-accent/90 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Analyze
        </button>
      </div>

      <AnimatePresence mode="wait">
        {insight ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-hw-accent/5 rounded-lg border border-hw-accent/10"
          >
            <p className="text-sm leading-relaxed text-hw-text/90 italic">
              "{insight.replace(/\*/g, '')}"
            </p>
          </motion.div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-2 opacity-30">
            <Sparkles className="w-8 h-8" />
            <p className="text-xs font-mono">Ready for analysis</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
