/**
 * Generates the new-order alert chime at public/sounds/new-order.wav
 *
 *   node scripts/generate-alert-sound.mjs
 *
 * Written as a script rather than committing an opaque binary so the sound can be re-tuned
 * later and so there is no third-party audio licensing question.
 *
 * Design notes: two rising bell tones (G5 → C6) with a fast attack and a long exponential
 * decay, plus a quiet octave harmonic to give it some body. Rising intervals read as
 * "something arrived" rather than "something went wrong". Kept near 1.1s so it is noticeable
 * without being annoying when several orders land together.
 *
 * Mono, 44.1kHz, 16-bit ≈ 96 KB. Small enough not to matter, and WAV means no encoder
 * dependency and instant playback with no decode delay.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const SAMPLE_RATE = 44100;
const DURATION = 1.1;
const totalSamples = Math.floor(SAMPLE_RATE * DURATION);

/** One bell: fundamental + quiet octave, exponential decay, short fade-in to avoid a click. */
function bell(t, startAt, freq, peak) {
  const local = t - startAt;
  if (local < 0) return 0;

  const decay = Math.exp(-local * 4.2);
  const attack = Math.min(1, local / 0.006); // ~6ms fade-in kills the transient click
  const fundamental = Math.sin(2 * Math.PI * freq * local);
  const octave = Math.sin(2 * Math.PI * freq * 2 * local) * 0.28;

  return (fundamental + octave) * decay * attack * peak;
}

const samples = new Float32Array(totalSamples);
for (let i = 0; i < totalSamples; i++) {
  const t = i / SAMPLE_RATE;
  // G5 then C6 — a rising fourth, the classic "notification" interval.
  samples[i] = bell(t, 0, 783.99, 0.42) + bell(t, 0.16, 1046.5, 0.46);
}

// Global fade-out over the last 120ms so the tail cannot click on abrupt playback stop.
const fadeSamples = Math.floor(SAMPLE_RATE * 0.12);
for (let i = totalSamples - fadeSamples; i < totalSamples; i++) {
  samples[i] *= (totalSamples - i) / fadeSamples;
}

// Normalise to -3 dBFS. Loud enough to hear across a room, with headroom to avoid clipping.
let peak = 0;
for (const s of samples) peak = Math.max(peak, Math.abs(s));
const gain = peak > 0 ? 0.708 / peak : 1;

const dataBytes = totalSamples * 2;
const buffer = Buffer.alloc(44 + dataBytes);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataBytes, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);          // PCM header size
buffer.writeUInt16LE(1, 20);           // format = PCM
buffer.writeUInt16LE(1, 22);           // channels = mono
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
buffer.writeUInt16LE(2, 32);           // block align
buffer.writeUInt16LE(16, 34);          // bits per sample
buffer.write("data", 36);
buffer.writeUInt32LE(dataBytes, 40);

for (let i = 0; i < totalSamples; i++) {
  const clamped = Math.max(-1, Math.min(1, samples[i] * gain));
  buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
}

const outDir = path.join(process.cwd(), "public", "sounds");
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "new-order.wav");
writeFileSync(outFile, buffer);

console.log(`Wrote ${outFile} — ${(buffer.length / 1024).toFixed(0)} KB, ${DURATION}s, ${SAMPLE_RATE}Hz mono`);
