"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import type { ProductDoc } from "@/lib/cms/types";
import { paintGarment } from "./garmentCanvas";

type Props = {
  products: ProductDoc[];
  index: number;
  colorIdx: number;
  side: "front" | "back";
  shuffleSeq: number;
  onSelect: (i: number) => void;
};

const SPACING = 1.25;
const GW = 1.5; // garment width (world units)
const GH = GW * (460 / 400);

type Slot = {
  pivot: THREE.Group; // hangs from the rail, sways
  turn: THREE.Group; // rotates to face camera / flip front-back
  front: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  back: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  frontCanvas: HTMLCanvasElement;
  backCanvas: HTMLCanvasElement;
  colorKey: string;
  phase: number;
};

/** Bends a plane slightly so the garment reads as fabric rather than a card. */
function clothGeometry() {
  const g = new THREE.PlaneGeometry(GW, GH, 16, 16);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = -0.12 * (x / (GW / 2)) ** 2 + 0.03 * Math.sin((y + GH) * 5) * (1 - (y + GH / 2) / GH);
    p.setZ(i, z);
  }
  g.computeVertexNormals();
  g.translate(0, -GH / 2 - 0.12, 0);
  return g;
}

/**
 * A three.js clothing rack: every product hangs on a rail. The selected item swings to the
 * front; clicking or dragging picks another. Colour tags, front/back and shuffle in the
 * showcase below stay in sync with the rack.
 */
export default function ClothingRack3D({ products, index, colorIdx, side, shuffleSeq, onSelect }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{
    focus: (i: number, instant?: boolean) => void;
    recolor: (i: number, ci: number) => void;
    flip: (i: number, s: "front" | "back") => void;
    spin: () => void;
  } | null>(null);
  const onSelectRef = useRef(onSelect);
  const state = useRef({ index, colorIdx, side });
  useEffect(() => {
    onSelectRef.current = onSelect;
    state.current = { index, colorIdx, side };
  });

  useEffect(() => {
    const el = host.current;
    if (!el || !products.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const D = (s: number) => (reduce ? 0 : s);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.touchAction = "pan-y";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b4a8, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2, 4, 6);
    scene.add(key);

    const metal = new THREE.MeshStandardMaterial({ color: 0x2b2b30, metalness: 0.8, roughness: 0.35 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x9a6b43, roughness: 0.7 });
    const geos: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [metal, wood];
    const track = <T extends THREE.BufferGeometry>(g: T) => (geos.push(g), g);

    // --- rack frame (rail + poles + feet) ---
    const rack = new THREE.Group();
    scene.add(rack);
    const railLen = Math.max(7, (products.length - 1) * SPACING + 4.4);
    const rail = new THREE.Mesh(track(new THREE.CylinderGeometry(0.035, 0.035, railLen, 16)), metal);
    rail.rotation.z = Math.PI / 2;
    rail.position.set(((products.length - 1) * SPACING) / 2, 0, 0);
    rack.add(rail);
    const poleGeo = track(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 16));
    const footGeo = track(new THREE.BoxGeometry(0.12, 0.06, 1.1));
    [-1, 1].forEach((s) => {
      const x = rail.position.x + (s * railLen) / 2;
      const pole = new THREE.Mesh(poleGeo, metal);
      pole.position.set(x, -1.7, 0);
      rack.add(pole);
      const foot = new THREE.Mesh(footGeo, metal);
      foot.position.set(x, -3.4, 0);
      rack.add(foot);
    });

    // floor shadow
    const sh = document.createElement("canvas");
    sh.width = sh.height = 128;
    const sctx = sh.getContext("2d")!;
    const rg = sctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    rg.addColorStop(0, "rgba(0,0,0,.22)");
    rg.addColorStop(1, "rgba(0,0,0,0)");
    sctx.fillStyle = rg;
    sctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(sh);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    mats.push(shadowMat);
    const shadowGeo = track(new THREE.PlaneGeometry(1.6, 0.5));

    // --- hangers + garments ---
    const cloth = track(clothGeometry());
    const hookGeo = track(new THREE.TorusGeometry(0.09, 0.012, 8, 24, Math.PI * 1.4));
    const neckGeo = track(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8));
    const shoulderGeo = track(new THREE.CylinderGeometry(0.03, 0.022, GW * 0.62, 12));

    const slots: Slot[] = products.map((p, i) => {
      const pivot = new THREE.Group();
      pivot.position.set(i * SPACING, 0, 0);
      rack.add(pivot);
      const hook = new THREE.Mesh(hookGeo, metal);
      hook.position.set(0, 0.04, 0);
      hook.rotation.z = -Math.PI * 0.2;
      pivot.add(hook);
      const turn = new THREE.Group();
      pivot.add(turn);
      const neck = new THREE.Mesh(neckGeo, metal);
      neck.position.y = -0.08;
      turn.add(neck);
      [-1, 1].forEach((s) => {
        const arm = new THREE.Mesh(shoulderGeo, wood);
        arm.rotation.z = s * (Math.PI / 2 - 0.42);
        arm.position.set(s * GW * 0.27, -0.26, 0.01);
        turn.add(arm);
      });

      const frontCanvas = document.createElement("canvas");
      const backCanvas = document.createElement("canvas");
      const mk = (c: HTMLCanvasElement) => {
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.05, roughness: 0.92, side: THREE.FrontSide });
        mats.push(m);
        return m;
      };
      const front = new THREE.Mesh(cloth, mk(frontCanvas));
      const back = new THREE.Mesh(cloth, mk(backCanvas));
      back.rotation.y = Math.PI;
      front.userData.slot = back.userData.slot = i;
      turn.add(front, back);

      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(i * SPACING, -3.42, 0.1);
      rack.add(shadow);

      return { pivot, turn, front, back, frontCanvas, backCanvas, colorKey: "", phase: Math.random() * Math.PI * 2 };
    });

    const paint = async (i: number, ci: number) => {
      const s = slots[i];
      const p = products[i];
      const cw = p.colorways[ci] ?? p.colorways[0];
      const key = `${ci}:${cw?.hex}`;
      if (s.colorKey === key) return;
      s.colorKey = key;
      await Promise.all([paintGarment(s.frontCanvas, p, cw, "front"), paintGarment(s.backCanvas, p, cw, "back")]);
      if (s.colorKey !== key) return;
      s.front.material.map!.needsUpdate = true;
      s.back.material.map!.needsUpdate = true;
    };
    const paintAll = () => slots.forEach((_, i) => paint(i, i === state.current.index ? state.current.colorIdx : 0));
    paintAll();
    // repaint once web fonts are ready so printed text uses Poppins
    document.fonts?.ready.then(() => {
      slots.forEach((s) => (s.colorKey = ""));
      paintAll();
    });

    // --- layout / focus ---
    let current = state.current.index;
    const focus = (i: number, instant = false) => {
      current = i;
      const dur = instant ? 0 : D(0.9);
      gsap.to(rack.position, { x: -i * SPACING, duration: dur, ease: "power3.out", overwrite: "auto" });
      slots.forEach((s, k) => {
        const d = k - i;
        const sel = d === 0;
        const flipped = sel && state.current.side === "back";
        gsap.to(s.turn.rotation, { y: sel ? (flipped ? Math.PI : 0) : Math.sign(d) * -1.05, duration: dur, ease: "power3.out", overwrite: "auto" });
        gsap.to(s.pivot.position, { z: sel ? 0.55 : -0.15 - Math.min(Math.abs(d), 3) * 0.08, duration: dur, ease: "power3.out", overwrite: "auto" });
        gsap.to(s.pivot.scale, { x: sel ? 1.08 : 0.9, y: sel ? 1.08 : 0.9, z: 1, duration: dur, ease: "power3.out", overwrite: "auto" });
      });
      // a little swing on the newly selected hanger
      if (!instant && !reduce) gsap.fromTo(slots[i].pivot.rotation, { z: 0.12 }, { z: 0, duration: 1.6, ease: "elastic.out(1, 0.3)", overwrite: "auto" });
    };
    focus(current, true);

    api.current = {
      focus,
      recolor: (i, ci) => {
        paint(i, ci);
        if (!reduce) gsap.fromTo(slots[i].pivot.rotation, { z: -0.06 }, { z: 0, duration: 1, ease: "elastic.out(1.2, 0.3)", overwrite: "auto" });
      },
      flip: (i, s) => void gsap.to(slots[i].turn.rotation, { y: s === "back" ? Math.PI : 0, duration: D(0.7), ease: "back.out(1.4)", overwrite: "auto" }),
      spin: () => {
        if (reduce) return;
        slots.forEach((s, k) => gsap.fromTo(s.pivot.rotation, { z: 0 }, { z: 0.18 * (k % 2 ? 1 : -1), duration: 0.12, yoyo: true, repeat: 5, ease: "sine.inOut" }));
      },
    };

    // --- sizing ---
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const narrow = w < 640;
      if (narrow) {
        camera.position.set(0, -1.0, 6.4);
        camera.lookAt(0, -1.25, 0);
      } else {
        camera.position.set(0, -1.35, 6.9);
        camera.lookAt(0, -1.7, 0);
      }
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // --- picking + drag ---
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = (cx: number, cy: number) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const h = ray.intersectObjects(slots.flatMap((s) => [s.front, s.back]), false)[0];
      return h ? (h.object.userData.slot as number) : null;
    };
    let downX: number | null = null;
    let startRackX = 0;
    let dragged = false;
    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      startRackX = rack.position.x;
      dragged = false;
    };
    const onMove = (e: PointerEvent) => {
      if (downX == null) {
        renderer.domElement.style.cursor = hit(e.clientX, e.clientY) != null ? "pointer" : "grab";
        return;
      }
      const dx = e.clientX - downX;
      if (Math.abs(dx) > 6) dragged = true;
      if (dragged && e.pointerType === "mouse") {
        gsap.killTweensOf(rack.position);
        rack.position.x = startRackX + dx * 0.01;
      }
    };
    const onUp = (e: PointerEvent) => {
      if (downX == null) return;
      const dx = e.clientX - downX;
      downX = null;
      if (!dragged) {
        const i = hit(e.clientX, e.clientY);
        if (i != null && i !== current) onSelectRef.current(i);
        return;
      }
      const target =
        e.pointerType === "mouse"
          ? Math.round(-rack.position.x / SPACING)
          : current + (Math.abs(dx) > 40 ? (dx < 0 ? 1 : -1) : 0);
      const i = Math.max(0, Math.min(products.length - 1, target));
      if (i !== current) onSelectRef.current(i);
      else focus(current);
    };
    const c = renderer.domElement;
    c.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    // --- loop ---
    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(el);
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = (performance.now() - t0) / 1000;
      if (!reduce) {
        slots.forEach((s, k) => {
          // gentle idle sway on top of any GSAP swing
          s.turn.rotation.z = Math.sin(t * 1.1 + s.phase) * (k === current ? 0.012 : 0.02);
        });
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      api.current = null;
      ro.disconnect();
      io.disconnect();
      c.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      gsap.killTweensOf([rack.position, ...slots.flatMap((s) => [s.turn.rotation, s.pivot.position, s.pivot.scale, s.pivot.rotation])]);
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => {
        (m as THREE.MeshStandardMaterial).map?.dispose();
        m.dispose();
      });
      renderer.dispose();
      c.remove();
    };
  }, [products]);

  // keep the rack in sync with the showcase
  useEffect(() => {
    api.current?.focus(index);
  }, [index]);
  useEffect(() => {
    api.current?.recolor(index, colorIdx);
  }, [index, colorIdx]);
  useEffect(() => {
    api.current?.flip(index, side);
  }, [side, index]);
  useEffect(() => {
    if (shuffleSeq) api.current?.spin();
  }, [shuffleSeq]);

  return <div ref={host} className="h-full w-full" />;
}
