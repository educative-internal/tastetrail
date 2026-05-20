import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChefHat, Plus, X, Search, Star } from 'lucide-react';
import {
  createMemory,
  deleteMemory,
  listMemories,
  type FoodMemory,
  updateMemory,
} from './lib/memory-store';
import { MemoryForm } from './components/MemoryForm';
import { MemoryCard } from './components/MemoryCard';
import { EmptyState } from './components/EmptyState';
import { Toast } from './components/Toast';

function App() {
  const [memories, setMemories] = useState<FoodMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const fetchMemories = useCallback(async () => {
    const data = await listMemories();
    setMemories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const cities = useMemo(() => {
    const unique = [...new Set(memories.map((m) => m.city))];
    return unique.sort((a, b) => a.localeCompare(b));
  }, [memories]);

  const hasActiveFilters = search || cityFilter || ratingFilter > 0;

  const resetFilters = useCallback(() => {
    setSearch('');
    setCityFilter('');
    setRatingFilter(0);
  }, []);

  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      if (search) {
        const q = search.toLowerCase();
        if (!m.dish.toLowerCase().includes(q) && !m.place.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (cityFilter && m.city !== cityFilter) return false;
      if (ratingFilter > 0 && m.rating !== ratingFilter) return false;
      return true;
    });
  }, [memories, search, cityFilter, ratingFilter]);

  const handleAddMemory = async (data: {
    city: string;
    place: string;
    dish: string;
    rating: number;
    note: string;
    date_visited: string | null;
  }) => {
    const newMemory = await createMemory(data);
    setMemories((prev) => [newMemory, ...prev]);
    showToast('Memory saved');
    setDrawerOpen(false);
  };

  const handleEditMemory = async (id: string, data: {
    city: string;
    place: string;
    dish: string;
    rating: number;
    note: string;
    date_visited: string | null;
  }) => {
    const updatedMemory = await updateMemory(id, data);
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? updatedMemory : m))
    );
    showToast('Memory updated');
  };

  const handleDeleteMemory = async (id: string) => {
    await deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
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
        <div className="mb-5">
          <h2 className="text-base font-semibold text-stone-800">Saved memories</h2>
          {memories.length > 0 && (
            <p className="text-xs text-stone-400 mt-0.5">
              {hasActiveFilters
                ? `${filteredMemories.length} of ${memories.length} ${memories.length === 1 ? 'memory' : 'memories'}`
                : `${memories.length} ${memories.length === 1 ? 'memory' : 'memories'}`
              }
            </p>
          )}
        </div>

        {/* Search and filters */}
        {memories.length > 0 && (
          <div className="mb-6 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by dish or place..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all duration-200"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* City filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200 cursor-pointer"
              >
                <option value="">All cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* Rating filter */}
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                    className="transition-transform duration-150 hover:scale-110 focus:outline-none"
                    aria-label={`Filter by ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={16}
                      className={`transition-colors duration-200 ${
                        star <= (ratingFilter || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors duration-200"
                >
                  <X size={12} />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Memories list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : memories.length === 0 ? (
          <EmptyState onAddMemory={() => setDrawerOpen(true)} />
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
              <Search size={28} className="text-stone-400" />
            </div>
            <h3 className="text-lg font-semibold text-stone-700 mb-1">No matches found</h3>
            <p className="text-sm text-stone-400 text-center max-w-xs mb-5">
              No memories match your current search or filters. Try adjusting them or clear all filters.
            </p>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-all duration-200 shadow-md shadow-amber-500/20 text-sm"
            >
              <X size={16} />
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMemories.map((memory) => (
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
