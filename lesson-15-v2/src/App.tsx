import { useState, useEffect, useCallback } from 'react';
import { ChefHat } from 'lucide-react';
import { supabase, type FoodMemory } from './lib/supabase';
import { MemoryForm } from './components/MemoryForm';
import { MemoryCard } from './components/MemoryCard';
import { EmptyState } from './components/EmptyState';

function App() {
  const [memories, setMemories] = useState<FoodMemory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemories = useCallback(async () => {
    const { data, error } = await supabase
      .from('food_memories')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMemories(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleAddMemory = async (data: {
    city: string;
    place: string;
    dish: string;
    rating: number;
    note: string;
  }) => {
    const { data: newMemory, error } = await supabase
      .from('food_memories')
      .insert([data])
      .select()
      .single();

    if (!error && newMemory) {
      setMemories((prev) => [newMemory, ...prev]);
    }
  };

  const handleEditMemory = async (id: string, data: {
    city: string;
    place: string;
    dish: string;
    rating: number;
    note: string;
  }) => {
    const { data: updatedMemory, error } = await supabase
      .from('food_memories')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (!error && updatedMemory) {
      setMemories((prev) =>
        prev.map((m) => (m.id === id ? updatedMemory : m))
      );
    }
  };

  const handleDeleteMemory = async (id: string) => {
    const { error } = await supabase
      .from('food_memories')
      .delete()
      .eq('id', id);

    if (!error) {
      setMemories((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20">
            <ChefHat size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-800 tracking-tight">TasteTrail</h1>
            <p className="text-xs text-stone-400 mt-0.5">Your food memories, one place</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-10">
        {/* Add Memory Section */}
        <section>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-5">
            Add a memory
          </h2>
          <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
            <MemoryForm onSubmit={handleAddMemory} />
          </div>
        </section>

        {/* Saved Memories Section */}
        <section>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-5">
            Saved memories
            {memories.length > 0 && (
              <span className="ml-2 text-stone-400 font-normal normal-case tracking-normal">
                ({memories.length})
              </span>
            )}
          </h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : memories.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4">
              {memories.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onEdit={handleEditMemory}
                  onDelete={handleDeleteMemory}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-100 mt-8">
        <div className="max-w-2xl mx-auto px-5 py-6 text-center">
          <p className="text-xs text-stone-400">TasteTrail</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
