import { NextResponse } from "next/server";

export async function POST() {
  try {
    // HeyGen APIのアクセストークンを環境変数から取得
    const token = process.env.HEYGEN_API_KEY;
    
    if (!token) {
      throw new Error("HEYGEN_API_KEY is not set in environment variables");
    }

    return new NextResponse(token);
  } catch (error) {
    console.error("Error in get-access-token:", error);
    return new NextResponse("Failed to get access token", { status: 500 });
  }
}
