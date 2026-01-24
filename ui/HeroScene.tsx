"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense } from "react";
import GlowingOrb from "./GlowingOrb";

export default function HeroScene() {
    return (
        <div style={{ width: "100%", height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 0 }}>
            <Canvas
                camera={{ position: [0, 0, 9], fov: 40 }}
                dpr={[1, 1.5]} // Optimize performance on high DPI
            >
                <color attach="background" args={["#020205"]} />

                <Suspense fallback={null}>
                    <Stars
                        radius={300}
                        depth={60}
                        count={7000}
                        factor={4}
                        saturation={0}
                        fade={true}
                        speed={0.5} // Slow movement of stars
                    />

                    {/* Minimal lighting since orb is emissive, but adding some helps depth if we used standard materials */}
                    <ambientLight intensity={0.2} />

                    <GlowingOrb />

                    <EffectComposer enableNormalPass={false}>
                        <Bloom
                            luminanceThreshold={0.1}
                            mipmapBlur
                            intensity={1.2}
                            radius={0.7}
                            levels={9}
                        />
                    </EffectComposer>
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={false} /* optional: disable user rotation to keep it purely cinematic? User asked to "disable zoom & pan", implied rotate is okay? "Camera should slowly auto-rotate... but disable zoom & pan." okay allow user rotate. */
                    enableDamping={true}
                    autoRotate
                    autoRotateSpeed={0.4}
                />
            </Canvas>
        </div>
    );
}
