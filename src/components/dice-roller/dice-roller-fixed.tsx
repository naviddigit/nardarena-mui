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
  const boxRef = useRef<any>(null);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (!containerRef.current || boxRef.current) return;

    console.log('🎲 Initializing dice box...');
    const container = containerRef.current;
    
    // Create dice box (exactly like original)
    const box: any = {
      dices: [],
      scene: new THREE.Scene(),
      world: new CANNON.World(),
      container,
      iteration: 0,
      running: false,
      last_time: 0,
    };

    // Renderer
    box.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    container.appendChild(box.renderer.domElement);
    box.renderer.shadowMap.enabled = true;
    box.renderer.shadowMap.type = THREE.PCFShadowMap;
    box.renderer.setClearColor(0xffffff, 0);

    // Init dimensions
    const reinit = () => {
      box.cw = container.clientWidth / 2;
      box.ch = container.clientHeight / 2;
      box.w = box.cw;
      box.h = box.ch;
      box.aspect = Math.min(box.cw / box.w, box.ch / box.h);
      box.scale = Math.sqrt(box.w * box.w + box.h * box.h) / 8;
      box.renderer.setSize(box.cw * 2, box.ch * 2);

      const wh = box.ch * box.aspect / Math.tan(10 * Math.PI / 180 / 2);
      box.camera = new THREE.PerspectiveCamera(20, box.cw / box.ch, 1, wh * 1.3);
      box.camera.position.z = wh;
    };
    reinit();

    console.log('🎲 Dimensions:', { cw: box.cw, ch: box.ch, w: box.w, h: box.h, scale: box.scale });

    // Gravity and physics
    box.world.gravity.set(0, 0, -9.8 * 800);
    box.world.broadphase = new CANNON.NaiveBroadphase();
    box.world.solver.iterations = 16;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xf0f0f0);
    box.scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xefefef, 2.5);
    spotLight.position.set(-box.w, box.h, box.w * 3);
    spotLight.target.position.set(0, 0, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = box.w / 10;
    spotLight.shadow.camera.far = box.w * 5;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    box.scene.add(spotLight);

    // Materials
    box.dice_body_material = new CANNON.Material();
    const desk_body_material = new CANNON.Material();
    const barrier_body_material = new CANNON.Material();

    box.world.addContactMaterial(
      new CANNON.ContactMaterial(desk_body_material, box.dice_body_material, {
        friction: 0.01,
        restitution: 0.5,
      })
    );
    box.world.addContactMaterial(
      new CANNON.ContactMaterial(barrier_body_material, box.dice_body_material, {
        friction: 0,
        restitution: 1.0,
      })
    );
    box.world.addContactMaterial(
      new CANNON.ContactMaterial(box.dice_body_material, box.dice_body_material, {
        friction: 0,
        restitution: 0.5,
      })
    );

    // Floor
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: desk_body_material,
    });
    box.world.addBody(floorBody);

    // Barriers
    let barrier: CANNON.Body;

    barrier = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: barrier_body_material });
    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    barrier.position.set(0, box.h * 0.93, 0);
    box.world.addBody(barrier);

    barrier = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: barrier_body_material });
    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    barrier.position.set(0, -box.h * 0.93, 0);
    box.world.addBody(barrier);

    barrier = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: barrier_body_material });
    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
    barrier.position.set(box.w * 0.93, 0, 0);
    box.world.addBody(barrier);

    barrier = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: barrier_body_material });
    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    barrier.position.set(-box.w * 0.93, 0, 0);
    box.world.addBody(barrier);

    // Create d6 die function
    box.create_d6 = () => {
      const size = box.scale * 0.9;
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshPhongMaterial({
        color: 0xf0f0f0,
        shininess: 40,
        flatShading: true,
      });
      const mesh: any = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;

      const body = new CANNON.Body({
        mass: 300,
        shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
        material: box.dice_body_material,
      });

      mesh.body = body;
      return mesh;
    };

    // Create dice
    box.create_dice = (type: string, pos: any, velocity: any, angle: any, axis: any) => {
      const dice = box.create_d6();
      dice.body.position.set(pos.x, pos.y, pos.z);
      dice.body.quaternion.setFromAxisAngle(new CANNON.Vec3(axis.x, axis.y, axis.z), axis.a * Math.PI * 2);
      dice.body.velocity.set(velocity.x, velocity.y, velocity.z);
      dice.body.angularVelocity.set(angle.x, angle.y, angle.z);
      dice.body.dice_stopped = undefined;
      box.scene.add(dice);
      box.world.addBody(dice.body);
      box.dices.push(dice);
    };

    // Check if throw finished - EXACTLY like original
    box.check_if_throw_finished = () => {
      let res = true;
      const e = 6;
      const frame_rate = 1 / 60;
      
      if (box.iteration < 10 / frame_rate) {
        for (let i = 0; i < box.dices.length; ++i) {
          const dice = box.dices[i];
          if (dice.body.dice_stopped === true) continue;
          
          const a = dice.body.angularVelocity;
          const v = dice.body.velocity;
          
          if (
            Math.abs(a.x) < e &&
            Math.abs(a.y) < e &&
            Math.abs(a.z) < e &&
            Math.abs(v.x) < e &&
            Math.abs(v.y) < e &&
            Math.abs(v.z) < e
          ) {
            if (dice.body.dice_stopped) {
              if (box.iteration - dice.body.dice_stopped > 3) {
                dice.body.dice_stopped = true;
                continue;
              }
            } else {
              dice.body.dice_stopped = box.iteration;
            }
            res = false;
          } else {
            dice.body.dice_stopped = undefined;
            res = false;
          }
        }
      }
      return res;
    };

    // Get dice values
    box.get_dice_values = () => {
      const values: number[] = [];
      for (let i = 0; i < box.dices.length; i++) {
        const dice = box.dices[i];
        const quaternion = dice.quaternion;
        
        const upVector = new THREE.Vector3(0, 0, 1);
        upVector.applyQuaternion(quaternion);

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
        values.push(value);
      }
      return values;
    };

    // Animation loop - EXACTLY like original
    box.__animate = (threadid: number) => {
      const time = new Date().getTime();
      const time_diff = (time - box.last_time) / 1000;
      const frame_rate = 1 / 60;
      
      ++box.iteration;
      box.world.step(frame_rate);

      for (let i = 0; i < box.scene.children.length; i++) {
        const interact = box.scene.children[i];
        if ((interact as any).body) {
          interact.position.copy((interact as any).body.position);
          interact.quaternion.copy((interact as any).body.quaternion);
        }
      }

      box.renderer.render(box.scene, box.camera);
      box.last_time = box.last_time ? time : new Date().getTime();

      if (box.running === threadid && box.check_if_throw_finished()) {
        box.running = false;
        const values = box.get_dice_values();
        console.log('🎲 Dice finished!', values);
        if (box.callback) box.callback(values);
      }

      if (box.running === threadid) {
        requestAnimationFrame(() => box.__animate(threadid));
      }
    };

    // Clear dices
    box.clear = () => {
      box.running = false;
      let dice;
      while ((dice = box.dices.pop())) {
        box.scene.remove(dice);
        if (dice.body) box.world.removeBody(dice.body);
      }
      box.renderer.render(box.scene, box.camera);
    };

    // Prepare and roll
    box.roll = (vectors: any[], callback: any) => {
      box.clear();
      box.iteration = 0;

      for (let i = 0; i < vectors.length; i++) {
        box.create_dice(vectors[i].set, vectors[i].pos, vectors[i].velocity, vectors[i].angle, vectors[i].axis);
      }

      box.callback = callback;
      box.running = new Date().getTime();
      box.last_time = 0;
      box.__animate(box.running);
    };

    // Initial render
    box.renderer.render(box.scene, box.camera);
    console.log('🎲 Initial render complete');

    // Add a test cube to see if anything renders
    const testGeometry = new THREE.BoxGeometry(50, 50, 50);
    const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(0, 0, 100);
    box.scene.add(testCube);
    box.renderer.render(box.scene, box.camera);
    console.log('🎲 Test cube added');

    boxRef.current = box;

    return () => {
      box.clear();
      if (container.contains(box.renderer.domElement)) {
        container.removeChild(box.renderer.domElement);
      }
    };
  }, []);

  const rollDice = () => {
    if (!boxRef.current || isRolling) return;

    console.log('🎲 Rolling dice:', diceNotation);
    setIsRolling(true);

    const box = boxRef.current;
    
    // Parse notation
    const match = diceNotation.match(/(\d+)d(\d+)/);
    if (!match) {
      setIsRolling(false);
      return;
    }

    const numDice = parseInt(match[1], 10);
    
    // Generate vectors (like original)
    const vectors: any[] = [];
    for (let i = 0; i < numDice; i++) {
      const vec = { x: Math.random() - 0.5, y: Math.random() - 0.5 };
      const pos = {
        x: box.w * (vec.x > 0 ? -1 : 1) * 0.9,
        y: box.h * (vec.y > 0 ? -1 : 1) * 0.9,
        z: Math.random() * 200 + 200,
      };
      const boost = 500;
      const velvec = { x: Math.random() - 0.5, y: Math.random() - 0.5 };
      const velocity = { x: velvec.x * boost, y: velvec.y * boost, z: -10 };
      const inertia = 13;
      const angle = {
        x: -(Math.random() * vec.y * 5 + inertia * vec.y),
        y: Math.random() * vec.x * 5 + inertia * vec.x,
        z: 0,
      };
      const axis = { x: Math.random(), y: Math.random(), z: Math.random(), a: Math.random() };
      vectors.push({ set: 'd6', pos, velocity, angle, axis });
    }

    // Roll!
    box.roll(vectors, (values: number[]) => {
      console.log('🎲 Roll complete:', values);
      const results: DiceResult[] = values.map((value) => ({ value, type: 'd6' }));
      setIsRolling(false);
      onRollComplete?.(results);
    });
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
