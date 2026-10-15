export async function decodeForTranscription(file) {
  if (file.size > 200 * 1024 * 1024)
    throw new Error(
      "For local transcription, choose an audio/video clip smaller than 200 MB. Larger videos still work with subtitle files.",
    );
  const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioContext)
    throw new Error(
      "Audio decoding is unavailable in this browser. Import subtitle files instead.",
    );
  const context = new AudioContext({ sampleRate: 16000 });
  try {
    const decoded = await context.decodeAudioData(await file.arrayBuffer());
    if (decoded.duration > 15 * 60)
      throw new Error(
        "Choose a clip under 15 minutes for local transcription, or use existing subtitles for a full show.",
      );
    const renderer = new OfflineAudioContext(
      1,
      Math.ceil(decoded.duration * 16000),
      16000,
    );
    const source = renderer.createBufferSource();
    source.buffer = decoded;
    source.connect(renderer.destination);
    source.start();
    const mono = await renderer.startRendering();
    return { audio: mono.getChannelData(0), duration: mono.duration };
  } finally {
    await context.close();
  }
}
export function startTranscription(
  audio,
  lang,
  {
    translate = false,
    onProgress = () => {},
    texts = null,
    prepare = null,
  } = {},
) {
  const worker = new Worker(
    new URL("../workers/transcription.js", import.meta.url),
    { type: "module" },
  );
  const id = crypto.randomUUID();
  let rejectTask;
  let deadline;
  const finish = () => {
    clearTimeout(deadline);
    worker.terminate();
  };
  const promise = new Promise((resolve, reject) => {
    rejectTask = reject;
    deadline = setTimeout(() => {
      finish();
      reject(
        new Error(
          "The local model took too long to start or finish. Import subtitles or try a shorter clip.",
        ),
      );
    }, 180000);
    worker.onmessage = ({ data }) => {
      if (data.id !== id) return;
      if (data.type === "progress") onProgress(data);
      if (data.type === "complete") {
        finish();
        resolve(data.result);
      }
      if (data.type === "error") {
        finish();
        reject(
          new Error(
            "Local transcription could not finish. Check model-download access, free memory, and audio format. " +
              data.error,
          ),
        );
      }
    };
    worker.onerror = () => {
      finish();
      reject(
        new Error(
          "The local speech worker could not start. Subtitle import is available.",
        ),
      );
    };
    if (prepare) worker.postMessage({ id, op: "prepare", key: prepare, lang });
    else if (texts)
      worker.postMessage({ id, op: "translate-text", texts, lang });
    else worker.postMessage({ id, audio, lang, translate }, [audio.buffer]);
  });
  return {
    promise,
    cancel: () => {
      finish();
      rejectTask(new Error("Transcription cancelled."));
    },
  };
}
