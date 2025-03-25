import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // URLからクエリパラメータを取得
    const searchParams = request.nextUrl.searchParams;
    const useWebSocket = searchParams.get('websocket') === 'true';
    
    if (useWebSocket) {
      // WebSocket用のAPIキーを返す（開発環境用）
      // 注意: 本番環境では直接APIキーを返すべきではありません
      return NextResponse.json({
        api_key: process.env.OPENAI_API_KEY,
      });
    } else {
      // WebRTC用のエフェメラルトークンを生成
      const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "realtime=v1"
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "coral", // 変更: 'verse'から'coral'に変更
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
