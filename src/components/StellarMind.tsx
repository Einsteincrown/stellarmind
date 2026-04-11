import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  Search, 
  Lock, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as StellarSdk from 'stellar-sdk';
import { 
  submitMicropayment, 
  getTransactionUrl, 
  createAccount, 
  fundAccount, 
  getTransactionHistory,
  isFreighterConnected,
  getFreighterPublicKey,
  submitFreighterMicropayment
} from '../lib/stellar';
import { runResearchAgent } from '../lib/agent';

type Step = 'idle' | 'initializing' | 'micropayment' | 'confirmed' | 'researching' | 'ready';

export const StellarMind: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('stellar-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [query, setQuery] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [useFreighter, setUseFreighter] = useState(false);
  const [freighterPublicKey, setFreighterPublicKey] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    setIsIframe(window.top !== window.self);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('stellar-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (useFreighter && freighterPublicKey) {
      fetchHistory(freighterPublicKey);
    } else if (secretKey) {
      try {
        const pair = StellarSdk.Keypair.fromSecret(secretKey);
        fetchHistory(pair.publicKey());
      } catch (e) {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  }, [secretKey, useFreighter, freighterPublicKey]);

  useEffect(() => {
    let interval: any;
    if (useFreighter) {
      interval = setInterval(async () => {
        try {
          const currentAddress = await getFreighterPublicKey();
          if (currentAddress !== freighterPublicKey) {
            setFreighterPublicKey(currentAddress);
          }
        } catch (e) {
          // Ignore errors during background check
        }
      }, 2000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [useFreighter, freighterPublicKey]);

  const fetchHistory = async (pubKey: string) => {
    setLoadingHistory(true);
    const data = await getTransactionHistory(pubKey);
    setHistory(data);
    setLoadingHistory(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenerateTestKey = async () => {
    setIsGenerating(true);
    setError(null);
    setUseFreighter(false);
    try {
      const { publicKey, secret } = createAccount();
      await fundAccount(publicKey);
      setSecretKey(secret);
      setShowSecret(true);
    } catch (err: any) {
      console.error('Generation Error:', err);
      setError('Failed to generate and fund a test account. Please try again or use the Stellar Laboratory link.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConnectFreighter = async () => {
    setIsConnectingWallet(true);
    setError(null);
    try {
      const connected = await isFreighterConnected();
      if (!connected) {
        throw new Error('Freighter wallet not found. Please install the extension and ensure it is enabled.');
      }
      const pubKey = await getFreighterPublicKey();
      setFreighterPublicKey(pubKey);
      setUseFreighter(true);
      setSecretKey(''); // Clear secret key if using wallet
    } catch (err: any) {
      console.error('Freighter Error:', err);
      let msg = err.message || 'Failed to connect to Freighter.';
      if (isIframe) {
        msg += ' Note: Wallet extensions may be blocked in iframes. Try opening the app in a new tab.';
      }
      setError(msg);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const runAgent = async () => {
    if (!query || (!secretKey && !useFreighter)) {
      setError('Please provide a research query and either a secret key or connect your wallet.');
      return;
    }

    setError(null);
    setReport(null);
    setTxHash(null);
    
    try {
      // 1. Initializing
      setCurrentStep('initializing');
      await new Promise(r => setTimeout(r, 1000));

      // 2. Micropayment
      setCurrentStep('micropayment');
      let result;
      if (useFreighter && freighterPublicKey) {
        result = await submitFreighterMicropayment(freighterPublicKey);
      } else {
        result = await submitMicropayment(secretKey);
      }
      setTxHash(result.hash);

      // 3. Confirmed
      setCurrentStep('confirmed');
      await new Promise(r => setTimeout(r, 800));

      // 4. Researching
      setCurrentStep('researching');
      const aiReport = await runResearchAgent(query);
      setReport(aiReport);

      // 5. Ready
      setCurrentStep('ready');
      
      // Refresh history
      if (useFreighter && freighterPublicKey) {
        fetchHistory(freighterPublicKey);
      } else {
        const pair = StellarSdk.Keypair.fromSecret(secretKey);
        fetchHistory(pair.publicKey());
      }
    } catch (err: any) {
      console.error('StellarMind Error:', err);
      setError(err.message || 'An unexpected error occurred during the research process.');
      setCurrentStep('idle');
    }
  };

  const steps = [
    { id: 'initializing', label: 'Initializing Agent' },
    { id: 'micropayment', label: 'Submitting x402 Micropayment' },
    { id: 'confirmed', label: 'Transaction Confirmed' },
    { id: 'researching', label: 'Running AI Research' },
    { id: 'ready', label: 'Report Ready' },
  ];

  const getStepStatus = (stepId: string) => {
    const stepOrder = ['initializing', 'micropayment', 'confirmed', 'researching', 'ready'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (currentStep === 'idle') return 'pending';
    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className={`min-h-screen w-full star-field ${theme === 'dark' ? 'bg-stellar-navy text-white' : 'bg-white text-stellar-navy'}`}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 stellar-gradient rounded-xl flex items-center justify-center shadow-lg shadow-stellar-blue/20">
              <span className="text-2xl text-white">✦</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">StellarMind</h1>
          </div>
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-all ${theme === 'dark' ? 'bg-stellar-card-dark hover:bg-white/10' : 'bg-stellar-card-light hover:bg-stellar-navy/5'}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Hero Section */}
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Autonomous <span className="stellar-gradient-text">Research Agent</span>
          </h2>
          <p className="text-lg opacity-60 font-medium">
            Powered by x402 Micropayments on the Stellar Network
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className={`p-8 rounded-3xl card-glow border transition-all ${theme === 'dark' ? 'bg-stellar-card-dark border-white/5' : 'bg-stellar-card-light border-stellar-navy/5'}`}>
              <div className="space-y-6">
                {/* Query Input */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
                    <Search className="w-3 h-3" /> Research Query
                  </label>
                  <textarea 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Analyze the impact of Soroban smart contracts on Stellar's TVL..."
                    className={`w-full h-32 p-4 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-stellar-blue/30 transition-all ${theme === 'dark' ? 'bg-stellar-navy/50 text-white placeholder:text-white/20' : 'bg-white text-stellar-navy placeholder:text-stellar-navy/20'}`}
                  />
                </div>

                {/* Secret Key Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
                      <Lock className="w-3 h-3" /> Stellar Authentication
                    </label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleConnectFreighter}
                        disabled={isConnectingWallet}
                        className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline disabled:opacity-50 ${useFreighter ? 'text-stellar-blue' : 'text-stellar-purple'}`}
                      >
                        {isConnectingWallet ? <Loader2 className="w-2 h-2 animate-spin" /> : <Wallet className="w-2 h-2" />}
                        {useFreighter ? 'Wallet Connected' : isConnectingWallet ? 'Connecting...' : 'Connect Freighter'}
                      </button>
                      <button 
                        onClick={handleGenerateTestKey}
                        disabled={isGenerating}
                        className="text-[10px] text-stellar-purple hover:underline font-bold uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="w-2 h-2 animate-spin" /> : <Sparkles className="w-2 h-2" />}
                        Generate & Fund
                      </button>
                      <a 
                        href="https://laboratory.stellar.org/#account-creator?network=testnet" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-stellar-blue hover:underline font-bold uppercase tracking-wider"
                      >
                        Manual Setup
                      </a>
                    </div>
                  </div>
                  
                  {useFreighter ? (
                    <div className={`w-full p-4 rounded-2xl border flex items-center justify-between ${theme === 'dark' ? 'bg-stellar-navy/50 border-white/10' : 'bg-white border-stellar-navy/10'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-stellar-blue/10 flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-stellar-blue" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Connected Wallet</p>
                          <p className="text-xs font-mono truncate max-w-[200px]">{freighterPublicKey}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={handleConnectFreighter}
                          className="text-[10px] font-bold uppercase tracking-widest text-stellar-blue hover:underline"
                        >
                          Switch Account
                        </button>
                        <button 
                          onClick={() => {
                            setUseFreighter(false);
                            setFreighterPublicKey(null);
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:underline"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input 
                        type={showSecret ? "text" : "password"}
                        value={secretKey}
                        onChange={(e) => {
                          setSecretKey(e.target.value);
                          setUseFreighter(false);
                        }}
                        placeholder="S..."
                        className={`w-full p-4 pr-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stellar-blue/30 transition-all font-mono text-sm ${theme === 'dark' ? 'bg-stellar-navy/50 text-white placeholder:text-white/20' : 'bg-white text-stellar-navy placeholder:text-stellar-navy/20'}`}
                      />
                      <button 
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                      >
                        {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                  
                  <p className="text-[10px] opacity-40 italic">
                    {useFreighter 
                      ? "Using Freighter for secure, non-custodial signing. No keys are shared." 
                      : "Your key is used only to sign the x402 micropayment locally. It is never stored."}
                  </p>
                </div>
              </div>

              {/* Run Button */}
              <div className="mt-8 space-y-4">
                <button 
                  onClick={() => {
                    if (!query || (!secretKey && !useFreighter)) {
                      setError('Please provide a research query and either a secret key or connect your wallet.');
                      return;
                    }
                    setShowConfirmModal(true);
                  }}
                  disabled={currentStep !== 'idle' && currentStep !== 'ready'}
                  className="w-full stellar-gradient text-white font-bold py-4 rounded-2xl shadow-xl shadow-stellar-blue/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  {currentStep !== 'idle' && currentStep !== 'ready' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{steps.find(s => s.id === currentStep)?.label || 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Run Research Agent</span>
                    </>
                  )}
                </button>

                {txHash && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <a 
                      href={getTransactionUrl(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] font-mono text-stellar-blue hover:underline opacity-60 hover:opacity-100 transition-all"
                    >
                      Last Payment: {txHash.substring(0, 8)}...{txHash.substring(txHash.length - 8)} <ExternalLink className="w-2 h-2" />
                    </a>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            {/* Report Output */}
            <AnimatePresence>
              {report && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-10 rounded-3xl border ${theme === 'dark' ? 'bg-stellar-card-dark border-white/5' : 'bg-stellar-card-light border-stellar-navy/5'}`}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold">Research Report</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          copied 
                            ? 'bg-green-500/20 text-green-500' 
                            : theme === 'dark' 
                              ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white' 
                              : 'bg-stellar-navy/5 hover:bg-stellar-navy/10 text-stellar-navy/60 hover:text-stellar-navy'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Report
                          </>
                        )}
                      </button>
                      <div className="px-3 py-1.5 rounded-lg bg-stellar-blue/10 text-stellar-blue text-[10px] font-bold uppercase tracking-widest">
                        StellarMind v1.0
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    {report.split('\n\n').map((section, idx) => {
                      const lines = section.split('\n');
                      const title = lines[0];
                      const content = lines.slice(1).join('\n');

                      return (
                        <div key={idx} className="mb-8 last:mb-0">
                          <h4 className="text-stellar-blue font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                            <ChevronRight className="w-3 h-3" /> {title.replace(':', '')}
                          </h4>
                          <p className={`text-sm leading-relaxed opacity-80 ${theme === 'dark' ? 'text-white' : 'text-stellar-navy'}`}>
                            {content.replace(/\*/g, '')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Transaction History */}
            <AnimatePresence>
              {(secretKey || useFreighter) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-stellar-card-dark border-white/5' : 'bg-stellar-card-light border-stellar-navy/5'}`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
                      <History className="w-3 h-3" /> Recent Activity
                    </h3>
                    {loadingHistory && <Loader2 className="w-3 h-3 animate-spin opacity-50" />}
                  </div>

                  <div className="space-y-3">
                    {history.length > 0 ? (
                      history.map((tx) => {
                        const isIncoming = (useFreighter && tx.to === freighterPublicKey) || 
                                         (!useFreighter && secretKey && tx.to === StellarSdk.Keypair.fromSecret(secretKey).publicKey());
                        
                        return (
                          <div 
                            key={tx.id} 
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                              theme === 'dark' ? 'bg-stellar-navy/30 border-white/5 hover:bg-stellar-navy/50' : 'bg-white border-stellar-navy/5 hover:bg-stellar-navy/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${
                                tx.type === 'payment' || tx.type === 'path_payment_strict_receive' || tx.type === 'path_payment_strict_send'
                                  ? 'bg-stellar-blue/10 text-stellar-blue'
                                  : 'bg-white/5 text-white/40'
                              }`}>
                                {tx.type === 'payment' ? (
                                  isIncoming ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                  <History className="w-3 h-3" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold capitalize truncate">{tx.type.replace(/_/g, ' ')}</p>
                                <p className="text-[8px] opacity-40 font-mono">
                                  {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {tx.amount && (
                                <p className={`text-[10px] font-mono font-bold ${isIncoming ? 'text-green-500' : 'text-stellar-blue'}`}>
                                  {isIncoming ? '+' : '-'}{parseFloat(tx.amount).toFixed(2)}
                                </p>
                              )}
                              <a 
                                href={getTransactionUrl(tx.transactionHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[8px] opacity-30 hover:opacity-100 hover:text-stellar-blue transition-all"
                              >
                                Details
                              </a>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center opacity-30">
                        <p className="text-[10px] font-mono">No recent activity</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center opacity-30 text-[10px] font-bold uppercase tracking-[0.2em]">
          StellarMind Protocol · Secure Research Node · 2026
        </footer>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stellar-navy/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`max-w-md w-full p-8 rounded-3xl border shadow-2xl ${theme === 'dark' ? 'bg-stellar-card-dark border-white/10' : 'bg-white border-stellar-navy/10'}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-stellar-blue/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-stellar-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Confirm Research</h3>
                    <p className="text-xs opacity-50 uppercase tracking-widest font-bold">x402 Protocol</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-stellar-navy/5'}`}>
                    <p className="text-xs opacity-50 mb-1">Query</p>
                    <p className="text-sm font-medium line-clamp-2 italic">"{query}"</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 rounded-2xl border border-stellar-blue/20 bg-stellar-blue/5">
                    <div>
                      <p className="text-xs opacity-50">Network Cost</p>
                      <p className="text-sm font-bold">0.0001 XLM</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-50">Network</p>
                      <p className="text-sm font-bold">Stellar Testnet</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-stellar-navy/5 hover:bg-stellar-navy/10'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      runAgent();
                    }}
                    className="flex-1 py-3 rounded-xl font-bold text-sm stellar-gradient text-white shadow-lg shadow-stellar-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Confirm & Pay
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
