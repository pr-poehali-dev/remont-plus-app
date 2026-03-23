import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { RoomDimensions, WallOpening, PlacedFurniture, WallStyle } from "./types";
import { FURNITURE_CATALOG } from "./furnitureCatalog";
import GLBModel from "@/components/room-designer/GLBModel";

interface Props {
  dimensions: RoomDimensions;
  openings: WallOpening[];
  furniture: PlacedFurniture[];
  wallStyles: WallStyle[];
  selectedFurnitureId: string | null;
  onSelectFurniture: (id: string | null) => void;
  modelMap?: Record<string, string>;
}

function WallWithOpenings({
  position, rotation, width, height, openings, color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  openings: WallOpening[];
  color: string;
}) {
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-width / 2, 0);
  wallShape.lineTo(width / 2, 0);
  wallShape.lineTo(width / 2, height);
  wallShape.lineTo(-width / 2, height);
  wallShape.lineTo(-width / 2, 0);

  const holes = openings.map(o => {
    const hole = new THREE.Path();
    const cx = (o.position - 0.5) * width;
    const hw = o.width / 2;
    const y0 = o.elevation;
    const y1 = o.elevation + o.height;
    hole.moveTo(cx - hw, y0);
    hole.lineTo(cx + hw, y0);
    hole.lineTo(cx + hw, y1);
    hole.lineTo(cx - hw, y1);
    hole.lineTo(cx - hw, y0);
    return hole;
  });
  holes.forEach(h => wallShape.holes.push(h));

  const geometry = new THREE.ShapeGeometry(wallShape);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      {openings.filter(o => o.type === "window").map(o => {
        const cx = (o.position - 0.5) * width;
        return (
          <mesh key={o.id} position={[cx, o.elevation + o.height / 2, 0.01]}>
            <planeGeometry args={[o.width, o.height]} />
            <meshPhysicalMaterial color="#b8d8f0" transparent opacity={0.3} roughness={0} metalness={0.1} />
          </mesh>
        );
      })}
      {openings.filter(o => o.type === "door").map(o => {
        const cx = (o.position - 0.5) * width;
        return (
          <mesh key={o.id} position={[cx, o.elevation + o.height / 2, 0.01]}>
            <planeGeometry args={[o.width, o.height]} />
            <meshStandardMaterial color="#8b6e4e" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function PrimitiveFallback({
  item, placed, onSelect, meshRef,
}: {
  item: typeof FURNITURE_CATALOG[0];
  placed: PlacedFurniture;
  onSelect: () => void;
  meshRef: React.RefObject<THREE.Mesh | null>;
}) {
  if (item.shape === "cylinder") {
    return (
      <mesh
        ref={meshRef}
        position={[0, item.height / 2, 0]}
        castShadow
        onClick={e => { e.stopPropagation(); onSelect(); }}
      >
        <cylinderGeometry args={[item.width / 2, item.width / 2, item.height, 16]} />
        <meshStandardMaterial color={placed.color} roughness={0.5} />
      </mesh>
    );
  }

  if (item.shape === "lshape") {
    return (
      <group onClick={e => { e.stopPropagation(); onSelect(); }}>
        <mesh position={[0, item.height / 2, -item.depth / 2 + item.depth * 0.2]} castShadow>
          <boxGeometry args={[item.width, item.height, item.depth * 0.4]} />
          <meshStandardMaterial color={placed.color} roughness={0.5} />
        </mesh>
        <mesh position={[-item.width / 2 + item.width * 0.2, item.height / 2, 0]} castShadow>
          <boxGeometry args={[item.width * 0.4, item.height, item.depth]} />
          <meshStandardMaterial color={placed.color} roughness={0.5} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh
      ref={meshRef}
      position={[0, item.height / 2, 0]}
      castShadow
      onClick={e => { e.stopPropagation(); onSelect(); }}
    >
      <boxGeometry args={[item.width, item.height, item.depth]} />
      <meshStandardMaterial color={placed.color} roughness={0.5} />
    </mesh>
  );
}

function FurniturePiece({
  item, placed, isSelected, onSelect, modelMap,
}: {
  item: typeof FURNITURE_CATALOG[0];
  placed: PlacedFurniture;
  isSelected: boolean;
  onSelect: () => void;
  modelMap?: Record<string, string>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const modelUrl = modelMap?.[placed.catalogId] || item.modelUrl;

  return (
    <group
      position={[placed.x, 0, placed.z]}
      rotation={[0, (placed.rotation * Math.PI) / 180, 0]}
    >
      {modelUrl ? (
        <GLBModel
          url={modelUrl}
          scale={item.modelScale ?? 1}
          color={placed.color}
          width={item.width}
          height={item.height}
          depth={item.depth}
          onClick={e => { (e as { stopPropagation: () => void }).stopPropagation(); onSelect(); }}
        />
      ) : (
        <PrimitiveFallback item={item} placed={placed} onSelect={onSelect} meshRef={meshRef} />
      )}
      {isSelected && (
        <mesh position={[0, item.height + 0.05, 0]}>
          <ringGeometry args={[Math.max(item.width, item.depth) * 0.5, Math.max(item.width, item.depth) * 0.55, 32]} />
          <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} />
        </mesh>
      )}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={isSelected}>
        <planeGeometry args={[item.width + 0.1, item.depth + 0.1]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function RoomContent({ dimensions, openings, furniture, wallStyles, selectedFurnitureId, onSelectFurniture, modelMap }: Props) {
  const { width: W, length: L, height: H } = dimensions;

  const getWallColor = (wall: string) =>
    wallStyles.find(s => s.wall === wall)?.color ?? "#f5f0eb";

  const wallOpenings = (wall: WallOpening["wall"]) =>
    openings.filter(o => o.wall === wall);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, 6, -2]} intensity={0.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow
        onClick={() => onSelectFurniture(null)}
      >
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color={getWallColor("floor")} roughness={0.6} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color={getWallColor("ceiling")} side={THREE.BackSide} roughness={0.9} />
      </mesh>

      <WallWithOpenings
        position={[0, 0, -L / 2]}
        rotation={[0, 0, 0]}
        width={W} height={H}
        openings={wallOpenings("back")}
        color={getWallColor("back")}
      />
      <WallWithOpenings
        position={[0, 0, L / 2]}
        rotation={[0, Math.PI, 0]}
        width={W} height={H}
        openings={wallOpenings("front")}
        color={getWallColor("front")}
      />
      <WallWithOpenings
        position={[-W / 2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={L} height={H}
        openings={wallOpenings("left")}
        color={getWallColor("left")}
      />
      <WallWithOpenings
        position={[W / 2, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        width={L} height={H}
        openings={wallOpenings("right")}
        color={getWallColor("right")}
      />

      {furniture.map(placed => {
        const catalogItem = FURNITURE_CATALOG.find(f => f.id === placed.catalogId);
        if (!catalogItem) return null;
        return (
          <FurniturePiece
            key={placed.id}
            item={catalogItem}
            placed={placed}
            isSelected={selectedFurnitureId === placed.id}
            onSelect={() => onSelectFurniture(placed.id)}
            modelMap={modelMap}
          />
        );
      })}

      <ContactShadows position={[0, 0.01, 0]} opacity={0.3} scale={Math.max(W, L) * 1.5} blur={2} />
    </>
  );
}

export default function Room3DScene(props: Props) {
  const maxDim = Math.max(props.dimensions.width, props.dimensions.length, props.dimensions.height);
  const camDist = maxDim * 1.2;

  return (
    <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <PerspectiveCamera makeDefault position={[camDist * 0.7, camDist * 0.5, camDist * 0.7]} fov={50} />
      <OrbitControls
        target={[0, props.dimensions.height * 0.35, 0]}
        maxPolarAngle={Math.PI * 0.85}
        minDistance={1}
        maxDistance={maxDim * 3}
        enableDamping
      />
      <Environment preset="apartment" />
      <RoomContent {...props} />
    </Canvas>
  );
}