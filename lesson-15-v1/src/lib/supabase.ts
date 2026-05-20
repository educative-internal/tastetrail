export interface FoodMemory {
  id: string;
  city: string;
  place: string;
  dish: string;
  rating: number;
  note: string;
  created_at: string;
  date_visited?: string | null;
}

type MemoryInput = Omit<FoodMemory, 'id' | 'created_at'>;
type MemoryUpdate = Partial<MemoryInput>;
type QueryResult<T> = { data: T; error: null } | { data: null; error: Error };

const DB_NAME = 'tastetrail_lesson_15_v1';
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

function withStore<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);

        transaction.oncomplete = () => db.close();
        transaction.onerror = () => reject(transaction.error ?? new Error('Database transaction failed.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Database transaction failed.'));

        work(store, resolve, reject);
      }),
  );
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function listMemories(ascending: boolean): Promise<FoodMemory[]> {
  const memories = await withStore<FoodMemory[]>('readonly', (store, resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => resolve((request.result as FoodMemory[]) ?? []);
    request.onerror = () => reject(request.error ?? new Error('Failed to load memories.'));
  });

  return memories.sort((a, b) =>
    ascending
      ? a.created_at.localeCompare(b.created_at)
      : b.created_at.localeCompare(a.created_at),
  );
}

async function addMemory(input: MemoryInput): Promise<FoodMemory> {
  const memory: FoodMemory = {
    ...input,
    id: makeId(),
    created_at: new Date().toISOString(),
  };

  await withStore<void>('readwrite', (store, resolve, reject) => {
    const request = store.add(memory);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Failed to save memory.'));
  });

  return memory;
}

async function editMemory(id: string, updates: MemoryUpdate): Promise<FoodMemory> {
  return withStore<FoodMemory>('readwrite', (store, resolve, reject) => {
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as FoodMemory | undefined;
      if (!existing) {
        reject(new Error('Memory not found.'));
        return;
      }

      const updated: FoodMemory = { ...existing, ...updates, id };
      const putRequest = store.put(updated);

      putRequest.onsuccess = () => resolve(updated);
      putRequest.onerror = () => reject(putRequest.error ?? new Error('Failed to update memory.'));
    };

    getRequest.onerror = () => reject(getRequest.error ?? new Error('Failed to load memory.'));
  });
}

async function removeMemory(id: string): Promise<void> {
  await withStore<void>('readwrite', (store, resolve, reject) => {
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Failed to delete memory.'));
  });
}

function success<T>(data: T): QueryResult<T> {
  return { data, error: null };
}

function failure<T>(error: unknown): QueryResult<T> {
  return { data: null, error: error instanceof Error ? error : new Error('Database request failed.') };
}

function createSelectQuery() {
  return {
    async order(column: string, options: { ascending: boolean }): Promise<QueryResult<FoodMemory[]>> {
      if (column !== 'created_at') {
        return failure<FoodMemory[]>(new Error(`Unsupported sort column: ${column}`));
      }

      try {
        return success(await listMemories(options.ascending));
      } catch (error) {
        return failure<FoodMemory[]>(error);
      }
    },
  };
}

function createInsertQuery(records: MemoryInput[]) {
  return {
    select() {
      return {
        async single(): Promise<QueryResult<FoodMemory>> {
          try {
            return success(await addMemory(records[0]));
          } catch (error) {
            return failure<FoodMemory>(error);
          }
        },
      };
    },
  };
}

function createUpdateQuery(updates: MemoryUpdate) {
  return {
    eq(column: string, value: string) {
      return {
        select() {
          return {
            async single(): Promise<QueryResult<FoodMemory>> {
              if (column !== 'id') {
                return failure<FoodMemory>(new Error(`Unsupported filter column: ${column}`));
              }

              try {
                return success(await editMemory(value, updates));
              } catch (error) {
                return failure<FoodMemory>(error);
              }
            },
          };
        },
      };
    },
  };
}

function createDeleteQuery() {
  return {
    async eq(column: string, value: string): Promise<QueryResult<null>> {
      if (column !== 'id') {
        return failure<null>(new Error(`Unsupported filter column: ${column}`));
      }

      try {
        await removeMemory(value);
        return success(null);
      } catch (error) {
        return failure<null>(error);
      }
    },
  };
}

export const supabase = {
  from(table: string) {
    if (table !== 'food_memories') {
      throw new Error(`Unsupported table: ${table}`);
    }

    return {
      select(_columns: string) {
        return createSelectQuery();
      },
      insert(records: MemoryInput[]) {
        return createInsertQuery(records);
      },
      update(updates: MemoryUpdate) {
        return createUpdateQuery(updates);
      },
      delete() {
        return createDeleteQuery();
      },
    };
  },
};
