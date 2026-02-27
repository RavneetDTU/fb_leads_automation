import React from "react";

const VoiceCallAnimationCircle = () => {
  return (
    <div>
      <div className="relative w-64 h-64 rounded-full flex items-center justify-center shadow-md shrink-0 overflow-hidden">
        {/* Animated spinning background */}
        <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-tr from-green-400 to-rose-300 blur-sm" />
        {/* Foreground */}
        <div className="relative z-10 flex items-center justify-center w-full h-full"></div>
      </div>
    </div>
  );
}
export default VoiceCallAnimationCircle;
