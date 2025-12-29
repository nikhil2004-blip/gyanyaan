import { useRef, useState, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame, useLoader, extend } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { Zap } from "lucide-react";

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

function RotatingEarth({ onColorChange, chaosMode }) {
  const groupRef = useRef();
  const materialRef = useRef();
  const [chaosTransform, setChaosTransform] = useState({ x: 0, y: 0, z: 0 });

  const [moon, mars, jupiter, venus] = useLoader(THREE.TextureLoader, [
    "http://localhost:3000/assets/planets/moon.jpg",
    "http://localhost:3000/assets/planets/mars.jpg",
    "http://localhost:3000/assets/planets/jupyter.jpg",
    "http://localhost:3000/assets/planets/venus.jpg"
  ]);

  const textures = useMemo(() => [moon, mars, jupiter, venus], [moon, mars, jupiter, venus]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [transitioning, setTransitioning] = useState(false);

  // Chaos effect for planet - EXTREME
  useEffect(() => {
    if (!chaosMode) {
      setChaosTransform({ x: 0, y: 0, z: 0 });
      return;
    }

    const interval = setInterval(() => {
      setChaosTransform({
        x: (Math.random() - 0.5) * 0.8, // Increased from 0.3
        y: (Math.random() - 0.5) * 0.8, // Increased from 0.3
        z: (Math.random() - 0.5) * 0.4 // Increased from 0.1
      });
    }, 60); // Changed from 100ms to 60ms

    return () => clearInterval(interval);
  }, [chaosMode]);

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

      // Apply chaos transform
      if (chaosMode) {
        groupRef.current.position.x = chaosTransform.x;
        groupRef.current.position.y = chaosTransform.y;
        groupRef.current.rotation.z = chaosTransform.z;
      } else {
        groupRef.current.position.x = 0;
        groupRef.current.position.y = 0;
        groupRef.current.rotation.z = 0;
      }
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

// Scrambled Text Component - EXTREME
const ScrambledText = ({ text, chaosMode }) => {
  const [scrambledText, setScrambledText] = useState(text);

  useEffect(() => {
    if (!chaosMode) {
      setScrambledText(text);
      return;
    }

    const chars =
      "!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789░▒▓█◄►▲▼☺☻♠♣♥♦";

    const interval = setInterval(() => {
      const scrambled = text
        .split("")
        .map((char) => {
          if (char === " " || char === "\u00A0") return char;
          return Math.random() > 0.2 ? char : chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      setScrambledText(scrambled);
    }, 70); // FAST: 70ms

    return () => clearInterval(interval);
  }, [text, chaosMode]);

  return <>{scrambledText}</>;
};

const Hero = ({ user, onEnterMission }) => {
  const [themeIndex, setThemeIndex] = useState(0);
  const [chaosMode, setChaosMode] = useState(false);
  const [chaosTransform, setChaosTransform] = useState({ x: 0, y: 0, rotate: 0 });
  const [buttonChaos, setButtonChaos] = useState({ x: 0, y: 0, rotate: 0 });

  const planetThemes = [
    { accent: "#22D3EE", glow: "rgba(34, 211, 238, 0.8)", name: "MOON BASE" },
    { accent: "#FF0055", glow: "rgba(255, 0, 85, 0.8)", name: "MARS COLONY" },
    { accent: "#A855F7", glow: "rgba(168, 85, 247, 0.8)", name: "JUPITER ORBIT" },
    { accent: "#FFD700", glow: "rgba(255, 215, 0, 0.8)", name: "VENUS STATION" }
  ];

  const activeTheme = planetThemes[themeIndex] || planetThemes[0];

  // Random movement effect - EXTREME CHAOS
  useEffect(() => {
    if (!chaosMode) {
      setChaosTransform({ x: 0, y: 0, rotate: 0 });
      return;
    }

    // FAST ZIGZAG CHAOS - 50ms intervals for rapid movement
    const interval = setInterval(() => {
      setChaosTransform({
        x: (Math.random() - 0.5) * 60, // Increased from 20 to 60
        y: (Math.random() - 0.5) * 60, // Increased from 20 to 60
        rotate: (Math.random() - 0.5) * 30 // Increased from 10 to 30
      });
    }, 50); // Changed from 200ms to 50ms for FAST chaos

    return () => clearInterval(interval);
  }, [chaosMode]);

  // VIOLENT BUTTON MOVEMENT - Flies across screen unclickably!
  useEffect(() => {
    if (!chaosMode) {
      setButtonChaos({ x: 0, y: 0, rotate: 0 });
      return;
    }

    // SUPER FAST VIOLENT MOVEMENTS - 40ms for unclickable chaos!
    const interval = setInterval(() => {
      setButtonChaos({
        x: (Math.random() - 0.5) * 200, // HUGE range
        y: (Math.random() - 0.5) * 150, // HUGE range
        rotate: (Math.random() - 0.5) * 90 // Massive rotation
      });
    }, 40); // 40ms - SUPER FAST!

    return () => clearInterval(interval);
  }, [chaosMode]);

  return (
    <section
      className={`relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center bg-transparent ${chaosMode ? "chaos-mode" : ""}`}
    >
      {/* Font and Chaos CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', cursive; }
        
        .hud-shadow {
            text-shadow: 0 0 10px rgba(0,0,0,0.8);
        }

        /* Chaos Mode Animations */
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-3px, 3px); }
          40% { transform: translate(-3px, -3px); }
          60% { transform: translate(3px, 3px); }
          80% { transform: translate(3px, -3px); }
        }

        @keyframes rgb-split {
          0% { text-shadow: 3px 0 #ff0000, -3px 0 #00ff00, 0 3px #0000ff; }
          25% { text-shadow: -3px 0 #ff0000, 3px 0 #00ff00, 0 -3px #0000ff; }
          50% { text-shadow: 3px 0 #00ff00, -3px 0 #0000ff, 0 3px #ff0000; }
          75% { text-shadow: -3px 0 #00ff00, 3px 0 #0000ff, 0 -3px #ff0000; }
          100% { text-shadow: 3px 0 #ff0000, -3px 0 #00ff00, 0 3px #0000ff; }
        }

        @keyframes scanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .chaos-mode {
          animation: flicker 0.3s infinite;
        }

        .chaos-mode::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          );
          animation: scanlines 8s linear infinite;
          pointer-events: none;
          z-index: 100;
        }

        .chaos-text {
          animation: rgb-split 0.2s infinite, glitch 0.4s infinite;
        }

        .chaos-button {
          animation: glitch 0.5s infinite;
        }
      `}</style>

      {/* Chaos Toggle Button */}
      <button
        onClick={() => setChaosMode(!chaosMode)}
        className={`absolute top-6 right-6 z-50 px-4 py-3 bg-black/50 border-2 ${chaosMode ? "border-red-500" : "border-purple-500"} backdrop-blur-md hover:bg-black/70 transition-all flex items-center gap-2 ${chaosMode ? "chaos-button" : ""}`}
        style={{
          boxShadow: chaosMode
            ? "0 0 30px rgba(255, 0, 0, 0.8), inset 0 0 20px rgba(255, 0, 0, 0.3)"
            : "0 0 20px rgba(168, 85, 247, 0.6)"
        }}
      >
        <Zap size={20} className={chaosMode ? "text-red-500 animate-pulse" : "text-purple-400"} />
        <span
          className={`font-pixel text-[10px] ${chaosMode ? "text-red-400" : "text-purple-300"}`}
        >
          {chaosMode ? "CHAOS ON" : "CHAOS OFF"}
        </span>
      </button>

      {/* 3D Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <Canvas>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 3, 5]} intensity={3.0} color="#ffffff" />
          <Suspense fallback={null}>
            <RotatingEarth onColorChange={setThemeIndex} chaosMode={chaosMode} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full pointer-events-auto px-4">
        {/* HEADLINE */}
        <motion.h1
          className={`text-5xl md:text-8xl font-black text-white z-20 transition-all duration-[3000ms] ease-in-out ${chaosMode ? "chaos-text" : ""}`}
          style={{
            textShadow: chaosMode
              ? "3px 0 #ff0000, -3px 0 #00ff00, 0 3px #0000ff"
              : `0 0 30px ${activeTheme.glow}, 0 0 60px ${activeTheme.glow}`,
            WebkitTextStroke: `1px ${activeTheme.accent}`,
            transform: `translate(${chaosTransform.x}px, ${chaosTransform.y}px) rotate(${chaosTransform.rotate}deg)`
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ScrambledText text="G Y A N Y A A N  1.0" chaosMode={chaosMode} />
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          className={`mt-6 text-xl md:text-2xl text-white tracking-[0.2em] font-bold z-20 uppercase hud-shadow transition-all duration-[3000ms] ease-in-out ${chaosMode ? "chaos-text" : ""}`}
          style={{
            borderBottom: `2px solid ${activeTheme.accent}`,
            paddingBottom: "10px",
            letterSpacing: "0.3em",
            transform: `translate(${chaosTransform.x * 0.5}px, ${chaosTransform.y * 0.5}px) rotate(${chaosTransform.rotate * 0.3}deg)`
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
            <ScrambledText text={activeTheme.name} chaosMode={chaosMode} />
          </span>
        </motion.p>

        {/* BUTTON - FLIES VIOLENTLY IN CHAOS MODE */}
        <motion.button
          className={`mt-12 px-12 py-5 bg-black/30 border text-xl font-bold uppercase tracking-widest transition-all duration-[3000ms] z-20 backdrop-blur-xl ${chaosMode ? "chaos-button" : ""}`}
          style={{
            borderColor: activeTheme.accent,
            color: "white",
            boxShadow: `0 0 20px ${activeTheme.glow}, inset 0 0 10px ${activeTheme.glow}`,
            transform: `translate(${buttonChaos.x}px, ${buttonChaos.y}px) rotate(${buttonChaos.rotate}deg)`,
            transition: chaosMode ? "none" : "all 3000ms" // No transition in chaos for instant jumps
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
          <ScrambledText text={user ? "ENTER COCKPIT" : "START ENGINE"} chaosMode={chaosMode} />
        </motion.button>
      </div>

      {/* Bottom Fade Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black via-black/60 to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default Hero;
