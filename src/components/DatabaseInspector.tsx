import React, { useState } from 'react';
import { WorkspaceItem } from '../types';
import { X, Code2, Copy, Check, ShieldCheck, Database, Layers } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface DatabaseInspectorProps {
  item: WorkspaceItem | null;
  onClose: () => void;
}

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const rawJson = JSON.stringify(item, null, 2);
  const jsonSize = new Blob([rawJson]).size;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Firestore Document Inspector</h3>
              <p className="text-xs text-slate-400 font-mono">
                /databases/{firebaseConfig.firestoreDatabaseId}/documents/items/{item.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Metadata badges */}
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-slate-400 text-[10px] uppercase font-sans">Document ID</div>
              <div className="text-amber-300 font-semibold truncate mt-0.5">{item.id}</div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-slate-400 text-[10px] uppercase font-sans">Document Size</div>
              <div className="text-cyan-300 font-semibold truncate mt-0.5">{jsonSize} bytes</div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-slate-400 text-[10px] uppercase font-sans">Security Rule Match</div>
              <div className="text-emerald-300 font-semibold truncate mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>isValidItem()</span>
              </div>
            </div>
          </div>

          {/* JSON code block */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-slate-400 px-3 py-1.5 bg-slate-950 rounded-t-xl border-t border-x border-slate-800">
              <span>RAW FIRESTORE DOCUMENT PAYLOAD</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-b-xl border border-slate-800 overflow-x-auto max-h-[300px]">
              {rawJson}
            </pre>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Rule Protection:</span> Updates to this document are guarded by{' '}
              <code className="text-amber-300 font-mono">affectedKeys().hasOnly(...)</code> and{' '}
              <code className="text-cyan-300 font-mono">existing().ownerId == request.auth.uid</code>.
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
