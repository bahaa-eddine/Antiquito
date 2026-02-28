import { useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useStore } from '../store/useStore';

export function useAuthListener() {
  const login = useStore((s) => s.login);
  const logout = useStore((s) => s.logout);
  const setAuthReady = useStore((s) => s.setAuthReady);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.emailVerified) {
          login({
            id: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            name:
              firebaseUser.displayName ??
              firebaseUser.email?.split('@')[0] ??
              'User',
          });
        } else {
          // Block unverified users — sign them out from Firebase too
          await signOut(auth);
          // onAuthStateChanged will fire again with null → logout() + setAuthReady() below
          return;
        }
      } else {
        logout();
      }
      // Mark auth as resolved so the app stops showing the loading screen
      setAuthReady();
    });

    return unsubscribe;
  }, []);
}
