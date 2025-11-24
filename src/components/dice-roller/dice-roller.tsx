import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type DiceResult = {
  value: number;
  type: string;
};

type DiceRollerProps = {
  onRollComplete?: (results: DiceResult[]) => void;
  diceNotation?: string; // e.g., "2d6" for backgammon
};

// ----------------------------------------------------------------------

export function DiceRoller({ onRollComplete, diceNotation = '2d6' }: DiceRollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const worldRef = useRef<CANNON.World | null>(null);
  const dicesRef = useRef<any[]>([]);
  const animationFrameRef = useRef<number>();
  const diceMaterialRef = useRef<CANNON.Material | null>(null);

  const [isRolling, setIsRolling] = useState(false);

  // Initialize Three.js scene and Cannon.js physics world
  useEffect(() => {
    if (!containerRef.current) return;

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
    const wh = height / Math.tan(10 * Math.PI / 400);
    const camera = new THREE.PerspectiveCamera(20, aspect, 1, wh * 1.3);
    camera.position.z = wh;
    cameraRef.current = camera;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xf0f0f0);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xefefef, 2.0);
    const mw = Math.max(width, height);
    spotLight.position.set(-mw / 2, mw / 2, mw * 2);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Ground plane
    const desk = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 2, height * 2, 1, 1),
      new THREE.MeshPhongMaterial({ color: 0x101010, opacity: 0.1, transparent: true })
    );
    desk.receiveShadow = true;
    scene.add(desk);

    // Physics world
    const world = new CANNON.World();
    world.gravity.set(0, 0, -9.8 * 800);
    world.broadphase = new CANNON.NaiveBroadphase();
    (world.solver as any).iterations = 16;
    (world.solver as any).tolerance = 0.1; // Add tolerance to reduce clamping warnings
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
      new CANNON.ContactMaterial(barrierMaterial, diceMaterial, {
        friction: 0,
        restitution: 1.0,
      })
    );
    world.addContactMaterial(
      new CANNON.ContactMaterial(diceMaterial, diceMaterial, { friction: 0, restitution: 0.5 })
    );

    // Floor
    const floorBody = new CANNON.Body({ mass: 0, material: deskMaterial });
    floorBody.addShape(new CANNON.Plane());
    world.addBody(floorBody);

    // Barriers (walls)
    const createBarrier = (position: CANNON.Vec3, rotation: CANNON.Quaternion) => {
      const barrier = new CANNON.Body({ mass: 0, material: barrierMaterial });
      barrier.addShape(new CANNON.Plane());
      barrier.quaternion.copy(rotation);
      barrier.position.copy(position);
      world.addBody(barrier);
    };

    const w = width / 2;
    const h = height / 2;

    createBarrier(
      new CANNON.Vec3(0, h * 0.99, 0),
      new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    );
    createBarrier(
      new CANNON.Vec3(0, -h * 0.99, 0),
      new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    );
    createBarrier(
      new CANNON.Vec3(w * 0.99, 0, 0),
      new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2)
    );
    createBarrier(
      new CANNON.Vec3(-w * 0.99, 0, 0),
      new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2)
    );

    // Initial render
    renderer.render(scene, camera);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // Create a single d6 die
  const createDie = (scale: number, position: CANNON.Vec3, rotation: CANNON.Quaternion) => {
    if (!sceneRef.current || !worldRef.current) return null;

    const size = scale * 0.9;

    // Three.js mesh
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshPhongMaterial({
      color: 0xf0f0f0,
      shininess: 40,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;

    // Add labels (1-6)
    const createLabel = (text: string, faceIndex: number) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = 64;
      canvas.height = 64;

      context.fillStyle = '#202020';
      context.font = 'bold 48px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 32, 32);

      const texture = new THREE.CanvasTexture(canvas);
      return new THREE.MeshBasicMaterial({ map: texture });
    };

    const materials = [
      createLabel('4', 0), // Right
      createLabel('3', 1), // Left
      createLabel('1', 2), // Top
      createLabel('6', 3), // Bottom
      createLabel('2', 4), // Front
      createLabel('5', 5), // Back
    ].filter((m): m is THREE.MeshBasicMaterial => m !== undefined);

    (mesh as any).material = materials;

    sceneRef.current.add(mesh);

    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
    const body = new CANNON.Body({
      mass: 300,
      shape,
      position,
      quaternion: rotation,
      material: diceMaterialRef.current || undefined,
    });
    body.linearDamping = 0.1;
    body.angularDamping = 0.1;

    worldRef.current.addBody(body);

    return { mesh, body };
  };

  // Roll dice
  const rollDice = () => {
    if (isRolling || !sceneRef.current || !worldRef.current) return;

    setIsRolling(true);

    // Play dice roll sound
    const audio = new Audio('/assets/sounds/dice-roll.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {}); // Ignore if audio fails

    // Clear previous dice
    dicesRef.current.forEach((die) => {
      sceneRef.current?.remove(die.mesh);
      worldRef.current?.removeBody(die.body);
    });
    dicesRef.current = [];

    // Parse notation (e.g., "2d6")
    const match = diceNotation.match(/(\d+)d(\d+)/);
    const numDice = match ? parseInt(match[1], 10) : 2;

    const scale = 150; // Increased from 100 for better visibility
    const w = containerRef.current?.clientWidth || 500;
    const h = containerRef.current?.clientHeight || 300;

    // Create dice with random throw - expanded area
    for (let i = 0; i < numDice; i += 1) {
      const position = new CANNON.Vec3(
        (Math.random() - 0.5) * w * 0.8, // Increased from 0.5 to 0.8
        (Math.random() - 0.5) * h * 0.8, // Increased from 0.5 to 0.8
        300 + i * 50
      );

      const rotation = new CANNON.Quaternion();
      rotation.setFromEuler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      const die = createDie(scale, position, rotation);
      if (die) {
        // Apply throw force
        const force = new CANNON.Vec3(
          (Math.random() - 0.5) * w * 100,
          (Math.random() - 0.5) * h * 100,
          -3000
        );
        die.body.applyImpulse(force, new CANNON.Vec3(0, 0, 0));

        // Apply random torque
        die.body.angularVelocity.set(
          Math.random() * 40 - 20,
          Math.random() * 40 - 20,
          Math.random() * 40 - 20
        );

        dicesRef.current.push(die);
      }
    }

    // Animation loop
    let lastTime = Date.now();
    const frameRate = 1 / 60;
    let stableCounter = 0;

    const animate = () => {
      if (!worldRef.current || !sceneRef.current || !rendererRef.current || !cameraRef.current)
        return;

      const currentTime = Date.now();
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      worldRef.current.step(frameRate);

      // Update mesh positions from physics
      let allStable = true;
      dicesRef.current.forEach((die) => {
        die.mesh.position.copy(die.body.position as any);
        die.mesh.quaternion.copy(die.body.quaternion as any);

        // Check if die is stable (same as original dice.js)
        const e = 6;
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
          if (!die.dice_stopped) {
            die.dice_stopped = stableCounter;
          } else if (stableCounter - die.dice_stopped <= 3) {
            allStable = false;
          }
        } else {
          die.dice_stopped = undefined;
          allStable = false;
        }
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);

      if (allStable) {
        stableCounter += 1;
        if (stableCounter > 60) {
          // Dice have settled (wait longer for stability)
          const results: DiceResult[] = dicesRef.current.map((die) => {
            // Determine which face is up by checking quaternion
            const upVector = new THREE.Vector3(0, 0, 1);
            upVector.applyQuaternion(die.mesh.quaternion);

            // Find which axis is most aligned with up
            const absX = Math.abs(upVector.x);
            const absY = Math.abs(upVector.y);
            const absZ = Math.abs(upVector.z);

            let value = 1;
            if (absZ > absX && absZ > absY) {
              value = upVector.z > 0 ? 1 : 6;
            } else if (absY > absX) {
              value = upVector.y > 0 ? 2 : 5;
            } else {
              value = upVector.x > 0 ? 3 : 4;
            }

            return { value, type: 'd6' };
          });

          setIsRolling(false);
          onRollComplete?.(results);
          return;
        }
      } else {
        stableCounter = 0;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: 1,
        height: 400,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.neutral',
      }}
    >
      <Box ref={containerRef} sx={{ width: 1, height: 1 }} />

      {!isRolling && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Box
            component="button"
            onClick={rollDice}
            sx={{
              px: 3,
              py: 1.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 1,
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Roll Dice
          </Box>
        </Box>
      )}
    </Box>
  );
}
