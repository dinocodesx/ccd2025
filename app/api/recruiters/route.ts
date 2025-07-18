import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RECRUITERS_DJANGO_URL } from "@/lib/constants/be";
import bkFetch from "@/services/backend.services";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.access) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const recruiterUrl = `${RECRUITERS_DJANGO_URL}`;

    const response = await bkFetch(recruiterUrl, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch recruiters" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Recruiter API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 