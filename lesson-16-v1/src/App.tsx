import { useState, useEffect, useCallback } from 'react';
import { ChefHat, Plus, X } from 'lucide-react';
import { supabase, type FoodMemory } from './lib/supabase';
import { MemoryForm } from './components/MemoryForm';
import { MemoryCard } from './components/MemoryCard';
import { EmptyState } from './components/EmptyState';
import { Toast } from './components/Toast';

function App() {
  const [memories, setMemories] = useState<FoodMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

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
    date_visited: string | null;
  }) => {
    const { data: newMemory, error } = await supabase
      .from('food_memories')
      .insert([data])
      .select()
      .single();

    if (!error && newMemory) {
      setMemories((prev) => [newMemory, ...prev]);
      showToast('Memory saved');
      setDrawerOpen(false);
    }
  };

  const handleEditMemory = async (id: string, data: {
    city: string;
    place: string;
    dish: string;
    rating: number;
    note: string;
    date_visited: string | null;
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
      showToast('Memory updated');
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
      <header className="bg-white border-b border-stone-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20">
              <ChefHat size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-800 tracking-tight leading-tight">TasteTrail</h1>
              <p className="text-[11px] text-stone-400 leading-tight">Your food memories, one place</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-all duration-200 shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add memory</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        {/* Summary bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-stone-800">Saved memories</h2>
            {memories.length > 0 && (
              <p className="text-xs text-stone-400 mt-0.5">{memories.length} {memories.length === 1 ? 'memory' : 'memories'}</p>
            )}
          </div>
          {memories.length > 0 && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors duration-200"
            >
              <Plus size={15} />
              Add another
            </button>
          )}
        </div>

        {/* Memories list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : memories.length === 0 ? (
          <EmptyState onAddMemory={() => setDrawerOpen(true)} />
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
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-100 mt-8">
        <div className="max-w-2xl mx-auto px-5 py-6 text-center">
          <p className="text-xs text-stone-400">TasteTrail</p>
        </div>
      </footer>

      {/* Drawer overlay */}
      <div
        className={`fixed inset-0 bg-stone-900/40 z-30 transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out max-h-[90vh] overflow-y-auto ${
          drawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-2xl mx-auto">
          {/* Drawer handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-stone-200" />
          </div>

          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-stone-100">
            <h3 className="text-base font-semibold text-stone-800">Add a memory</h3>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all duration-200"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            <MemoryForm onSubmit={handleAddMemory} />
          </div>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />
    </div>
  );
}

export default App;
