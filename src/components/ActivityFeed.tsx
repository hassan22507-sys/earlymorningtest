import React from 'react';
import { useFirebase } from '../firebase/FirebaseContext';
import { Activity as ActivityIcon, Radio, Clock, User } from 'lucide-react';

export const ActivityFeed: React.FC = () => {
  const { activities } = useFirebase();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Activity Feed</h3>
            <p className="text-[11px] text-slate-500">Real-time Firestore listeners</p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          {activities.length} events
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          <ActivityIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No activities recorded yet. Create or update an item to see real-time updates.
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {activities.map((act) => (
            <div
              key={act.id}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start gap-2.5"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                {(act.userEmail || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-800 leading-tight">
                  <span className="font-semibold text-slate-900">{act.userEmail?.split('@')[0] || 'User'}</span>{' '}
                  <span className="text-slate-600">{act.action}</span>
                </div>
                <div className="font-medium text-indigo-600 truncate mt-0.5">
                  &ldquo;{act.targetTitle}&rdquo;
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
