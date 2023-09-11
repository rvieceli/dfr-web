import classNames from "classnames";
import Image, { StaticImageData } from "next/image";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import { useMemo } from "react";

interface MessagesProps {
  messages: ChatCompletionMessageParam[];
  audioMap?: Record<string, string>;
  image: StaticImageData;
  style?: string;
  isRight?: boolean;
}

function getUrl(audioMap?: Record<string, string>, content?: string | null) {
  if (!content || !audioMap) return undefined;

  return audioMap[content];
}

export function Messages({
  messages,
  audioMap,
  image,
  style,
  isRight = false,
}: MessagesProps) {
  const [previous, last] = useMemo(() => {
    if (!messages?.length) return [[], undefined];

    const previous = [...messages];
    const last = previous.pop();

    return [previous, last];
  }, [messages]);

  if (!last) {
    return null;
  }

  return (
    <div className="chat-message">
      <div className={classNames("flex items-end", { "justify-end": isRight })}>
        <div
          className={classNames(
            "flex flex-col space-y-2 text-xs max-w-xs mx-2",
            { "order-1 items-end": isRight },
            { "order-2 items-start": !isRight }
          )}
        >
          {previous.map((message, idx) => (
            <RenderMessage
              key={idx}
              message={message}
              audio_url={getUrl(audioMap, message.content)}
              style={style}
            />
          ))}

          <RenderMessage
            message={last}
            audio_url={getUrl(audioMap, last.content)}
            style={style}
            isLast
          />
        </div>
        <Image
          src={image}
          alt="System"
          className={classNames("w-6 h-6 rounded-full", {
            "order-1": !isRight,
            "order-2": isRight,
          })}
        />
      </div>
    </div>
  );
}

function RenderMessage({
  message,
  audio_url,
  isLast = false,
  style = "bg-gray-700 text-gray-100",
}: {
  message: ChatCompletionMessageParam;
  audio_url?: string;
  isLast?: boolean;
  style?: string;
}) {
  const className = classNames("px-4 py-2 rounded-lg inline-block", style, {
    "rounded-bl-none": isLast,
  });

  return (
    <div key={message.content}>
      {message.content ? (
        <>
          <span className={className}>{message.content}</span>
          {audio_url && <audio controls src={audio_url} />}
        </>
      ) : (
        <pre className={className}>
          {JSON.stringify(message.function_call, null, 2)}
        </pre>
      )}
    </div>
  );
}
