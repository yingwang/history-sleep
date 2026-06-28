import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { stories, voices, stripCues } from "../src/stories.js";

const args = process.argv.slice(2);

function argValue(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function hasArg(name) {
  return args.includes(name);
}

function fileName(storyId, durationId, edgeName) {
  return `audio/${storyId}-${durationId}-${edgeName}.mp3`;
}

function defaultVoiceFor(story, durationId) {
  const voiceId = story.versions[durationId]?.voice || "xiaoxiao";
  return voices.find((voice) => voice.id === voiceId) || voices[0];
}

function collectJobs() {
  const storyFilter = argValue("--story");
  const durationFilter = argValue("--duration");
  const voiceFilter = argValue("--voice");
  const allVoices = hasArg("--all-voices");
  const jobs = [];

  for (const story of stories) {
    if (storyFilter && story.id !== storyFilter) continue;
    for (const durationId of ["short", "long"]) {
      if (durationFilter && durationId !== durationFilter) continue;
      const version = story.versions[durationId];
      if (!version?.text?.length) continue;
      const text = stripCues(version.text).join("\n\n");
      const chosenVoices = allVoices
        ? voices
        : [voiceFilter ? voices.find((voice) => voice.id === voiceFilter || voice.edgeName === voiceFilter) : defaultVoiceFor(story, durationId)];
      for (const voice of chosenVoices.filter(Boolean)) {
        jobs.push({ story, durationId, voice, text });
      }
    }
  }

  return jobs;
}

function listJobs() {
  const jobs = collectJobs();
  if (!jobs.length) {
    console.log("No story text found for the selected filters.");
    return;
  }
  for (const job of jobs) {
    console.log(`${job.story.id} ${job.durationId} ${job.voice.edgeName} -> ${fileName(job.story.id, job.durationId, job.voice.edgeName)}`);
  }
}

function ensureEdgeTts() {
  const result = spawnSync("python3", ["-c", "import edge_tts"], { encoding: "utf-8" });
  if (result.status !== 0) {
    console.error("Missing Python package: edge-tts");
    console.error("Install it with: python3 -m pip install edge-tts");
    process.exit(1);
  }
}

function generate() {
  const jobs = collectJobs();
  if (!jobs.length) {
    console.log("No story text found for the selected filters.");
    return;
  }

  ensureEdgeTts();
  mkdirSync(".tmp", { recursive: true });

  for (const job of jobs) {
    const textFile = join(".tmp", `${job.story.id}-${job.durationId}-${job.voice.id}.txt`);
    const output = fileName(job.story.id, job.durationId, job.voice.edgeName);
    writeFileSync(textFile, job.text, "utf-8");

    console.log(`Generating ${output}`);
    const result = spawnSync(
      "python3",
      [
        "scripts/edge_tts_file.py",
        "--text-file",
        textFile,
        "--output",
        output,
        "--voice",
        job.voice.edgeName,
        "--rate",
        job.voice.tts.rate,
        "--volume",
        job.voice.tts.volume,
        "--pitch",
        job.voice.tts.pitch
      ],
      { stdio: "inherit" }
    );

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }

  rmSync(".tmp", { recursive: true, force: true });
}

if (hasArg("--list")) {
  listJobs();
} else {
  generate();
}
