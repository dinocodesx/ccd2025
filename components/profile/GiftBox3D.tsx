"use client"
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Badge } from "../ui/Badge";
import { RoundedBoxGeometry } from 'three-stdlib';
import { useTheme } from 'next-themes';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/Tooltip";
import Confetti from 'react-confetti';
import KitInfoJson from '@/public/content/kits.json'
import CongratulatoryDialog from "./CongratulatoryDialog";
import FeatureRule from '@/public/content/feature.rule.json'

interface GiftBox3DProps {
  size: number;
  color: number;
  ribbonColor: number;
  type: string;
}

const GiftBox3D: React.FC<GiftBox3DProps> = ({ size, color, ribbonColor, type }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  let easterCount = 9999999999;
  if (FeatureRule.profile.showEasterEgg) {
    const min = FeatureRule.profile.easterCountMin || 1;
    const max = FeatureRule.profile.easterCountMax || min;
    easterCount = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  const [isEasterEggVisible, setEasterEggVisible] = useState(false);
  const clickCount = useRef(0);

  const animationState = useRef({
    isAnimating: false,
    startTime: 0,
    type: 'bounce'
  });

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
    } else if (type === 'volunteer') {
      model = createMajesticGiftBox(size, color, ribbonColor);
    } else {
      model = createGiftBox(size, color, ribbonColor);
    }

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });
    scene.add(model);

    // --- Shadow Plane ---
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
    const initialPosition = new THREE.Vector3(0, 0, 0);
    model.position.copy(initialPosition);

    model.scale.set(0, 0, 0);
    const targetScale = new THREE.Vector3(1, 1, 1);

    const clock = new THREE.Clock();

    let frameId: number;
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (!animationState.current.isAnimating) {
        model.scale.lerp(targetScale, 0.08);
      }

      let baseRotationY = initialRotation.y + Math.cos(elapsedTime * 1.5) * 0.2;
      let basePositionY = initialPosition.y + Math.sin(elapsedTime * 2) * size * 0.05;

      if (animationState.current.isAnimating) {
        const timeSinceClick = elapsedTime - animationState.current.startTime;

        switch (animationState.current.type) {
          case 'bounce': {
            const duration = 1.5;
            if (timeSinceClick < duration) {
              const progress = timeSinceClick / duration;
              const bounceAmount = Math.exp(-progress * 4) * Math.sin(progress * 20);
              model.scale.set(1 - bounceAmount * 0.2, 1 + bounceAmount * 0.3, 1 - bounceAmount * 0.2);
            } else {
              animationState.current.isAnimating = false;
              model.scale.copy(targetScale);
            }
            break;
          }
          case 'spin': {
            const duration = 1.0;
            if (timeSinceClick < duration) {
              const progress = timeSinceClick / duration;
              const easeProgress = 0.5 * (1 - Math.cos(Math.PI * progress));
              model.rotation.y = baseRotationY + easeProgress * Math.PI * 2;
            } else {
              animationState.current.isAnimating = false;
            }
            break;
          }
          case 'jiggle': {
            const duration = 1.0;
            if (timeSinceClick < duration) {
              const progress = timeSinceClick / duration;
              const jiggleAmount = Math.exp(-progress * 5) * Math.sin(progress * 30);
              model.rotation.z = jiggleAmount * 0.4;
            } else {
              animationState.current.isAnimating = false;
              model.rotation.z = 0;
            }
            break;
          }
          case 'flip': {
            const duration = 1.2;
            if (timeSinceClick < duration) {
              const progress = timeSinceClick / duration;
              const easeProgress = 0.5 * (1 - Math.cos(Math.PI * progress));
              model.rotation.x = initialRotation.x + easeProgress * Math.PI * 2;
            } else {
              animationState.current.isAnimating = false;
            }
            break;
          }
          case 'launch': {
            const totalDuration = 2.5;
            if (timeSinceClick < totalDuration) {
                const shakeEnd = 0.4;
                const launchEnd = 1.2;
                const fallEnd = 1.8;
                
                // Phase 1: Pre-launch shake
                if (timeSinceClick < shakeEnd) {
                    model.position.x = initialPosition.x + (Math.random() - 0.5) * size * 0.1;
                    model.position.z = initialPosition.z + (Math.random() - 0.5) * size * 0.1;
                } 
                // Phase 2 & 3: Launch and Fall
                else if (timeSinceClick < fallEnd) {
                    const flightProgress = (timeSinceClick - shakeEnd) / (fallEnd - shakeEnd);
                    // Using a parabola (-x^2 + 1) to go up and come down smoothly
                    const launchHeight = -4 * (flightProgress * flightProgress - flightProgress);
                    model.position.y = basePositionY + launchHeight * size * 2.5; // Reduced height
                    shadowPlane.material.opacity = shadowOpacity * (1 - launchHeight);
                }
                // Phase 4: Landing Ripples
                else {
                    const rippleProgress = (timeSinceClick - fallEnd) / (totalDuration - fallEnd);
                    const rippleAmount = Math.exp(-rippleProgress * 5) * Math.sin(rippleProgress * 30);
                    model.scale.x = 1 + rippleAmount * 0.2;
                    model.scale.z = 1 + rippleAmount * 0.2;
                }

            } else {
                animationState.current.isAnimating = false;
                model.position.copy(initialPosition);
                model.scale.copy(targetScale);
                shadowPlane.material.opacity = shadowOpacity;
            }
            break;
          }
        }
      } 
      
      if (!animationState.current.isAnimating) {
        // Apply base animations if no click animation is active
        model.rotation.x = initialRotation.x;
        model.rotation.z = 0; // Ensure z rotation is reset
        model.rotation.y = baseRotationY;
        model.position.y = basePositionY;
        model.position.x = initialPosition.x;
        model.position.z = initialPosition.z;
        shadowPlane.material.opacity = shadowOpacity;
        model.visible = true;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const animationTypes = ['bounce', 'spin', 'jiggle', 'flip', 'launch'];
    const handleClick = () => {
      clickCount.current += 1;
      if (clickCount.current === easterCount && FeatureRule.profile.showEasterEgg) {
        setEasterEggVisible(true);
        clickCount.current = 0;
      }
      if (!animationState.current.isAnimating) {
        const randomIndex = Math.floor(Math.random() * animationTypes.length);
        animationState.current = {
          isAnimating: true,
          startTime: clock.getElapsedTime(),
          type: animationTypes[randomIndex]
        };
      }
    };
    mount.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(frameId);
      mount.removeEventListener('click', handleClick);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size, color, ribbonColor, type, resolvedTheme, easterCount]);

  return (
    <>
      {isEasterEggVisible && (
        <Confetti
          recycle={false}
          numberOfPieces={400}
          onConfettiComplete={(confetti) => {
            if (confetti) confetti.reset();
          }}
        />
      )}
      <CongratulatoryDialog open={isEasterEggVisible} setOpen={setEasterEggVisible} />
      <div className="flex flex-col items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              ref={mountRef}
              style={{ width: "100px", height: "100px", cursor: "pointer" }}
              tabIndex={0}
              aria-label="3D gift box"
            />
          </TooltipTrigger>
          <TooltipContent sideOffset={8} className="text-center">
            {KitInfoJson[type as keyof typeof KitInfoJson]?.description || "Schwag Kit"}
          </TooltipContent>
        </Tooltip>
        <Badge variant={"outline"} className="inline-block lg:hidden font-semibold capitalize text-xs">
          {KitInfoJson[type as keyof typeof KitInfoJson]?.label || `${type} Schwags Kit`}
        </Badge>
      </div>
    </>
  );
};


// --- Model Creation Functions (Unchanged) ---

function createGiftBox(size: number, boxColor: number, ribbonColor: number) {
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
  const group = new THREE.Group();
  const boxWidth = size * 1.4;
  const boxHeight = size * 0.9;
  const boxDepth = size * 1.1;
  const borderRadius = size * 0.05;

  const boxGeom = new RoundedBoxGeometry(boxWidth, boxHeight, boxDepth, 5, borderRadius);
  const boxMat = new THREE.MeshStandardMaterial({
    color: boxColor,
    metalness: 0.4,
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