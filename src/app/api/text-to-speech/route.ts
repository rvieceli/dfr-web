import { NextResponse } from "next/server";

import { uploadFile } from "@/lib/aws/s3";
import { textToSpeech } from "@/lib/aws/polly";
// import { textToSpeech } from "@/lib/eleven-labs/eleven-labs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { text }: { text: string } = await request.json();

  try {
    const buffer = await textToSpeech(text);

    const audio_url = await uploadFile(text, buffer);

    return NextResponse.json({ audio_url });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/*
curl -X POST http://localhost:3000/api/text-to-speech -d '{"text": "test from curl"}' -H "Content-Type: application/json"
*/
