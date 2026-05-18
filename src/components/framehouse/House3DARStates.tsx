import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

/**
 * UI-блоки для разных состояний AR-режима.
 * Полностью повторяют JSX из исходного House3DAR.tsx.
 */

export function ARStateChecking() {
  return (
    <div className="text-white text-center">
      <Icon name="Loader2" size={36} className="animate-spin mx-auto mb-3" />
      <p>Проверяем поддержку AR…</p>
    </div>
  );
}

export function ARStateSupported({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-md text-center text-white space-y-5">
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40">
        <Icon name="ScanLine" size={44} className="text-white" />
      </div>
      <h3 className="text-2xl font-bold">Дом в натуральную величину</h3>
      <p className="text-slate-300">
        Поставьте свой каркасник на участок и обойдите его вокруг. Используется ARCore через
        WebXR — без установки приложений.
      </p>
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2 text-sm text-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">1</span>
          Направьте камеру на ровную поверхность
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">2</span>
          Дождитесь оранжевого кольца-прицела
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">3</span>
          Коснитесь экрана — дом появится в реальном мире
        </div>
      </div>
      <Button
        onClick={onStart}
        size="lg"
        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 text-base font-bold"
      >
        <Icon name="ScanLine" className="mr-2" />
        Запустить AR
      </Button>
    </div>
  );
}

export function ARStateActive({
  placed,
  scale,
  onScaleChange,
  onEnd,
}: {
  placed: boolean;
  scale: number;
  onScaleChange: (v: number) => void;
  onEnd: () => void;
}) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
      {placed && (
        <div className="bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-xl flex items-center gap-3">
          <button
            onClick={() => onScaleChange(Math.max(0.1, scale - 0.1))}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"
          >
            <Icon name="Minus" size={16} />
          </button>
          <span className="text-sm font-semibold w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => onScaleChange(Math.min(2, scale + 0.1))}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"
          >
            <Icon name="Plus" size={16} />
          </button>
        </div>
      )}
      <Button
        onClick={onEnd}
        className="bg-red-500 hover:bg-red-600 text-white border-0"
      >
        <Icon name="X" className="mr-1" size={16} />
        Завершить AR
      </Button>
    </div>
  );
}

export function ARStateIOS({
  iosError,
  iosLoading,
  onLaunch,
}: {
  iosError: string | null;
  iosLoading: boolean;
  onLaunch: () => void;
}) {
  return (
    <div className="max-w-md text-center text-white space-y-5">
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40">
        <Icon name="Smartphone" size={44} className="text-white" />
      </div>
      <h3 className="text-2xl font-bold">AR Quick Look для iPhone</h3>
      <p className="text-slate-300">
        Откроется нативный AR-просмотрщик Apple. Наведите камеру на пол или землю — каркасник встанет в натуральную величину.
      </p>
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2 text-sm text-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">1</span>
          Нажмите «Открыть в AR»
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">2</span>
          В Quick Look выберите вкладку «AR»
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">3</span>
          Поводите камерой и поставьте дом на участок
        </div>
      </div>
      {iosError && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
          {iosError}
        </div>
      )}
      <Button
        onClick={onLaunch}
        disabled={iosLoading}
        size="lg"
        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0 text-base font-bold"
      >
        {iosLoading ? (
          <>
            <Icon name="Loader2" className="mr-2 animate-spin" />
            Готовим модель…
          </>
        ) : (
          <>
            <Icon name="ScanLine" className="mr-2" />
            Открыть в AR
          </>
        )}
      </Button>
      <p className="text-slate-500 text-xs">
        Работает в Safari на iOS 12+ и iPadOS. Модель оптимизирована под Apple ARKit.
      </p>
    </div>
  );
}

export function ARStateUnsupported({ onClose }: { onClose: () => void }) {
  return (
    <div className="max-w-md text-center text-white space-y-4">
      <div className="w-20 h-20 mx-auto rounded-full bg-slate-700 flex items-center justify-center">
        <Icon name="AlertTriangle" size={36} className="text-amber-400" />
      </div>
      <h3 className="text-xl font-bold">AR недоступен на этом устройстве</h3>
      <p className="text-slate-300">
        Откройте сайт на Android-смартфоне в Chrome или Edge (требуется ARCore). На компьютере AR-режим не работает.
      </p>
      <Button onClick={onClose} variant="outline" className="text-white border-white/30 hover:bg-white/10">
        Вернуться к 3D
      </Button>
    </div>
  );
}
