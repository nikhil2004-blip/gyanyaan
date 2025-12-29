import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Thermometer,
  Database,
  Wifi,
  Battery,
  Sun,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Globe,
  Zap,
  Server,
  Radio,
  Scan,
  Image as ImageIcon,
  XCircle,
  Activity,
  ArrowLeft,
  Info,
  Target,
  BookOpen,
  Medal,
  Lightbulb,
  AlertOctagon
} from "lucide-react";
import StarryBackground from "../components/ui/StarryBackground";

// --- MRD & CONFIGURATION ---
const MRD_CONTENT = {
  briefing: {
    title: "LEVEL 8: MARS SCIENCE OPERATIONS",
    subtitle: "ORBITAL DATA COLLECTION",
    sections: [
      {
        label: "MISSION GOAL",
        text: "MOM is now in stable Mars orbit. Your mission: Operate scientific instruments to collect 1000 data points and transmit them back to Earth. Balance power, data collection, and transmission to complete the mission."
      },
      {
        label: "CRITICAL TASKS",
        items: [
          "CHARGING: Point to SUN to charge solar panels. Battery is your lifeline.",
          "SCIENCE: Point to MARS and activate instruments to collect data (drains power).",
          "TRANSMISSION: Point to EARTH and transmit buffered data to ground stations.",
          "BALANCE: Manage the day/night cycle - cameras need sunlight on Mars!"
        ]
      }
    ],
    physics_tip: {
      label: "PRO TIP: POWER MANAGEMENT",
      text: "The spacecraft orbits Mars once every ~76 minutes. Use the dayside (sunlit Mars surface) for camera observations, nightside for thermal measurements. Always return to SUN orientation when battery is low. Your buffer can only hold 200 data points - transmit regularly!"
    }
  },
  failure_tips: {
    "CRITICAL POWER FAILURE. MISSION LOST.": {
      title: "BATTERY DEPLETED",
      analysis:
        "The spacecraft's battery dropped to 0%, causing a total systems failure. All instruments, communication systems, and attitude control are now offline. The mission cannot be recovered.",
      correction:
        "Monitor battery levels constantly. When below 30%, immediately point to SUN to recharge. Don't activate multiple instruments simultaneously when battery is low. Science collection can wait - power cannot."
    },
    "BUFFER OVERFLOW": {
      title: "DATA LOSS - STORAGE FULL",
      analysis:
        "The local data buffer reached maximum capacity (200 points) and had to discard incoming science data. This wastes valuable observation time.",
      correction:
        "Transmit data to Earth before buffer fills up. When buffer is near 150-180 points, switch to EARTH orientation and transmit. Better data management prevents loss."
    }
  },
  success: {
    title: "SCIENCE MISSION COMPLETE",
    mission_impact:
      "Outstanding operations! You've successfully collected and transmitted 1000 data points from Mars orbit. The data includes surface images, thermal maps, and methane measurements that will advance our understanding of the Red Planet.",
    details: [
      {
        topic: "MISSION DATA",
        content:
          "• Data Collected: 1000 science points\n• Instruments Used: MCC Camera, TIS Thermal, MSM Methane\n• Orbit Cycles: ~8-12 orbits\n• Mission Duration: ~10-15 hours (simulated)\n• Status: Mission success"
      },
      {
        topic: "SCIENTIFIC INSTRUMENTS",
        content:
          "• MCC: Mars Color Camera - captured surface images\n• TIS: Thermal Infrared Spectrometer - mapped heat signatures\n• MSM: Methane Sensor for Mars - detected atmospheric composition\n• HGA: High Gain Antenna - transmitted data to Earth"
      },
      {
        topic: "PERFORMANCE REPORT",
        content:
          "Your power management and data transmission strategy was excellent. Balancing charging, observation, and communication is the key to space mission success."
      },
      {
        topic: "MISSION COMPLETE",
        content:
          "Congratulations! You've successfully completed all 8 levels of the ISRO Mission Simulator. From rocket assembly to Mars science operations, you've experienced the full journey of India's Mangalyaan mission. This is a historic achievement!"
      }
    ]
  }
};

// --- Constants ---
const GOAL_SCORE = 1000; // Data points needed to win
const MAX_BUFFER = 200; // Max local storage
const MAX_BATTERY = 100;
const ORBIT_DURATION = 1000; // Ticks per orbit

// Reduced costs for better gameplay balance (0.8x drain)
const INSTRUMENTS = {
  MCC: { id: "mcc", label: "MCC (Camera)", cost: 0.12, rate: 2.0, needsLight: true }, // was 0.15
  TIS: { id: "tis", label: "TIS (Thermal)", cost: 0.04, rate: 1.0, needsLight: false }, // was 0.05
  MSM: { id: "msm", label: "MSM (Methane)", cost: 0.08, rate: 1.5, needsLight: true } // was 0.1
};

// --- Modal Component ---
const Modal = ({
  title,
  children,
  onClose,
  variant = "neutral",
  buttonText = "CONTINUE",
  onSecondary,
  secondaryButtonText
}) => {
  const bgColors = {
    neutral: "border-blue-500 shadow-blue-900/50",
    danger: "border-red-500 shadow-red-900/50",
    success: "border-green-500 shadow-green-900/50"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border-4 ${bgColors[variant]} max-w-lg w-full shadow-2xl relative flex flex-col max-h-[90vh]`}
      >
        {/* Fixed Header */}
        <div className="p-6 pb-2 shrink-0">
          <h2
            className={`font-pixel text-sm md:text-base text-center ${variant === "danger" ? "text-red-400" : variant === "success" ? "text-green-400" : "text-blue-400"}`}
          >
            {title}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-2 overflow-y-auto custom-scroll flex-1">
          <div className="space-y-4 font-mono text-xs md:text-sm text-slate-300 leading-relaxed">
            {children}
          </div>
        </div>

        {/* Fixed Footer Buttons */}
        <div className="p-6 pt-4 shrink-0 flex gap-3">
          {onSecondary && (
            <button
              onClick={onSecondary}
              className="flex-1 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-white text-white font-pixel text-xs py-3 transition-all uppercase"
            >
              {secondaryButtonText}
            </button>
          )}
          <button
            onClick={onClose}
            className={`${onSecondary ? "flex-1" : "w-full"} bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-white text-white font-pixel text-xs py-3 transition-all uppercase`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Components ---

const RetroButton = ({
  label,
  onClick,
  disabled,
  active,
  icon: Icon,
  color = "blue",
  className = ""
}) => {
  const colors = {
    blue: "bg-blue-600 border-blue-800 hover:bg-blue-500",
    green: "bg-emerald-600 border-emerald-800 hover:bg-emerald-500",
    amber: "bg-amber-600 border-amber-800 hover:bg-amber-500",
    red: "bg-red-600 border-red-800 hover:bg-red-500",
    slate: "bg-slate-700 border-slate-900 hover:bg-slate-600"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-3 py-3 border-b-4 active:border-b-0 active:translate-y-1 
        flex items-center justify-center gap-2 transition-all w-full
        font-pixel text-[10px] text-white uppercase tracking-wider
        ${disabled ? "opacity-50 cursor-not-allowed bg-slate-800 border-slate-900" : colors[color]}
        ${active ? "brightness-125 border-t-2 border-b-0 translate-y-1" : ""}
        ${className}
      `}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
};

const StatBar = ({ label, value, max, color, icon: Icon, warningThreshold = 20 }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const isLow = value < max * (warningThreshold / 100);

  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] font-pixel text-slate-400 mb-1">
        <span className="flex items-center gap-1">
          {Icon && <Icon size={10} />} {label}
        </span>
        <span className={isLow ? "text-red-500 animate-pulse" : "text-white"}>
          {Math.floor(value)}/{max}
        </span>
      </div>
      <div className="h-3 w-full bg-slate-800 rounded-full border border-slate-600 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqgAAOABJkwlDQAAYRjgxAAAAAElFTkSuQmCC')] opacity-20 pointer-events-none" />
        <div
          className={`h-full transition-all duration-300 ${color} ${isLow ? "animate-pulse bg-red-500" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default function Level8ScienceOps({ onBack, onNextLevel }) {
  // --- Modal State ---
  const [showBriefing, setShowBriefing] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [failData, setFailData] = useState(null);

  // --- State ---
  const [gameActive, setGameActive] = useState(false);
  const [missionWon, setMissionWon] = useState(false);
  const [missionFailed, setMissionFailed] = useState(false);
  const [failReason, setFailReason] = useState("");

  // Resources
  const [battery, setBattery] = useState(100);
  const [buffer, setBuffer] = useState(0);
  const [score, setScore] = useState(0); // Science Data transmitted

  // Systems
  const [orientation, setOrientation] = useState("SUN"); // SUN, MARS, EARTH
  const [activeInstruments, setActiveInstruments] = useState({
    MCC: false,
    TIS: false,
    MSM: false
  });
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Environment
  const [orbitProgress, setOrbitProgress] = useState(0); // 0-360 degrees
  const [isDaySide, setIsDaySide] = useState(true);

  const requestRef = useRef();

  // --- Game Loop ---
  const updateGame = useCallback(() => {
    if (!gameActive || missionWon || missionFailed) return;

    // 1. Orbital Physics (Day/Night Cycle)
    setOrbitProgress((prev) => {
      const next = (prev + 0.2) % 360;
      // Simple day/night: 90 to 270 is "Behind Mars" (Night relative to Sun)
      // Adjusting: Let's say 270->90 is Day, 90->270 is Night
      const day = next < 90 || next > 270;
      setIsDaySide(day);
      return next;
    });

    // 2. Resource Logic
    setBattery((bat) => {
      let change = 0;

      // Charging
      if (orientation === "SUN") change += 0.8;
      else if (orientation === "EARTH")
        change += 0.1; // Partial charge
      else change -= 0.008; // Reduced base drain: 0.01 * 0.8 = 0.008

      // Drain from instruments
      if (orientation === "MARS") {
        Object.entries(activeInstruments).forEach(([key, isActive]) => {
          if (isActive) change -= INSTRUMENTS[key].cost;
        });
      }

      // Drain from transmission
      if (isTransmitting && orientation === "EARTH") change -= 0.32; // Reduced: 0.4 * 0.8 = 0.32

      const newBat = Math.min(MAX_BATTERY, Math.max(0, bat + change));

      if (newBat <= 0) {
        handleFail("CRITICAL POWER FAILURE. MISSION LOST.");
      }
      return newBat;
    });

    // 3. Science Gathering
    if (orientation === "MARS") {
      let dataGain = 0;
      Object.entries(activeInstruments).forEach(([key, isActive]) => {
        if (isActive) {
          // Check constraints
          if (INSTRUMENTS[key].needsLight && !isDaySide) {
            // Penalty or just no data? Let's just say no data but still drains power
          } else {
            dataGain += INSTRUMENTS[key].rate;
          }
        }
      });

      setBuffer((buf) => Math.min(MAX_BUFFER, buf + dataGain));
    }

    // 4. Data Transmission
    if (orientation === "EARTH" && isTransmitting) {
      if (buffer > 0) {
        const txRate = 3.0; // Data points per tick
        const amount = Math.min(buffer, txRate);
        setBuffer((b) => b - amount);
        setScore((s) => {
          const newScore = s + amount;
          if (newScore >= GOAL_SCORE) handleWin();
          return newScore;
        });
      } else {
        setIsTransmitting(false); // Auto stop when empty
      }
    }

    // Loop
    requestRef.current = requestAnimationFrame(updateGame);
  }, [
    gameActive,
    missionWon,
    missionFailed,
    orientation,
    activeInstruments,
    isTransmitting,
    buffer,
    isDaySide
  ]);

  useEffect(() => {
    if (gameActive) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [updateGame, gameActive]);

  // --- Helpers ---

  const handleFail = (reason) => {
    setMissionFailed(true);
    setFailReason(reason);
    setGameActive(false);
    setTimeout(() => setFailData(reason), 500);
  };

  const handleWin = () => {
    setMissionWon(true);
    setGameActive(false);
    setTimeout(() => setShowSuccess(true), 1000);
  };

  const toggleInstrument = (id) => {
    setActiveInstruments((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const changeOrientation = (mode) => {
    setOrientation(mode);
    setIsTransmitting(false); // Stop transmit if moving away from Earth
    // Instruments stay "On" switch-wise, but don't function unless pointing at Mars
  };

  const handleStartFromBriefing = () => {
    setShowBriefing(false);
    startGame();
  };

  const startGame = () => {
    setGameActive(true);
    setBattery(100);
    setBuffer(0);
    setScore(0);
    setOrbitProgress(270); // Start at dawn
    setOrientation("SUN"); // Start pointing at sun
    setActiveInstruments({ MCC: false, TIS: false, MSM: false }); // All off
    setIsTransmitting(false);
  };

  const resetGame = () => {
    setMissionWon(false);
    setMissionFailed(false);
    setFailData(null);
    setShowSuccess(false);
    setShowBriefing(true); // Show briefing on retry
  };

  // --- Visuals ---
  // Calculates X offset from center (0)
  const getOrbitalOffsetX = () => {
    return 120 * Math.cos(orbitProgress * (Math.PI / 180));
  };
  // Calculates Y offset from center (0)
  const getOrbitalOffsetY = () => {
    return 30 * Math.sin(orbitProgress * (Math.PI / 180));
  };
  const getScale = () => {
    // Scale based on Y (closer/further)
    const y = Math.sin(orbitProgress * (Math.PI / 180));
    return 1 + y * 0.2;
  };
  const getZIndex = () => {
    return Math.sin(orbitProgress * (Math.PI / 180)) > 0 ? 20 : 0;
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 font-sans p-2 sm:p-4 select-none flex flex-col items-center justify-center relative">
      <StarryBackground />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', monospace; }
        .crt-scanline {
          background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%);
          background-size: 100% 4px;
        }
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: #1e293b; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>

      {/* BRIEFING MODAL */}
      {showBriefing && (
        <Modal
          title={MRD_CONTENT.briefing.title}
          variant="neutral"
          buttonText="START MISSION"
          onClose={handleStartFromBriefing}
        >
          <div className="space-y-3">
            <div className="bg-blue-950/30 border border-blue-800/50 p-3 rounded">
              <div className="flex gap-2 mb-2">
                <Info className="text-blue-400 shrink-0" size={16} />
                <span className="text-blue-300 font-pixel text-[10px]">
                  {MRD_CONTENT.briefing.subtitle}
                </span>
              </div>
            </div>

            {MRD_CONTENT.briefing.sections.map((section, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="text-green-400" size={14} />
                  <span className="font-pixel text-[9px] text-green-400">{section.label}</span>
                </div>
                {section.text && <p className="text-slate-300 ml-5">{section.text}</p>}
                {section.items && (
                  <ul className="list-disc list-inside ml-5 space-y-1 text-slate-300">
                    {section.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="bg-amber-950/30 border border-amber-700/50 p-3 rounded">
              <div className="flex gap-2 mb-1">
                <Lightbulb className="text-amber-400 shrink-0" size={14} />
                <span className="font-pixel text-[9px] text-amber-400">
                  {MRD_CONTENT.briefing.physics_tip.label}
                </span>
              </div>
              <p className="text-amber-200/90 text-xs ml-5">
                {MRD_CONTENT.briefing.physics_tip.text}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* SUCCESS MODAL - SPECIAL MISSION COMPLETE SCREEN */}
      {showSuccess && (
        <Modal
          title="🎉 MISSION COMPLETE 🎉"
          variant="success"
          buttonText="CONTINUE TO MISSION SUMMARY"
          onClose={onNextLevel}
          onSecondary={resetGame}
          secondaryButtonText="REPLAY LEVEL"
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-950/60 to-blue-950/60 border-2 border-green-500/50 p-4 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <Medal className="text-yellow-400 shrink-0 animate-pulse" size={32} />
                <div>
                  <h3 className="font-pixel text-sm text-green-300 mb-2">
                    CONGRATULATIONS, COMMANDER!
                  </h3>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    You have successfully completed all phases of India's historic Mars Orbiter
                    Mission (Mangalyaan). From assembly to science operations, you've experienced
                    the entire journey of ISRO's first interplanetary mission.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-950/30 border border-red-700/50 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="text-red-400" size={18} />
                <span className="font-pixel text-[10px] text-red-400">ABOUT MANGALYAAN</span>
              </div>
              <div className="text-slate-300 text-xs space-y-2">
                <p>
                  <strong className="text-white">Launch Date:</strong> November 5, 2013
                  <br />
                  <strong className="text-white">Mars Arrival:</strong> September 24, 2014
                  <br />
                  <strong className="text-white">Mission Cost:</strong> $74 million (₹450 crore)
                </p>
                <p className="text-amber-200 font-semibold">
                  Mangalyaan made India the first Asian nation to reach Mars orbit, and the first
                  nation in the world to succeed on their very first attempt!
                </p>
              </div>
            </div>

            <div className="bg-blue-950/30 border border-blue-700/50 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-blue-400" size={18} />
                <span className="font-pixel text-[10px] text-blue-400">KEY ACHIEVEMENTS</span>
              </div>
              <ul className="text-slate-300 text-xs space-y-1 list-disc list-inside">
                <li>First interplanetary mission by ISRO</li>
                <li>Lowest cost Mars mission in history</li>
                <li>100% success rate on first attempt</li>
                <li>Detected methane in Martian atmosphere</li>
                <li>Captured 1000s of high-resolution images</li>
                <li>Mission lasted 8+ years (planned for 6 months)</li>
              </ul>
            </div>

            <div className="bg-purple-950/30 border border-purple-700/50 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="text-purple-400" size={18} />
                <span className="font-pixel text-[10px] text-purple-400">SIGNIFICANCE</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Mangalyaan demonstrated India's space capabilities on the world stage and inspired
                millions to pursue science and technology. It proved that ambitious space missions
                don't require unlimited budgets - just brilliant engineering and determination.
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-b from-slate-900 to-black border-2 border-green-500/30 rounded-lg">
              <p className="font-pixel text-xs text-green-400 mb-2">MISSION STATUS</p>
              <p className="text-2xl font-pixel text-white mb-1">✓ COMPLETE</p>
              <p className="text-[10px] text-slate-400 font-mono">
                All 8 levels mastered • 100% mission success rate
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* FAILURE MODAL */}
      {failData && MRD_CONTENT.failure_tips[failData] && (
        <Modal
          title="MISSION FAILED"
          variant="danger"
          buttonText="RETRY LEVEL"
          onClose={resetGame}
          onSecondary={onBack}
          secondaryButtonText="EXIT LEVEL"
        >
          <div className="space-y-3">
            <div className="bg-red-950/40 border border-red-700/50 p-3 rounded">
              <div className="flex gap-2 mb-2">
                <AlertOctagon className="text-red-400 shrink-0" size={18} />
                <span className="font-pixel text-[10px] text-red-400">
                  {MRD_CONTENT.failure_tips[failData].title}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="text-amber-400" size={14} />
                <span className="font-pixel text-[9px] text-amber-400">FAILURE ANALYSIS</span>
              </div>
              <p className="text-slate-300 ml-5">{MRD_CONTENT.failure_tips[failData].analysis}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="text-green-400" size={14} />
                <span className="font-pixel text-[9px] text-green-400">CORRECTION</span>
              </div>
              <p className="text-green-200 ml-5">{MRD_CONTENT.failure_tips[failData].correction}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* HEADER */}
      <div className="w-full max-w-5xl border-b-4 border-slate-700 pb-4 mb-6 flex justify-between items-end">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <div className="w-12 h-12 bg-purple-700 border-2 border-white flex items-center justify-center shadow-lg">
            <Database className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-pixel text-white">MARS SCIENCE OPS</h1>
            <p className="text-[10px] text-purple-300 font-mono">PHASE: ORBITAL DATA COLLECTION</p>
          </div>
        </div>
        <div className="flex items-end gap-4">
          <button
            onClick={() => setShowBriefing(true)}
            className="hidden sm:flex bg-slate-800 px-3 py-2 border border-slate-600 items-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <Info size={14} className="text-blue-400" />
            <span className="text-[10px] font-pixel text-slate-300">MRD DOCS</span>
          </button>
          <div className="text-right">
            <div className="text-[10px] font-pixel text-slate-500 mb-1">MISSION PROGRESS</div>
            <div className="font-mono text-xl text-green-400">
              {((score / GOAL_SCORE) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* LEFT: VISUALIZER (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-video bg-black border-4 border-slate-700 rounded-xl overflow-hidden shadow-2xl group">
            {/* HUD */}
            <div className="absolute top-4 left-4 z-30 font-pixel text-[10px] text-slate-400">
              <div className="bg-black/50 p-2 rounded border border-slate-600">
                <div>
                  LIGHT:{" "}
                  {isDaySide ? (
                    <span className="text-yellow-400">DAY SIDE</span>
                  ) : (
                    <span className="text-blue-400">NIGHT SIDE</span>
                  )}
                </div>
                <div>
                  MODE: <span className="text-white">{orientation} POINTING</span>
                </div>
              </div>
            </div>

            {/* VISUALS */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Stars */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50" />

              {/* Mars */}
              <div className="relative w-48 h-48 rounded-full z-10 shadow-[0_0_50px_rgba(185,28,28,0.4)] overflow-hidden">
                {/* Day/Night Texture Simulation */}
                <div className="absolute inset-0 bg-red-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent" />
              </div>

              {/* Satellite Orbiting */}
              <div
                className="absolute flex flex-col items-center justify-center transition-transform duration-100"
                style={{
                  left: "50%", // Centered
                  top: "50%", // Centered
                  zIndex: getZIndex(),
                  // Transform calculates movement relative to center
                  transform: `translate(calc(-50% + ${getOrbitalOffsetX()}px), calc(-50% + ${getOrbitalOffsetY()}px)) scale(${getScale()})`
                }}
              >
                {/* Spacecraft Body */}
                <div
                  className={`
                            relative w-12 h-12 bg-slate-200 border-2 border-slate-400 flex items-center justify-center shadow-xl
                            ${orientation === "SUN" ? "ring-4 ring-yellow-500/50" : ""}
                            ${orientation === "EARTH" ? "ring-4 ring-blue-500/50" : ""}
                            ${orientation === "MARS" ? "ring-4 ring-red-500/50" : ""}
                        `}
                >
                  {orientation === "MARS" && (
                    <Camera size={16} className="text-red-500 animate-pulse" />
                  )}
                  {orientation === "EARTH" && (
                    <Wifi size={16} className="text-blue-500 animate-pulse" />
                  )}
                  {orientation === "SUN" && (
                    <Sun size={16} className="text-yellow-500 animate-spin-slow" />
                  )}

                  {/* Solar Panels */}
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-8 bg-blue-900 border border-slate-500" />
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-8 bg-blue-900 border border-slate-500" />
                </div>

                {/* Action Indicators */}
                {orientation === "MARS" && activeInstruments.MCC && isDaySide && (
                  <div className="absolute -top-8 text-yellow-300 font-pixel text-[8px] animate-bounce">
                    CAPTURING
                  </div>
                )}
                {orientation === "EARTH" && isTransmitting && (
                  <div className="absolute -top-8 text-blue-300 font-pixel text-[8px] animate-pulse">
                    UPLINKING
                  </div>
                )}
              </div>
            </div>

            <div className="absolute inset-0 crt-scanline pointer-events-none z-40 opacity-20" />
          </div>

          {/* STATUS BARS */}
          <div className="bg-slate-900 p-4 border-2 border-slate-700 rounded-lg">
            <StatBar
              label="BATTERY POWER"
              value={battery}
              max={100}
              color="bg-green-500"
              icon={Battery}
            />
            <StatBar
              label="DATA BUFFER (LOCAL STORAGE)"
              value={buffer}
              max={MAX_BUFFER}
              color="bg-purple-500"
              icon={Server}
              warningThreshold={90} // Warn if full
            />
          </div>
        </div>

        {/* RIGHT: CONTROLS (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* 1. ORIENTATION CONTROL */}
          <div className="bg-slate-900 border-4 border-slate-700 p-4 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-pixel text-slate-400">ATTITUDE MODE</span>
              <RotateCcw size={14} className="text-slate-500" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <RetroButton
                label="SUN"
                icon={Sun}
                color="amber"
                active={orientation === "SUN"}
                onClick={() => changeOrientation("SUN")}
              />
              <RetroButton
                label="MARS"
                icon={Scan}
                color="red"
                active={orientation === "MARS"}
                onClick={() => changeOrientation("MARS")}
              />
              <RetroButton
                label="EARTH"
                icon={Globe}
                color="blue"
                active={orientation === "EARTH"}
                onClick={() => changeOrientation("EARTH")}
              />
            </div>
            <div className="mt-2 text-[9px] font-mono text-center text-slate-500">
              {orientation === "SUN" && "SOLAR PANELS ALIGNED. CHARGING."}
              {orientation === "MARS" && "INSTRUMENTS FACING SURFACE. DRAINING POWER."}
              {orientation === "EARTH" && "HGA ALIGNED TO DSN. READY TO TRANSMIT."}
            </div>
          </div>

          {/* 2. SCIENCE PAYLOAD */}
          <div className="bg-slate-900 border-4 border-slate-700 p-4 rounded-xl shadow-lg flex-1">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-pixel text-slate-400">PAYLOAD CONTROL</span>
              <Activity size={14} className="text-slate-500" />
            </div>

            <div className="space-y-2">
              {Object.entries(INSTRUMENTS).map(([key, inst]) => (
                <div key={key} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleInstrument(key)}
                    className={`
                                    flex-1 py-3 px-4 border-2 flex justify-between items-center transition-all
                                    ${activeInstruments[key]
                        ? "bg-purple-900/50 border-purple-500 text-white"
                        : "bg-slate-800 border-slate-600 text-slate-500 hover:bg-slate-750"
                      }
                                `}
                  >
                    <span className="font-pixel text-[10px]">{inst.label}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${activeInstruments[key] ? "bg-green-400 shadow-[0_0_5px_lime]" : "bg-slate-600"}`}
                    />
                  </button>
                  {/* Warnings */}
                  {activeInstruments[key] && orientation !== "MARS" && (
                    <AlertTriangle
                      size={16}
                      className="text-amber-500 animate-pulse"
                      title="Wrong Orientation"
                    />
                  )}
                  {activeInstruments[key] &&
                    inst.needsLight &&
                    !isDaySide &&
                    orientation === "MARS" && (
                      <div className="text-[8px] font-pixel text-red-400 w-12 leading-tight">
                        NEEDS LIGHT
                      </div>
                    )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-2 bg-black/40 rounded border border-slate-700">
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>POWER DRAW</span>
                <span className="text-red-400">
                  -
                  {orientation === "MARS"
                    ? Object.entries(activeInstruments)
                      .reduce((acc, [k, v]) => acc + (v ? INSTRUMENTS[k].cost : 0), 0)
                      .toFixed(1)
                    : "0.0"}{" "}
                  /tick
                </span>
              </div>
            </div>
          </div>

          {/* 3. COMMS */}
          <div className="bg-slate-900 border-4 border-slate-700 p-4 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-pixel text-slate-400">DOWNLINK</span>
              <Radio size={14} className="text-slate-500" />
            </div>
            <RetroButton
              label={isTransmitting ? "TRANSMITTING..." : "TRANSMIT DATA"}
              icon={Wifi}
              color="green"
              disabled={orientation !== "EARTH" || buffer <= 0}
              active={isTransmitting}
              onClick={() => setIsTransmitting(!isTransmitting)}
            />
            {buffer >= MAX_BUFFER && (
              <div className="mt-2 text-[9px] font-pixel text-red-500 text-center animate-pulse">
                BUFFER FULL! STOP SCIENCE & TRANSMIT.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
