import { NextResponse } from "next/server";

import { transcribe } from "@/lib/openai/openai";
import { uploadFile } from "@/lib/aws/s3";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const text = await transcribe(file);

    if (!text) throw new Error("No text transcribed");

    const audio_url = await uploadFile(text, buffer);

    return NextResponse.json({ text, audio_url });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
