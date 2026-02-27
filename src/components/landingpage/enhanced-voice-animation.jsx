import { useEffect, useState } from "react"
import { useMediaQuery } from "../../hooks/use-media-query"

export default function EnhancedVoiceAnimation() {
    const [isAnimating, setIsAnimating] = useState(false)
    const [activeWave, setActiveWave] = useState(0)
    const isMobile = useMediaQuery("(max-width: 768px)")

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating((prev) => !prev)
            setActiveWave((prev) => (prev + 1) % 3)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative flex items-center justify-center p-4 md:p-12">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />

            <div className="relative flex flex-row items-center justify-center md:space-x-8 space-y-8 md:space-y-0">
                {/* Phone Side */}
                <div className="h-full flex flex-col  items-center space-y-4 md:space-y-6 group">
                    <div className="relative mt-8 md:mt-0">
                        <div
                            className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${isAnimating ? "animate-pulse scale-110 shadow-indigo-500/50" : "shadow-indigo-600/30"
                                }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-8 h-8 md:w-10 md:h-10 text-white"
                            >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </div>
                        {/* Ripple Effect */}
                        {isAnimating && (
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-600/30 animate-ping" />
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-graphite">Incoming Call</p>
                        <p className="text-xs text-graphite/60">Restaurant Booking</p>
                    </div>
                </div>

                {/* Enhanced Voice Waveform */}
                <div className="flex items-center space-x-1 md:space-x-2 mx-4 md:mx-12">
                    {[...Array(isMobile ? 8 : 12)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1 md:w-1.5 rounded-full transition-all duration-300 ${activeWave === 0
                                    ? "bg-gradient-to-t from-indigo-600 to-indigo-400"
                                    : activeWave === 1
                                        ? "bg-gradient-to-t from-emerald-500 to-emerald-400"
                                        : "bg-gradient-to-t from-indigo-500 to-emerald-500"
                                }`}
                            style={{
                                height: isAnimating ? `${Math.random() * (isMobile ? 30 : 50) + 15}px` : "8px",
                                animationDelay: `${i * 0.1}s`,
                                transform: isAnimating ? `scaleY(${Math.random() * 2 + 0.5})` : "scaleY(1)",
                            }}
                        />
                    ))}
                </div>

                {/* AI Agent Side */}
                <div className="flex flex-col items-center space-y-4 md:space-y-6 group">
                    <div className="relative">
                        <div
                            className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${isAnimating ? "animate-pulse scale-110 shadow-emerald-500/50" : "shadow-emerald-500/30"
                                }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-8 h-8 md:w-10 md:h-10 text-white"
                            >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                        </div>
                        {/* AI Indicator */}
                        <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-3 h-3 text-white"
                            >
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </div>
                        {/* Success Ripple */}
                        {isAnimating && (
                            <div
                                className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping"
                                style={{ animationDelay: "0.5s" }}
                            />
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-graphite">AI Responding</p>
                        <p className="text-xs text-graphite/60">Booking Confirmed</p>
                    </div>
                </div>
            </div>

            {/* Floating Elements - Reduced on mobile */}
            {!isMobile && (
                <>
                    <div className="absolute top-4 left-4 w-3 h-3 bg-indigo-600/40 rounded-full animate-bounce-slow" />
                    <div className="absolute bottom-4 right-4 w-2 h-2 bg-emerald-500/40 rounded-full animate-pulse-slow" />
                    <div className="absolute top-1/2 left-2 w-1 h-1 bg-indigo-500/60 rounded-full animate-ping" />
                </>
            )}
        </div>
    )
}
