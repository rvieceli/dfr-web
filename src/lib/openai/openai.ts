import OpenAI from "openai";
import type {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from "openai/resources/chat/index.mjs";
import type { Uploadable } from "openai/uploads.mjs";
import { availableFunctions } from "./functions";

export type { Uploadable, ChatCompletionMessageParam };

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
});

export async function speechToText(file: Uploadable): Promise<string> {
  const response = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "it",
    prompt: "Trascrivi questo audio in italiano",
    temperature: 0.2,
  });

  return response.text;
}

const functions: ChatCompletionCreateParams.Function[] = [
  {
    name: "getAvailableSlots",
    description: "get available slots if user asks for a specific date",
    parameters: {
      type: "object",
      properties: {
        start_date: {
          type: "string",
          description: "ISO date for start of the period",
        },
        end_date: {
          type: "string",
          description: "ISO date for end of the period",
        },
      },
    },
  },
  {
    name: "getSlotSuggestions",
    description: "get slot suggestions if user don't ask for a specific date",
    parameters: { type: "object", properties: {} },
  },
];

export async function chatCompletion(messages: ChatCompletionMessageParam[]) {
  const newMessages = [...messages];

  const assistantMessage = await askGpt(newMessages);

  newMessages.push(assistantMessage);

  if (!!assistantMessage.function_call) {
    const functionResponse = await runFunctions(assistantMessage);

    newMessages.push(functionResponse);

    const assistantMessageWithData = await askGpt(newMessages);

    newMessages.push(assistantMessageWithData);
  }

  return newMessages;
}

async function askGpt(messages: ChatCompletionMessageParam[]) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    messages,
    functions,
    function_call: "auto",
    temperature: 0.2,
  });

  return response.choices[0].message;
}

async function runFunctions(message: ChatCompletionMessageParam) {
  if (!message.function_call) return message;

  const functionName = message.function_call.name;
  const functionArguments = message.function_call.arguments;
  const callable = availableFunctions[functionName];
  const functionResponse = callable(functionArguments);

  return {
    role: "function",
    name: functionName,
    content: functionResponse,
  } satisfies ChatCompletionMessageParam;
}
