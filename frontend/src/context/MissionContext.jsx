import React, { createContext, useContext, useState, useEffect } from "react";

const MissionContext = createContext();

export function useMission() {
    return useContext(MissionContext);
}

export function MissionProvider({ children }) {
    // --- Mission Configuration (Mangalyaan / MOM) ---
    // PSLV-XL Lift-off mass is ~320,000 kg total. 
    // We model fuel specifically: 
    // Launch Phases (PSLV Stages 1-4 fuel): ~263,500 kg
    // Payload (Orbiter) Fuel (LAM & RCS): ~852 kg
    // Total Initial Fuel = 264,352 kg
    const INITIAL_FUEL = 264352;
    const PAYLOAD_FUEL = 852;

    // Timeline: Nov 5, 2013 (Launch) -> Sep 24, 2014 (Arrival)
    const START_DATE = new Date("2013-11-05T09:08:00Z");

    const [fuel, setFuel] = useState(INITIAL_FUEL);
    const [currentDate, setCurrentDate] = useState(START_DATE);
    const [isActive, setIsActive] = useState(false); // Track if a run is ongoing

    // Live simulation tick when a mission level is active
    useEffect(() => {
        let interval;
        if (isActive) {
            // Update fuel and time every 1 second
            interval = setInterval(() => {
                setFuel((prev) => {
                    // Burn fuel faster during launch vehicle stages, vastly slower during payload cruise
                    const burnRate = prev > 1000 ? 25.5 : 0.08;
                    return Math.max(0, prev - burnRate);
                });

                setCurrentDate((prev) => {
                    // Fast-forward time so the clock is obviously ticking (+15 minutes per real second)
                    return new Date(prev.getTime() + 1000 * 60 * 15);
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    // Set the mission to appropriate phases based on the level ID to support direct level hopping
    const syncWithLevel = (levelId) => {
        setIsActive(true);
        let targetFuel = INITIAL_FUEL;
        let targetDate = new Date(START_DATE);

        switch (levelId) {
            case 1: // Assembly - Nov 5 2013
                targetFuel = INITIAL_FUEL;
                targetDate = new Date(START_DATE);
                break;
            case 2: // Ascent Phase - Nov 5 2013 - Starts using PSLV Fuel
                targetFuel = INITIAL_FUEL;
                targetDate = new Date(START_DATE);
                break;
            case 3: // Earth Orbit - Nov 7 2013
                targetFuel = PAYLOAD_FUEL + 50; // Approximating some LAM burns
                targetDate = new Date("2013-11-07T00:00:00Z");
                break;
            case 4: // Orbit Raiser - Nov 16 2013
                targetFuel = PAYLOAD_FUEL;
                targetDate = new Date("2013-11-16T00:00:00Z");
                break;
            case 5: // Trans-Mars Injection - Dec 1 2013
                targetFuel = PAYLOAD_FUEL - 190; // Just an approximation of orbital raising expenditure
                targetDate = new Date("2013-12-01T00:00:00Z");
                break;
            case 6: // Mars Transfer - Cruise - Dec 2013 to Sept 2014
                targetFuel = PAYLOAD_FUEL - 300;
                targetDate = new Date("2014-06-11T00:00:00Z"); // Mid-course correction date
                break;
            case 7: // Mars Orbit Insertion - Sept 24 2014
                targetFuel = PAYLOAD_FUEL - 350;
                targetDate = new Date("2014-09-24T00:00:00Z");
                break;
            case 8: // Science Ops - Oct 2014+
                targetFuel = PAYLOAD_FUEL - 600; // Remaining fuel for operations
                targetDate = new Date("2014-10-01T00:00:00Z");
                break;
            default:
                break;
        }

        setFuel(targetFuel);
        setCurrentDate(targetDate);
    };

    const burnFuel = (amount) => {
        setFuel((prev) => Math.max(0, prev - amount));
    };

    const advanceTime = (days) => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        });
    };

    const resetMission = () => {
        setFuel(INITIAL_FUEL);
        setCurrentDate(START_DATE);
        setIsActive(false);
    };

    const value = {
        fuel,
        currentDate,
        isActive,
        burnFuel,
        advanceTime,
        syncWithLevel,
        resetMission
    };

    return (
        <MissionContext.Provider value={value}>
            {children}
        </MissionContext.Provider>
    );
}
