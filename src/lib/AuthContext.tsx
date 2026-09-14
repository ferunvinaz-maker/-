import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole, Grade } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role: UserRole, grade?: Grade, school?: string) => Promise<void>;
  activateSubscription: (plan: 'free_trial' | 'semester' | 'annual', method: 'thawani' | 'school_voucher' | 'free_trial') => Promise<void>;
  loginAsDemo: (name?: string, role?: UserRole, grade?: Grade) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Firestore user document
  const fetchUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      } else {
        // Create baseline profile if not yet in Firestore
        const defaultProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'مستخدم جديد',
          role: 'student',
          grade: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, defaultProfile);
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback local representation
      setUserProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'مستخدم',
        role: 'student',
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await fetchUserProfile(cred.user);
  };

  const register = async (
    email: string, 
    pass: string, 
    name: string, 
    role: UserRole, 
    grade?: Grade, 
    school?: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email,
      displayName: name,
      role,
      grade: role === 'student' ? (grade || 10) : undefined,
      school: school || 'مدارس سلطنة عُمان',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userRef = doc(db, 'users', cred.user.uid);
    await setDoc(userRef, newProfile);
    setUserProfile(newProfile);
  };

  const activateSubscription = async (
    plan: 'free_trial' | 'semester' | 'annual', 
    method: 'thawani' | 'school_voucher' | 'free_trial'
  ) => {
    const expiresDays = plan === 'annual' ? 365 : plan === 'semester' ? 120 : 14;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

    const updated = {
      isSubscribed: true,
      subscriptionPlan: plan,
      subscriptionPaymentMethod: method,
      subscriptionExpiresAt: expiresAt,
      updatedAt: new Date().toISOString(),
    };

    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, updated, { merge: true });
      } catch (err) {
        console.warn('Could not sync subscription to firestore:', err);
      }
    }

    setUserProfile((prev) => {
      if (!prev) {
        return {
          uid: currentUser?.uid || 'demo-user',
          email: currentUser?.email || 'student@edu.om',
          displayName: currentUser?.displayName || 'طالب عُماني متميز',
          role: 'student',
          grade: 10,
          ...updated,
        };
      }
      return {
        ...prev,
        ...updated,
      };
    });
  };

  const loginAsDemo = async (
    name = 'طالب عُماني تجريبي', 
    role: UserRole = 'student', 
    grade: Grade = 10
  ) => {
    // Demo user for testing and evaluation without credentials
    const demoProfile: UserProfile = {
      uid: 'demo-' + Date.now(),
      email: 'demo.student@edu.om',
      displayName: name,
      role,
      grade,
      school: 'مدرسة السلطان قابوس النموذجية - مسقط',
      isSubscribed: false, // will ask to subscribe or allow trial
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Fake mock user to satisfy currentUser checks
    const fakeUser = {
      uid: demoProfile.uid,
      email: demoProfile.email,
      displayName: demoProfile.displayName,
      emailVerified: true,
    } as unknown as User;

    setCurrentUser(fakeUser);
    setUserProfile(demoProfile);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userProfile, 
      loading, 
      login, 
      register, 
      activateSubscription, 
      loginAsDemo, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
