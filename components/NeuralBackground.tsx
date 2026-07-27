"use client";

import { useEffect, useRef } from "react";

// Ported 1:1 from the original static site's inline script. Same node count,
// same link distance, same drift/rebound physics -- only the wrapper changed
// (React lifecycle instead of a raw <script> tag) so the look is identical.
export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf = 0;
    let cleanup = () => {};

    import("three").then((THREE) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const NODE_COUNT = 140;
      const NODE_RANGE = 620;
      const LINK_DIST = 95;
      let mouseX = 0,
        mouseY = 0;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
      camera.position.z = 420;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      const positions: number[] = [];
      const velocities: number[] = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        positions.push(
          (Math.random() - 0.5) * NODE_RANGE,
          (Math.random() - 0.5) * NODE_RANGE * 0.7,
          (Math.random() - 0.5) * NODE_RANGE * 0.6
        );
        velocities.push((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: 0x9d8cff,
        size: 3.2,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(geo, mat);
      scene.add(particles);

      const lineGeo = new THREE.BufferGeometry();
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x3fd9ff,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
      });
      const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lineMesh);

      function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      function onMouseMove(e: MouseEvent) {
        mouseX = e.clientX / window.innerWidth - 0.5;
        mouseY = e.clientY / window.innerHeight - 0.5;
      }
      window.addEventListener("resize", onResize);
      window.addEventListener("mousemove", onMouseMove);

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function animate() {
        raf = requestAnimationFrame(animate);
        const posAttr = particles.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;

        if (!reduceMotion) {
          for (let i = 0; i < NODE_COUNT; i++) {
            const ix = i * 3;
            arr[ix] += velocities[ix];
            arr[ix + 1] += velocities[ix + 1];
            arr[ix + 2] += velocities[ix + 2];
            if (Math.abs(arr[ix]) > NODE_RANGE / 2) velocities[ix] *= -1;
            if (Math.abs(arr[ix + 1]) > NODE_RANGE * 0.35) velocities[ix + 1] *= -1;
            if (Math.abs(arr[ix + 2]) > NODE_RANGE * 0.3) velocities[ix + 2] *= -1;
          }
          posAttr.needsUpdate = true;
        }

        const linePositions: number[] = [];
        for (let i = 0; i < NODE_COUNT; i++) {
          for (let j = i + 1; j < NODE_COUNT; j++) {
            const dx = arr[i * 3] - arr[j * 3];
            const dy = arr[i * 3 + 1] - arr[j * 3 + 1];
            const dz = arr[i * 3 + 2] - arr[j * 3 + 2];
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (d < LINK_DIST) {
              linePositions.push(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2], arr[j * 3], arr[j * 3 + 1], arr[j * 3 + 2]);
            }
          }
        }
        lineMesh.geometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));

        camera.position.x += (mouseX * 80 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 60 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);
        if (!reduceMotion) {
          particles.rotation.y += 0.0006;
          lineMesh.rotation.y += 0.0006;
        }

        renderer.render(scene, camera);
      }
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", onMouseMove);
        renderer.dispose();
      };
    });

    return () => cleanup();
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 h-full w-full" aria-hidden="true" />;
}
