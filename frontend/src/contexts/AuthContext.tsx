import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type UserRole = 'admin' | 'chef' | 'manager';

interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  active: boolean;
  displayName?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        console.log('User data fetched:', { uid: user.uid, role: data.role, active: data.active });
        setUserData(data);
      } else {
        console.error('User document does not exist in Firestore:', user.uid);
        console.error('Please create a user document in Firestore with the following structure:');
        console.error({
          uid: user.uid,
          email: user.email,
          role: 'chef', // or 'manager', 'admin'
          active: true,
          displayName: user.email?.split('@')[0] || 'User'
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      console.error('This might be a Firestore permissions issue. Check your security rules.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserData(result.user);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  const value = {
    currentUser,
    userData,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
