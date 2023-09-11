const apiKey = process.env.ELEVEN_LABS_KEY!;
const voiceId = process.env.ELEVEN_LABS_VOICE_ID!;
const elevenLabsAPI = "https://api.elevenlabs.io/v1";
const voiceURL = `${elevenLabsAPI}/text-to-speech/${voiceId}`;

export async function textToSpeech(text: string) {
  const body = {
    text,
    model_id: "eleven_monolingual_v1",
    voice_settings: {
      stability: 0,
      similarity_boost: 0,
      style: 0,
      use_speaker_boost: true,
    },
  };

  const headers = {
    "Content-Type": "application/json",
    accept: "audio/mpeg",
    "xi-api-key": apiKey,
  };

  const response = await fetch(voiceURL, {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });

  const buffer = Buffer.from(await response.arrayBuffer());

  return buffer;
}
