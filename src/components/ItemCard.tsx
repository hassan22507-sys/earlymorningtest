import React, { useState } from 'react';
import { WorkspaceItem } from '../types';
import { useFirebase } from '../firebase/FirebaseContext';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Tag,
  Trash2,
  Edit3,
  Code2,
  ArrowRight,
  Flame,
  FileText,
  Lightbulb,
  CheckSquare,
} from 'lucide-react';

interface ItemCardProps {
  item: WorkspaceItem;
  onEdit: (item: WorkspaceItem) => void;
  onInspect: (item: WorkspaceItem) => void;
}

const categoryIcons = {
  task: CheckSquare,
  note: FileText,
  milestone: Flame,
  idea: Lightbulb,
};

const priorityStyles = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  urgent: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
};

const statusStyles = {
  todo: 'bg-slate-100 text-slate-800 border-slate-200',
  in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onInspect }) => {
  const { user, updateItem, deleteItem } = useFirebase();
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.uid === item.ownerId;
  const CategoryIcon = categoryIcons[item.category] || CheckSquare;

  const handleStatusChange = async (nextStatus: WorkspaceItem['status']) => {
    if (!isOwner || updating) return;
    try {
      setUpdating(true);
      await updateItem(item.id, { status: nextStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || deleting) return;
    if (!window.confirm(`Delete "${item.title}" from Firestore?`)) return;
    try {
      setDeleting(true);
      await deleteItem(item.id, item.title);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
              <CategoryIcon className="w-3 h-3 text-slate-500" />
              {item.category}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${
                priorityStyles[item.priority]
              }`}
            >
              {item.priority}
            </span>
          </div>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
              statusStyles[item.status]
            }`}
          >
            {item.status.replace('_', ' ')}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-slate-600 text-xs mt-2 line-clamp-3 leading-relaxed whitespace-pre-wrap">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200"
              >
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        {/* Author / Timestamp info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
          <span className="truncate max-w-[150px]" title={item.ownerEmail}>
            By: {item.ownerName || item.ownerEmail.split('@')[0]}
          </span>
          <span>{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center justify-between gap-1">
          {/* Quick status transition */}
          {isOwner ? (
            <div className="flex items-center gap-1">
              {item.status !== 'in_progress' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={updating}
                  className="px-2 py-1 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  title="Move to In Progress"
                >
                  Start
                </button>
              )}
              {item.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  disabled={updating}
                  className="px-2 py-1 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                  title="Mark as Completed"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Done
                </button>
              )}
              {item.status === 'completed' && (
                <button
                  onClick={() => handleStatusChange('todo')}
                  disabled={updating}
                  className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  title="Reopen to To Do"
                >
                  Reopen
                </button>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Read-only collaborator</span>
          )}

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => onInspect(item)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Inspect Firestore Document"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Edit item"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                  title="Delete from Firestore"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
