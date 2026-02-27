import { useModalStore } from "../../lib/store";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { openEarlyAccess, openBookSetup } = useModalStore();

    return (
        <footer className="relative bg-graphite text-white">
            {/* Top gradient divider */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-emerald-500 to-indigo-600" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* CTA Banner */}
                <div className="py-12 md:py-16 border-b border-white/10">
                    <div className="text-center max-w-2xl mx-auto space-y-4">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                            Ready to Automate Your Restaurant?
                        </h2>
                        <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                            Join 500+ restaurants using Jarvis AI to handle calls, bookings, and WhatsApp — 24/7.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                            <button
                                onClick={openEarlyAccess}
                                className="w-full sm:w-auto cursor-pointer bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Get Early Access
                            </button>
                            <button
                                onClick={openBookSetup}
                                className="w-full sm:w-auto cursor-pointer border border-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
                            >
                                Book Free Setup
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Grid */}
                <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                            </div>
                            <span className="text-lg font-semibold text-white">Jarvis AI</span>
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                            AI-powered phone and WhatsApp agents built for the restaurant industry.
                        </p>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Product</h4>
                        <ul className="space-y-2.5">
                            <li><span className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Phone Agent</span></li>
                            <li><span className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">WhatsApp Bot</span></li>
                            <li><span className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Smart Scheduling</span></li>
                            <li><span className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Analytics</span></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Company</h4>
                        <ul className="space-y-2.5">
                            <li><span className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">About Us</span></li>
                            <li><a href="/privacy-policy" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Privacy Policy</a></li>
                            <li><a href="/terms-of-service" className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Terms of Service</a></li>
                            <li><span className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">Contact</span></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Get in Touch</h4>
                        <ul className="space-y-2.5">
                            <li className="flex items-start space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50 mt-0.5 shrink-0">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                <span className="text-sm text-white/50">support@jarviscalling.ai</span>
                            </li>
                        </ul>
                        {/* Social Icons */}
                        <div className="flex items-center space-x-3 pt-2">
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="LinkedIn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Twitter / X">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a
                                href="https://wa.me/919728000432?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Jarvis%20AI"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-500/30 flex items-center justify-center transition-colors"
                                aria-label="WhatsApp"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/40">
                        © {currentYear} JarvisCalling.ai All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6">
                        <a href="/privacy-policy" className="text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer">Privacy Policy</a>
                        <a href="/terms-of-service" className="text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer">Terms of Service</a>
                        <span className="text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer">Cookie Policy</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
