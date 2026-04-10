import React from 'react';
import { Wallet, Copy, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface AccountCardProps {
  publicKey: string;
  balances: any[];
  loading: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({ publicKey, balances, loading }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicKey);
  };

  return (
    <div className="hw-widget space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-hw-accent/10 rounded-lg">
            <Wallet className="w-5 h-5 text-hw-accent" />
          </div>
          <div>
            <p className="hw-label">Active Account</p>
            <p className="hw-value truncate max-w-[200px]">{publicKey}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={copyToClipboard}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Copy Public Key"
          >
            <Copy className="w-4 h-4 text-hw-muted" />
          </button>
          <a 
            href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-hw-muted" />
          </a>
        </div>
      </div>

      <div className="space-y-4">
        <p className="hw-label">Balances</p>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-10 bg-white/5 rounded-lg" />
            <div className="h-10 bg-white/5 rounded-lg" />
          </div>
        ) : balances.length > 0 ? (
          <div className="grid gap-2">
            {balances.map((balance, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div>
                  <p className="text-xs font-mono text-hw-muted">
                    {balance.asset_type === 'native' ? 'XLM' : balance.asset_code}
                  </p>
                  <p className="text-lg font-mono font-medium">
                    {parseFloat(balance.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="hw-label">Type</p>
                  <p className="text-[10px] font-mono uppercase opacity-50">{balance.asset_type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-hw-muted italic">No balances found or account not funded.</p>
        )}
      </div>
    </div>
  );
};
