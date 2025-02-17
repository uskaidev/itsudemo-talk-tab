import { API_CONFIG } from "@/app/lib/constants";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }

    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_TOKEN}`,
      {
        method: "POST",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("HeyGen API error:", {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });
      throw new Error(`HeyGen API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!data.data?.token) {
      console.error("Invalid token response:", data);
      throw new Error("Invalid token response from HeyGen API");
    }

    return new Response(data.data.token, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error retrieving access token:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
