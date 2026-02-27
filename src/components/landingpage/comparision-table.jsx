import React from "react";

const comparisons = [
  {
    feature: "Availability",
    jarvis: "24/7 support, no breaks",
    traditional: "Limited to working hours",
  },
  {
    feature: "Response Time",
    jarvis: "Instant replies",
    traditional: "Delays during peak hours",
  },
  {
    feature: "Multilingual Support",
    jarvis: "Supports multiple languages effortlessly",
    traditional: "Limited to staff's language skills",
  },
  {
    feature: "Order Handling",
    jarvis: "Can take orders automatically via chat/call",
    traditional: "Requires human intervention",
  },
  {
    feature: "Reservation Management",
    jarvis: "Instant booking confirmations via website/WhatsApp",
    traditional: "Manual confirmation needed",
  },
  {
    feature: "Cost Efficiency",
    jarvis: "Low operational cost (no staffing needed)",
    traditional: "High labor costs",
  },
  {
    feature: "Scalability",
    jarvis: "Handles unlimited queries simultaneously",
    traditional: "Limited by staff availability",
  },
  {
    feature: "Integration",
    jarvis: "Works on website, WhatsApp, and calls seamlessly",
    traditional: "Separate systems for calls/messages",
  },
];

const comparisionsMobile = [
        {
          "featureMobile": "Availability",
          "jarvis_aiMobile": "24/7, no breaks",
          "traditionalMobile": "Limited hours"
        },
        {
          "featureMobile": "Response",
          "jarvis_aiMobile": "Instant replies",
          "traditionalMobile": "Delays at peak"
        },
        {
          "featureMobile": "Languages",
          "jarvis_aiMobile": "Multi-language built-in",
          "traditionalMobile": "Staff-limited"
        },
        {
          "featureMobile": "Orders",
          "jarvis_aiMobile": "Auto via chat/call",
          "traditionalMobile": "Needs staff"
        },
        {
          "featureMobile": "Reservations",
          "jarvis_aiMobile": "Instant booking on site/WhatsApp",
          "traditionalMobile": "Manual confirm"
        },
        {
          "featureMobile": "Cost",
          "jarvis_aiMobile": "Low (no staffing)",
          "traditionalMobile": "High labor"
        },
        {
          "featureMobile": "Scalability",
          "jarvis_aiMobile": "Handles unlimited users",
          "traditionalMobile": "Limited by staff"
        },
        {
          "featureMobile": "Integration",
          "jarvis_aiMobile": "Works on site, WhatsApp, & calls",
          "traditionalMobile": "Separate systems"
        }   
]

export const ComparisonTable = () => {
    return (
        <div className="space-y-4 md:space-y-8 bg-white/80 backdrop-blur-md p-4 md:p-8 rounded-md md:rounded-xl md:shadow-lg md:border border-gray-200">
      
          {/* Desktop Headings Row */}
          <div className="grid grid-cols-3 gap-6 items-start font-semibold text-gray-900">
            <div className="text-start pl-2">Feature</div>
            <div className="text-start pl-2">Jarvis AI</div>
            <div className="text-start pl-2">Traditional Support</div>
          </div>
      
          {/* Desktop Table Rows */}
          <div className="hidden md:block space-y-4">
            {comparisons.map((comparison, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 items-center">
                <div className="text-sm font-bold text-gray-800">{comparison.feature}</div>
      
                <div className="flex items-center space-x-3">
                  <div className="text-emerald-500 bg-emerald-100 p-1.5 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-800">{comparison.jarvis}</span>
                </div>
      
                <div className="flex items-center space-x-3">
                  <div className="text-carmine bg-red-100 p-1.5 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{comparison.traditional}</span>
                </div>
              </div>
            ))}
          </div>
      
          {/* Mobile View */}
          {/* Desktop Table Rows */}
          <div className="block md:hidden space-y-4 ">
            {comparisionsMobile.map((comparison, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 items-center border-b border-gray-400 pb-2">
                <div className="text-sm font-bold text-gray-800">{comparison.featureMobile}</div>
      
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-800">{comparison.jarvis_aiMobile}</span>
                </div>
      
                <div className="flex items-center justify-center">
                  <span className="text-sm text-center text-gray-700">{comparison.traditionalMobile}</span>
                </div>
              </div>
            ))}
          </div>
      
        </div>
      );
      
};