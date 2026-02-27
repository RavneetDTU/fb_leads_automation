import { useState } from "react"
import { useModalStore } from "../../lib/store"

export default function BookSetupModal() {
    const { isBookSetupOpen, closeBookSetup } = useModalStore()
    const [formData, setFormData] = useState({
        restaurantName: "",
        ownerName: "",
        email: "",
        phoneNumber: "",
        website: "",
        dailyQueries: "",
        contactMethod: "Call",
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Book Setup Form:", formData)
        closeBookSetup()
        // Handle form submission here
    }

    if (!isBookSetupOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-graphite mb-1">Book Free Setup</h2>
                            <p className="text-xs sm:text-sm text-graphite/60">Schedule your onboarding call</p>
                        </div>
                        <button
                            onClick={closeBookSetup}
                            className="text-graphite/40 hover:text-graphite/60 transition-colors p-1 sm:p-2 hover:bg-gray-100 rounded-full"
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

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div>
                            <label htmlFor="restaurantName" className="block text-sm font-medium text-graphite mb-1">
                                Restaurant Name *
                            </label>
                            <input
                                id="restaurantName"
                                type="text"
                                required
                                value={formData.restaurantName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, restaurantName: e.target.value }))}
                                className="w-full px-3 py-2 border border-graphite/20 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="ownerName" className="block text-sm font-medium text-graphite mb-1">
                                Owner/Manager Name *
                            </label>
                            <input
                                id="ownerName"
                                type="text"
                                required
                                value={formData.ownerName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
                                className="w-full px-3 py-2 border border-graphite/20 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-graphite mb-1">
                                Email *
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 border border-graphite/20 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-graphite mb-1">
                                Phone Number *
                            </label>
                            <input
                                id="phoneNumber"
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                                className="w-full px-3 py-2 border border-graphite/20 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-graphite mb-1">
                                Website / Instagram (Optional)
                            </label>
                            <input
                                id="website"
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                                className="w-full px-3 py-2 border border-graphite/20 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-colors"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label htmlFor="dailyQueries" className="block text-sm font-medium text-graphite mb-1">
                                Daily Calls/WhatsApp Queries *
                            </label>
                            <input
                                id="dailyQueries"
                                type="number"
                                required
                                value={formData.dailyQueries}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dailyQueries: e.target.value }))}
                                className="w-full px-3 py-2 border border-graphite/20 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="contactMethod" className="block text-sm font-medium text-graphite mb-1">
                                Preferred Contact Method *
                            </label>
                            <select
                                id="contactMethod"
                                value={formData.contactMethod}
                                onChange={(e) => setFormData((prev) => ({ ...prev, contactMethod: e.target.value }))}
                                className="w-full px-3 py-2 border border-graphite/20 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-colors"
                            >
                                <option value="Call">Call</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Email">Email</option>
                            </select>
                        </div>

                        <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 p-3 sm:p-6 rounded-xl border border-indigo-100">
                            <p className="text-sm font-medium text-graphite mb-2 sm:mb-3 flex items-center">
                                <svg
                                    className="w-4 h-4 mr-2 text-indigo-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Schedule your setup call:
                            </p>
                            <div className="bg-white p-3 sm:p-4 rounded-lg border border-indigo-200 shadow-sm">
                                <p className="text-sm text-graphite/70 mb-2">Calendly integration would go here</p>
                                <p className="text-xs text-graphite/50">Click "Book Setup" to proceed to calendar</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105 mt-2"
                        >
                            Book Free Setup
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
