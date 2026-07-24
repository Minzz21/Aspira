import { collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import { Admin, AdminPerformance, Aspirasi, UMKM, Warga, WhitelistWarga } from '@/types';

// Create a generic function to get a typed collection
const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

// Export all specific collections
export const adminsCol = createCollection<Admin>('admins');
export const aspirasiCol = createCollection<Aspirasi>('aspirasi');
export const whitelistCol = createCollection<WhitelistWarga>('whitelist');
export const umkmCol = createCollection<UMKM>('umkm');
export const wargaCol = createCollection<Warga>('akun_warga');
export const adminPerformanceCol = createCollection<AdminPerformance>('admin_performance');
