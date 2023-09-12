import { NextResponse } from "next/server";

import {
  ChatCompletionMessageParam,
  chatCompletion,
} from "@/lib/openai/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { messages }: { messages: ChatCompletionMessageParam[] } =
    await request.json();

  try {
    const answer = await chatCompletion(messages);
    return NextResponse.json({ answer });
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
