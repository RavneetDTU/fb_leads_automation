import { useNavigate } from "react-router-dom";
import Footer from "./footer";

export default function PrivacyPolicy() {
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
                    <h1 className="text-3xl sm:text-4xl font-semibold text-white">Privacy Policy</h1>
                    <p className="text-white/50 mt-2 text-sm">Last updated: {lastUpdated}</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="space-y-10 text-graphite/80">

                    <section>
                        <p className="text-lg leading-relaxed">
                            This Privacy Policy describes how <strong>JarvisCalling.ai</strong> ("we," "us," or "our") collects, uses, and protects your information across the Jarvis AI platform. We are committed to transparency, especially regarding how we interact with third-party services like Google.
                        </p>
                    </section>

                    {/* 1. Google API Disclosure - MOVING THIS UP FOR VERIFICATION PURPOSES */}
                    <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-graphite mb-4">1. Google API Limited Use Disclosure</h2>
                        <p className="mb-4">
                            Jarvis AI’s use and transfer of information received from Google APIs to any other app will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-indigo-600 font-semibold underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-graphite underline">Permissions & Scopes</h3>
                                <p className="text-sm mt-1">We request the following scopes to provide full automation features:</p>
                                <ul className="list-disc pl-5 mt-2 space-y-2 text-sm">
                                    <li><code className="bg-white px-1 font-mono">auth/calendar</code>: Full access to read, create, modify, and delete calendar events to manage your restaurant bookings.</li>
                                    <li><code className="bg-white px-1 font-mono">auth/userinfo.profile</code>: To identify your account and personalize your dashboard experience.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-graphite underline">How We Use Google Data</h3>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                    <li><strong>Service Delivery:</strong> To sync, display, and manage restaurant reservations directly in your Google Calendar.</li>
                                    <li><strong>No AI Training:</strong> We do <u>not</u> use your Google user data to train, retrain, or improve generalized AI/ML models.</li>
                                    <li><strong>No Advertising:</strong> We do <u>not</u> use Google data for advertising or marketing purposes.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 2. Information Collection */}
                    <section>
                        <h2 className="text-xl font-semibold text-graphite border-b pb-2 mb-4">2. Information We Collect</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-graphite">Provided by You</h3>
                                <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                                    <li>Account details (Name, Email, Business Name).</li>
                                    <li>Customer Booking Data (Names, phone numbers, and reservation notes).</li>
                                    <li>Communication records from AI interactions.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-medium text-graphite">Third-Party Integration</h3>
                                <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                                    <li><strong>Google:</strong> Calendar event metadata and profile identity.</li>
                                    <li><strong>Twilio/Wati:</strong> Call transcriptions and WhatsApp metadata for routing.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 3. Data Sharing */}
                    <section>
                        <h2 className="text-xl font-semibold text-graphite border-b pb-2 mb-4">3. Data Sharing & Disclosure</h2>
                        <p className="text-sm mb-3">We only share data with third parties in the following strictly limited circumstances:</p>
                        <ul className="list-disc pl-5 text-sm space-y-2">
                            <li><strong>Sub-processors:</strong> Cloud hosting (Google Cloud/Vercel) and communication APIs (Twilio) necessary for the service to function.</li>
                            <li><strong>Legal:</strong> To comply with valid legal processes or protect our rights.</li>
                            <li><strong>Human Review:</strong> We only allow human access to your data if you provide explicit consent for troubleshooting or if required for security audits.</li>
                        </ul>
                    </section>

                    {/* 4. Data Retention */}
                    <section>
                        <h2 className="text-xl font-semibold text-graphite border-b pb-2 mb-4">4. Data Retention & Deletion</h2>
                        <p className="text-sm leading-relaxed">
                            We retain account data as long as your account is active. Google OAuth tokens are stored securely and can be revoked by the user at any time via the dashboard or through <a href="https://myaccount.google.com/permissions" className="text-indigo-600 underline">Google Security Settings</a>. Upon account deletion, all associated data is purged from our active databases within 30 days.
                        </p>
                    </section>

                    {/* 5. Security */}
                    <section>
                        <h2 className="text-xl font-semibold text-graphite border-b pb-2 mb-4">5. Security</h2>
                        <p className="text-sm">
                            We implement industry-standard encryption (AES-256) for data at rest and TLS for data in transit. We use Firebase Authentication to ensure that only you can access your connected Google data.
                        </p>
                    </section>

                    {/* 6. Contact */}
                    <section className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold text-graphite mb-2">6. Contact & Support</h2>
                        <p className="text-sm">If you have questions about this policy or wish to exercise your data rights, contact us at:</p>
                        <div className="mt-4 text-sm font-medium">
                            <p>Email: <a href="mailto:support@jarviscalling.ai" className="text-indigo-600">support@jarviscalling.ai</a></p>
                            <p>Global Support: +1 503 748 3026</p>
                        </div>
                    </section>

                </div>
            </div>

            <Footer />
        </div>
    );
}