import React from 'react';
import { useFirebase } from '../firebase/FirebaseContext';
import { Database, LogIn, LogOut, ShieldCheck, Flame, User as UserIcon } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

export const Header: React.FC = () => {
  const { user, signIn, signOut, loading, serverConnected } = useFirebase();

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Firebase Cloud Hub</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                Firestore
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Project: <span className="font-mono text-slate-700">{firebaseConfig.projectId}</span>
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Connection Status indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                serverConnected === true
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                  : serverConnected === false
                  ? 'bg-rose-500'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="font-medium text-slate-700">
              {serverConnected === true ? 'Firestore Live' : serverConnected === false ? 'Offline' : 'Connecting...'}
            </span>
          </div>

          {loading ? (
            <div className="h-9 w-24 bg-slate-200 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pl-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-300 ring-2 ring-white object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.displayName || 'Signed In'}
                  </div>
                  <div className="text-[11px] text-slate-500 max-w-[150px] truncate leading-tight">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
                title="Sign out of Firebase"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
