import { auth } from "@/modules/auth/auth";
import { API_URL } from "@/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const filmId = searchParams.get("filmId");
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");

  if (!filmId) {
    return new NextResponse("Missing filmId", { status: 400 });
  }

  let url = `${API_URL}/streaming?filmId=${filmId}`;
  if (season) url += `&season=${season}`;
  if (episode) url += `&episode=${episode}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      return new NextResponse(response.statusText, { status: response.status });
    }

    const data = await response.text();
    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
      },
    });
  } catch (error) {
    console.error("Stream proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
