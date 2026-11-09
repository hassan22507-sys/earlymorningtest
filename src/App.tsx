import React, { useState, useMemo } from 'react';
import { FirebaseProvider, useFirebase } from './firebase/FirebaseContext';
import { Header } from './components/Header';
import { ConnectionBanner } from './components/ConnectionBanner';
import { ItemCard } from './components/ItemCard';
import { ItemModal } from './components/ItemModal';
import { ActivityFeed } from './components/ActivityFeed';
import { DatabaseInspector } from './components/DatabaseInspector';
import { WorkspaceItem, ItemCategory, ItemPriority, ItemStatus } from './types';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  Columns3,
  Flame,
  ShieldCheck,
  Database,
  Lock,
  Sparkles,
  LogIn,
  CheckCircle2,
  Clock,
  ListTodo,
} from 'lucide-react';
import firebaseConfig from '../firebase-applet-config.json';

const WorkspaceContent: React.FC = () => {
  const { user, items, signIn, addItem, loading } = useFirebase();

  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkspaceItem | null>(null);
  const [inspectingItem, setInspectingItem] = useState<WorkspaceItem | null>(null);
  const [isCreatingStarter, setIsCreatingStarter] = useState(false);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        search.trim() === '' ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;

      return matchesSearch && matchesCat && matchesStatus && matchesPriority;
    });
  }, [items, search, selectedCategory, selectedStatus, selectedPriority]);

  const handleEdit = (item: WorkspaceItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCreateStarter = async () => {
    if (!user || isCreatingStarter) return;
    try {
      setIsCreatingStarter(true);
      await addItem({
        title: 'Complete Firebase security audit and deployment',
        description: 'Verify firestore.rules deployment with zero-trust Attribute-Based Access Control and strict timestamp verification.',
        category: 'task',
        priority: 'high',
        status: 'in_progress',
        tags: ['security', 'firebase', 'production'],
      });
      await addItem({
        title: 'Architecture Note: Enterprise Firestore Database',
        description: 'Provisioned with dedicated database ID ai-studio-' + firebaseConfig.firestoreDatabaseId + ' and Google Authentication.',
        category: 'note',
        priority: 'medium',
        status: 'todo',
        tags: ['architecture', 'db'],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingStarter(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner with Live Config */}
        <ConnectionBanner />

        {/* Not Signed In Banner / Sign In CTA */}
        {!user && !loading && (
          <div className="bg-white rounded-2xl border border-indigo-100 p-8 text-center shadow-sm max-w-2xl mx-auto my-8">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Sign In to Access Real-Time Firestore</h3>
            <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Your database is securely configured. Authenticate with your Google account to create, update, and manage persistent documents in real time.
            </p>
            <div className="mt-6">
              <button
                onClick={() => signIn()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm shadow-md transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
            </div>
            <div className="mt-4 text-xs text-slate-400 font-mono">
              Database: {firebaseConfig.firestoreDatabaseId}
            </div>
          </div>
        )}

        {/* Workspace controls */}
        {user && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, tag, description..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Categories</option>
                  <option value="task">Tasks</option>
                  <option value="note">Notes</option>
                  <option value="milestone">Milestones</option>
                  <option value="idea">Ideas</option>
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>

                {/* View toggle */}
                <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === 'kanban'
                        ? 'bg-white shadow-xs text-indigo-600 font-medium'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Kanban Board View"
                  >
                    <Columns3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-xs text-indigo-600 font-medium'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>

                {/* New Item Button */}
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Item</span>
                </button>
              </div>
            </div>

            {/* Empty state when user has no items */}
            {items.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-semibold text-slate-800">Your workspace is empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Create a document or populate starter templates to start syncing with your live Firestore database.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Item</span>
                  </button>
                  <button
                    onClick={handleCreateStarter}
                    disabled={isCreatingStarter}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{isCreatingStarter ? 'Generating...' : 'Seed Starter Templates'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Main content grid: Workspace Items + Sidebar */}
            {items.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Items Container */}
                <div className="lg:col-span-3 space-y-4">
                  {viewMode === 'kanban' ? (
                    /* Kanban 3-Column Layout */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Column: To Do */}
                      <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">To Do</h4>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                            {filteredItems.filter((i) => i.status === 'todo').length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {filteredItems
                            .filter((i) => i.status === 'todo')
                            .map((item) => (
                              <ItemCard
                                key={item.id}
                                item={item}
                                onEdit={handleEdit}
                                onInspect={(itm) => setInspectingItem(itm)}
                              />
                            ))}
                          {filteredItems.filter((i) => i.status === 'todo').length === 0 && (
                            <div className="text-center py-6 text-slate-400 text-xs">No items in To Do</div>
                          )}
                        </div>
                      </div>

                      {/* Column: In Progress */}
                      <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">In Progress</h4>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-indigo-600 border border-slate-200">
                            {filteredItems.filter((i) => i.status === 'in_progress').length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {filteredItems
                            .filter((i) => i.status === 'in_progress')
                            .map((item) => (
                              <ItemCard
                                key={item.id}
                                item={item}
                                onEdit={handleEdit}
                                onInspect={(itm) => setInspectingItem(itm)}
                              />
                            ))}
                          {filteredItems.filter((i) => i.status === 'in_progress').length === 0 && (
                            <div className="text-center py-6 text-slate-400 text-xs">No items in progress</div>
                          )}
                        </div>
                      </div>

                      {/* Column: Completed */}
                      <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Completed</h4>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-emerald-600 border border-slate-200">
                            {filteredItems.filter((i) => i.status === 'completed').length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {filteredItems
                            .filter((i) => i.status === 'completed')
                            .map((item) => (
                              <ItemCard
                                key={item.id}
                                item={item}
                                onEdit={handleEdit}
                                onInspect={(itm) => setInspectingItem(itm)}
                              />
                            ))}
                          {filteredItems.filter((i) => i.status === 'completed').length === 0 && (
                            <div className="text-center py-6 text-slate-400 text-xs">No completed items yet</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Grid Layout */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredItems.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onEdit={handleEdit}
                          onInspect={(itm) => setInspectingItem(itm)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Sidebar: Live Activity & Cloud Architecture Info */}
                <div className="space-y-4">
                  <ActivityFeed />

                  {/* Architecture spec card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Security & Architecture</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Protected by deployed <code className="font-mono text-indigo-600">firestore.rules</code> with Attribute-Based Access Control:
                    </p>
                    <ul className="space-y-1.5 text-slate-600 text-[11px]">
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Path ID Poisoning Guards</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Max length & volumetric boundaries</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Immutable creation timestamps</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Selective key update allowlists</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Item Modal */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
      />

      {/* Database Document Inspector Modal */}
      <DatabaseInspector
        item={inspectingItem}
        onClose={() => setInspectingItem(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FirebaseProvider>
      <WorkspaceContent />
    </FirebaseProvider>
  );
}
