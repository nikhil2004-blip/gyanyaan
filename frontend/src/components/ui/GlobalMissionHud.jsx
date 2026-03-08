import React from "react";
import { useMission } from "../../context/MissionContext";
import { Fuel, Clock, Activity, Zap } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function GlobalMissionHud() {
    const { fuel, currentDate, isActive } = useMission();
    const location = useLocation();

    // Hide the HUD on screens where it isn't relevant 
    // It should be visible during levels, not on the homepage or login
    const isLevelRoute = location.pathname.includes('/levels/');
    if (!isActive || !isLevelRoute) return null;

    // Format date nicely
    // e.g. "05 NOV 2013"
    const formattedDate = currentDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).toUpperCase();

    const formattedTime = currentDate.toLocaleTimeString("en-GB", {
        timeStyle: 'short',
        hour12: false,
        timeZone: 'UTC'
    });

    // Calculate percentage: Mangalyaan PSLV-XL start max is 264352
    const maxFuel = 264352;
    const fuelPercentage = Math.min((fuel / maxFuel) * 100, 100);

    // Decide fuel state color
    let fuelColor = "text-green-400";
    let barColor = "bg-green-500";
    if (fuel < 1000) {
        fuelColor = "text-amber-400";
        barColor = "bg-amber-500"; // payload fuel scale
    }
    if (fuel < 200) {
        fuelColor = "text-red-500";
        barColor = "bg-red-500";
    }

    return (
        <div className="fixed right-4 top-24 z-50 pointer-events-none fade-in animate-in hidden lg:flex flex-col gap-2">
            {/* Container */}
            <div className="w-56 bg-slate-900/90 border-2 border-blue-900/50 p-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md">

                {/* Header */}
                <div className="border-b border-blue-900/50 pb-2 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-neonBlue">
                        <Activity size={14} className="animate-pulse" />
                        <span className="font-pixel text-[10px] tracking-wider">TELEMETRY</span>
                    </div>
                </div>

                {/* TIME / DATE */}
                <div className="mb-4">
                    <div className="flex justify-between items-center text-slate-500 font-pixel text-[8px] mb-1">
                        <span className="flex items-center gap-1"><Clock size={10} /> MISSION CLOCK</span>
                        <span>T+ UTC</span>
                    </div>
                    <div className="text-white font-mono text-sm tracking-widest bg-black/50 p-1.5 border border-slate-800 text-right font-bold flex justify-between items-center">
                        <span className="text-neonBlue">{formattedTime}</span>
                        <span>{formattedDate}</span>
                    </div>
                </div>

                {/* FUEL */}
                <div>
                    <div className="flex justify-between items-center text-slate-500 font-pixel text-[8px] mb-1">
                        <span className="flex items-center gap-1"><Fuel size={10} /> PROPELLANT</span>
                        <span className={fuelColor}>{Math.round(fuel).toLocaleString()} KG</span>
                    </div>

                    <div className="w-full h-3 bg-black/80 border border-slate-800 relative overflow-hidden">
                        {/* Indicator bar. If below 1000kg, visually switch to a micro-scale indicator since 852kg relative to 264000kg is barely 1 pixel */}
                        <div
                            className={`h-full ${barColor} shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out`}
                            style={{ width: `${fuel > 1000 ? fuelPercentage : (fuel / 1000) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-[8px] text-slate-600 font-mono">
                        <span>{fuel > 1000 ? 'PSLV + MOM' : 'MOM LAM/RCS'}</span>
                        <span>CRITICAL</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
