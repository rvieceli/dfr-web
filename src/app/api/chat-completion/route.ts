import { NextResponse } from "next/server";

import {
  ChatCompletionMessageParam,
  chatCompletion,
} from "@/lib/openai/openai";

export async function POST(request: Request) {
  const { messages }: { messages: ChatCompletionMessageParam[] } =
    await request.json();

  const answer = await chatCompletion(messages);

  return NextResponse.json({ answer });
}
