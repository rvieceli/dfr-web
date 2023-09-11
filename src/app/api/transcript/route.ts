import { NextResponse } from "next/server";

import { transcribe } from "@/lib/openai/openai";
import { uploadFile } from "@/lib/aws/s3";

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());

  const text = await transcribe(file);

  const audio_url = await uploadFile(text, buffer);

  return NextResponse.json({ text, audio_url });
}