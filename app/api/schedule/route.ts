import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const data = await req.json();

    const response = await fetch('https://sessionize.com/api/v2/pkltj8cb/view/Sessions', {
        method: "GET",
        body: JSON.stringify(data)
    });
    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
}