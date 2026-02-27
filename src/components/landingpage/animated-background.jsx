import { useEffect, useState } from "react"
import { useMediaQuery } from "../../hooks/use-media-query"

export default function AnimatedBackground() {
    const isMobile = useMediaQuery("(max-width: 768px)")
    const [reducedMotion, setReducedMotion] = useState(false)

    useEffect(() => {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        setReducedMotion(prefersReducedMotion)
    }, [])

    // Reduce complexity on mobile or when reduced motion is preferred
    const complexity = isMobile || reducedMotion ? "reduced" : "full"

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-snow via-indigo-50 to-indigo-100" />

            {/* Floating Blobs - Reduced on mobile */}
            {complexity === "full" ? (
                <>
                    <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-600/20 to-indigo-500/20 rounded-full blur-3xl animate-float" />
                    <div
                        className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-emerald-500/15 to-indigo-600/15 rounded-full blur-3xl animate-float"
                        style={{ animationDelay: "2s" }}
                    />
                    <div
                        className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-full blur-3xl animate-float"
                        style={{ animationDelay: "4s" }}
                    />

                    {/* Geometric Shapes */}
                    <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-indigo-600/30 rotate-45 animate-pulse-slow" />
                    <div className="absolute top-3/4 left-1/3 w-6 h-6 bg-emerald-500/40 rounded-full animate-bounce-slow" />
                    <div
                        className="absolute top-1/2 right-1/3 w-3 h-3 bg-indigo-500/50 animate-pulse-slow"
                        style={{ animationDelay: "1s" }}
                    />
                </>
            ) : (
                // Simplified version for mobile
                <>
                    <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-indigo-600/15 to-indigo-500/15 rounded-full blur-2xl" />
                    <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-emerald-500/10 to-indigo-600/10 rounded-full blur-2xl" />
                </>
            )}

            {/* Wave Pattern - Simplified on mobile */}
            <svg className="absolute bottom-0 left-0 w-full h-24 md:h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path
                    d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                    opacity=".25"
                    fill="#4F46E5"
                ></path>
                <path
                    d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                    opacity=".5"
                    fill="#4F46E5"
                ></path>
                <path
                    d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                    fill="#4F46E5"
                ></path>
            </svg>
        </div>
    )
}
