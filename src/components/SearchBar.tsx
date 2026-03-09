import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface SearchBarProps {
  large?: boolean;
  initialQuery?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export default function SearchBar({ large, initialQuery = '', onSearch, autoFocus }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (onSearch) {
      onSearch(query.trim());
    } else {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`relative flex items-center w-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur transition-all duration-300 focus-within:border-primary/50 focus-within:glow ${
          large ? 'h-16' : 'h-12'
        }`}
      >
        <Icon
          name="Search"
          size={large ? 22 : 18}
          className="absolute left-4 text-muted-foreground"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Что ищем сегодня?..."
          className={`w-full bg-transparent outline-none placeholder:text-muted-foreground/60 ${
            large ? 'pl-12 pr-14 text-lg' : 'pl-11 pr-12 text-sm'
          }`}
        />
        <button
          type="submit"
          className={`absolute right-2 rounded-xl gradient-bg text-white flex items-center justify-center transition-all hover:opacity-90 active:scale-95 ${
            large ? 'w-10 h-10' : 'w-8 h-8'
          }`}
        >
          <Icon name="ArrowRight" size={large ? 20 : 16} />
        </button>
      </div>
    </form>
  );
}
