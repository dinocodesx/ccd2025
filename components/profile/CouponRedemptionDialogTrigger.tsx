"use client"
import React, { useState } from "react";
import CouponRedemption from "./CouponRedemption";
import Button from "../ui/Button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTrigger } from "../ui/AlertDialog";
import { Profile } from "next-auth";

interface CouponRedemptionDialogTriggerProps {
  user: Profile;
}

const CouponRedemptionDialogTrigger: React.FC<CouponRedemptionDialogTriggerProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="mt-4 px-4 py-2 rounded-lg bg-google-blue text-white font-semibold shadow hover:bg-blue-700 transition"
        >
          Redeem Coupon Code
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md w-full p-0">
        <AlertDialogHeader>
        </AlertDialogHeader>
        <div className="p-6">
          <CouponRedemption setOpen={setOpen} user={user}/>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CouponRedemptionDialogTrigger;