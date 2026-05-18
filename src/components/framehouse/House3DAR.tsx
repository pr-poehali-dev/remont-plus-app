import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { FrameHouseSpec } from "@/lib/frameHouseGenerator";
import { type ViewMode } from "./House3DMaterials";
import {
  useARSupport,
  startARSession,
  launchIOSQuickLook as launchIOSQuickLookFn,
} from "./House3DARSession";
import {
  ARStateChecking,
  ARStateSupported,
  ARStateActive,
  ARStateIOS,
  ARStateUnsupported,
} from "./House3DARStates";

interface Props {
  spec: FrameHouseSpec;
  mode: ViewMode;
  onClose: () => void;
}

/**
 * AR-режим через WebXR (immersive-ar).
 * На Android Chrome/Edge с ARCore — нативная AR-сессия.
 * На iOS — инструкция (Safari не поддерживает WebXR нативно).
 */
export default function House3DAR({ spec, mode, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [support, setSupport] = useARSupport();
  const [sessionActive, setSessionActive] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [scale, setScale] = useState(1);
  const [iosLoading, setIosLoading] = useState(false);
  const [iosError, setIosError] = useState<string | null>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const houseGroupRef = useRef<THREE.Group | null>(null);
  const reticleRef = useRef<THREE.Mesh | null>(null);
  const hitTestSourceRef = useRef<XRHitTestSource | null>(null);
  const sessionRef = useRef<XRSession | null>(null);
  // В оригинале `placed` использовался из замыкания startAR (== false),
  // сохраняем то же поведение через ref, инициализированный значением на момент старта.
  const placedRef = useRef(false);

  const startAR = async () => {
    placedRef.current = placed;
    await startARSession(
      spec,
      mode,
      {
        rendererRef,
        sceneRef,
        houseGroupRef,
        reticleRef,
        hitTestSourceRef,
        sessionRef,
      },
      {
        setSessionActive,
        setPlaced,
        setSupport,
        placedRef,
      },
    );
  };

  const endAR = () => {
    sessionRef.current?.end?.();
  };

  const launchIOSQuickLook = () => launchIOSQuickLookFn(spec, setIosError, setIosLoading);

  // Управление масштабом дома в AR
  useEffect(() => {
    if (houseGroupRef.current) {
      houseGroupRef.current.scale.setScalar(scale);
    }
  }, [scale]);

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/95 backdrop-blur-md flex flex-col">
      {/* Шапка */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-2">
          <Icon name="View" size={20} className="text-orange-400" />
          <h2 className="text-lg font-bold">AR-режим</h2>
          <span className="text-[10px] uppercase tracking-wider bg-orange-500 px-1.5 py-0.5 rounded font-bold">
            BETA
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            endAR();
            onClose();
          }}
          className="text-white hover:bg-white/10"
        >
          <Icon name="X" size={18} />
        </Button>
      </div>

      {/* Контент */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center p-6">
        {support === "checking" && <ARStateChecking />}

        {support === "supported" && !sessionActive && (
          <ARStateSupported onStart={startAR} />
        )}

        {sessionActive && (
          <ARStateActive
            placed={placed}
            scale={scale}
            onScaleChange={setScale}
            onEnd={endAR}
          />
        )}

        {support === "ios" && (
          <ARStateIOS
            iosError={iosError}
            iosLoading={iosLoading}
            onLaunch={launchIOSQuickLook}
          />
        )}

        {support === "unsupported" && <ARStateUnsupported onClose={onClose} />}
      </div>
    </div>
  );
}
