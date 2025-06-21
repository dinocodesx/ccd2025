import SocialShareButtons from "./SocialShareButtons"

export default function SocialShare (){
    return     <div className="space-y-4 animate-fade-in mt-4">
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-google-blue/10 via-[#34a853]/10 to-[#ea4335]/10 animate-gradient-x rounded-lg"></div>
      <div className="relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm border border-google-blue/20 rounded-xl p-6">
        <h4 className="font-bold text-lg text-google-blue dark:text-google-blue mb-4 flex items-center gap-2">
          🎉 Share Your CCD Kolkata Ticket
          <div className="h-1 w-1 rounded-full bg-[#34a853]"></div>
          <div className="h-1 w-1 rounded-full bg-[#ea4335]"></div>
          <div className="h-1 w-1 rounded-full bg-[#fbbc04]"></div>
        </h4>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-200">
            Show your excitement for CCD Kolkata 2025! Share your ticket on social media and tag us:
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="bg-google-blue/10 text-google-blue px-3 py-1.5 rounded-full text-sm font-medium">@gdgcloudkol</span>
            <span className="bg-[#34a853]/10 text-[#34a853] px-3 py-1.5 rounded-full text-sm font-medium">#CCDKol2025</span>
            <span className="bg-google-yellow/10 text-google-yellow px-3 py-1.5 rounded-full text-sm font-medium">#GDGCloudKolkata</span>
          </div>


            <SocialShareButtons />

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <span className="font-semibold">Note:</span> Your QR code is secure and tamper-proof. Feel free to show it in your social media posts!
            </p>
          </div>
        
        </div>
      </div>
    </div>
   
  </div>
}