import { useRef, useState, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame, useLoader, extend } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";
import { shaderMaterial, Html, useProgress } from "@react-three/drei";
import { Zap, Loader2, Server, ShieldCheck } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- Custom Shader for Pixelated Transition ---
const PixelPlanetMaterial = shaderMaterial(
  {
    uTexture1: new THREE.Texture(),
    uTexture2: new THREE.Texture(),
    uMix: 0,
    uPixels: 100.0
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
  // Fragment Shader
  `
    uniform sampler2D uTexture1;
    uniform sampler2D uTexture2;
    uniform float uMix;
    uniform float uPixels;
    varying vec2 vUv;

    void main() {
        vec4 c1 = texture2D(uTexture1, vUv);
        vec4 c2 = texture2D(uTexture2, vUv);
        gl_FragColor = mix(c1, c2, uMix); 
    }
    `
);

extend({ PixelPlanetMaterial });

function RotatingEarth({ onColorChange }) {
  const groupRef = useRef();
  const materialRef = useRef();

  const [moon, mars, jupiter, venus] = useLoader(
    THREE.TextureLoader,
    [
      `${API}/assets/planets/moon.jpg`,
      `${API}/assets/planets/mars.jpg`,
      `${API}/assets/planets/jupyter.jpg`,
      `${API}/assets/planets/venus.jpg`
    ],
    (loader) => {
      loader.setCrossOrigin("anonymous");
    }
  );

  const textures = useMemo(() => [moon, mars, jupiter, venus], [moon, mars, jupiter, venus]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      if (!transitioning) {
        setTransitioning(true);
        if (onColorChange) onColorChange(nextIndex);
      }
    }, 5000);

    return () => clearInterval(cycleInterval);
  }, [transitioning, nextIndex, onColorChange]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;

      groupRef.current.position.x = 0;
      groupRef.current.position.y = 0;
      groupRef.current.rotation.z = 0;
    }

    if (transitioning && materialRef.current) {
      materialRef.current.uMix += delta * 0.5;
      if (materialRef.current.uMix >= 1) {
        materialRef.current.uMix = 0;
        setTransitioning(false);

        const newCurrentIndex = nextIndex;
        const newNextIndex = (nextIndex + 1) % textures.length;

        materialRef.current.uTexture1 = textures[newCurrentIndex];
        materialRef.current.uTexture2 = textures[newNextIndex];

        setCurrentIndex(newCurrentIndex);
        setNextIndex(newNextIndex);
      }
    }
  });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uTexture1 = textures[currentIndex];
      materialRef.current.uTexture2 = textures[nextIndex];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group ref={groupRef} scale={3.5}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        {/* @ts-ignore */}
        <pixelPlanetMaterial ref={materialRef} uPixels={120} transparent />
      </mesh>
    </group>
  );
}

const LoadingScreen = ({ onLoaded }) => {
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      // Small delay for smooth transition
      const timer = setTimeout(() => onLoaded(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [progress, onLoaded]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        {/* Animated Icon */}
        <div className="mb-8 relative flex justify-center">
          <Zap className="text-neonBlue animate-pulse absolute opacity-20" size={80} />
          <Loader2 className="text-neonBlue animate-spin" size={80} strokeWidth={1} />
        </div>

        {/* Title */}
        <h2 className="text-white font-pixel text-xs tracking-[0.3em] mb-8 leading-relaxed">
          MISSION STARTUP INITIALIZED
        </h2>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-900 border border-slate-800 mb-4 overflow-hidden relative">
          <motion.div
            className="h-full bg-neonBlue shadow-[0_0_15px_rgba(34,211,238,0.8)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Details Tracking */}
        <div className="flex justify-between items-center font-mono text-[10px] text-slate-500 mb-12">
          <span className="flex items-center gap-2">
            <Server size={10} /> SYNCING TELEMETRY...
          </span>
          <span className="text-neonBlue font-bold">{Math.round(progress)}%</span>
        </div>

        {/* Systems Check */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-2 border text-[8px] font-pixel transition-colors ${progress > 25 ? 'border-neonBlue/50 text-neonBlue' : 'border-slate-800 text-slate-700'}`}>
            ORBITER: {progress > 25 ? 'READY' : 'WAIT'}
          </div>
          <div className={`p-2 border text-[8px] font-pixel transition-colors ${progress > 50 ? 'border-neonBlue/50 text-neonBlue' : 'border-slate-800 text-slate-700'}`}>
            FUEL: {progress > 50 ? 'READY' : 'WAIT'}
          </div>
          <div className={`p-2 border text-[8px] font-pixel transition-colors ${progress > 75 ? 'border-neonBlue/50 text-neonBlue' : 'border-slate-800 text-slate-700'}`}>
            DATA: {progress > 75 ? 'READY' : 'WAIT'}
          </div>
          <div className={`p-2 border text-[8px] font-pixel transition-colors ${progress === 100 ? 'border-neonBlue/50 text-neonBlue' : 'border-slate-800 text-slate-700'}`}>
            SYSTEM: {progress === 100 ? 'READY' : 'WAIT'}
          </div>
        </div>
      </div>
    </div>
  );
};

const Hero = ({ user, onEnterMission }) => {
  const [themeIndex, setThemeIndex] = useState(0);
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);

  const planetThemes = [
    { accent: "#22D3EE", glow: "rgba(34, 211, 238, 0.8)", name: "MOON BASE" },
    { accent: "#FF0055", glow: "rgba(255, 0, 85, 0.8)", name: "MARS COLONY" },
    { accent: "#A855F7", glow: "rgba(168, 85, 247, 0.8)", name: "JUPITER ORBIT" },
    { accent: "#FFD700", glow: "rgba(255, 215, 0, 0.8)", name: "VENUS STATION" }
  ];

  const activeTheme = planetThemes[themeIndex] || planetThemes[0];

  return (
    <section
      className={`relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center bg-transparent`}
    >
      {/* Font and Chaos CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', cursive; }
        
        .hud-shadow {
            text-shadow: 0 0 10px rgba(0,0,0,0.8);
        }
      `}</style>

      {/* Loading Sequence */}
      {!isAssetsLoaded && <LoadingScreen onLoaded={setIsAssetsLoaded} />}

      {/* 3D Background */}
      <div className={`absolute inset-0 z-0 flex items-center justify-center transition-opacity duration-1000 ${isAssetsLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Canvas>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 3, 5]} intensity={3.0} color="#ffffff" />
          <Suspense fallback={null}>
            <RotatingEarth onColorChange={setThemeIndex} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className={`relative z-10 flex flex-col items-center justify-center h-full w-full pointer-events-auto px-4 transition-all duration-1000 ${isAssetsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* HEADLINE */}
        <motion.h1
          className={`text-5xl md:text-8xl font-black text-white z-20 transition-all duration-[3000ms] ease-in-out`}
          style={{
            textShadow: `0 0 30px ${activeTheme.glow}, 0 0 60px ${activeTheme.glow}`,
            WebkitTextStroke: `1px ${activeTheme.accent}`,
            transform: `translate(0px, 0px) rotate(0deg)`
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          G Y A N Y A A N  1.0
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          className={`mt-6 text-xl md:text-2xl text-white tracking-[0.2em] font-bold z-20 uppercase hud-shadow transition-all duration-[3000ms] ease-in-out`}
          style={{
            borderBottom: `2px solid ${activeTheme.accent}`,
            paddingBottom: "10px",
            letterSpacing: "0.3em",
            transform: `translate(0px, 0px) rotate(0deg)`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          STATUS:{" "}
          <span
            style={{
              color: "white",
              textShadow: `0 0 20px ${activeTheme.accent}`,
              transition: "text-shadow 3s ease-in-out"
            }}
          >
            {activeTheme.name}
          </span>
        </motion.p>

        {/* BUTTON */}
        <motion.button
          className={`mt-12 px-12 py-5 bg-black/30 border text-xl font-bold uppercase tracking-widest transition-all duration-[3000ms] z-20 backdrop-blur-xl`}
          style={{
            borderColor: activeTheme.accent,
            color: "white",
            boxShadow: `0 0 20px ${activeTheme.glow}, inset 0 0 10px ${activeTheme.glow}`,
            transform: `translate(0px, 0px) rotate(0deg)`,
            transition: "all 3000ms"
          }}
          whileHover={{
            backgroundColor: activeTheme.accent,
            color: "#000",
            boxShadow: `0 0 60px ${activeTheme.accent}, 0 0 30px ${activeTheme.accent}`,
            scale: 1.05
          }}
          onClick={() => {
            onEnterMission();
          }}
        >
          {user ? "ENTER COCKPIT" : "START ENGINE"}
        </motion.button>
      </div>

      {/* Bottom Fade Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black via-black/60 to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default Hero;
