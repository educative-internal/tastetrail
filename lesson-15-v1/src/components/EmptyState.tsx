import { UtensilsCrossed } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
        <UtensilsCrossed size={28} className="text-stone-400" />
      </div>
      <h3 className="text-lg font-semibold text-stone-700 mb-1">No memories yet</h3>
      <p className="text-sm text-stone-400 text-center max-w-xs">
        Save your first food memory above and start building your TasteTrail.
      </p>
    </div>
  );
}
