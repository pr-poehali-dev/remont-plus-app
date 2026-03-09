import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { isSiteBlocked, type BlockedSite } from '@/lib/search-store';

interface SiteViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function SiteViewer({ url, title, onClose }: SiteViewerProps) {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState<BlockedSite | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    isSiteBlocked(url).then(b => {
      setBlocked(b);
      setChecking(false);
    });
  }, [url]);

  if (checking) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
        <div className="h-12 flex items-center justify-between px-4 border-b border-border/50 glass">
          <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
            <Icon name="ShieldX" size={16} className="text-destructive" />
            <span className="truncate">{url}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Icon name="ShieldX" size={40} className="text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Сайт заблокирован</h2>
            <p className="text-muted-foreground mb-4">
              Доступ к <span className="text-foreground font-medium">{title}</span> ограничен.
            </p>
            <div className="rounded-xl bg-card border border-border/50 p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Причина:</span> {blocked.reason}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl gradient-bg text-white font-medium transition-all hover:opacity-90 active:scale-95"
            >
              Вернуться к поиску
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
      <div className="h-12 flex items-center justify-between px-4 border-b border-border/50 glass">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors shrink-0">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg px-3 py-1 flex-1 min-w-0">
            <Icon name="Lock" size={14} className="text-green-400 shrink-0" />
            <span className="truncate">{url}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            title="Открыть в новой вкладке"
          >
            <Icon name="ExternalLink" size={16} />
          </a>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Загрузка сайта...</p>
            </div>
          </div>
        )}
        <iframe
          src={url}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          title={title}
        />
      </div>
    </div>
  );
}
