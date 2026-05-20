export interface FoodMemory {
  id: string;
  city: string;
  place: string;
  dish: string;
  rating: number;
  note: string;
  date_visited: string | null;
  created_at: string;
}

type MemoryInput = {
  city: string;
  place: string;
  dish: string;
  rating: number;
  note: string;
  date_visited: string | null;
};

const DB_NAME = 'tastetrail';
const DB_VERSION = 1;
const STORE_NAME = 'food_memories';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open database.'));
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);

        transaction.onabort = () => reject(transaction.error ?? new Error('Database transaction failed.'));
        transaction.onerror = () => reject(transaction.error ?? new Error('Database transaction failed.'));
        transaction.oncomplete = () => db.close();

        operation(store, resolve, reject);
      }),
  );
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function listMemories(): Promise<FoodMemory[]> {
  const memories = await runTransaction<FoodMemory[]>('readonly', (store, resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => resolve((request.result as FoodMemory[]) ?? []);
    request.onerror = () => reject(request.error ?? new Error('Failed to load memories.'));
  });

  return memories.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createMemory(input: MemoryInput): Promise<FoodMemory> {
  const memory: FoodMemory = {
    id: generateId(),
    created_at: new Date().toISOString(),
    ...input,
  };

  await runTransaction<void>('readwrite', (store, resolve, reject) => {
    const request = store.add(memory);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Failed to save memory.'));
  });

  return memory;
}

export async function updateMemory(id: string, input: MemoryInput): Promise<FoodMemory> {
  return runTransaction<FoodMemory>('readwrite', (store, resolve, reject) => {
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as FoodMemory | undefined;

      if (!existing) {
        reject(new Error('Memory not found.'));
        return;
      }

      const updatedMemory: FoodMemory = {
        ...existing,
        ...input,
        id,
      };

      const putRequest = store.put(updatedMemory);

      putRequest.onsuccess = () => resolve(updatedMemory);
      putRequest.onerror = () => reject(putRequest.error ?? new Error('Failed to update memory.'));
    };

    getRequest.onerror = () => reject(getRequest.error ?? new Error('Failed to load memory.'));
  });
}

export async function deleteMemory(id: string): Promise<void> {
  await runTransaction<void>('readwrite', (store, resolve, reject) => {
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Failed to delete memory.'));
  });
}
