import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.profile?.is_checked_in) {
      return NextResponse.json({ message: "You must be checked in to redeem a coupon code." }, { status: 403 });
    }
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ message: "Coupon code is required." }, { status: 400 });
    }
    // Mock: Always succeed
    return NextResponse.json({ message: "Coupon code redeemed! Points will be added to your account." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred while redeeming the coupon code." }, { status: 500 });
  }
} 