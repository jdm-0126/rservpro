import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

type User = { id: string; name: string; email: string; photo: string };

// Add your admin email(s) here
const ADMIN_EMAILS = ['<YOUR_ADMIN_EMAIL@gmail.com>'];

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email);

  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '<YOUR_ANDROID_CLIENT_ID>',
    iosClientId: '<YOUR_IOS_CLIENT_ID>',
    webClientId: '<YOUR_WEB_CLIENT_ID>',
  });

  useEffect(() => {
    AsyncStorage.getItem('villa_user').then((data) => {
      if (data) setUser(JSON.parse(data));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      fetchGoogleUser(response.authentication?.accessToken!);
    }
  }, [response]);

  const fetchGoogleUser = async (token: string) => {
    const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const userData: User = { id: data.id, name: data.name, email: data.email, photo: data.picture };
    setUser(userData);
    await AsyncStorage.setItem('villa_user', JSON.stringify(userData));
  };

  const signInWithGoogle = async () => { await promptAsync(); };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('villa_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
