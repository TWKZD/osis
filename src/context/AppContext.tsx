import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Aspiration, Announcement, AiConfig } from '../types';

interface AppContextType {
  aspirations: Aspiration[];
  announcements: Announcement[];
  aiConfig: AiConfig;
  addAspiration: (aspiration: Omit<Aspiration, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateAspirationStatus: (id: string, status: Aspiration['status']) => Promise<void>;
  addResponse: (id: string, response: string) => Promise<void>;
  deleteAspiration: (id: string) => Promise<void>;
  addAnnouncement: (title: string, content: string, author: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  updateAiConfig: (config: AiConfig) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [aiConfig, setAiConfig] = useState<AiConfig>({
    personality: 'Kamu adalah OSIS ASISTEN, asisten pintar dari OSIS Sangsaka SMAN 1 Kemangkon. Kamu ramah, asyik, gaul, membantu, dan tidak kaku.',
    knowledge: 'Ulang tahun SMAN 1 Kemangkon (HUT SMAN 1 Kemangkon) diadakan pada tanggal yang ditetapkan oleh sekolah (harap sesuaikan di pengaturan).'
  });

  useEffect(() => {
    // Listen to Aspirations
    const qAspirations = query(collection(db, 'aspirations'), orderBy('createdAt', 'desc'));
    const unsubscribeAspirations = onSnapshot(qAspirations, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          ...docData,
          id: doc.id,
          createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Aspiration;
      });
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

    // Listen to AiConfig
    const unsubscribeAiConfig = onSnapshot(doc(db, 'settings', 'ai_config'), (docSnap) => {
      if (docSnap.exists()) {
        setAiConfig(docSnap.data() as AiConfig);
      }
    });

    return () => {
      unsubscribeAspirations();
      unsubscribeAnnouncements();
      unsubscribeAiConfig();
    };
  }, []);

  const addAspiration = async (data: Omit<Aspiration, 'id' | 'createdAt' | 'status'>) => {
    await addDoc(collection(db, 'aspirations'), {
      ...data,
      status: 'Pending',
      createdAt: serverTimestamp()
    });
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

  const updateAiConfig = async (config: AiConfig) => {
    // Upsert the document
    const configRef = doc(db, 'settings', 'ai_config');
    await updateDoc(configRef, { ...config }).catch(async (error) => {
       if (error.code === 'not-found') {
          // If the document doesn't exist, create it.
          // Note: updateDoc fails if the document does not exist, so we use setDoc
          const { setDoc } = await import('firebase/firestore');
          await setDoc(configRef, { ...config });
       } else {
          throw error;
       }
    });
  };

  return (
    <AppContext.Provider value={{ 
      aspirations, announcements, aiConfig,
      addAspiration, updateAspirationStatus, addResponse, deleteAspiration,
      addAnnouncement, deleteAnnouncement, updateAiConfig
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
