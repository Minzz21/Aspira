"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminsCol } from '@/lib/firestore';
import { getDocs, query, where, addDoc } from 'firebase/firestore';
import { Admin } from '@/types';

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (nik: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAdminData: (newData: Partial<Admin>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const checkSessionAndSeed = async () => {
      try {
        const storedAdmin = localStorage.getItem('aspira_admin_data');
        if (storedAdmin) {
          setAdmin(JSON.parse(storedAdmin));
        }

        // Auto-seed admin if collection is empty
        const snapshot = await getDocs(adminsCol);
        if (snapshot.empty) {
          console.log("No admins found. Seeding default admin...");
          await addDoc(adminsCol, {
            nik: '1122334455667788',
            password: 'Admin12345',
            nama: 'Administrator Utama',
            role: 'Super Admin',
            email: 'admin@aspira.id',
            telp: '081234567890',
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSessionAndSeed();
  }, []);

  const login = async (nik: string, password: string): Promise<boolean> => {
    try {
      const q = query(adminsCol, where('nik', '==', nik));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return false;

      let authenticated = false;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.password === password) {
          authenticated = true;
          const adminData = { id: doc.id, ...data };
          
          setAdmin(adminData);
          localStorage.setItem('aspira_admin_data', JSON.stringify(adminData));
          
          // Set cookie for middleware route protection (valid for 30 days)
          document.cookie = `aspira_session=true; path=/; max-age=${30 * 24 * 60 * 60}`;
        }
      });

      return authenticated;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('aspira_admin_data');
    document.cookie = 'aspira_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const updateAdminData = (newData: Partial<Admin>) => {
    if (admin) {
      const updated = { ...admin, ...newData };
      setAdmin(updated);
      localStorage.setItem('aspira_admin_data', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout, updateAdminData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
