import React, { Suspense, useMemo, useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface GLBModelInnerProps {
  url: string;
  scale: number;
  color: string;
  onClick?: (e: unknown) => void;
  onError: () => void;
}

function GLBModelInner({ url, scale, color, onClick, onError }: GLBModelInnerProps) {
  const gltf = useGLTF(url);

  const clonedScene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mesh.material = materials.map((mat) => {
            const cloned = mat.clone();
            if ("color" in cloned) {
              (cloned as THREE.MeshStandardMaterial).color = new THREE.Color(color);
            }
            return cloned;
          });
          if (!Array.isArray(mesh.material) && materials.length === 1) {
            mesh.material = (mesh.material as THREE.Material[])[0] || mesh.material;
          }
        }
      }
    });
    return clone;
  }, [gltf.scene, color]);

  useEffect(() => {
    if (!gltf.scene) {
      onError();
    }
  }, [gltf.scene, onError]);

  return (
    <primitive
      object={clonedScene}
      scale={[scale, scale, scale]}
      onClick={onClick}
    />
  );
}

function LoadingPlaceholder({ width, height, depth, color }: {
  width: number;
  height: number;
  depth: number;
  color: string;
}) {
  return (
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} roughness={0.5} transparent opacity={0.4} wireframe />
    </mesh>
  );
}

interface GLBModelProps {
  url: string;
  scale: number;
  color: string;
  width: number;
  height: number;
  depth: number;
  onClick?: (e: unknown) => void;
  onLoadError?: () => void;
}

function ErrorBoundaryFallback({ children, fallback, onError }: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError?: () => void;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (hasError && onError) {
      onError();
    }
  }, [hasError, onError]);

  if (hasError) {
    return <>{fallback}</>;
  }

  return (
    <ErrorCatcher onError={() => setHasError(true)}>
      {children}
    </ErrorCatcher>
  );
}

class ErrorCatcher extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export default function GLBModel({
  url, scale, color, width, height, depth, onClick, onLoadError,
}: GLBModelProps) {
  const [failed, setFailed] = useState(false);

  const fallbackBox = (
    <mesh position={[0, height / 2, 0]} castShadow onClick={onClick}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );

  if (failed) {
    return fallbackBox;
  }

  return (
    <ErrorBoundaryFallback
      fallback={fallbackBox}
      onError={() => {
        setFailed(true);
        onLoadError?.();
      }}
    >
      <Suspense fallback={
        <LoadingPlaceholder width={width} height={height} depth={depth} color={color} />
      }>
        <GLBModelInner
          url={url}
          scale={scale}
          color={color}
          onClick={onClick}
          onError={() => {
            setFailed(true);
            onLoadError?.();
          }}
        />
      </Suspense>
    </ErrorBoundaryFallback>
  );
}