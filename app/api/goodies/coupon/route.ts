
import { EARLYBIRD_URL } from "@/lib/constants/be";
import bkFetch from "@/services/backend.services";

import { NextRequest, NextResponse, userAgent } from "next/server";


export async function POST(req:NextRequest): Promise<NextResponse> {
    try {
        const {couponCode}= await req.json()

        const res = await bkFetch(EARLYBIRD_URL, {
            method: "POST",
            body:JSON.stringify({
                coupon_code:couponCode
            })
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status || 200 });
    } catch (error) {
        console.error('Error redeeming goodies:', error);
        return NextResponse.json(
            { error: 'Failed to redeem goodies', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}