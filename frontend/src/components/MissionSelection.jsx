import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SciFiCard from "./ui/SciFiCard";
import TechButton from "./ui/TechButton";
import StarryBackground from "./ui/StarryBackground";
import { CheckCircle, Award, Trophy, Star } from "lucide-react";

const MISSION_DATA = {
  mangalyaan: {
    id: "mangalyaan",
    name: "MANGALYAAN",
    locked: false,
    type: "orbiter",
    visual: "bg-[radial-gradient(circle_at_30%_30%,_#ef4444,_#7f1d1d)]",
    shadow: "shadow-[0_0_40px_rgba(239,68,68,0.6)]",
    texture: "https://www.transparenttextures.com/patterns/stardust.png",
    summary: {
      title: "Mars Orbiter Mission Complete",
      achievements: [
        "First Asian nation to reach Mars orbit",
        "First nation to succeed on first attempt",
        "Lowest cost Mars mission in history ($74M)",
        "Detected methane in Martian atmosphere",
        "Captured 1000s of high-resolution images",
        "Mission lasted 8+ years (planned 6 months)"
      ],
      stats: [
        { label: "Launch Date", value: "November 5, 2013" },
        { label: "Mars Arrival", value: "September 24, 2014" },
        { label: "Mission Cost", value: "$74 million" },
        { label: "Total Levels", value: "8/8 Complete" }
      ]
    }
  },
  chandrayaan: {
    id: "chandrayaan",
    name: "CHANDRAYAAN-3",
    locked: true,
    type: "lander",
    visual: "bg-[radial-gradient(circle_at_30%_30%,_#e5e7eb,_#4b5563)]",
    shadow: "shadow-[0_0_40px_rgba(255,255,255,0.4)]",
    texture: "https://www.transparenttextures.com/patterns/asfalt-dark.png"
  },
  adityal1: {
    id: "adityal1",
    name: "ADITYA-L1",
    locked: true,
    type: "solar",
    visual: "bg-[radial-gradient(circle_at_center,_#fcd34d,_#b45309,_#7c2d12)] animate-pulse-slow",
    shadow: "shadow-[0_0_60px_rgba(251,191,36,0.7)]",
    texture: "https://www.transparenttextures.com/patterns/arches.png"
  },
  gaganyaan: {
    id: "gaganyaan",
    name: "GAGANYAAN",
    locked: true,
    type: "human",
    visual: "bg-[radial-gradient(circle_at_30%_30%,_#3b82f6,_#1e3a8a)]",
    shadow: "shadow-[0_0_50px_rgba(59,130,246,0.6)]",
    texture: "https://www.transparenttextures.com/patterns/broken-noise.png"
  }
};

const levels = Object.values(MISSION_DATA);

const MapNode = ({ level, onClick, delay, isComplete, onViewSummary }) => {
  return (
    <motion.div
      className="transform z-20"
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: 0
      }}
      transition={{ delay: delay, type: "spring", stiffness: 100 }}
    >
      <motion.div
        className="relative flex flex-col items-center focus:outline-none"
        animate={{
          y: [0, -15, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 2
        }}
      >
        {/* PIXEL CARD CONTAINER */}
        <button onClick={() => onClick(level)} disabled={level.locked} className="w-full">
          <motion.div
            whileHover={{
              scale: !level.locked ? 1.05 : 1,
              filter: !level.locked ? "brightness(1.2)" : "none"
            }}
            whileTap={{ scale: !level.locked ? 0.95 : 1 }}
            className={`
              w-64 h-80 bg-slate-900/90 border-4 relative overflow-hidden flex flex-col items-center justify-start pt-6 gap-6 p-4
              ${level.locked
                ? "border-gray-700 opacity-70 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                : isComplete
                  ? "border-green-500 box-glow-hover shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                  : "border-neonBlue box-glow-hover shadow-[0_0_40px_rgba(0,240,255,0.3)]"
              }
              transition-all duration-300
            `}
          >
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 bg-white"></div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-white"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 bg-white"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-white"></div>

            {/* Completion Badge */}
            {isComplete && (
              <div className="absolute top-4 right-4 z-40 bg-green-500 rounded-full p-2 border-2 border-white shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-pulse">
                <CheckCircle size={24} className="text-white" />
              </div>
            )}

            {/* Lock Overlay */}
            {level.locked && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <div className="bg-black p-4 border-4 border-gray-600 shadow-2xl">
                  <span className="text-3xl opacity-80">🔒</span>
                </div>
              </div>
            )}

            {/* Planet */}
            <div
              className={`w-36 h-36 rounded-full relative overflow-hidden border-4 shrink-0 shadow-2xl
                ${level.locked
                  ? "grayscale brightness-50 border-gray-600"
                  : `border-white/20 ${level.shadow}`
                } ${level.visual}`}
            >
              <div className="absolute inset-0 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.8),inset_5px_5px_10px_rgba(255,255,255,0.2)]"></div>
              <div
                className="absolute inset-0 opacity-40 mix-blend-overlay"
                style={{ backgroundImage: `url(${level.texture})` }}
              ></div>
            </div>

            {/* Card Content */}
            <div className="w-full text-center space-y-4 mt-auto pb-6 relative z-10">
              <div
                className={`mx-auto px-3 py-2 text-[10px] md:text-xs font-pixel tracking-widest uppercase border-y-2 bg-black/80 backdrop-blur-md shadow-lg ${level.locked
                    ? "border-gray-700 text-gray-500"
                    : isComplete
                      ? "border-green-500 text-green-400"
                      : "border-neonBlue text-neonBlue"
                  }`}
              >
                {level.name}
              </div>

              {isComplete && (
                <div className="flex justify-center items-center gap-1 text-yellow-400">
                  <Trophy size={14} className="animate-bounce" />
                  <span className="text-[10px] font-pixel">COMPLETE</span>
                </div>
              )}

              {!level.locked && !isComplete && (
                <div className="flex justify-center space-x-2 text-[10px] text-yellow-400">
                  <span className="drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">⭐</span>
                  <span className="drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">⭐</span>
                  <span className="opacity-30 text-white">☆</span>
                </div>
              )}

              <div className="text-[9px] font-pixel text-slate-400 uppercase tracking-[0.2em]">
                {level.type} CLASS
              </div>
            </div>
          </motion.div>
        </button>

        {/* Mission Summary Button (shown below card when complete) */}
        {isComplete && onViewSummary && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewSummary(level);
            }}
            className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-500 border-2 border-green-400 text-white font-pixel text-[10px] uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center gap-2"
          >
            <Award size={14} />
            VIEW MISSION SUMMARY
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

const MissionBriefing = ({ mission, onClose, onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
    >
      <SciFiCard
        className="w-full max-w-2xl border-white/20"
        glowing
        title={`MISSION: ${mission.name}`}
      >
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Planet Preview */}
            <div
              className={`w-32 h-32 md:w-40 md:h-40 rounded-full shrink-0 border-4 border-white/10 shadow-2xl relative overflow-hidden ${mission.visual}`}
            >
              <div className="absolute inset-0 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.8)]"></div>
              <div
                className="absolute inset-0 opacity-40 mix-blend-overlay"
                style={{ backgroundImage: `url(${mission.texture})` }}
              ></div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs text-neonBlue font-mono tracking-widest">
                  MISSION PROFILE
                </span>
                <span className="text-sm font-bold text-white uppercase bg-white/10 px-2 py-0.5 rounded">
                  {mission.type} CLASS
                </span>
              </div>
              <p className="text-gray-300 font-mono text-sm leading-relaxed">
                COMMANDER, the <span className="text-white font-bold">{mission.name}</span> mission
                is ready for launch sequence.
                <br />
                <br />
                <span className="text-techGreen font-bold">OBJECTIVE:</span> Establish orbit and
                deploy payload.
                <br />
                <span className="text-techOrange font-bold">CONSTRAINTS:</span> Manage fuel levels
                and orbital trajectory.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-white/5">
            <TechButton variant="neutral" onClick={onClose}>
              Abort
            </TechButton>
            <TechButton variant="primary" onClick={onStart}>
              INITIATE MISSION
            </TechButton>
          </div>
        </div>
      </SciFiCard>
    </motion.div>
  );
};

const ProfileModal = ({ user, profile, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm bg-[#0a0a16] border border-white/20 rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(0,240,255,0.3)]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        {/* Header Banner */}
        <div className="h-24 bg-gradient-to-r from-neonBlue to-purple-600 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Avatar */}
        <div className="relative -mt-10 mb-4 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-black border-4 border-[#0a0a16] flex items-center justify-center relative z-10">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-techGreen to-emerald-600 flex items-center justify-center text-3xl font-black text-black">
              {profile?.nickname
                ? profile.nickname[0].toUpperCase()
                : user?.displayName
                  ? user.displayName[0].toUpperCase()
                  : "?"}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <h2 className="text-xl font-black text-white tracking-widest uppercase mb-1">
            {profile?.nickname || user?.displayName}
          </h2>
          <p className="text-neonBlue text-xs font-mono tracking-[0.2em] uppercase mb-4">
            LEVEL 01 ACCESS
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded p-3 border border-white/10">
              <p className="text-gray-500 text-[10px] uppercase font-bold text-left mb-1">
                Expertise
              </p>
              <p className="text-white text-sm font-mono text-left uppercase">
                {profile?.expertise || "UNKNOWN"}
              </p>
            </div>
            <div className="bg-white/5 rounded p-3 border border-white/10">
              <p className="text-gray-500 text-[10px] uppercase font-bold text-left mb-1">Age</p>
              <p className="text-white text-sm font-mono text-left">{profile?.age || "N/A"} YRS</p>
            </div>
          </div>

          <div className="text-left text-xs text-gray-400 font-mono space-y-2 mb-6">
            <p className="flex justify-between">
              <span>MEMBERSHIP ID:</span>
              <span className="text-white font-bold">#{user?.uid.slice(0, 8).toUpperCase()}</span>
            </p>
            <p className="flex justify-between">
              <span>STATUS:</span>
              <span className="text-techGreen font-bold">ACTIVE</span>
            </p>
            <p className="flex justify-between">
              <span>JOINED:</span>
              <span className="text-white">
                {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : "Today"}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded font-bold uppercase text-xs tracking-widest transition-colors"
          >
            Close Profile
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const MissionSummaryModal = ({ mission, onClose }) => {
  if (!mission?.summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#0a0a16] border-4 border-green-500 rounded-xl overflow-hidden relative shadow-[0_0_50px_rgba(34,197,94,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 relative">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Trophy className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-pixel text-white">{mission.summary.title}</h2>
              <p className="text-[10px] text-green-100 font-mono mt-1">
                MISSION COMPLETE • 100% SUCCESS RATE
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scroll">
          {/* Achievements */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="text-yellow-400" size={20} />
              <h3 className="font-pixel text-sm text-yellow-400">KEY ACHIEVEMENTS</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {mission.summary.achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-green-950/30 border border-green-700/50 p-3 rounded"
                >
                  <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">{achievement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="text-blue-400" size={20} />
              <h3 className="font-pixel text-sm text-blue-400">MISSION DATA</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {mission.summary.stats.map((stat, idx) => (
                <div key={idx} className="bg-blue-950/30 border border-blue-700/50 p-3 rounded">
                  <p className="text-[10px] text-blue-300 font-pixel mb-1">{stat.label}</p>
                  <p className="text-sm text-white font-mono">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Closing Message */}
          <div className="bg-gradient-to-r from-purple-950/50 to-blue-950/50 border-2 border-purple-500/30 p-4 rounded-lg text-center">
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="text-purple-400 font-pixel text-xs">CONGRATULATIONS!</span>
              <br />
              <br />
              You have successfully completed the Mangalyaan mission and made history. Your
              exceptional performance demonstrates the skills needed for India's next great space
              adventures.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 border-2 border-green-400 text-white font-pixel text-[10px] uppercase tracking-wider transition-all"
          >
            CLOSE
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const MissionSelection = ({ onBack, onMissionStart }) => {
  const { currentUser, userProfile, logout, getLevelProgress } = useAuth();
  const [selectedMission, setSelectedMission] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSummary, setShowSummary] = useState(null);
  const [missionProgress, setMissionProgress] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch mission progress
  useEffect(() => {
    const fetchProgress = async () => {
      if (!currentUser) return;

      const mangalyaanProgress = await getLevelProgress("mangalyaan");
      const chandrayaanProgress = await getLevelProgress("chandrayaan");

      console.log("📊 Mission Progress Loaded:", {
        mangalyaan: mangalyaanProgress,
        chandrayaan: chandrayaanProgress
      });

      setMissionProgress({
        mangalyaan: mangalyaanProgress,
        chandrayaan: chandrayaanProgress
      });
    };

    fetchProgress();
  }, [currentUser, getLevelProgress]);

  // Check for auto-show profile from navigation state
  useEffect(() => {
    if (location.state?.showProfile) {
      setShowProfile(true);
      // Clear state so it doesn't reopen on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleMissionStart = () => {
    if (onMissionStart) {
      onMissionStart(selectedMission);
    }
  };

  const handleLogout = async () => {
    try {
      navigate("/", { replace: true });
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Determine which missions are complete and unlocked
  const getMissionStatus = (missionId) => {
    const progress = missionProgress[missionId];
    const isComplete = progress?.missionComplete || false;
    let isLocked = MISSION_DATA[missionId].locked;

    // Unlock Chandrayaan if Mangalyaan is complete
    if (missionId === "chandrayaan" && missionProgress.mangalyaan?.missionComplete) {
      isLocked = false;
    }

    console.log(`🎯 Mission Status (${missionId}):`, {
      progress,
      isComplete,
      isLocked
    });

    return { isComplete, isLocked };
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden flex flex-col font-sans">
      <StarryBackground />

      {/* Inject Pixel Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel { font-family: 'Press Start 2P', cursive; }
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: #1e293b; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>

      {/* Header */}
      <div className="relative z-30 px-4 py-6 md:px-8 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Profile Button */}
        <div className="flex items-center w-full md:w-auto justify-between md:justify-start space-x-4 z-20">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-4 bg-slate-900/80 px-4 py-3 md:px-6 md:py-4 rounded-xl border-2 border-white/20 backdrop-blur-md hover:bg-slate-800/90 hover:border-neonBlue transition-all group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-tr from-neonBlue to-purple-600 flex items-center justify-center text-sm md:text-lg font-pixel font-bold border-2 border-white/20 group-hover:scale-110 transition-transform shadow-lg">
              {userProfile?.nickname
                ? userProfile.nickname[0].toUpperCase()
                : currentUser?.displayName
                  ? currentUser.displayName[0]
                  : "C"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs md:text-sm font-pixel text-white leading-none tracking-widest uppercase mb-2 group-hover:text-neonBlue transition-colors">
                {userProfile?.nickname || currentUser?.displayName || "COMMANDER"}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-[8px] md:text-[10px] text-gray-400 leading-none font-mono">
                  LEVEL 01 ACCESS
                </p>
              </div>
            </div>
          </button>

          {/* Mobile Logout (visible only on small screens next to profile) */}
          <div className="md:hidden">
            <TechButton
              variant="danger"
              onClick={handleLogout}
              className="text-[10px] py-3 px-4 font-pixel border-2"
            >
              LOGOUT
            </TechButton>
          </div>
        </div>

        {/* Title */}
        <div className="md:absolute md:left-1/2 md:-translate-x-1/2 md:top-10 order-last md:order-none mt-2 md:mt-0">
          <h1 className="text-2xl md:text-4xl font-pixel tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 text-glow opacity-90 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] text-center">
            MISSION MAP
          </h1>
        </div>

        {/* Desktop Logout */}
        <div className="hidden md:block z-20">
          <TechButton
            variant="danger"
            onClick={handleLogout}
            className="ml-4 text-xs py-4 px-8 font-pixel border-2"
          >
            LOGOUT
          </TechButton>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative w-full h-full max-w-7xl mx-auto z-10 flex flex-col items-center justify-center p-8">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 relative z-20">
          {levels.map((level, index) => {
            const { isComplete, isLocked } = getMissionStatus(level.id);
            const levelWithStatus = { ...level, locked: isLocked };

            return (
              <div key={level.id} className="relative group">
                {index < levels.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-12 w-12 h-1 bg-white/20 z-0"></div>
                )}

                <MapNode
                  level={levelWithStatus}
                  onClick={setSelectedMission}
                  delay={index * 0.1}
                  isComplete={isComplete}
                  onViewSummary={setShowSummary}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedMission && (
          <MissionBriefing
            mission={selectedMission}
            onClose={() => setSelectedMission(null)}
            onStart={handleMissionStart}
          />
        )}
        {showProfile && (
          <ProfileModal
            user={currentUser}
            profile={userProfile}
            onClose={() => setShowProfile(false)}
          />
        )}
        {showSummary && (
          <MissionSummaryModal mission={showSummary} onClose={() => setShowSummary(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MissionSelection;
