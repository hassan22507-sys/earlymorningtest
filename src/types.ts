export type ItemCategory = 'task' | 'note' | 'milestone' | 'idea';
export type ItemPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ItemStatus = 'todo' | 'in_progress' | 'completed';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceItem {
  id: string;
  title: string;
  description?: string;
  category: ItemCategory;
  priority: ItemPriority;
  status: ItemStatus;
  ownerId: string;
  ownerEmail: string;
  ownerName?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  userEmail?: string;
  action: string;
  targetTitle: string;
  createdAt: string;
}
