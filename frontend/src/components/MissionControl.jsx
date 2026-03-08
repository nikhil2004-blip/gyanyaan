import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMission } from "../context/MissionContext";
import Level1 from "../levels/Level1";
import Level2 from "../levels/Level2";
import Level3 from "../levels/Level3";
import Level4 from "../levels/Level4";
import Level5 from "../levels/Level5";
import Level6 from "../levels/Level6";
import Level7 from "../levels/Level7";
import Level8 from "../levels/Level8";

const LEVEL_COMPONENTS = { 1: Level1, 2: Level2, 3: Level3, 4: Level4, 5: Level5, 6: Level6, 7: Level7, 8: Level8 };

const MissionControl = () => {
  const { missionId, levelId } = useParams();
  const navigate = useNavigate();
  const { saveLevelProgress } = useAuth();

  const levelNum = parseInt(levelId, 10);
  const LevelComponent = LEVEL_COMPONENTS[levelNum];
  const { syncWithLevel } = useMission();

  React.useEffect(() => {
    syncWithLevel(levelNum);
  }, [levelNum]);

  const goToLevelSelect = () => {
    // If there is history, go back to pop the stack. Otherwise, navigate to the levels page.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(`/missions/${missionId}/levels`);
    }
  };

  const handleLevelComplete = async () => {
    await saveLevelProgress(missionId, levelNum);
    if (levelNum < 8) {
      // replace so back button goes to level-select, not previous level
      navigate(`/missions/${missionId}/levels/${levelNum + 1}`, { replace: true });
    } else {
      // mission complete — back to mission map, clear the level from history
      navigate("/missions", { replace: true });
    }
  };

  // Unknown level
  if (!LevelComponent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">LEVEL NOT FOUND</h2>
          <button onClick={goToLevelSelect} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded">
            ← BACK TO LEVELS
          </button>
        </div>
      </div>
    );
  }

  return (
    <LevelComponent
      onNextLevel={handleLevelComplete}
      onBack={goToLevelSelect}
    />
  );
};

export default MissionControl;
