'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Box, Button } from '@mui/material';

export type DiceResult = {
  value: number;
  type: string;
};

type DiceRollerProps = {
  diceNotation?: string;
  onRollComplete?: (results: DiceResult[]) => void;
};

export function DiceRoller({ diceNotation = '2d6', onRollComplete }: DiceRollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const worldRef = useRef<CANNON.World | null>(null);
  const dicesRef = useRef<any[]>([]);
  const animationFrameRef = useRef<number>();
  const diceMaterialRef = useRef<CANNON.Material | null>(null);
  const isInitializedRef = useRef(false);

  const [isRolling, setIsRolling] = useState(false);

  // Initialize scene once
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0xffffff, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Camera
    const aspect = width / height;
    const scale = Math.sqrt(width * width + height * height) / 8;
    const wh = height / Math.tan((10 * Math.PI) / 400);
    const camera = new THREE.PerspectiveCamera(20, aspect, 1, wh * 1.3);
    camera.position.z = wh;
    cameraRef.current = camera;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xf0f0f0);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xefefef, 2.5);
    spotLight.position.set(-width / 2, height / 2, width * 3);
    spotLight.target.position.set(0, 0, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = width / 10;
    spotLight.shadow.camera.far = width * 5;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);

    // Physics World
    const world = new CANNON.World();
    world.gravity.set(0, 0, -9.8 * 800);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 25;
    worldRef.current = world;

    // Materials
    const diceMaterial = new CANNON.Material();
    const deskMaterial = new CANNON.Material();
    const barrierMaterial = new CANNON.Material();
    diceMaterialRef.current = diceMaterial;

    world.addContactMaterial(
      new CANNON.ContactMaterial(deskMaterial, diceMaterial, { friction: 0.01, restitution: 0.5 })
    );
    world.addContactMaterial(
      new CANNON.ContactMaterial(barrierMaterial, diceMaterial, { friction: 0, restitution: 1.0 })
    );
    world.addContactMaterial(
      new CANNON.ContactMaterial(diceMaterial, diceMaterial, { friction: 0, restitution: 0.5 })
    );

    // Floor
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: deskMaterial,
    });
    world.addBody(floorBody);

    // Barriers (walls) at 0.93
    const h = height / 2;
    const w = width / 2;

    const barrier1 = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: barrierMaterial,
    });
    barrier1.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    barrier1.position.set(0, h * 0.93, 0);
    world.addBody(barrier1);

    const barrier2 = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: barrierMaterial,
    });
    barrier2.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    barrier2.position.set(0, -h * 0.93, 0);
    world.addBody(barrier2);

    const barrier3 = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: barrierMaterial,
    });
    barrier3.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
    barrier3.position.set(w * 0.93, 0, 0);
    world.addBody(barrier3);

    const barrier4 = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: barrierMaterial,
    });
    barrier4.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    barrier4.position.set(-w * 0.93, 0, 0);
    world.addBody(barrier4);

    // Render initial scene
    renderer.render(scene, camera);

    isInitializedRef.current = true;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const rollDice = () => {
    if (isRolling || !sceneRef.current || !worldRef.current) return;

    setIsRolling(true);

    // Parse notation
    const match = diceNotation.match(/(\d+)d(\d+)/);
    if (!match) {
      setIsRolling(false);
      return;
    }

    const numDice = parseInt(match[1], 10);
    const diceSides = parseInt(match[2], 10);

    // Clear previous dice
    dicesRef.current.forEach((die) => {
      sceneRef.current?.remove(die.mesh);
      worldRef.current?.removeBody(die.body);
    });
    dicesRef.current = [];

    const container = containerRef.current!;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const scale = Math.sqrt(width * width + height * height) / 8;

    // Create dice
    for (let i = 0; i < numDice; i++) {
      const die = createDie(scale);
      if (die) {
        dicesRef.current.push(die);
      }
    }

    // Animate
    let iteration = 0;
    const frameRate = 1 / 60;
    let lastTime = Date.now();

    const animate = () => {
      if (!worldRef.current || !sceneRef.current || !rendererRef.current || !cameraRef.current) {
        return;
      }

      iteration++;
      worldRef.current.step(frameRate);

      // Update dice positions
      dicesRef.current.forEach((die) => {
        die.mesh.position.copy(die.body.position as any);
        die.mesh.quaternion.copy(die.body.quaternion as any);
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);

      // Check if finished
      const minIterations = 10 / frameRate;
      let allFinished = true;
      const e = 6;

      if (iteration < minIterations) {
        allFinished = false;
      }

      dicesRef.current.forEach((die) => {
        if (die.dice_stopped === true) return;

        const a = die.body.angularVelocity;
        const v = die.body.velocity;

        if (
          Math.abs(a.x) < e &&
          Math.abs(a.y) < e &&
          Math.abs(a.z) < e &&
          Math.abs(v.x) < e &&
          Math.abs(v.y) < e &&
          Math.abs(v.z) < e
        ) {
          if (die.dice_stopped) {
            if (iteration - (die.dice_stopped as number) > 3) {
              die.dice_stopped = true;
            } else {
              allFinished = false;
            }
          } else {
            die.dice_stopped = iteration;
            allFinished = false;
          }
        } else {
          die.dice_stopped = undefined;
          allFinished = false;
        }
      });

      if (allFinished) {
        const results: DiceResult[] = dicesRef.current.map((die) => {
          const value = getDieValue(die.mesh.quaternion);
          return { value, type: `d${diceSides}` };
        });

        setIsRolling(false);
        onRollComplete?.(results);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const createDie = (scale: number) => {
    if (!sceneRef.current || !worldRef.current || !diceMaterialRef.current) return null;

    const size = scale * 0.9;

    // Mesh
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshPhongMaterial({
      color: 0xf0f0f0,
      shininess: 40,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    sceneRef.current.add(mesh);

    // Body
    const body = new CANNON.Body({
      mass: 300,
      shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
      material: diceMaterialRef.current,
    });

    // Random position and rotation
    const container = containerRef.current!;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const w = width / 2;
    const h = height / 2;

    const px = (Math.random() - 0.5) * w * 0.5;
    const py = (Math.random() - 0.5) * h * 0.5;
    const pz = Math.random() * 200 + 200;
    body.position.set(px, py, pz);

    // Random throw
    const vx = (Math.random() - 0.5) * 500;
    const vy = (Math.random() - 0.5) * 500;
    const vz = -10;
    body.velocity.set(vx, vy, vz);

    const ax = (Math.random() - 0.5) * 50;
    const ay = (Math.random() - 0.5) * 50;
    const az = (Math.random() - 0.5) * 50;
    body.angularVelocity.set(ax, ay, az);

    worldRef.current.addBody(body);

    return { mesh, body, dice_stopped: undefined };
  };

  const getDieValue = (quaternion: THREE.Quaternion): number => {
    const upVector = new THREE.Vector3(0, 0, 1);
    upVector.applyQuaternion(quaternion);

    const absX = Math.abs(upVector.x);
    const absY = Math.abs(upVector.y);
    const absZ = Math.abs(upVector.z);

    if (absZ > absX && absZ > absY) {
      return upVector.z > 0 ? 1 : 6;
    }
    if (absY > absX) {
      return upVector.y > 0 ? 2 : 5;
    }
    return upVector.x > 0 ? 3 : 4;
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: 'background.neutral',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      />
      <Button
        variant="contained"
        onClick={rollDice}
        disabled={isRolling}
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </Button>
    </Box>
  );
}

