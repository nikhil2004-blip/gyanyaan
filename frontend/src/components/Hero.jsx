import { useRef, useState, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame, useLoader, extend } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";
import { shaderMaterial, Html, useProgress, Stars } from "@react-three/drei";
import { Zap, Loader2, Server, ShieldCheck, ChevronRight, Info } from "lucide-react";

// --- ISRO Facts Database ---
const ISRO_FACTS = [
  "India was the first country to reach Mars on its very first attempt.",
  "The Mars Orbiter Mission (MOM) cost ~$74 million—less than the movie 'Gravity'.",
  "Mangalyaan completed more than 7 years in orbit, far exceeding its 6-month life.",
  "ISRO set a world record in 2017 by launching 104 satellites in a single mission.",
  "India's first satellite, Aryabhata, was launched in 1975.",
  "Mangalyaan was launched using the PSLV-C25 rocket from Sriharikota.",
  "The MOM mission distance traversed was approximately 666 million kilometers.",
  "ISRO is currently developing Gaganyaan, India's first manned space mission."
];

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:3000");

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

const InteractiveLoadingBackground = () => {
  const groupRef = useRef();
  const starsLayer1 = useRef();
  const starsLayer2 = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Interactive mouse parallax
      const targetX = (state.pointer.x * 0.3);
      const targetY = (state.pointer.y * 0.3);

      // Smoothly interpolate current rotation towards mouse target influence
      groupRef.current.rotation.x += (targetY - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;

      // Base rotation
      groupRef.current.rotation.z -= delta * 0.02;
    }

    const time = state.clock.elapsedTime;
    if (starsLayer1.current) {
      starsLayer1.current.material.transparent = true;
      starsLayer1.current.material.opacity = Math.abs(Math.sin(time * 2.5));
    }
    if (starsLayer2.current) {
      starsLayer2.current.material.transparent = true;
      starsLayer2.current.material.opacity = Math.abs(Math.cos(time * 3.5));
    }
  });

  return (
    <group ref={groupRef}>
      {/* Stable small background stars */}
      <Stars radius={100} depth={50} count={6000} factor={3} saturation={0} fade speed={1} />

      {/* Blinking, larger stars */}
      <Stars ref={starsLayer1} radius={80} depth={40} count={1000} factor={7} saturation={0} fade speed={2} />

      {/* Fast blinking, medium stars */}
      <Stars ref={starsLayer2} radius={90} depth={60} count={1500} factor={5} saturation={0} fade speed={3} />

      <fog attach="fog" args={["#000000", 10, 150]} />
    </group>
  );
};

const LoadingScreen = ({ onLoaded }) => {
  const { progress } = useProgress();
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % ISRO_FACTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => onLoaded(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [progress, onLoaded]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center cursor-crosshair">
      {/* Interactive 3D Background just for Loader */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <InteractiveLoadingBackground />
          <ambientLight intensity={0.5} />
        </Canvas>
      </div>

      <div className="max-w-md w-full relative z-10 pointer-events-none">
        {/* Animated Icon */}
        <div className="mb-8 relative flex justify-center items-center w-24 h-24 mx-auto">
          <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] overflow-visible">
            <defs>
              <clipPath id="zap-shape">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </clipPath>
            </defs>

            {/* Background Outline */}
            <polygon
              points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="opacity-20"
            />

            <g clipPath="url(#zap-shape)">
              {/* The liquid container moving up. Progress goes 0 to 100. Box goes y=24 to y=-4 to comfortably fill beyond top peak. */}
              <motion.g
                initial={{ y: 24 }}
                animate={{ y: 24 - (progress / 100) * 28 }}
                transition={{ ease: "linear", duration: 0.5 }}
              >
                {/* Back Wave (offset phase and opacity) moving right */}
                <motion.path
                  d="M -24 0 Q -21 1.2 -18 0 T -12 0 T -6 0 T 0 0 T 6 0 T 12 0 T 18 0 T 24 0 T 30 0 T 36 0 T 42 0 T 48 0 L 48 30 L -24 30 Z"
                  fill="#06b6d4" // darker cyan
                  className="opacity-50"
                  animate={{ x: [-12, 0] }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 1.5 }}
                  style={{ y: -0.5 }}
                />

                {/* Front Wave moving left */}
                <motion.path
                  d="M -24 0 Q -21 1.2 -18 0 T -12 0 T -6 0 T 0 0 T 6 0 T 12 0 T 18 0 T 24 0 T 30 0 T 36 0 T 42 0 T 48 0 L 48 30 L -24 30 Z"
                  fill="#22D3EE" // bright neon blue
                  className="opacity-95"
                  animate={{ x: [0, -12] }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                />
              </motion.g>
            </g>

            {/* Crisp Overlay Border */}
            <polygon
              points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>

          <ShieldCheck className="text-green-500 absolute bottom-0 right-0 translate-x-4 opacity-80 z-20" size={24} />
        </div>

        {/* Title */}
        <h2 className="text-white font-pixel text-xs tracking-[0.3em] mb-4 leading-relaxed">
          DEEP SPACE INITIALIZATION
        </h2>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-900 border border-slate-800 mb-4 overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,1)]">
          <motion.div
            className="h-full bg-neonBlue shadow-[0_0_25px_rgba(34,211,238,1)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Details Tracking */}
        <div className="flex justify-between items-center font-mono text-[10px] text-slate-500 mb-12 uppercase tracking-tighter">
          <span className="flex items-center gap-2">
            <Server size={10} className="animate-pulse" /> DOWNLOADING HIGH-RES TEXTURES...
          </span>
          <span className="text-neonBlue font-bold">{Math.round(progress)}%</span>
        </div>

        {/* FACTS BOX */}
        <motion.div
          key={factIndex}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="mb-12 p-4 bg-slate-900/50 border border-blue-900/20 rounded backdrop-blur-sm min-h-[80px] flex items-center justify-center"
        >
          <div className="flex gap-3 text-left">
            <Info size={20} className="text-amber-500 shrink-0 mt-1" />
            <p className="text-[10px] font-mono text-slate-300 leading-relaxed italic">
              "{ISRO_FACTS[factIndex]}"
            </p>
          </div>
        </motion.div>

        {/* Systems Check */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-2 border text-[8px] font-pixel transition-colors flex items-center justify-center gap-2 ${progress > 25 ? 'border-neonBlue/50 text-neonBlue bg-neonBlue/5' : 'border-slate-800 text-slate-700'}`}>
            {progress > 25 && <ChevronRight size={8} />} ORBITER
          </div>
          <div className={`p-2 border text-[8px] font-pixel transition-colors flex items-center justify-center gap-2 ${progress > 50 ? 'border-neonBlue/50 text-neonBlue bg-neonBlue/5' : 'border-slate-800 text-slate-700'}`}>
            {progress > 50 && <ChevronRight size={8} />} FUEL MNG
          </div>
          <div className={`p-2 border text-[8px] font-pixel transition-colors flex items-center justify-center gap-2 ${progress > 75 ? 'border-neonBlue/50 text-neonBlue bg-neonBlue/5' : 'border-slate-800 text-slate-700'}`}>
            {progress > 75 && <ChevronRight size={8} />} TELEMETRY
          </div>
          <div className={`p-2 border text-[8px] font-pixel transition-colors flex items-center justify-center gap-2 ${progress === 100 ? 'border-neonBlue/50 text-neonBlue bg-neonBlue/5' : 'border-slate-800 text-slate-700'}`}>
            {progress === 100 && <ChevronRight size={8} />} READY
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
            }}
          >
            {activeTheme.name}
          </span>
        </motion.p>

        <motion.button
          className={`mt-12 px-12 py-5 bg-black/30 border text-xl font-bold uppercase tracking-widest transition-all duration-[3000ms] z-20 backdrop-blur-xl cursor-target`}
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
