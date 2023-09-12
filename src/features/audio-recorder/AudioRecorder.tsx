"use client";

import classNames from "classnames";
import { on } from "events";
import { useCallback } from "react";
import {
  ReactMediaRecorderHookProps,
  useReactMediaRecorder,
} from "react-media-recorder";
import { RecordSVG } from "./RecordSVG";
import { validateAudioDuration } from "@/lib/webapi/audio-context";

type OnStop = NonNullable<ReactMediaRecorderHookProps["onStop"]>;

interface AudioRecorderProps {
  onTranscript?: (data: { text: string; audio_url: string }) => void;
  onStartListening?: () => void;
  onStartTranscribing?: () => void;
  onEndTranscribing?: () => void;
}

export function AudioRecorder({
  onTranscript,
  onStartListening,
  onStartTranscribing,
  onEndTranscribing,
}: AudioRecorderProps) {
  const onStop = useCallback<OnStop>(
    async (blobUrl, blob) => {
      try {
        await validateAudioDuration(blob);

        onStartTranscribing?.();

        const formData = new FormData();

        formData.append("file", blob, "file.webm");

        const response = await fetch("/api/transcript", {
          method: "POST",
          body: formData,
        });

        if (!response.ok || response.status !== 200) {
          const { message } = await response.json();

          throw new Error(message);
        }

        const data: {
          text: string;
          audio_url: string;
        } = await response.json();

        if (data && data.text) {
          onTranscript?.(data);
        }
      } catch (error) {
        setTimeout(
          () =>
            alert(
              error instanceof Error
                ? error.message
                : "Error transcribing audio"
            ),
          300
        );
      } finally {
        onEndTranscribing?.();
      }
    },
    [onEndTranscribing, onStartTranscribing, onTranscript]
  );

  const { status, startRecording, stopRecording } = useReactMediaRecorder({
    audio: true,
    onStop,
    mediaRecorderOptions: {
      mimeType: "audio/webm",
    },
    onStart: onStartListening,
  });

  const isRecording = status === "recording";

  return (
    <div className={"h-12 w-12  relative"}>
      <div
        className={classNames(
          "absolute bg-red-500 animate-ping inline-flex h-full w-full rounded-full opacity-75",
          {
            hidden: !isRecording,
          }
        )}
      />
      <button
        className={classNames(
          "inline-flex items-center justify-center rounded-full  transition duration-500 ease-in-out relative",
          {
            "hover:bg-gray-300 focus:outline-none": !isRecording,
            "bg-red-500 hover:bg-red-300": isRecording,
          }
        )}
        type="button"
        onTouchStart={startRecording}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseOut={stopRecording}
        onTouchEnd={stopRecording}
        // onTouchMove={stopRecording}
        onClick={stopRecording}
      >
        <RecordSVG isRecording={isRecording} />
      </button>
    </div>
  );
}
