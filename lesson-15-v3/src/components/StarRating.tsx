import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 24 }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform duration-150 hover:scale-110 focus:outline-none"
        >
          <Star
            size={size}
            className={`transition-colors duration-200 ${
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-stone-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

interface StarDisplayProps {
  value: number;
  size?: number;
}

export function StarDisplay({ value, size = 16 }: StarDisplayProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= value
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-stone-300'
          }`}
        />
      ))}
    </div>
  );
}
