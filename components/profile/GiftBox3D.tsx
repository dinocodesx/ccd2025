"use client"
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { Badge } from "../ui/Badge";
import { RoundedBoxGeometry } from 'three-stdlib';
import { useTheme } from 'next-themes';

interface GiftBox3DProps {
  size: number;
  color: number;
  ribbonColor: number;
  type: string;
}

const GiftBox3D: React.FC<GiftBox3DProps> = ({ size, color, ribbonColor, type }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = size * 2.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 2.5));
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.0);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(3, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(-5, -5, -10);
    scene.add(rimLight);

    // --- Model Creation ---
    let model;
    if (type === 'gold') {
      model = createMajesticGiftBox(size, color, ribbonColor);
    } else if (type === 'regular') {
      model = createShoppingBag(size, color, ribbonColor);
    } else {
      model = createGiftBox(size, color, ribbonColor);
    }
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });
    scene.add(model);

    // --- Shadow Plane (Theme-aware) ---
    const shadowColor = resolvedTheme === 'dark' ? 0x888888 : 0x000000;
    const shadowOpacity = resolvedTheme === 'dark' ? 0.3 : 0.15;

    const shadowPlaneGeom = new THREE.PlaneGeometry(size * 3, size * 3);
    const shadowPlaneMat = new THREE.ShadowMaterial({ 
      color: shadowColor,
      opacity: shadowOpacity
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -size * 0.7;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // --- Animation ---
    const initialRotation = new THREE.Euler(0.25, -0.5, 0);
    model.rotation.copy(initialRotation);
    
    model.scale.set(0, 0, 0);
    const targetScale = new THREE.Vector3(1, 1, 1);
    
    const clock = new THREE.Clock();

    let frameId: number;
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      model.scale.lerp(targetScale, 0.08);
      model.position.y = Math.sin(elapsedTime * 2) * size * 0.05;
      model.rotation.y = initialRotation.y + Math.cos(elapsedTime * 1.5) * 0.2;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(frameId);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size, color, ribbonColor, type, resolvedTheme]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        ref={mountRef}
        style={{ width: "100px", height: "100px", cursor: "pointer" }}
        tabIndex={0}
        aria-label="3D animated icon"
      />
      <Badge variant={"outline"} className="inline-block lg:hidden font-semibold capitalize text-xs">{type} Schwags Kit</Badge>
    </div>
  );
};


// --- Model Creation Functions ---

function createGiftBox(size: number, boxColor: number, ribbonColor: number) {
  // Unchanged...
  const group = new THREE.Group();
  const boxGeom = new THREE.BoxGeometry(size, size, size, 10, 10, 10);
  const boxMat = new THREE.MeshStandardMaterial({ color: boxColor, roughness: 0.4, metalness: 0.1 });
  const box = new THREE.Mesh(boxGeom, boxMat);
  group.add(box);
  const ribbonMaterial = new THREE.MeshStandardMaterial({ color: ribbonColor, metalness: 0.1, roughness: 0.6 });
  const ribbonWidth = size * 0.2;
  const ribbonOffset = size * 1.05;
  const ribbonSegments = 4;
  const horizontalGeom = new THREE.BoxGeometry(ribbonOffset, ribbonWidth, ribbonOffset, ribbonSegments, ribbonSegments, ribbonSegments);
  const horizontalRibbon = new THREE.Mesh(horizontalGeom, ribbonMaterial);
  group.add(horizontalRibbon);
  const verticalGeom = new THREE.BoxGeometry(ribbonWidth, ribbonOffset, ribbonOffset, ribbonSegments, ribbonSegments, ribbonSegments);
  const verticalRibbon = new THREE.Mesh(verticalGeom, ribbonMaterial);
  group.add(verticalRibbon);
  const bowTieGroup = new THREE.Group();
  const knotGeom = new THREE.SphereGeometry(ribbonWidth * 0.7, 32, 32);
  const knot = new THREE.Mesh(knotGeom, ribbonMaterial);
  const loopSize = ribbonWidth * 1.5;
  const loopGeom = new THREE.TorusGeometry(loopSize * 0.6, ribbonWidth * 0.25, 32, 100);
  const leftLoop = new THREE.Mesh(loopGeom, ribbonMaterial);
  leftLoop.position.x = -loopSize * 0.6;
  leftLoop.rotation.y = Math.PI / 2;
  leftLoop.rotation.z = -Math.PI / 6;
  const rightLoop = new THREE.Mesh(loopGeom, ribbonMaterial);
  rightLoop.position.x = loopSize * 0.6;
  rightLoop.rotation.y = -Math.PI / 2;
  rightLoop.rotation.z = -Math.PI / 6;
  bowTieGroup.add(knot, leftLoop, rightLoop);
  bowTieGroup.position.y = (size / 2) + ribbonWidth * 0.3;
  group.add(bowTieGroup);
  return group;
}

function createMajesticGiftBox(size: number, boxColor: number, ribbonColor: number) {
  // Unchanged...
  const group = new THREE.Group();
  const boxWidth = size * 1.4;
  const boxHeight = size * 0.9;
  const boxDepth = size * 1.1;
  const borderRadius = size * 0.05;
  
  const boxGeom = new RoundedBoxGeometry(boxWidth, boxHeight, boxDepth, 5, borderRadius);
  const boxMat = new THREE.MeshStandardMaterial({
      color: boxColor,
      metalness: 0.6,
      roughness: 0.2,
      // @ts-expect-error: 'clearcoat' may not exist on older @types/three versions
      clearcoat: 1.0,

      clearcoatRoughness: 0.1,
  });
  const box = new THREE.Mesh(boxGeom, boxMat);
  group.add(box);

  const ribbonMaterial = new THREE.MeshStandardMaterial({
      color: ribbonColor,
      metalness: 0.2,
      roughness: 0.5,
  });
  const ribbonWidth = size * 0.22;
  const horizontalGeom = new THREE.BoxGeometry(boxWidth * 1.01, ribbonWidth, boxDepth * 1.01);
  const horizontalRibbon = new THREE.Mesh(horizontalGeom, ribbonMaterial);
  group.add(horizontalRibbon);
  
  const verticalGeom = new THREE.BoxGeometry(ribbonWidth, boxHeight * 1.01, boxDepth * 1.01);
  const verticalRibbon = new THREE.Mesh(verticalGeom, ribbonMaterial);
  group.add(verticalRibbon);
  
  const bowTieGroup = new THREE.Group();
  const knotGeom = new THREE.SphereGeometry(ribbonWidth * 0.8, 32, 32);
  const knot = new THREE.Mesh(knotGeom, ribbonMaterial);
  
  const loopSize = ribbonWidth * 2;
  const loopGeom = new THREE.TorusGeometry(loopSize * 0.6, ribbonWidth * 0.3, 32, 100);
  const leftLoop = new THREE.Mesh(loopGeom, ribbonMaterial);
  leftLoop.position.x = -loopSize * 0.65;
  leftLoop.rotation.y = Math.PI / 2;
  leftLoop.rotation.z = -Math.PI / 8;
  
  const rightLoop = new THREE.Mesh(loopGeom, ribbonMaterial);
  rightLoop.position.x = loopSize * 0.65;
  rightLoop.rotation.y = -Math.PI / 2;
  rightLoop.rotation.z = -Math.PI / 8;
  
  bowTieGroup.add(knot, leftLoop, rightLoop);
  bowTieGroup.position.y = (boxHeight / 2) + ribbonWidth * 0.2;
  group.add(bowTieGroup);
  
  return group;
}

function createShoppingBag(size: number, bagColor: number, handleColor: number) {
    const group = new THREE.Group();
    // Adjusted dimensions for a wider look
    const bagWidth = size * 1.2;
    const bagHeight = size * 0.9;
    const bagDepth = size * 0.5;

    const shape = new THREE.Shape();
    shape.moveTo(-bagWidth / 2, -bagHeight / 2);
    shape.lineTo(bagWidth / 2, -bagHeight / 2);
    shape.lineTo(bagWidth / 2 - bagWidth * 0.1, bagHeight / 2);
    shape.lineTo(-bagWidth / 2 + bagWidth * 0.1, bagHeight / 2);
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: bagDepth,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelOffset: -0.02,
      bevelSegments: 3,
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: bagColor,
      roughness: 0.8,
      metalness: 0.0,
    });
    const bag = new THREE.Mesh(geometry, material);
    group.add(bag);

    const handleMaterial = new THREE.MeshStandardMaterial({
      color: handleColor,
      roughness: 0.4,
      metalness: 0.1,
    });
    const handleRadius = size * 0.025;
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-bagWidth * 0.2, bagHeight * 0.4, 0),
      new THREE.Vector3(-bagWidth * 0.15, bagHeight * 0.7, 0),
      new THREE.Vector3(0, bagHeight * 0.8, 0),
      new THREE.Vector3(bagWidth * 0.15, bagHeight * 0.7, 0),
      new THREE.Vector3(bagWidth * 0.2, bagHeight * 0.4, 0),
    ]);
    const handleGeometry = new THREE.TubeGeometry(
      handleCurve,
      20,
      handleRadius,
      8,
      false
    );

    const handle1 = new THREE.Mesh(handleGeometry, handleMaterial);
    handle1.position.z = bagDepth / 2 + handleRadius;
    group.add(handle1);

    const handle2 = new THREE.Mesh(handleGeometry, handleMaterial);
    handle2.position.z = -(bagDepth / 2 + handleRadius);
    group.add(handle2);
    return group;
}

export default GiftBox3D;