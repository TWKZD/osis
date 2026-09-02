import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, where, limit } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Aspiration, Announcement } from '../types';

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  aspirations: Aspiration[];
  announcements: Announcement[];
  addAspiration: (data: any, captcha: any) => Promise<void>;
  updateAspirationStatus: (id: string, status: Aspiration['status']) => Promise<void>;
  addResponse: (id: string, response: string) => Promise<void>;
  deleteAspiration: (id: string) => Promise<void>;
  addAnnouncement: (title: string, content: string, author: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Listen to Aspirations (Admin sees all, Public sees only Approved)
    // We add limit() to prevent enormous reads. Public is sorted client-side since composite index might be missing.
    const qAspirations = user
      ? query(collection(db, 'aspirations'), orderBy('createdAt', 'desc'), limit(200))
      : query(collection(db, 'aspirations'), where('status', '==', 'Approved'), limit(150));

    const unsubscribeAspirations = onSnapshot(qAspirations, (snapshot) => {
      let data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          ...docData,
          id: doc.id,
          createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Aspiration;
      });
      
      // Since we can't easily compound index 'status' and 'createdAt' for public, we sort it client-side
      if (!user) {
        data = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      setAspirations(data);
    });

    // Listen to Announcements
    const qAnnouncements = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribeAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          ...docData,
          id: doc.id,
          createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Announcement;
      });
      setAnnouncements(data);
    });

    return () => {
      unsubscribeAspirations();
      unsubscribeAnnouncements();
    };
  }, [user]);

  const addAspiration = async (data: any, captcha: any) => {
    const res = await fetch('/api/aspirations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, captcha })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Terjadi kesalahan saat mengirim');
    }
  };

  const updateAspirationStatus = async (id: string, status: Aspiration['status']) => {
    await updateDoc(doc(db, 'aspirations', id), { status });
  };

  const addResponse = async (id: string, response: string) => {
    await updateDoc(doc(db, 'aspirations', id), { response });
  };

  const deleteAspiration = async (id: string) => {
    await deleteDoc(doc(db, 'aspirations', id));
  };

  const addAnnouncement = async (title: string, content: string, author: string) => {
    await addDoc(collection(db, 'announcements'), {
      title,
      content,
      author,
      createdAt: serverTimestamp()
    });
  };

  const deleteAnnouncement = async (id: string) => {
    await deleteDoc(doc(db, 'announcements', id));
  };

  return (
    <AppContext.Provider value={{ 
       user, authLoading, aspirations, announcements, 
       addAspiration, updateAspirationStatus, addResponse, deleteAspiration,
      addAnnouncement, deleteAnnouncement 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
