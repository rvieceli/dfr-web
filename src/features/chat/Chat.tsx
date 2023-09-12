"use client";

import systemImage from "@/assets/system.png";
import userImage from "@/assets/user.png";
import assistantImage from "@/assets/assistant.png";
import functionImage from "@/assets/function.png";

import { StaticImageData } from "next/image";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { Messages } from "./Messages";
import { InstructionForm } from "@/components/InstructionForm";
import dynamic from "next/dynamic";
import { RecordSVG } from "../audio-recorder/RecordSVG";

const AudioRecorder = dynamic(
  () =>
    import("../audio-recorder/AudioRecorder").then((mod) => mod.AudioRecorder),
  {
    loading: () => <RecordSVG />,
    ssr: false,
  }
);

const roleImageMap: Record<
  ChatCompletionMessageParam["role"],
  StaticImageData
> = {
  user: userImage,
  assistant: assistantImage,
  function: functionImage,
  system: systemImage,
};

const roleStyleMap: Record<ChatCompletionMessageParam["role"], string> = {
  user: "bg-blue-600 text-white",
  assistant: "bg-gray-300 text-gray-700",
  function: "bg-purple-800 text-white",
  system: "bg-green-800 text-white",
};

function lastRole(blocks: MessageBlock[]) {
  if (!blocks?.length) return undefined;

  const last = blocks[blocks.length - 1];

  return last.role;
}

interface MessageBlock {
  messages: ChatCompletionMessageParam[];
  role: ChatCompletionMessageParam["role"];
}

export function Chat() {
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    {
      role: "system",
      content: `Today is ${new Date().toISOString().substring(0, 10)}`,
    },
    {
      role: "system",
      content: "The chat will be exclusively in Italian",
    },
  ]);
  const [audioMap, setAudioMap] = useState<Record<string, string>>({});

  const [state, setState] = useState<
    | "idle"
    | "recording"
    | "transcribing"
    | "assistant is thinking"
    | "synthesizing speech"
  >("idle");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const messageBlocks = useMemo(() => {
    return messages.reduce((acc, message) => {
      const last = lastRole(acc);

      if (last === message.role) {
        acc[acc.length - 1].messages.push(message);
      } else {
        acc.push({
          role: message.role,
          messages: [message],
        });
      }

      return acc;
    }, [] as MessageBlock[]);
  }, [messages]);

  const askAssistant = useCallback(
    async (messages: ChatCompletionMessageParam[], signal: AbortSignal) => {
      try {
        setState("assistant is thinking");

        const response = await fetch("/api/chat-completion", {
          method: "POST",
          body: JSON.stringify({ messages }),
          signal,
        });

        const data = await response.json();

        if (data && data.answer) {
          setMessages(data.answer);
        }
      } finally {
        setState("idle");
      }
    },
    []
  );

  const textToSpeech = useCallback(
    async (text: string, signal: AbortSignal) => {
      try {
        setState("synthesizing speech");

        const response = await fetch("/api/text-to-speech", {
          method: "POST",
          body: JSON.stringify({ text }),
          signal,
        });

        const data = await response.json();

        if (data && data.audio_url) {
          setAudioMap((audioMap) => ({
            ...audioMap,
            [text]: data.audio_url,
          }));
        }
      } finally {
        setState("idle");
      }
    },
    []
  );

  useEffect(() => {
    const control = new AbortController();
    const last = messages[messages.length - 1];

    if (!last) return;

    if (last.role === "user") {
      askAssistant(messages, control.signal);
    }

    if (last.role === "assistant" && last.content && !audioMap[last.content]) {
      textToSpeech(last.content, control.signal);
    }

    return () => {
      control.abort();
    };
  }, [askAssistant, textToSpeech, messages, audioMap]);

  useEffect(() => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  }, [state]);

  const handleAudioTranscript = useCallback(
    ({ text, audio_url }: { text: string; audio_url: string }) => {
      if (!text) return;

      setMessages((messages) => [
        ...messages,
        {
          role: "user",
          content: text,
        },
      ]);

      setAudioMap((audioMap) => ({
        ...audioMap,
        [text]: audio_url,
      }));
    },
    []
  );

  const handleInstructionAdded = useCallback((instruction: string) => {
    if (!instruction) return;

    setMessages((messages) => [
      ...messages,
      {
        role: "system",
        content: instruction,
      },
    ]);
  }, []);

  return (
    <div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-[calc(100dvh)]">
      <div
        id="messages"
        className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
      >
        {messageBlocks.map(({ role, messages }, idx) => {
          const key = `${role}-${idx}`;

          return (
            <Messages
              key={key}
              messages={messages}
              image={roleImageMap[role]}
              audioMap={audioMap}
              style={roleStyleMap[role]}
              isRight={role === "user"}
            />
          );
        })}
        <div ref={chatBottomRef} className="flex items-center justify-center">
          {state === "idle" ? null : (
            <div className="flex">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm text-gray-600">{state}</span>
            </div>
          )}
        </div>
      </div>
      <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
        <div className="relative flex gap-5">
          <AudioRecorder
            onTranscript={handleAudioTranscript}
            onStartListening={() => setState("recording")}
            onStartTranscribing={() => setState("transcribing")}
            onEndTranscribing={() => setState("idle")}
          />
          <InstructionForm onInstructionAdded={handleInstructionAdded} />
        </div>
      </div>
    </div>
  );
}
