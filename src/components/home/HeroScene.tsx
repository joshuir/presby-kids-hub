"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Playful three.js hero background: floating 3D stars, bubbles and a cloud that drift
 * gently and follow the pointer. Pauses when off-screen; static for reduced motion.
 */
export default function HeroScene({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 14);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1d4ed8, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 6, 8);
    scene.add(key);

    // --- star geometry (extruded) ---
    const starShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 1 : 0.45;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 3 });
    starGeo.center();

    const mats = {
      sun: new THREE.MeshStandardMaterial({ color: 0xffc83d, roughness: 0.35, metalness: 0.1 }),
      white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
      sky: new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.3 }),
      bubble: new THREE.MeshPhysicalMaterial({ color: 0xbfdbfe, roughness: 0.05, transmission: 0.6, thickness: 0.8, transparent: true, opacity: 0.85 }),
    };

    type Floater = { mesh: THREE.Object3D; base: THREE.Vector3; speed: number; phase: number; spin: THREE.Vector3 };
    const floaters: Floater[] = [];
    const add = (mesh: THREE.Object3D, x: number, y: number, z: number, s: number) => {
      mesh.position.set(x, y, z);
      mesh.scale.setScalar(s);
      scene.add(mesh);
      floaters.push({
        mesh,
        base: new THREE.Vector3(x, y, z),
        speed: 0.4 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        spin: new THREE.Vector3(Math.random() * 0.4, Math.random() * 0.6, Math.random() * 0.3),
      });
    };

    add(new THREE.Mesh(starGeo, mats.sun), 6.6, 3.4, -1, 0.85);
    add(new THREE.Mesh(starGeo, mats.white), 6.2, -1.8, -2, 0.7);
    add(new THREE.Mesh(starGeo, mats.sky), -5.5, 2.8, -3, 0.6);
    add(new THREE.Mesh(starGeo, mats.sun), -6.8, -2.6, -4, 0.5);
    add(new THREE.Mesh(starGeo, mats.white), 1.2, 4.2, -5, 0.45);

    const sphere = new THREE.SphereGeometry(1, 32, 32);
    add(new THREE.Mesh(sphere, mats.bubble), 7.6, 0.2, -1.5, 0.7);
    add(new THREE.Mesh(sphere, mats.bubble), -3.4, -3.0, -1.5, 0.55);
    add(new THREE.Mesh(sphere, mats.bubble), 2.4, -3.4, -2.5, 0.4);
    add(new THREE.Mesh(sphere, mats.bubble), -7.5, 0.6, -5, 0.6);

    // puffy cloud
    const cloud = new THREE.Group();
    [[0, 0, 0, 1], [1.1, 0.25, 0, 0.8], [-1.1, 0.1, 0, 0.75], [0.4, 0.75, 0, 0.7], [-0.5, 0.6, 0, 0.6]].forEach(([x, y, z, r]) => {
      const m = new THREE.Mesh(sphere, mats.white);
      m.position.set(x, y, z);
      m.scale.setScalar(r);
      cloud.add(m);
    });
    add(cloud, 2.4, 4.6, -4.5, 0.7);

    const pointer = new THREE.Vector2();
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep shapes framed on narrow screens
      camera.position.z = w < 640 ? 19 : 14;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = (performance.now() - t0) / 1000;
      for (const f of floaters) {
        f.mesh.position.y = f.base.y + Math.sin(t * f.speed + f.phase) * 0.35;
        f.mesh.position.x = f.base.x + Math.cos(t * f.speed * 0.6 + f.phase) * 0.15;
        f.mesh.rotation.x += f.spin.x * 0.01;
        f.mesh.rotation.y += f.spin.y * 0.01;
      }
      camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (pointer.y * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    if (reduce) renderer.render(scene, camera);
    else tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      starGeo.dispose();
      sphere.dispose();
      Object.values(mats).forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className={className} />;
}
