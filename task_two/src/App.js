import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';

function RotatingBox({ position, color }) {
  const mesh = useRef();
  const [active, setActive] = React.useState(false);

  useFrame(() => {
    mesh.current.rotation.x += 0.01;
    mesh.current.rotation.y += 0.01;
  });

  return (
    <mesh
      position={position}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={() => setActive(!active)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={active ? 'hotpink' : color} />
    </mesh>
  );
}

function VRCanvas() {
  const { gl } = useThree();

  useEffect(() => {
    document.body.appendChild(VRButton.createButton(gl));
    gl.xr.enabled = true;
  }, [gl]);

  return null;
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 60 }}>
        <VRCanvas />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <RotatingBox position={[-2, 0, 0]} color="orange" />
        <RotatingBox position={[2, 0, 0]} color="skyblue" />
        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}
