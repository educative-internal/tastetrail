import { useState } from 'react';
import { MapPin, UtensilsCrossed, Building2, StickyNote, Plus, CalendarDays } from 'lucide-react';
import { StarRating } from './StarRating';

const NOTE_MAX_LENGTH = 200;

interface MemoryFormProps {
  onSubmit: (data: { city: string; place: string; dish: string; rating: number; note: string; date_visited: string | null }) => void;
}

export function MemoryForm({ onSubmit }: MemoryFormProps) {
  const [city, setCity] = useState('');
  const [place, setPlace] = useState('');
  const [dish, setDish] = useState('');
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [dateVisited, setDateVisited] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !place.trim() || !dish.trim() || rating === 0) return;

    onSubmit({
      city: city.trim(),
      place: place.trim(),
      dish: dish.trim(),
      rating,
      note: note.trim(),
      date_visited: dateVisited || null,
    });
    setCity('');
    setPlace('');
    setDish('');
    setRating(0);
    setNote('');
    setDateVisited('');
  };

  const isValid = city.trim() && place.trim() && dish.trim() && rating > 0;
  const noteCharCount = note.length;
  const isNoteOverLimit = noteCharCount > NOTE_MAX_LENGTH;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
            <MapPin size={15} className="text-stone-400" />
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Tokyo"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
            <Building2 size={15} className="text-stone-400" />
            Place
          </label>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="e.g. Ichiran Ramen"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
            <UtensilsCrossed size={15} className="text-stone-400" />
            Dish
          </label>
          <input
            type="text"
            value={dish}
            onChange={(e) => setDish(e.target.value)}
            placeholder="e.g. Tonkotsu Ramen"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-2">
            <CalendarDays size={15} className="text-stone-400" />
            Date visited
          </label>
          <input
            type="date"
            value={dateVisited}
            onChange={(e) => setDateVisited(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-stone-600 mb-2 block">Rating</label>
        <StarRating value={rating} onChange={setRating} size={28} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
            <StickyNote size={15} className="text-stone-400" />
            Short note
          </label>
          <span className={`text-xs tabular-nums ${isNoteOverLimit ? 'text-red-500 font-medium' : 'text-stone-400'}`}>
            {noteCharCount}/{NOTE_MAX_LENGTH}
          </span>
        </div>
        <textarea
          value={note}
          onChange={(e) => {
            if (e.target.value.length <= NOTE_MAX_LENGTH) {
              setNote(e.target.value);
            }
          }}
          placeholder="What made this memorable?"
          rows={2}
          className={`w-full px-4 py-3 rounded-xl border bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200 resize-none ${
            isNoteOverLimit ? 'border-red-300' : 'border-stone-200'
          }`}
        />
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:shadow-none"
      >
        <Plus size={18} />
        Save Memory
      </button>
    </form>
  );
}
