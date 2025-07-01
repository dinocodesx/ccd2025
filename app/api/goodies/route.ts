import { GOODIES_URL } from "@/lib/constants/be";
import bkFetch from "@/services/backend.services";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
    try {
        const res = await bkFetch(GOODIES_URL, {
            method: "GET"
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status || 200 });
    } catch (error) {
        console.error('Error fetching goodies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch goodies', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}