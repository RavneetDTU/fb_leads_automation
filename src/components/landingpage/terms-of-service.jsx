import { useNavigate } from "react-router-dom";
import Footer from "./footer";

export default function TermsOfService() {
    const navigate = useNavigate();
    const lastUpdated = "February 25, 2026";

    return (
        <div className="min-h-screen bg-snow">
            {/* Header */}
            <div className="bg-graphite">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <button
                        onClick={() => navigate("/landing")}
                        className="inline-flex items-center text-sm text-white/60 hover:text-white transition-colors mb-6 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Back to Home
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-semibold text-white">Terms of Service</h1>
                    <p className="text-white/50 mt-2 text-sm">Last updated: {lastUpdated}</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="space-y-10 text-graphite/80">

                    <section>
                        <p className="text-lg leading-relaxed">
                            These Terms of Service ("<strong>Terms</strong>") govern your access to and use of the Jarvis AI platform and services (the "<strong>Service</strong>"), operated by <strong>JarvisCalling.ai</strong> ("we," "us," or "our"). By creating an account, you agree to these Terms in full.
                        </p>
                    </section>

                    {/* 1. Service Scope */}
                    <section>
                        <h2 className="text-xl font-bold text-graphite border-b pb-2 mb-4">1. Service Description</h2>
                        <p className="text-sm mb-4">Jarvis AI provides an automated restaurant management suite, including but not limited to:</p>
                        <ul className="grid md:grid-cols-2 gap-3 text-sm">
                            <li className="flex items-start"><span className="mr-2">•</span> AI-powered phone and WhatsApp agents.</li>
                            <li className="flex items-start"><span className="mr-2">•</span> Real-time Google Calendar synchronization and management.</li>
                            <li className="flex items-start"><span className="mr-2">•</span> Automated lead and campaign management tools.</li>
                            <li className="flex items-start"><span className="mr-2">•</span> Analytics and operational reporting.</li>
                        </ul>
                    </section>

                    {/* 2. Google API - CRITICAL FOR VERIFICATION */}
                    <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-graphite mb-4">2. Third-Party Integrations (Google APIs)</h2>
                        <p className="text-sm mb-4 leading-relaxed">
                            To provide automated booking management, Jarvis AI integrates with Google API Services. By connecting your Google Account, you acknowledge and agree:
                        </p>
                        <ul className="list-disc pl-5 text-sm space-y-3">
                            <li>
                                <strong>Authorization:</strong> You grant Jarvis AI permission to <strong>read, create, edit, and delete</strong> events on your Google Calendar as necessary to manage restaurant reservations.
                            </li>
                            <li>
                                <strong>Compliance:</strong> Our access and use of Google data are strictly governed by the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-indigo-600 font-semibold underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>.
                            </li>
                            <li>
                                <strong>Limited Use:</strong> We will not use Google user data for advertising, or transfer this data to third parties for purposes other than providing and improving the core Service functionality.
                            </li>
                            <li>
                                <strong>Control:</strong> You may disconnect your Google Account and revoke these permissions at any time through your Jarvis AI settings or Google’s security panel.
                            </li>
                        </ul>
                    </section>

                    {/* 3. Acceptable Use */}
                    <section>
                        <h2 className="text-xl font-bold text-graphite border-b pb-2 mb-4">3. Acceptable Use</h2>
                        <p className="text-sm mb-3">You agree not to use the Service for:</p>
                        <ul className="list-disc pl-5 text-sm space-y-2">
                            <li>Unlawful activities or the transmission of deceptive/spam content.</li>
                            <li>Attempting to bypass security measures or reverse-engineer the Service.</li>
                            <li>Abusing third-party APIs (such as Google or Twilio) through our platform.</li>
                            <li>Harassing or harming customers through automated communications.</li>
                        </ul>
                    </section>

                    {/* 4. AI Liability */}
                    <section>
                        <h2 className="text-xl font-bold text-graphite border-b pb-2 mb-4">4. AI-Generated Interactions</h2>
                        <p className="text-sm leading-relaxed">
                            The Service utilizes artificial intelligence to handle live interactions. You understand that AI-generated responses may occasionally contain inaccuracies. You are responsible for monitoring and verifying the accuracy of bookings and customer communications processed by the AI. Jarvis Calling is not liable for errors resulting from automated AI interpretations.
                        </p>
                    </section>

                    {/* 5. Payments & Refunds */}
                    <section>
                        <h2 className="text-xl font-bold text-graphite border-b pb-2 mb-4">5. Payment Terms</h2>
                        <p className="text-sm">
                            Fees for Jarvis AI are billed according to your selected plan. Payments are processed via PayFast. Unless required by law, all fees are non-refundable. We reserve the right to modify pricing with 30 days' notice.
                        </p>
                    </section>

                    {/* 6. Limitation of Liability */}
                    <section>
                        <h2 className="text-xl font-bold text-graphite border-b pb-2 mb-4">6. Limitation of Liability</h2>
                        <p className="text-sm leading-relaxed">
                            To the maximum extent permitted by law, Jarvis Calling shall not be liable for any indirect, incidental, or consequential damages (including loss of data or business revenue) arising from your use of the Service or third-party service interruptions (e.g., Google or WhatsApp outages).
                        </p>
                    </section>

                    {/* 7. Governing Law */}
                    <section>
                        <h2 className="text-xl font-bold text-graphite border-b pb-2 mb-4">7. Governing Law</h2>
                        <p className="text-sm">
                            These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the exclusive jurisdiction of the South African courts.
                        </p>
                    </section>

                    {/* 8. Contact */}
                    <section className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-graphite mb-2">8. Contact Us</h2>
                        <div className="text-sm font-medium">
                            <p>Jarvis AI (Jarvis Calling)</p>
                            <p className="mt-2 text-graphite/60">Support: <a href="mailto:support@jarviscalling.ai" className="text-indigo-600">support@jarviscalling.ai</a></p>
                        </div>
                    </section>

                </div>
            </div>

            <Footer />
        </div>
    );
}