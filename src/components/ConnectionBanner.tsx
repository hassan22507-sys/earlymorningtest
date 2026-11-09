import React, { useState } from 'react';
import { useFirebase } from '../firebase/FirebaseContext';
import { CheckCircle2, AlertCircle, RefreshCw, Database, Shield, Zap, Copy, Check } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

export const ConnectionBanner: React.FC = () => {
  const { serverConnected, connectionMessage, recheckConnection } = useFirebase();
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePing = async () => {
    setChecking(true);
    await recheckConnection();
    setTimeout(() => setChecking(false), 400);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(firebaseConfig, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Connected
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Zap className="w-3 h-3" />
              Enterprise Firestore
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Firebase Services Active
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Real-time synchronization enabled across all clients with strict Attribute-Based Access Control (ABAC) and audit-grade security rules.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider font-sans">Project ID</div>
              <div className="text-amber-300 font-semibold truncate mt-0.5">{firebaseConfig.projectId}</div>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider font-sans">Firestore Database ID</div>
              <div className="text-cyan-300 font-semibold truncate mt-0.5">{firebaseConfig.firestoreDatabaseId}</div>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider font-sans">Server Status</div>
              <div className="text-emerald-300 font-semibold truncate mt-0.5 flex items-center gap-1">
                {serverConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {connectionMessage}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row lg:flex-col gap-2 shrink-0">
          <button
            onClick={handlePing}
            disabled={checking}
            className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>Test Server Ping</span>
          </button>
          <button
            onClick={handleCopyConfig}
            className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Config Copied' : 'Copy Applet Config'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
