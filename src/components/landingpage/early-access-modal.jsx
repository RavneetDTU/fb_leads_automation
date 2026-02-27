import { useState } from "react"
import { useModalStore } from "../../lib/store"

export default function EarlyAccessModal() {
    const { isEarlyAccessOpen, closeEarlyAccess } = useModalStore()
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        email: "",
        restaurantName: "",
        city: "",
        dailyCalls: "",
        interests: [],
    })

    const handleInterestChange = (interest) => {
        setFormData((prev) => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter((i) => i !== interest)
                : [...prev.interests, interest],
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Early Access Form:", formData)
        closeEarlyAccess()
        // Handle form submission here
    }

    if (!isEarlyAccessOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-indigo-100 relative no-scrollbar">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-emerald-500/20 rounded-2xl blur-xl -z-10" />
                <div className="p-4 sm:p-6 md:p-8 pb-6">
                    <div className="flex justify-between items-center mb-6 sm:mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-semibold text-graphite mb-1 sm:mb-2">Get Early Access</h2>
                            <p className="text-sm sm:text-base text-graphite/60">Join the waitlist for exclusive early access</p>
                        </div>
                        <button
                            onClick={closeEarlyAccess}
                            className="text-graphite/40 hover:text-graphite/60 transition-colors p-2 hover:bg-gray-100 rounded-full"
                            aria-label="Close modal"
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
                                className="w-5 h-5 sm:w-6 sm:h-6"
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-graphite mb-1 sm:mb-2">
                                Full Name *
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-graphite mb-1 sm:mb-2">
                                Phone Number *
                            </label>
                            <input
                                id="phoneNumber"
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-graphite mb-1 sm:mb-2">
                                Email Address *
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="restaurantName" className="block text-sm font-medium text-graphite mb-1 sm:mb-2">
                                Restaurant Name *
                            </label>
                            <input
                                id="restaurantName"
                                type="text"
                                required
                                value={formData.restaurantName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, restaurantName: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-graphite mb-1 sm:mb-2">
                                City / Location *
                            </label>
                            <input
                                id="city"
                                type="text"
                                required
                                value={formData.city}
                                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="dailyCalls" className="block text-sm font-medium text-graphite mb-1 sm:mb-2">
                                Daily Calls (Optional)
                            </label>
                            <input
                                id="dailyCalls"
                                type="number"
                                value={formData.dailyCalls}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dailyCalls: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white"
                                placeholder="How many calls do you get per day?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-graphite mb-1 sm:mb-2">Interested in:</label>
                            <div className="space-y-2 sm:space-y-3">
                                {["Phone Agent", "WhatsApp Bot", "Both"].map((interest) => (
                                    <label key={interest} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.interests.includes(interest)}
                                            onChange={() => handleInterestChange(interest)}
                                            className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
                                        />
                                        <span className="ml-2 sm:ml-3 text-sm text-graphite">{interest}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-medium hover:from-indigo-700 hover:to-indigo-600 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg"
                        >
                            Get Early Access
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
