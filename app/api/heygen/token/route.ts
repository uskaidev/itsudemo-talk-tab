import { NextResponse } from 'next/server';

export const POST = async () => {
  const apiKey = process.env.HEYGEN_API_KEY;
  
  try {
    const response = await fetch("https://api.heygen.com/v2/streaming.create_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey || "",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        avatar_id: "Wayne_20240711",
        voice_id: "1bd001e7e89244f5b01e5f36c3c7b926",
        language: "ja"
      })
    });

    // リクエストとレスポンスの詳細なログを追加
    console.log("Request URL:", "https://api.heygen.com/v2/streaming.create_token");
    console.log("Request headers:", {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey ? "PRESENT" : "MISSING",
      "Accept": "application/json"
    });
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log("Raw response:", text); // デバッグ用

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse response:", text);
      return NextResponse.json(
        { error: "Invalid response from HeyGen API" },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("Token fetch error:", data);
      return NextResponse.json(
        { error: data.message || `Failed to fetch token: ${response.status}` },
        { status: response.status }
      );
    }

    // 成功時のレスポンス構造を確認
    console.log("Successful response:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching access token:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
