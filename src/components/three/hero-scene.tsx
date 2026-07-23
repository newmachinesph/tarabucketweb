"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Icosahedron } from "@react-three/drei";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";

function Blob({ reduce }: { reduce: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (reduce || !ref.current) return;
    ref.current.rotation.y += delta * 0.14;
    const px = state.pointer.x * 0.35;
    const py = state.pointer.y * 0.25;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, py, 0.04);
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, px, 0.04);
  });
  return (
    <group ref={ref}>
      <Icosahedron args={[1.4, 24]}>
        <MeshDistortMaterial
          color="#14A3E1"
          speed={reduce ? 0 : 1.7}
          distort={0.38}
          roughness={0.22}
          metalness={0.15}
        />
      </Icosahedron>
    </group>
  );
}

function Orb({
  position,
  color,
  size,
  reduce,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  reduce: boolean;
}) {
  return (
    <Float
      speed={reduce ? 0 : 2.2}
      rotationIntensity={reduce ? 0 : 1}
      floatIntensity={reduce ? 0 : 1.6}
    >
      <mesh position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.18}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  const reduce = !!useReducedMotion();
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={reduce ? "demand" : "always"}
    >
      <ambientLight intensity={0.75} />
      <pointLight position={[4, 3, 4]} intensity={2.6} decay={0} color="#FF5A36" />
      <pointLight position={[-4, -2, 2]} intensity={2.2} decay={0} color="#14A3E1" />
      <directionalLight position={[0, 4, 5]} intensity={1.1} color="#ffffff" />
      <Blob reduce={reduce} />
      <Orb position={[2.3, 1, -1]} color="#FF5A36" size={0.3} reduce={reduce} />
      <Orb position={[-2.5, -0.7, 0]} color="#FFD166" size={0.21} reduce={reduce} />
      <Orb position={[1.9, -1.5, 0.5]} color="#22C58B" size={0.17} reduce={reduce} />
      <Orb position={[-2, 1.4, -0.5]} color="#ffffff" size={0.14} reduce={reduce} />
    </Canvas>
  );
}
