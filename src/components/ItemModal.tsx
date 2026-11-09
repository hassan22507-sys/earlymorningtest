import React, { useState, useEffect } from 'react';
import { WorkspaceItem, ItemCategory, ItemPriority, ItemStatus } from '../types';
import { useFirebase } from '../firebase/FirebaseContext';
import { X, Plus, Sparkles, Tag, CheckSquare, FileText, Flame, Lightbulb } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: WorkspaceItem | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, editItem }) => {
  const { addItem, updateItem } = useFirebase();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('task');
  const [priority, setPriority] = useState<ItemPriority>('medium');
  const [status, setStatus] = useState<ItemStatus>('todo');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDescription(editItem.description || '');
      setCategory(editItem.category);
      setPriority(editItem.priority);
      setStatus(editItem.status);
      setTagsInput(editItem.tags ? editItem.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('task');
      setPriority('medium');
      setStatus('todo');
      setTagsInput('');
    }
    setError(null);
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10);

    try {
      setIsSubmitting(true);
      setError(null);

      if (editItem) {
        await updateItem(editItem.id, {
          title: title.trim().slice(0, 120),
          description: description.trim().slice(0, 2000),
          category,
          priority,
          status,
          tags,
        });
      } else {
        await addItem({
          title: title.trim().slice(0, 120),
          description: description.trim().slice(0, 2000),
          category,
          priority,
          status,
          tags,
        });
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving item:', err);
      setError(err?.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {editItem ? 'Edit Workspace Item' : 'New Workspace Item'}
            </h3>
            <p className="text-xs text-slate-500">
              Persisted instantly to Firestore collection <code className="font-mono text-slate-700">/items</code>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Set up OAuth consent screen and production rules"
              maxLength={120}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
            <div className="text-[11px] text-slate-400 text-right mt-1">{title.length}/120</div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="task">Task</option>
                <option value="note">Note</option>
                <option value="milestone">Milestone</option>
                <option value="idea">Idea</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ItemPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['todo', 'in_progress', 'completed'] as ItemStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center capitalize ${
                    status === st
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, acceptance criteria, or architectural notes..."
              rows={3}
              maxLength={2000}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
            <div className="text-[11px] text-slate-400 text-right mt-1">{description.length}/2000</div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Tags (Comma separated)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="backend, security, v1.0, sprint-3"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Up to 10 tags, separated by commas</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving to Firestore...' : editItem ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
