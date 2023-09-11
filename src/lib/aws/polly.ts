import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { config } from "./config";

const client = new PollyClient({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

export async function textToSpeech(text: string) {
  const command = new SynthesizeSpeechCommand({
    Engine: "neural",
    LanguageCode: "it-IT",
    OutputFormat: "mp3",
    Text: text,
    TextType: "text",
    VoiceId: "Bianca",
  });

  const data = await client.send(command);

  if (!data.AudioStream) {
    throw new Error("No audio stream");
  }

  const buffer = Buffer.from(await data.AudioStream.transformToByteArray());

  return buffer;
}
