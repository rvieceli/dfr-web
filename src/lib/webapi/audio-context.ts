export async function validateAudioDuration(audio: Blob) {
  try {
    const audioContext = new AudioContext();
    const audioDetails = await audioContext.decodeAudioData(
      await audio.arrayBuffer()
    );

    const duration = audioDetails.duration;

    if (duration < 0.2) throw new Error("Audio too short");

    if (duration > 10) throw new Error("Audio too long");

    audioContext.close();

    return duration;
  } catch {}
}
