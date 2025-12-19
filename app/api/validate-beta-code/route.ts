import { NextRequest, NextResponse } from "next/server";

// Get valid beta codes from environment variable (case-insensitive comparison)
const validBetaCodes = process.env.BETA_CODES?.split(",").map(code => code.trim().toLowerCase()) || [];

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Beta code is required" },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim().toLowerCase();
    const isValid = validBetaCodes.includes(trimmedCode);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Error validating beta code:", error);
    return NextResponse.json(
      { valid: false, error: "Server error" },
      { status: 500 }
    );
  }
}

