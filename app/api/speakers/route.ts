import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const response = await fetch('https://sessionize.com/api/v2/pkltj8cb/view/Speakers',{
        method:'GET',
    });
    if(!response.ok)
    {   const err= await response.text()
        console.log(err)
        throw new Error('An error occured fetching speakers')
    }
    const result = await response.json();


    return NextResponse.json(result, { status: response.status });
}