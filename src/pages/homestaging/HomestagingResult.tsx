import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { AnalysisResult, PRIORITY_META } from "./HomestagingTypes";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

export default function HomestagingResult({ result, onReset }: Props) {
  const navigate = useNavigate();

  return (
    <div className="mt-8 space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center text-white">
              <Icon name="Home" size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Помещение</p>
              <h3 className="font-bold text-gray-900 capitalize">{result.roomType}</h3>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <Icon name="Star" size={18} className="text-amber-500 fill-amber-500" />
            <span className="font-bold text-gray-900 text-lg">{result.overallScore}</span>
            <span className="text-gray-500 text-sm">/ 10</span>
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed">{result.shortSummary}</p>

        {result.strengths?.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Сильные стороны</p>
            <div className="flex flex-wrap gap-2">
              {result.strengths.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                  <Icon name="Check" size={14} />
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Icon name="ListChecks" size={22} className="text-rose-500" />
          <h3 className="text-xl font-bold text-gray-900">
            Рекомендации ({result.recommendations.length})
          </h3>
        </div>

        <div className="space-y-3">
          {result.recommendations.map((rec, i) => {
            const meta = PRIORITY_META[rec.priority] || PRIORITY_META.medium;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${meta.bg} ${meta.text}`}>
                        <Icon name={meta.icon} size={12} />
                        {meta.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        {rec.category}
                      </span>
                      {rec.estimatedCost && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <Icon name="Wallet" size={12} />
                          {rec.estimatedCost}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Нужна помощь с реализацией?</h3>
            <p className="text-white/70 text-sm">
              Найдём проверенных мастеров в вашем городе для мелкого ремонта, уборки и декора перед продажей.
            </p>
          </div>
          <Button
            onClick={() => navigate("/masters")}
            className="bg-white text-gray-900 hover:bg-white/90 font-bold h-12 px-6"
          >
            Найти мастера
            <Icon name="ArrowRight" size={18} className="ml-2" />
          </Button>
        </div>
      </div>

      <Button
        onClick={onReset}
        variant="outline"
        className="w-full h-11"
      >
        <Icon name="RotateCcw" size={16} className="mr-2" />
        Анализировать другое фото
      </Button>
    </div>
  );
}
