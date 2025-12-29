import React from "react";
import clsx from "clsx";

const SciFiCard = ({ children, className, title, glowing = false, noPadding = false }) => {
  return (
    <div
      className={clsx(
        "relative bg-spaceBlue/50 border border-white/10 backdrop-blur-md overflow-hidden",
        glowing && "box-glow border-neonBlue/30",
        className
      )}
    >
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-neonBlue opacity-70"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-neonBlue opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-neonBlue opacity-70"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-neonBlue opacity-70"></div>

      {title && (
        <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-widest uppercase text-neonBlue">{title}</h3>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <div className="w-1 h-1 bg-white/10 rounded-full"></div>
          </div>
        </div>
      )}

      <div className={clsx(!noPadding && "p-4")}>{children}</div>
    </div>
  );
};

export default SciFiCard;
