import { useState, useEffect } from 'react';
import { CollectionReference, Query, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

interface FirestoreCollectionHook<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export function useFirestoreCollection<T>(
  query: CollectionReference | Query | null
): FirestoreCollectionHook<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const documents: T[] = [];
        snapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() } as unknown as T);
        });
        setData(documents);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
