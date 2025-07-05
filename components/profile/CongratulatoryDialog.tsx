import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogAction
  } from "@/components/ui/AlertDialog";
  
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import QRCode from "qrcode";

export default  function CongratulatoryDialog ({open,setOpen}:{
    open:boolean;
    setOpen:Dispatch<SetStateAction<boolean>>;
}) {
    const session = useSession()
    const [qrCodeDataURL, setQrCodeDataURL] = useState("");

    useEffect(() => {
        const uniqueCode = session?.data?.user?.profile?.unique_code;
        if (!uniqueCode) return;
        QRCode.toDataURL(
            String(uniqueCode),
            {
                width: 80,
                margin: 1,
                color: {
                    dark: "#000000",
                    light: "#FFFFFF",
                },
            }
        ).then(setQrCodeDataURL);
    }, [session?.data?.user?.profile?.unique_code]);

 return<AlertDialog open={open} onOpenChange={setOpen}>
 <AlertDialogContent>
   <AlertDialogHeader>
     <AlertDialogTitle className="text-2xl text-center">
       🎉 Congratulations {session.data?.user.profile?.first_name}! 🎉
     </AlertDialogTitle>
   </AlertDialogHeader>

   <div className="text-center pt-4 space-y-3">
     <p>You've unlocked an Easter egg on your profile!</p>
     <p>As a vote of thanks, you'll be getting <strong>exclusive points</strong>.</p>

     {qrCodeDataURL && (
       <div className="flex justify-center my-2">
         <img
           src={qrCodeDataURL}
           alt="QR Code"
           width={80}
           height={80}
           style={{ borderRadius: 8, border: "1px solid #eee" }}
         />
       </div>
     )}

     <p className="font-semibold">
       Just take a screenshot of this message and email it to{" "}
       <a
         href="mailto:gdgcloudkol@gmail.com?subject=Easter%20egg%20completion%20for%20schwags%20kit&body=Hi%20team%2C%20%0A%0AI'm%20thrilled%20to%20let%20you%20know%20I%20have%20discovered%20an%20easter%20egg%20on%20the%20CCD%20profile%20page%2C%20and%20completed%20it.%20I%20am%20attaching%20the%20screenshot%20of%20the%20message%20from%20the%20website.%0A%0AThanks"
         className="text-blue-500 hover:underline"
       >
         gdgcloudkol@gmail.com
       </a>{" "}
       for verification.
     </p>

     <p>Upon verification, special points will be added to your profile.</p>
     <strong>
       Note: This transaction is valid only once for {session.data?.user.email}!
     </strong>
   </div>

   <AlertDialogFooter>
     <AlertDialogAction onClick={() => setOpen(false)}>
       I understand
     </AlertDialogAction>
   </AlertDialogFooter>
 </AlertDialogContent>
</AlertDialog>
}