import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, db, googleProvider, testConnection } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { WorkspaceItem, Activity, UserProfile } from '../types';

interface FirebaseContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  serverConnected: boolean | null;
  connectionMessage: string;
  items: WorkspaceItem[];
  activities: Activity[];
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  addItem: (itemData: {
    title: string;
    description: string;
    category: WorkspaceItem['category'];
    priority: WorkspaceItem['priority'];
    status: WorkspaceItem['status'];
    tags: string[];
  }) => Promise<void>;
  updateItem: (id: string, updates: Partial<WorkspaceItem>) => Promise<void>;
  deleteItem: (id: string, title: string) => Promise<void>;
  recheckConnection: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverConnected, setServerConnected] = useState<boolean | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('Checking connection...');
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // 1. Initial boot connection validation as mandated by skill
  const checkConnection = useCallback(async () => {
    const res = await testConnection();
    setServerConnected(res.success);
    setConnectionMessage(res.message);
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // 2. Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user profile to Firestore
        const profilePath = `users/${currentUser.uid}`;
        try {
          const profileData: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || 'unknown@domain.com',
            displayName: currentUser.displayName || 'Anonymous User',
            photoURL: currentUser.photoURL || '',
            role: 'member',
            updatedAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });
          setUserProfile(profileData);
        } catch (err) {
          console.warn('Failed to sync profile (might be read-only or offline):', err);
        }
      } else {
        setUserProfile(null);
        setItems([]);
        setActivities([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Real-time items listener (Only attached when user is authenticated)
  useEffect(() => {
    if (!user) return;

    const itemsPath = 'items';
    const q = query(collection(db, itemsPath), orderBy('updatedAt', 'desc'), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedItems: WorkspaceItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as WorkspaceItem;
          loadedItems.push({
            ...data,
            id: docSnap.id,
          });
        });
        setItems(loadedItems);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, itemsPath);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 4. Real-time activity listener (Only attached when user is authenticated)
  useEffect(() => {
    if (!user) return;

    const activityPath = 'activities';
    const q = query(collection(db, activityPath), orderBy('createdAt', 'desc'), limit(30));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedActivities: Activity[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Activity;
          loadedActivities.push({
            ...data,
            id: docSnap.id,
          });
        });
        setActivities(loadedActivities);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, activityPath);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  };

  const addItem = async (itemData: {
    title: string;
    description: string;
    category: WorkspaceItem['category'];
    priority: WorkspaceItem['priority'];
    status: WorkspaceItem['status'];
    tags: string[];
  }) => {
    if (!user) throw new Error('You must be signed in to add items.');

    // Sanitize and enforce volumetric limits from blueprint
    const title = itemData.title.trim().slice(0, 120);
    const description = itemData.description.trim().slice(0, 2000);
    const tags = (itemData.tags || [])
      .map((t) => t.trim().slice(0, 20))
      .filter(Boolean)
      .slice(0, 10);

    const now = new Date().toISOString();
    const cleanId = 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const itemPath = `items/${cleanId}`;

    const newItem: WorkspaceItem = {
      id: cleanId,
      title,
      description,
      category: itemData.category,
      priority: itemData.priority,
      status: itemData.status,
      ownerId: user.uid,
      ownerEmail: user.email || 'user@example.com',
      ownerName: user.displayName || 'Collaborator',
      tags,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'items', cleanId), newItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, itemPath);
    }

    // Append activity
    try {
      const actId = 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      const actData: Activity = {
        id: actId,
        userId: user.uid,
        userEmail: user.email || '',
        action: 'created item',
        targetTitle: title,
        createdAt: now,
      };
      await setDoc(doc(db, 'activities', actId), actData);
    } catch (err) {
      console.warn('Activity logging error:', err);
    }
  };

  const updateItem = async (id: string, updates: Partial<WorkspaceItem>) => {
    if (!user) throw new Error('You must be signed in to update items.');
    const itemPath = `items/${id}`;
    const now = new Date().toISOString();

    const allowedUpdates: Record<string, any> = {
      ...updates,
      updatedAt: now,
    };
    // Ensure immutable fields are not tampered
    delete allowedUpdates.ownerId;
    delete allowedUpdates.createdAt;

    try {
      await updateDoc(doc(db, 'items', id), allowedUpdates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, itemPath);
    }

    // Log update activity
    try {
      const actId = 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      const actData: Activity = {
        id: actId,
        userId: user.uid,
        userEmail: user.email || '',
        action: updates.status ? `changed status to ${updates.status}` : 'updated item',
        targetTitle: updates.title || id,
        createdAt: now,
      };
      await setDoc(doc(db, 'activities', actId), actData);
    } catch (err) {
      console.warn('Activity logging error:', err);
    }
  };

  const deleteItem = async (id: string, title: string) => {
    if (!user) throw new Error('You must be signed in to delete items.');
    const itemPath = `items/${id}`;

    try {
      await deleteDoc(doc(db, 'items', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, itemPath);
    }

    // Log deletion
    try {
      const actId = 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      const actData: Activity = {
        id: actId,
        userId: user.uid,
        userEmail: user.email || '',
        action: 'deleted item',
        targetTitle: title,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'activities', actId), actData);
    } catch (err) {
      console.warn('Activity logging error:', err);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        userProfile,
        loading,
        serverConnected,
        connectionMessage,
        items,
        activities,
        signIn,
        signOut,
        addItem,
        updateItem,
        deleteItem,
        recheckConnection: checkConnection,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
