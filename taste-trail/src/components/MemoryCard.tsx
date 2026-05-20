import { useState } from 'react';
import { MapPin, Building2, UtensilsCrossed, StickyNote, Pencil, Trash2, X, Check, CalendarDays } from 'lucide-react';
import { StarDisplay, StarRating } from './StarRating';
import type { FoodMemory } from '../lib/memory-store';

const NOTE_MAX_LENGTH = 200;

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface MemoryCardProps {
  memory: FoodMemory;
  onEdit: (id: string, data: { city: string; place: string; dish: string; rating: number; note: string; date_visited: string | null }) => void;
  onDelete: (id: string) => void;
}

export function MemoryCard({ memory, onEdit, onDelete }: MemoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [city, setCity] = useState(memory.city);
  const [place, setPlace] = useState(memory.place);
  const [dish, setDish] = useState(memory.dish);
  const [rating, setRating] = useState(memory.rating);
  const [note, setNote] = useState(memory.note);
  const [dateVisited, setDateVisited] = useState(memory.date_visited || '');

  const handleEditClick = () => {
    setCity(memory.city);
    setPlace(memory.place);
    setDish(memory.dish);
    setRating(memory.rating);
    setNote(memory.note);
    setDateVisited(memory.date_visited || '');
    setIsEditing(true);
    setIsDeleting(false);
  };

  const handleDeleteClick = () => {
    setIsDeleting(true);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!city.trim() || !place.trim() || !dish.trim() || rating === 0) return;
    onEdit(memory.id, {
      city: city.trim(),
      place: place.trim(),
      dish: dish.trim(),
      rating,
      note: note.trim(),
      date_visited: dateVisited || null,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleConfirmDelete = () => {
    onDelete(memory.id);
    setIsDeleting(false);
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
  };

  const isValid = city.trim() && place.trim() && dish.trim() && rating > 0;
  const noteCharCount = note.length;
  const isNoteOverLimit = noteCharCount > NOTE_MAX_LENGTH;

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border-2 border-amber-400 p-5 shadow-md shadow-amber-500/10 transition-all duration-300">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center">
            <Pencil size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-amber-600">Editing memory</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-1.5">
                <MapPin size={14} className="text-stone-400" />
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-1.5">
                <Building2 size={14} className="text-stone-400" />
                Place
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-1.5">
                <UtensilsCrossed size={14} className="text-stone-400" />
                Dish
              </label>
              <input
                type="text"
                value={dish}
                onChange={(e) => setDish(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600 mb-1.5">
                <CalendarDays size={14} className="text-stone-400" />
                Date visited
              </label>
              <input
                type="date"
                value={dateVisited}
                onChange={(e) => setDateVisited(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-600 mb-1.5 block">Rating</label>
            <StarRating value={rating} onChange={setRating} size={24} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
                <StickyNote size={14} className="text-stone-400" />
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
              rows={2}
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200 resize-none ${
                isNoteOverLimit ? 'border-red-300' : 'border-stone-200'
              }`}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSaveEdit}
              disabled={!isValid}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Check size={16} />
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 transition-all duration-200"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isDeleting) {
    return (
      <div className="bg-white rounded-2xl border-2 border-red-300 p-5 shadow-md transition-all duration-300">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <Trash2 size={16} className="text-red-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-800">
              Delete this memory?
            </p>
            <p className="text-sm text-stone-500 mt-0.5 truncate">
              {memory.dish} at {memory.place}, {memory.city}
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 transition-all duration-200"
              >
                <Trash2 size={15} />
                Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 transition-all duration-200"
              >
                <X size={15} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md hover:border-stone-200 transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-stone-800 truncate">{memory.dish}</h3>
          <div className="flex items-center gap-1.5 text-stone-500 mt-0.5 flex-wrap">
            <MapPin size={13} className="shrink-0" />
            <span className="text-sm truncate">{memory.city}</span>
            <span className="text-stone-300 mx-0.5">/</span>
            <Building2 size={13} className="shrink-0" />
            <span className="text-sm truncate">{memory.place}</span>
            {memory.date_visited && (
              <>
                <span className="text-stone-300 mx-0.5">/</span>
                <CalendarDays size={13} className="shrink-0" />
                <span className="text-sm">{formatDate(memory.date_visited)}</span>
              </>
            )}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <StarDisplay value={memory.rating} size={15} />
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleEditClick}
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-amber-50 transition-all duration-200"
              aria-label="Edit memory"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              aria-label="Delete memory"
            >
              <Trash2 size={14} />
            </button>
          </div>
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
