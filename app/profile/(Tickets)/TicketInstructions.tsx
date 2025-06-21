const TicketInstructions = () => (
  <div className="bg-gradient-to-r border border-google-green from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4">
    <h4 className="font-semibold text-green-900 dark:text-white mb-3">
      📋 How to use your ticket:
    </h4>
    <ul className="text-base text-green-800 dark:text-white space-y-2">
      <li className="flex items-start gap-2">
        <span className="text-green-600 dark:text-green-400">•</span>
        Select your preferred ticket design from 2 available themes.
      </li>
      <li className="flex items-start gap-2">
        <span className="text-green-600 dark:text-green-400">•</span>
        Download your personalized ticket with all your details.
      </li>
      <li className="flex items-start gap-2">
        <span className="text-green-600 dark:text-green-400">•</span>
        Present this ticket and your Govt. Photo ID card at CCD Kolkata 2025 for entry verification.
      </li>
      <li className="flex items-start gap-2">
        <span className="text-green-600 dark:text-green-400">•</span>
        <span>
        Only physical copies of Govt. Photo ID cards <strong>(Aadhaar Card, Voter Card, Passport, Driving License)</strong> would be accepted.  
        </span>
      </li>
    </ul>
  </div>
);

export default TicketInstructions; 