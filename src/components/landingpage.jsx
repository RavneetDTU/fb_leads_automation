import { useState } from "react";
import EnhancedVoiceAnimation from "./landingpage/enhanced-voice-animation";
import AnimatedBackground from "./landingpage/animated-background";
import EarlyAccessModal from "./landingpage/early-access-modal";
import BookSetupModal from "./landingpage/book-setup-modal";
import { ComparisonTable } from "./landingpage/comparision-table";
import CustomerReview from "./landingpage/customer-review";
import { useModalStore } from "../lib/store";
// import JarvisWidget from "./landingpage/jarvis-widget";
import Footer from "./landingpage/footer";

export default function LandingPage() {
    const { openEarlyAccess, openBookSetup } = useModalStore();

    const features = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
            ),
            title: "24/7 Phone Support",
            description: "Never miss a call again with AI that answers instantly",
            gradient: "from-indigo-600/10 to-indigo-500/10",
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
            ),
            title: "WhatsApp Integration",
            description: "Handle bookings and queries on your customers' favorite platform",
            gradient: "from-emerald-500/10 to-emerald-400/10",
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            title: "Smart Scheduling",
            description: "Automatic booking management with calendar sync",
            gradient: "from-indigo-600/10 to-emerald-500/10",
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            title: "Customer Delight",
            description: "Personalized service that makes customers feel valued",
            gradient: "from-emerald-500/10 to-indigo-600/10",
        },
    ];

    const stats = [
        { number: "90%", label: "Fewer Missed Calls" },
        { number: "3x", label: "More Bookings" },
        { number: "24/7", label: "Availability" },
        { number: "99%", label: "Customer Satisfaction" },
    ];

    return (
        <div className="min-h-screen bg-snow relative overflow-hidden">
            <AnimatedBackground />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-12 md:py-16">
                <div className="max-w-7xl flex flex-col-reverse md:flex-row gap-8 md:gap-12 lg:gap-16 items-center relative">

                    {/* LEFT SIDE */}
                    <div className="space-y-6 md:space-y-8 animate-fade-in-up order-2 lg:order-1">
                        <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-600/10 to-emerald-500/10 rounded-full border border-indigo-600/20">
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
                                className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 mr-1.5 sm:mr-2"
                            >
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium text-graphite">
                                AI-Powered Restaurant Assistant
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-graphite leading-tight">
                            Your AI Front Desk,{" "}
                            <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                                24/7
                            </span>{" "}
                            – Never Miss a Reservation Again
                        </h1>

                        <p className="text-base sm:text-lg lg:text-xl text-graphite/70 leading-relaxed max-w-2xl">
                            AI-powered phone and WhatsApp agents that take bookings, send reminders, and delight your customers with instant, personalized service.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                onClick={openEarlyAccess}
                                className="group border-2 cursor-pointer border-indigo-600 text-indigo-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-medium hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Get Early Access
                            </button>

                            <button
                                onClick={openBookSetup}
                                className="group bg-white cursor-pointer text-graphite px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Book Free Setup
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 sm:pt-4">
                            <div className="flex items-center space-x-2">
                                <div className="flex -space-x-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                                        >
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs sm:text-sm text-graphite/60">
                                    500+ restaurants trust us
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400"
                                    >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                ))}
                                <span className="text-xs sm:text-sm text-graphite/60 ml-1">
                                    4.9/5 rating
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="h-full flex flex-col items-center justify-center gap-8 md:gap-14 animate-slide-in-right order-1 lg:order-2">
                        <EnhancedVoiceAnimation />

                        <div className="w-fit flex items-center gap-4 md:gap-6">
                            {/* Jarvis AI Voice Widget — replaces the Try Demo Call button */}
                            {/* <JarvisWidget position="bottom-right" theme="light" /> */}

                            <a
                                href="https://wa.me/919728000432?text=Hi%2C%20I%20want%20to%20book%20a%20table"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white md:px-6 md:py-3 px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-xl cursor-pointer">
                                    Chat on WhatsApp
                                </button>
                            </a>
                        </div>
                        <div className="flex flex-col">
                            <p>Jarvis AI is ready to take your call! </p>
                            <p>📞 US: +1 503 748 3026 </p>
                            <p>📞 South Africa: +27 87 250 2261</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="relative py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className={`p-6 rounded-2xl bg-gradient-to-br ${feature.gradient}`}>
                            <div className="flex justify-center mb-4">{feature.icon}</div>
                            <h3 className="text-lg font-semibold text-center">{feature.title}</h3>
                            <p className="text-sm text-center text-graphite/70">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Comparison */}
            <section className="relative py-16 md:py-24 bg-gradient-to-br from-snow to-indigo-50">
                <div className="max-w-5xl mx-auto px-4">
                    <ComparisonTable />
                </div>
            </section>

            {/* Stats */}
            <section className="relative py-16 md:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-emerald-50">
                            <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                                {stat.number}
                            </div>
                            <div className="text-sm text-graphite/70">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Reviews */}
            <section className="relative py-16 md:py-24 bg-gradient-to-br from-snow to-indigo-50">
                <div className="max-w-6xl mx-auto px-4">
                    <CustomerReview />
                </div>
            </section>

            {/* Footer */}
            <Footer />

            <EarlyAccessModal />
            <BookSetupModal />
        </div>
    );
}