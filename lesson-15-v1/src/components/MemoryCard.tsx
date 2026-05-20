import { MapPin, Building2, UtensilsCrossed, StickyNote } from 'lucide-react';
import { StarDisplay } from './StarRating';
import type { FoodMemory } from '../lib/supabase';

interface MemoryCardProps {
  memory: FoodMemory;
}

export function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md hover:border-stone-200 transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-stone-800 truncate">{memory.dish}</h3>
          <div className="flex items-center gap-1.5 text-stone-500 mt-0.5">
            <MapPin size={13} className="shrink-0" />
            <span className="text-sm truncate">{memory.city}</span>
            <span className="text-stone-300 mx-0.5">/</span>
            <Building2 size={13} className="shrink-0" />
            <span className="text-sm truncate">{memory.place}</span>
          </div>
        </div>
        <div className="shrink-0 pt-0.5">
          <StarDisplay value={memory.rating} size={15} />
        </div>
      </div>

      {memory.note && (
        <div className="flex items-start gap-2 pt-3 border-t border-stone-100">
          <StickyNote size={13} className="text-stone-400 mt-0.5 shrink-0" />
          <p className="text-sm text-stone-500 leading-relaxed">{memory.note}</p>
        </div>
      )}
    </div>
  );
}
