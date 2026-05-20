import { UtensilsCrossed, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddMemory: () => void;
}

export function EmptyState({ onAddMemory }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
        <UtensilsCrossed size={28} className="text-stone-400" />
      </div>
      <h3 className="text-lg font-semibold text-stone-700 mb-1">No memories yet</h3>
      <p className="text-sm text-stone-400 text-center max-w-xs mb-6">
        Save your first food memory and start building your TasteTrail.
      </p>
      <button
        onClick={onAddMemory}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-all duration-200 shadow-md shadow-amber-500/20 text-sm"
      >
        <Plus size={16} />
        Add your first memory
      </button>
    </div>
  );
}
