import React from "react";
import clsx from "clsx";

const TechButton = ({ children, onClick, variant = "primary", className, disabled = false }) => {
  const variants = {
    primary: "bg-neonBlue/20 text-neonBlue border-neonBlue hover:bg-neonBlue hover:text-black",
    danger: "bg-techRed/20 text-techRed border-techRed hover:bg-techRed hover:text-white",
    success: "bg-techGreen/20 text-techGreen border-techGreen hover:bg-techGreen hover:text-black",
    neutral: "bg-white/5 text-gray-400 border-white/10 hover:border-white/50 hover:text-white"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "relative group px-6 py-3 border transition-all duration-300 font-bold uppercase tracking-wider text-sm",
        "clip-corner-br", // Custom class for clipped corner
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed grayscale",
        className
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>

      {/* Tech Decoration */}
      {!disabled && (
        <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity"></div>
      )}
    </button>
  );
};

export default TechButton;
