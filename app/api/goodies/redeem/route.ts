import { authOptions } from "@/lib/auth";
import { GOODIES_URL, REDEMPTION_URL } from "@/lib/constants/be";
import bkFetch from "@/services/backend.services";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse, userAgent } from "next/server";

export async function GET(): Promise<NextResponse> {
    try {
       
        const res = await bkFetch(REDEMPTION_URL, {
            method: "GET",
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status || 200 });
    } catch (error) {
        console.error('Error getting redeemed goodies:', error);
        return NextResponse.json(
            { error: 'Failed to get redeemed goodies', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
export async function POST(req:NextRequest): Promise<NextResponse> {
    try {
        const session= await getServerSession(authOptions)
        const {goodie}= await req.json()
        const res = await bkFetch(REDEMPTION_URL, {
            method: "POST",
            body:JSON.stringify({
                user:session?.user.pk,
                goodie
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