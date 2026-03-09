import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface City {
  name: string;
  id: string;
}

interface EnrichProgress {
  running: boolean;
  cycle: number;
  totalEnriched: number;
  lastResult: string;
  log: string[];
}

interface Props {
  cities: City[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  parsing: boolean;
  findingWebsites: boolean;
  statusMsg: string;
  enrichProgress: EnrichProgress;
  websiteProgress: EnrichProgress;
  rebuildRunning: boolean;
  rebuildPhase: "" | "parse" | "enrich";
  rebuildMsg: string;
  onParse: () => void;
  onEnrichStart: () => void;
  onEnrichStop: () => void;
  onFindWebsites: () => void;
  onWebsiteStop: () => void;
  onRebuildContacts: () => void;
  onRebuildStop: () => void;
}

export default function CompanyParserControlPanel({
  cities,
  selectedCity,
  onCityChange,
  parsing,
  findingWebsites,
  statusMsg,
  enrichProgress,
  websiteProgress,
  rebuildRunning,
  rebuildPhase,
  rebuildMsg,
  onParse,
  onEnrichStart,
  onEnrichStop,
  onFindWebsites,
  onWebsiteStop,
  onRebuildContacts,
  onRebuildStop,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <select
          value={selectedCity}
          onChange={e => onCityChange(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white min-w-[180px]"
        >
          <option value="">— Все города —</option>
          {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <Button
          onClick={onParse}
          disabled={!selectedCity || parsing || enrichProgress.running}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          {parsing ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Search" size={16} />}
          {parsing ? "Собираю..." : "Собрать из ЕГРЮЛ"}
        </Button>

        {!enrichProgress.running ? (
          <Button
            onClick={onEnrichStart}
            disabled={parsing || findingWebsites}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <Icon name="Zap" size={16} />
            Запустить обогащение{selectedCity ? ` (${selectedCity})` : ""}
          </Button>
        ) : (
          <Button
            onClick={onEnrichStop}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 gap-2"
          >
            <Icon name="Square" size={16} />
            Остановить обогащение
          </Button>
        )}

        {!websiteProgress.running ? (
          <Button
            onClick={onFindWebsites}
            disabled={parsing || enrichProgress.running || rebuildRunning}
            variant="outline"
            className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Icon name="Globe" size={16} />
            Найти сайты{selectedCity ? ` (${selectedCity})` : ""}
          </Button>
        ) : (
          <Button
            onClick={onWebsiteStop}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 gap-2"
          >
            <Icon name="Square" size={16} />
            Остановить сайты
          </Button>
        )}

        {selectedCity && (
          !rebuildRunning ? (
            <Button
              onClick={onRebuildContacts}
              disabled={parsing || enrichProgress.running || findingWebsites}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              <Icon name="RefreshCw" size={16} />
              Пересобрать контакты
            </Button>
          ) : (
            <Button
              onClick={onRebuildStop}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 gap-2"
            >
              <Icon name="Square" size={16} />
              Остановить пересборку
            </Button>
          )
        )}

        {statusMsg && (
          <span className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">{statusMsg}</span>
        )}
      </div>

      {/* Прогресс обогащения */}
      {(enrichProgress.running || enrichProgress.lastResult) && (
        <div className="border-t border-gray-100 pt-3 mt-1">
          <div className="flex items-center gap-3 mb-2">
            {enrichProgress.running && (
              <Icon name="Loader2" size={14} className="animate-spin text-green-600" />
            )}
            <span className="text-sm font-medium text-gray-700">{enrichProgress.lastResult}</span>
            {enrichProgress.totalEnriched > 0 && (
              <span className="ml-auto text-sm text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-lg">
                +{enrichProgress.totalEnriched} обогащено
              </span>
            )}
          </div>
          {enrichProgress.log.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1">
              {enrichProgress.log.map((line, i) => (
                <p key={i} className="text-xs text-gray-500 font-mono">{line}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Прогресс пересборки контактов */}
      {(rebuildRunning || rebuildMsg) && (
        <div className="border-t border-gray-100 pt-3 mt-1">
          <div className="flex items-center gap-3">
            {rebuildRunning && (
              <Icon name="Loader2" size={14} className={`animate-spin ${rebuildPhase === "parse" ? "text-orange-500" : "text-purple-600"}`} />
            )}
            {!rebuildRunning && <Icon name="CheckCircle" size={14} className="text-purple-600" />}
            <span className="text-sm font-medium text-gray-700">{rebuildMsg}</span>
            {rebuildRunning && (
              <span className="ml-auto text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-lg">
                {rebuildPhase === "parse" ? "Шаг 1: сбор" : "Шаг 2: обогащение"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Прогресс поиска сайтов */}
      {(websiteProgress.running || websiteProgress.lastResult) && (
        <div className="border-t border-gray-100 pt-3 mt-1">
          <div className="flex items-center gap-3 mb-2">
            {websiteProgress.running && (
              <Icon name="Loader2" size={14} className="animate-spin text-blue-500" />
            )}
            <span className="text-sm font-medium text-gray-700">{websiteProgress.lastResult}</span>
            {websiteProgress.totalEnriched > 0 && (
              <span className="ml-auto text-sm text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-lg">
                +{websiteProgress.totalEnriched} сайтов
              </span>
            )}
          </div>
          {websiteProgress.log.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1">
              {websiteProgress.log.map((line, i) => (
                <p key={i} className="text-xs text-gray-500 font-mono">{line}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
