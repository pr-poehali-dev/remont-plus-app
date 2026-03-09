import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import SiteViewer from '@/components/SiteViewer';
import Icon from '@/components/ui/icon';
import { searchSites, isSiteBlocked, type SiteEntry, type BlockedSite } from '@/lib/search-store';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SiteEntry[]>([]);
  const [blockedMap, setBlockedMap] = useState<Record<string, BlockedSite | null>>({});
  const [viewingSite, setViewingSite] = useState<SiteEntry | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchSites(query).then(async (sites) => {
        setResults(sites);
        setSearched(true);
        setLoading(false);
        const map: Record<string, BlockedSite | null> = {};
        await Promise.all(
          sites.map(async (s) => {
            map[s.id] = await isSiteBlocked(s.url);
          })
        );
        setBlockedMap(map);
      });
    }
  }, [query]);

  const handleSearch = (q: string) => {
    setSearchParams({ q });
  };

  if (viewingSite) {
    return (
      <SiteViewer
        url={viewingSite.url}
        title={viewingSite.title}
        onClose={() => setViewingSite(null)}
      />
    );
  }

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <SearchBar initialQuery={query} onSearch={handleSearch} autoFocus={!query} />

        {query && (
          <p className="text-sm text-muted-foreground mt-4 mb-6">
            Результаты по запросу «<span className="text-foreground">{query}</span>»
            {!loading && results.length > 0 && ` — найдено ${results.length}`}
          </p>
        )}

        {loading && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Поиск...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Icon name="SearchX" size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Ничего не найдено</h3>
            <p className="text-sm text-muted-foreground">
              Попробуйте изменить запрос или добавьте сайты через админ-панель
            </p>
          </div>
        )}

        <div className="space-y-3">
          {results.map((site, i) => {
            const blocked = blockedMap[site.id];
            return (
              <div
                key={site.id}
                className="group rounded-2xl border border-border/50 bg-card/50 p-5 hover:border-primary/30 transition-all duration-300 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => setViewingSite(site)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground truncate">{site.url}</span>
                      {blocked && (
                        <span className="inline-flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                          <Icon name="ShieldX" size={10} />
                          Заблокирован
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-primary group-hover:underline mb-1">{site.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{site.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {site.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:gradient-bg group-hover:text-white transition-all">
                    <Icon name={blocked ? 'ShieldX' : 'ArrowRight'} size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
