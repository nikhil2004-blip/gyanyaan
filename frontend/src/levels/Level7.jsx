import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Rocket,
  AlertTriangle,
  CheckCircle,
  Flame,
  RotateCcw,
  RefreshCw,
  Crosshair,
  Activity,
  ArrowDownToLine,
  Zap,
  Globe,
  Gauge,
  XCircle,
  ArrowLeftRight,
  Anchor,
  Info,
  Target,
  BookOpen,
  Medal,
  Lightbulb,
  AlertOctagon,
  ArrowLeft
} from "lucide-react";
import StarryBackground from "../components/ui/StarryBackground";

// --- MRD & CONFIGURATION ---
const MRD_CONTENT = {
  briefing: {
    title: "LEVEL 7: MARS ORBIT INSERTION",
    subtitle: "CRITICAL BRAKING MANEUVER",
    sections: [
      {
        label: "MISSION GOAL",
        text: "After 300 days of cruising through deep space, we're approaching Mars at 5.8 km/s. Your mission: Execute a precision braking burn to slow down and capture into a stable Mars orbit."
      },
      {
        label: "CRITICAL TASKS",
        items: [
          "ALIGNMENT: Rotate spacecraft to 0° (Retrograde) to point engines forward.",
          "TIMING: Wait until you're at Mars Periapsis (closest approach) - the top of the planet.",
          "BURN: Hold IGNITE LAM to brake. Target velocity: 4.0 - 4.4 km/s.",
          "CONFIRM: Click 'PARK IN ORBIT' when velocity is in green zone and near Mars."
        ]
      }
    ],
    physics_tip: {
      label: "PRO TIP: ORBITAL MECHANICS",
      text: "Fire engines when you're closest to Mars (Periapsis) for maximum efficiency. Too fast = flyby into deep space. Too slow = crash into surface. The green zone (4.0-4.4 km/s) is your safe capture window."
    }
  },
  failure_tips: {
    "FUEL EXHAUSTED": {
      title: "PROPELLANT DEPLETED",
      analysis:
        "The fuel tanks ran dry before achieving orbital velocity. This usually happens from burning too early when far from Mars, or maintaining a poor attitude angle.",
      correction:
        "Only burn when close to Mars (distance < 1000 km). Ensure attitude is near 0° for maximum braking efficiency. Each degree of misalignment wastes precious fuel."
    },
    "CRITICAL DECAY": {
      title: "VELOCITY TOO LOW - SURFACE IMPACT",
      analysis:
        "The spacecraft slowed below 3.0 km/s, the minimum velocity to maintain orbit. Mars gravity pulled the spacecraft down, resulting in atmospheric reentry and impact.",
      correction:
        "Monitor velocity carefully. Release the burn immediately if approaching 3.0 km/s. It's better to escape than crash."
    },
    "GRAVITY ESCAPE": {
      title: "FLYBY - MISSED MARS CAPTURE",
      analysis:
        "The spacecraft failed to slow down enough during the approach window and flew past Mars into deep space. Insufficient braking = permanent mission loss.",
      correction:
        "Start burning earlier and hold longer. You need to reduce from 5.8 km/s down to 4.0-4.4 km/s during the close approach window."
    },
    "VELOCITY HIGH": {
      title: "INSUFFICIENT BRAKING - ESCAPE TRAJECTORY",
      analysis:
        "Final velocity above 4.4 km/s exceeds Mars escape velocity. The spacecraft will continue on a hyperbolic trajectory away from Mars.",
      correction:
        "You didn't burn long enough. Hold IGNITE LAM longer to slow down further. Watch the velocity bar and aim for the green success zone."
    },
    "VELOCITY LOW": {
      title: "EXCESSIVE BRAKING - ORBITAL DECAY",
      analysis:
        "Final velocity below 4.0 km/s is insufficient to maintain a stable orbit. The spacecraft will gradually spiral into Mars atmosphere due to gravity.",
      correction:
        "You burned too long. Release IGNITE as soon as velocity enters the green zone (4.0-4.4 km/s). Precision is key."
    },
    "PREMATURE PARKING": {
      title: "PARKING ATTEMPT TOO FAR FROM MARS",
      analysis:
        "You attempted to park in orbit while still too far from Mars periapsis. Orbital insertion must occur at the closest approach point.",
      correction:
        "Wait until distance reads < 2000 km and you're passing Mars (top of screen). Only then attempt to park."
    }
  },
  success: {
    title: "MARS ORBIT CAPTURED",
    mission_impact:
      "Spectacular flying! MOM has successfully inserted into Mars orbit. After traveling 680 million kilometers over 300 days, we've achieved orbital capture with precision braking.",
    details: [
      {
        topic: "FLIGHT DATA",
        content:
          "• Mission Duration: 300 days\n• Total Distance: 680 million km\n• Final Orbit: 422 km × 76,994 km (elliptical)\n• Insertion Burn: ~24 minutes\n• Status: All systems nominal"
      },
      {
        topic: "MISSION VOCABULARY",
        content:
          "• MOI: Mars Orbit Insertion - the critical braking maneuver\n• LAM: Liquid Apogee Motor - main engine\n• PERIAPSIS: Closest point to Mars in orbit\n• APOAPSIS: Farthest point from Mars in orbit\n• CAPTURE WINDOW: Velocity range for stable orbit (4.0-4.4 km/s)"
      },
      {
        topic: "PERFORMANCE REPORT",
        content:
          "Your burn timing and attitude control were excellent. The spacecraft is now in a highly elliptical Mars orbit, perfectly positioned for the science mission phase."
      },
      {
        topic: "HISTORIC ACHIEVEMENT",
        content:
          "On September 24, 2014, India's Mars Orbiter Mission became the first Asian nation to reach Mars orbit, and the first nation to succeed on their very first attempt. You've just recreated this historic achievement!"
      }
    ]
  }
};

// --- Constants ---
const PHYSICS = {
  MARS_RADIUS: 3390, // km
  TARGET_VELOCITY: 4.2, // km/s (Midpoint of success range)
  ARRIVAL_VELOCITY: 5.8, // km/s
  CRASH_VELOCITY: 3.0, // km/s (Physics crash limit)
  ESCAPE_VELOCITY: 5.0, // km/s
  // Success range - more forgiving than before
  MIN_SUCCESS_VEL: 4.0,
  MAX_SUCCESS_VEL: 4.4,
  TARGET_APOAPSIS: 76994, // km
  TARGET_PERIAPSIS: 422, // km
  PARKING_MAX_DISTANCE: 2000 // km - can only park when close to Mars
};

const VISUALS = {
  MARS_CX: 400,
  MARS_CY: 300,
  TARGET_RX: 80
};

// --- Helper Components ---

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

const DashboardButton = ({
  label,
  onClick,
  disabled,
  variant = "neutral",
  active,
  icon: Icon,
  className = "",
  ...props
}) => {
  const variants = {
    neutral: "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700",
    primary: "bg-blue-700 border-blue-500 text-white hover:bg-blue-600",
    danger: "bg-red-700 border-red-500 text-white hover:bg-red-600",
    warning: "bg-amber-600 border-amber-400 text-white hover:bg-amber-500",
    success: "bg-green-700 border-green-500 text-white hover:bg-green-600"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onContextMenu={(e) => e.preventDefault()}
      className={`
        relative w-full py-3 px-4 flex items-center justify-center gap-2
        font-pixel text-xs uppercase tracking-widest transition-all select-none touch-none
        ${variants[variant]} ${active ? "brightness-125 scale-[0.98] border-t-4 border-b-0" : "border-b-4"}
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );
};

const TelemetryRow = ({ label, value, unit, color = "text-white" }) => (
  <div className="flex justify-between items-baseline border-b border-slate-800 pb-0.5 mb-0.5 last:border-0 last:mb-0">
    <span className="text-[7px] font-pixel text-slate-500">{label}</span>
    <span className={`font-mono text-[9px] ${color}`}>
      {value} <span className="text-[6px] opacity-70">{unit}</span>
    </span>
  </div>
);

const CRTOverlay = () => (
  <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-xl">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-16" />
  </div>
);

const Starfield = () => (
  <div
    className="absolute inset-0 opacity-60 pointer-events-none"
    style={{
      backgroundImage:
        "radial-gradient(white 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
      backgroundSize: "100px 100px, 40px 40px",
      backgroundPosition: "0 0, 20px 20px"
    }}
  />
);

export default function Level7MOI({ onBack, onNextLevel }) {
  // --- State ---
  // Modals
  const [showBriefing, setShowBriefing] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [failData, setFailData] = useState(null);

  const [gameState, setGameState] = useState({
    started: false,
    phase: "approach",
    velocity: PHYSICS.ARRIVAL_VELOCITY,
    fuel: 100,
    attitude: 180, // 180=Prograde(Left), 0=Retrograde(Right)
    distanceX: 400, // Visual X distance from Mars Center
    apoapsis: 999999,
    message: "STEP 1: ROTATE TO 0°",
    failureReason: null
  });

  const isBurningRef = useRef(false);
  const [isBurningUI, setIsBurningUI] = useState(false);
  const requestRef = useRef();

  // --- Physics Engine ---
  const loop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.started || prev.phase === "failed" || prev.phase === "success") return prev;

      let { phase, velocity, fuel, distanceX, message, attitude } = prev;
      let newPhase = phase;
      let newMessage = message;
      let newDistX = distanceX;
      let newVel = velocity;
      let newFuel = fuel;
      let fail = null;

      // Motion
      if (phase === "approach" || phase === "flyby") {
        const distCenter = Math.abs(distanceX);
        const speed = 0.5 + Math.max(0, 150 - distCenter) * 0.002;
        newDistX -= speed;

        // Periapsis Crossing Logic
        if (newDistX <= 0 && newDistX > -5 && phase === "approach") {
          if (newVel > PHYSICS.MAX_SUCCESS_VEL) {
            newPhase = "flyby";
            newMessage = "ALERT: VELOCITY HIGH! FLYBY IMMINENT!";
          }
        }

        // Flyby Fail (Distance limit)
        if (newDistX < -400) {
          fail = {
            title: "GRAVITY ESCAPE",
            desc: "Spacecraft failed to brake sufficiently and flew past Mars into deep space. Mission lost."
          };
          newPhase = "failed";
        }
      }

      // Guidance
      if (phase === "approach") {
        if (attitude > 10) newMessage = "STEP 1: ROTATE SPACECRAFT TO 0° (RETROGRADE)";
        else if (newDistX > 100) newMessage = "STEP 2: WAIT FOR PERIAPSIS (TOP OF MARS)";
        else if (newDistX <= 100 && newDistX > -100)
          newMessage = "STEP 3: IGNITE! BRAKE TO GREEN ZONE";
      }

      // Burn
      if (isBurningRef.current) {
        if (fuel <= 0) {
          fail = {
            title: "FUEL EXHAUSTED",
            desc: "Propellant tanks depleted before achieving orbital capture velocity."
          };
          newPhase = "failed";
        } else {
          const efficiency = Math.cos(attitude * (Math.PI / 180));
          const oberth = Math.max(0.5, 1 - Math.abs(newDistX) / 500);
          newFuel = Math.max(0, fuel - 0.3);
          const deltaV = 0.02 * efficiency * oberth;
          newVel = Math.max(0, velocity - deltaV);
        }
      }

      // Orbit Params
      const orbitFactor = Math.max(
        0,
        (newVel - PHYSICS.CRASH_VELOCITY) / (PHYSICS.ESCAPE_VELOCITY - PHYSICS.CRASH_VELOCITY)
      );
      let newApo = 0;
      if (newVel >= PHYSICS.ESCAPE_VELOCITY) newApo = 999999;
      else newApo = Math.round(PHYSICS.TARGET_APOAPSIS * Math.pow(orbitFactor / 0.55, 3));

      // Crash (Passive)
      if (newVel <= PHYSICS.CRASH_VELOCITY) {
        fail = {
          title: "CRITICAL DECAY",
          desc: "Velocity dropped below minimum orbital threshold. Mars gravity initiated uncontrolled descent and surface impact."
        };
        newPhase = "failed";
      }

      return {
        ...prev,
        phase: newPhase,
        velocity: newVel,
        fuel: newFuel,
        distanceX: newDistX,
        message: newMessage,
        apoapsis: newApo,
        failureReason: fail || prev.failureReason
      };
    });

    requestRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  // --- Handlers ---

  const handleStartFromBriefing = () => {
    setShowBriefing(false);
    setGameState((p) => ({ ...p, started: true }));
  };

  const handleAttitude = (e) => {
    const val = Number(e.target.value);
    setGameState((p) => ({ ...p, attitude: val }));
  };

  const startBurn = () => {
    isBurningRef.current = true;
    setIsBurningUI(true);
  };

  const stopBurn = () => {
    if (!isBurningRef.current) return;
    isBurningRef.current = false;
    setIsBurningUI(false);
  };

  const parkInOrbit = () => {
    setGameState((p) => {
      const { velocity, distanceX } = p;

      // Distance Check - FIXED LOOPHOLE
      if (Math.abs(distanceX) > PHYSICS.PARKING_MAX_DISTANCE) {
        return {
          ...p,
          phase: "failed",
          failureReason: {
            title: "PREMATURE PARKING",
            desc: `Cannot park in orbit while ${Math.abs(distanceX * 10).toFixed(0)} km from Mars. You must wait until closest approach (< ${PHYSICS.PARKING_MAX_DISTANCE * 10} km).`
          }
        };
      }

      // Strict Velocity Check [4.0, 4.4]
      if (velocity >= PHYSICS.MIN_SUCCESS_VEL && velocity <= PHYSICS.MAX_SUCCESS_VEL) {
        return { ...p, phase: "success" };
      } else if (velocity > PHYSICS.MAX_SUCCESS_VEL) {
        return {
          ...p,
          phase: "failed",
          failureReason: {
            title: "VELOCITY HIGH",
            desc: `Final velocity ${velocity.toFixed(2)} km/s exceeds maximum ${PHYSICS.MAX_SUCCESS_VEL} km/s. Spacecraft will escape Mars gravity well.`
          }
        };
      } else {
        return {
          ...p,
          phase: "failed",
          failureReason: {
            title: "VELOCITY LOW",
            desc: `Final velocity ${velocity.toFixed(2)} km/s is below minimum ${PHYSICS.MIN_SUCCESS_VEL} km/s. Orbit unstable - atmospheric drag will cause gradual decay.`
          }
        };
      }
    });
  };

  const failMission = useCallback((reason) => {
    setGameState((p) => ({ ...p, phase: "failed" }));
    setFailData(reason);
  }, []);

  // Auto-trigger success/fail modals
  useEffect(() => {
    if (gameState.phase === "success") {
      setTimeout(() => setShowSuccess(true), 1000);
    } else if (gameState.phase === "failed" && gameState.failureReason) {
      setTimeout(() => setFailData(gameState.failureReason.title), 500);
    }
  }, [gameState.phase, gameState.failureReason]);

  const reset = () => {
    setGameState({
      started: false,
      phase: "approach",
      velocity: PHYSICS.ARRIVAL_VELOCITY,
      fuel: 100,
      attitude: 180,
      distanceX: 400,
      apoapsis: 999999,
      message: "STEP 1: ROTATE TO 0°",
      failureReason: null
    });
    isBurningRef.current = false;
    setIsBurningUI(false);
    setShowSuccess(false);
    setFailData(null);
    setShowBriefing(true); // Show briefing on retry
  };

  // --- Visuals ---
  const { velocity, distanceX, attitude, phase, apoapsis, fuel } = gameState;
  const { MARS_CX, MARS_CY, TARGET_RX } = VISUALS;

  // Trajectory Logic
  const vDiff = velocity - PHYSICS.TARGET_VELOCITY;
  let currentRx = TARGET_RX;
  if (vDiff > 0) {
    currentRx = TARGET_RX + vDiff * 400;
  } else {
    currentRx = Math.max(30, TARGET_RX + vDiff * 40);
  }

  const currentRy = currentRx * 0.6;
  const orbitCy = 220 + currentRy;
  const orbitCx = MARS_CX;

  const visualShipX = MARS_CX + distanceX;
  const flybyY = 220 - 0.0015 * Math.pow(distanceX, 2);
  const xDist = visualShipX - MARS_CX;

  let captureY = 220;
  if (Math.abs(xDist) < currentRx)
    captureY = orbitCy - currentRy * Math.sqrt(1 - (xDist * xDist) / (currentRx * currentRx));

  let visualShipY = Math.abs(xDist) < currentRx ? captureY : flybyY;

  if (phase === "success") {
    visualShipY = 300 - Math.sqrt(Math.max(0, TARGET_RX * TARGET_RX - xDist * xDist));
    if (isNaN(visualShipY)) visualShipY = 300;
  }

  // Derive Trajectory Type
  let trajectoryType = "hyperbola";
  if (velocity >= PHYSICS.ESCAPE_VELOCITY) trajectoryType = "hyperbola";
  else if (velocity <= PHYSICS.CRASH_VELOCITY) trajectoryType = "crash";
  else trajectoryType = "capture";

  // Calculate Success Zone Bar Position
  const minVelPct = Math.min(100, Math.max(0, ((PHYSICS.MIN_SUCCESS_VEL - 2) / 4) * 100));
  const maxVelPct = Math.min(100, Math.max(0, ((PHYSICS.MAX_SUCCESS_VEL - 2) / 4) * 100));
  const successWidth = maxVelPct - minVelPct;

  return (
    <div className="min-h-screen bg-transparent text-slate-200 font-sans p-2 sm:p-4 select-none flex flex-col items-center justify-center relative">
      <StarryBackground />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', monospace; }
        @keyframes dash { to { stroke-dashoffset: -20; } }
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

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <Modal
          title={MRD_CONTENT.success.title}
          variant="success"
          buttonText="NEXT LEVEL"
          onClose={onNextLevel}
          onSecondary={reset}
          secondaryButtonText="REPLAY LEVEL"
        >
          <div className="space-y-3">
            <div className="bg-green-950/40 border border-green-700/50 p-3 rounded flex gap-3">
              <Medal className="text-green-400 shrink-0" size={20} />
              <p className="text-green-100">{MRD_CONTENT.success.mission_impact}</p>
            </div>

            {MRD_CONTENT.success.details.map((detail, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="text-blue-400" size={14} />
                  <span className="font-pixel text-[9px] text-blue-400">{detail.topic}</span>
                </div>
                <p className="text-slate-300 whitespace-pre-line ml-5">{detail.content}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* FAILURE MODAL */}
      {failData && MRD_CONTENT.failure_tips[failData] && (
        <Modal
          title="MISSION FAILED"
          variant="danger"
          buttonText="RETRY LEVEL"
          onClose={reset}
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
      <div className="w-full max-w-5xl border-b-4 border-slate-800 pb-4 mb-6 flex justify-between items-end">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <div className="w-14 h-14 bg-red-700 border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(185,28,28,0.5)]">
            <Globe className="text-white animate-pulse" size={32} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-pixel text-white">MARS ORBIT INSERTION</h1>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                PHASE: {phase.toUpperCase()}
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                LAM: ARMED
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setShowBriefing(true)}
            className="hidden sm:flex bg-slate-800 px-3 py-2 border border-slate-600 items-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <Info size={14} className="text-blue-400" />
            <span className="text-[10px] font-pixel text-slate-300">MRD DOCS</span>
          </button>
          <div className="text-right">
            <div className="text-[10px] font-pixel text-slate-500 mb-1">ALTITUDE (RELATIVE)</div>
            <div
              className={`font-mono text-xl ${Math.abs(distanceX) < 100 ? "text-green-400 animate-pulse" : distanceX < 0 ? "text-red-400" : "text-white"}`}
            >
              {Math.abs(distanceX * 10).toFixed(0)} km {distanceX < 0 ? "(PAST)" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* LEFT: ORBITAL VISUALIZER */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative aspect-video bg-black border-4 border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            {/* HUD Overlay - Telemetry Panel */}
            <div className="absolute top-4 left-4 z-20 w-36 bg-black/80 p-2 rounded border border-slate-600 backdrop-blur-sm shadow-lg">
              <div className="text-[7px] text-green-400 font-pixel mb-1 border-b border-slate-700 pb-0.5">
                FLIGHT TELEMETRY
              </div>

              {/* Primary: Velocity */}
              <div className="flex justify-between items-end mb-1">
                <div>
                  <div className="text-[7px] text-slate-400">VELOCITY</div>
                  <div
                    className={`text-base font-mono font-bold ${velocity >= PHYSICS.MIN_SUCCESS_VEL && velocity <= PHYSICS.MAX_SUCCESS_VEL ? "text-green-400" : "text-white"}`}
                  >
                    {velocity.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[7px] text-slate-400">TARGET</div>
                  <div className="text-[9px] font-mono text-green-500 font-bold">
                    {PHYSICS.MIN_SUCCESS_VEL} - {PHYSICS.MAX_SUCCESS_VEL}
                  </div>
                </div>
              </div>

              {/* Secondary: Orbit Params */}
              <div className="space-y-0.5 bg-slate-900/50 p-1 rounded">
                <TelemetryRow
                  label="PERIAPSIS"
                  value={"~" + PHYSICS.TARGET_PERIAPSIS}
                  unit="km"
                  color="text-green-300"
                />
                <TelemetryRow
                  label="APOAPSIS"
                  value={apoapsis > 500000 ? "UNBOUND" : (apoapsis / 1000).toFixed(1) + "k"}
                  unit="km"
                  color={
                    Math.abs(apoapsis - PHYSICS.TARGET_APOAPSIS) < 10000
                      ? "text-green-400"
                      : "text-amber-400"
                  }
                />
              </div>
            </div>

            {/* Message */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full text-center">
              <div
                className={`inline-block px-6 py-3 font-pixel text-xs border-2 shadow-lg backdrop-blur-md rounded
                        ${phase === "failed"
                    ? "bg-red-900/90 border-red-500 text-white"
                    : phase === "success"
                      ? "bg-green-900/90 border-green-500 text-white"
                      : isBurningUI
                        ? "bg-amber-900/90 border-amber-500 text-white animate-pulse"
                        : "bg-slate-900/90 border-blue-500 text-blue-300"
                  }
                    `}
              >
                {gameState.message}
              </div>
            </div>

            {/* Visualizer */}
            <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 800 600">
              <rect width="100%" height="100%" fill="transparent" />
              <Starfield />

              <circle
                cx={MARS_CX}
                cy={MARS_CY}
                r={40}
                fill="#b91c1c"
                stroke="#7f1d1d"
                strokeWidth="4"
              />
              <circle
                cx={MARS_CX}
                cy={MARS_CY}
                r={50}
                fill="none"
                stroke="#fca5a5"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.3"
              />

              <ellipse
                cx={MARS_CX}
                cy={MARS_CY}
                rx={TARGET_RX}
                ry={TARGET_RX}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeDasharray="6 6"
                opacity="0.4"
              />

              {phase !== "success" && phase !== "failed" && (
                <ellipse
                  cx={orbitCx}
                  cy={orbitCy}
                  rx={currentRx}
                  ry={currentRy}
                  fill="none"
                  stroke={
                    trajectoryType === "crash"
                      ? "#ef4444"
                      : trajectoryType === "capture"
                        ? "#22c55e"
                        : "#ffffff"
                  }
                  strokeWidth="3"
                  className={isBurningUI ? "opacity-100" : "opacity-60"}
                />
              )}

              {phase === "success" && (
                <ellipse
                  cx={MARS_CX}
                  cy={MARS_CY}
                  rx={TARGET_RX}
                  ry={TARGET_RX}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                />
              )}

              <g transform={`translate(${visualShipX}, ${visualShipY}) rotate(${attitude})`}>
                <path d="M 10 0 L -10 -6 L -10 6 Z" fill="white" />
                <rect x="-5" y="-12" width="5" height="24" fill="#1e40af" />
                {isBurningUI && (
                  <path d="M -10 0 L -25 -5 L -25 5 Z" fill="#fbbf24" className="animate-pulse" />
                )}
              </g>
            </svg>
            <CRTOverlay />
          </div>
        </div>

        {/* RIGHT: CONTROL PANEL */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 border-4 border-slate-700 p-4 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-pixel text-slate-400">ROTATION CONTROL</span>
              <span
                className={`font-mono text-xs ${Math.abs(attitude - 0) < 5 ? "text-green-400" : "text-amber-400"}`}
              >
                {attitude}° {attitude < 10 ? "(RETRO)" : attitude > 170 ? "(PRO)" : ""}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="180"
              value={attitude}
              onChange={handleAttitude}
              className="w-full h-6 bg-slate-800 rounded-lg appearance-none cursor-pointer border border-slate-600 accent-blue-500"
              style={{ direction: "rtl" }}
              disabled={phase === "success" || phase === "failed"}
            />
            <div className="flex justify-between mt-1 text-[9px] font-mono text-slate-500">
              <span>0° (RIGHT)</span>
              <span>180° (LEFT)</span>
            </div>
          </div>

          <div className="bg-slate-900 border-4 border-slate-700 p-4 rounded-xl shadow-xl flex-1 flex flex-col justify-between relative overflow-hidden">
            {attitude > 10 && phase === "approach" && (
              <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center backdrop-blur-[1px] p-4 text-center">
                <div className="text-red-400 font-pixel text-[10px] mb-2 border border-red-500 px-2 py-1 bg-black">
                  ALIGNMENT REQUIRED
                </div>
                <p className="text-slate-400 text-[9px] font-mono">Rotate to 0° (Retrograde)</p>
              </div>
            )}

            <div>
              <div className="text-[10px] font-pixel text-slate-400 mb-1">MAIN ENGINE (LAM)</div>

              {/* Visual Velocity Bar in Controls */}
              <div className="h-4 w-full bg-slate-800 rounded mb-4 overflow-hidden border border-slate-600 relative">
                {/* Success Zone */}
                <div
                  className="absolute h-full bg-green-500/50 w-[5%] left-[50%] border-x border-green-400"
                  style={{
                    left: `${minVelPct}%`,
                    width: `${successWidth}%`
                  }}
                />
                <div
                  className="absolute top-0 h-full w-1 bg-white"
                  style={{ left: `${Math.min(100, Math.max(0, ((velocity - 2) / 4) * 100))}%` }}
                />
              </div>

              <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-2">
                  <Flame
                    size={20}
                    className={isBurningUI ? "text-orange-500 animate-bounce" : "text-slate-600"}
                  />
                  <span className="font-mono text-white text-sm">
                    {isBurningUI ? "BRAKING..." : "IDLE"}
                  </span>
                </div>
                <div className="font-mono text-orange-400 text-sm">FUEL {fuel.toFixed(0)}%</div>
              </div>
            </div>

            <DashboardButton
              label="IGNITE LAM"
              variant={isBurningUI ? "warning" : "danger"}
              icon={Flame}
              className="h-32 text-lg shadow-inner"
              onMouseDown={startBurn}
              onMouseUp={stopBurn}
              onMouseLeave={stopBurn}
              onTouchStart={(e) => {
                e.preventDefault();
                startBurn();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopBurn();
              }}
              disabled={fuel <= 0 || phase === "success" || phase === "failed" || phase === "flyby"}
            />
          </div>

          <DashboardButton
            label={phase === "success" ? "ORBIT CONFIRMED" : "PARK IN ORBIT"}
            variant="success"
            icon={Anchor}
            onClick={parkInOrbit}
            disabled={phase === "success" || phase === "failed"}
            className={
              velocity >= PHYSICS.MIN_SUCCESS_VEL && velocity <= PHYSICS.MAX_SUCCESS_VEL
                ? "animate-pulse"
                : "opacity-50"
            }
          />
        </div>
      </div>
    </div>
  );
}
