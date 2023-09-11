"use client";

import classNames from "classnames";
import { on } from "events";
import { useCallback } from "react";
import {
  ReactMediaRecorderHookProps,
  useReactMediaRecorder,
} from "react-media-recorder";
import { RecordSVG } from "./RecordSVG";

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
      const formData = new FormData();

      formData.append("file", blob, "file.webm");

      try {
        onStartTranscribing?.();

        const response = await fetch("/api/transcript", {
          method: "POST",
          body: formData,
        });

        const data: {
          text: string;
          audio_url: string;
        } = await response.json();

        if (data && data.text) {
          onTranscript?.(data);
        }
      } catch (error) {
        console.error(error);
        alert("Error transcribing audio");
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
    <button
      type="button"
      className={classNames(
        "inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out",
        {
          "hover:bg-gray-300 focus:outline-none": !isRecording,
          "bg-red-500 hover:bg-red-300": isRecording,
        }
      )}
      // onClick={isRecording ? stopRecording : startRecording}
      onMouseDown={startRecording}
      onMouseLeave={stopRecording}
      onMouseUp={stopRecording}
    >
      <RecordSVG isRecording={isRecording} />
    </button>
  );
}
