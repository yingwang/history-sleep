import {
  ambiences,
  durations,
  getStory,
  getVersion,
  getVoice,
  hasText,
  stories,
  voices
} from "./stories.js";

const NARRATION_PLAYBACK_RATE = 1.0;
const SPEECH_SLEEP_RATE = 0.88;
const SPEECH_PARAGRAPH_PAUSE_MS = 1100;
const SHORT_CUE_PAUSE_MS = 2600;
const LONG_CUE_PAUSE_MS = 5000;
const VOLUME_STORAGE_KEYS = {
  ambient: "historySleepAmbientVolume",
  narration: "historySleepNarrationVolume"
};

const state = {
  storyId: "changan-rain-night",
  durationId: "long",
  voiceId: "xiaoxiao",
  ambientId: "rain",
  timerMinutes: 0,
  timerHandle: null,
  cueHandle: null,
  speaking: false,
  speechIndex: 0,
  audioMode: "idle",
  ambient: null
};

const els = {
  voiceSelect: document.querySelector("#voiceSelect"),
  ambientSelect: document.querySelector("#ambientSelect"),
  readyCount: document.querySelector("#readyCount"),
  storyList: document.querySelector("#storyList"),
  storyMeta: document.querySelector("#storyMeta"),
  storyTitle: document.querySelector("#storyTitle"),
  storySummary: document.querySelector("#storySummary"),
  playbackStatus: document.querySelector("#playbackStatus"),
  timerStatus: document.querySelector("#timerStatus"),
  progressBar: document.querySelector("#progressBar"),
  playButton: document.querySelector("#playButton"),
  stopButton: document.querySelector("#stopButton"),
  ambientVolume: document.querySelector("#ambientVolume"),
  ambientVolumeValue: document.querySelector("#ambientVolumeValue"),
  narrationVolume: document.querySelector("#narrationVolume"),
  narrationVolumeValue: document.querySelector("#narrationVolumeValue"),
  timerButtons: document.querySelector("#timerButtons"),
  storyText: document.querySelector("#storyText"),
  versionState: document.querySelector("#versionState"),
  copyPromptButton: document.querySelector("#copyPromptButton"),
  toast: document.querySelector("#toast"),
  narrationAudio: document.querySelector("#narrationAudio")
};

let narrationGraph = null;

function inputVolume(input) {
  const value = Number(input.value) / 100;
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function clampSliderValue(input, value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return input.value;
  }
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  return String(Math.round(Math.max(min, Math.min(max, number))));
}

function readStoredValue(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private browsing or blocked storage should not break playback.
  }
}

function loadVolumeSettings() {
  const ambientVolume = readStoredValue(VOLUME_STORAGE_KEYS.ambient);
  const narrationVolume = readStoredValue(VOLUME_STORAGE_KEYS.narration);
  if (ambientVolume !== null) {
    els.ambientVolume.value = clampSliderValue(els.ambientVolume, ambientVolume);
  }
  if (narrationVolume !== null) {
    els.narrationVolume.value = clampSliderValue(els.narrationVolume, narrationVolume);
  }
  updateVolumeLabels();
}

function saveVolumeSettings() {
  writeStoredValue(VOLUME_STORAGE_KEYS.ambient, els.ambientVolume.value);
  writeStoredValue(VOLUME_STORAGE_KEYS.narration, els.narrationVolume.value);
}

function updateVolumeLabels() {
  els.ambientVolumeValue.textContent = `${els.ambientVolume.value}%`;
  els.narrationVolumeValue.textContent = `${els.narrationVolume.value}%`;
}

function createAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return AudioContext ? new AudioContext() : null;
}

function resumeAudioContext(audioCtx) {
  if (!audioCtx || audioCtx.state !== "suspended") {
    return Promise.resolve();
  }
  return audioCtx.resume().catch(() => {});
}

// iOS Safari often ignores HTMLMediaElement.volume, so sliders use Web Audio gain when possible.
function createMediaAudioGraph(audio, volume) {
  const audioCtx = createAudioContext();
  if (!audioCtx) {
    return null;
  }

  try {
    const source = audioCtx.createMediaElementSource(audio);
    const gain = audioCtx.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(audioCtx.destination);
    return { audioCtx, source, gain };
  } catch {
    try {
      audioCtx.close();
    } catch {
      // Some browsers throw if the context is already closing.
    }
    return null;
  }
}

function ensureNarrationGraph() {
  if (narrationGraph) {
    return narrationGraph;
  }

  narrationGraph = createMediaAudioGraph(els.narrationAudio, inputVolume(els.narrationVolume));
  return narrationGraph;
}

function setNarrationVolume() {
  const volume = inputVolume(els.narrationVolume);
  updateVolumeLabels();
  saveVolumeSettings();
  els.narrationAudio.volume = volume;
  if (narrationGraph?.gain) {
    narrationGraph.gain.gain.value = volume;
  }
}

function setAmbientVolume() {
  const volume = inputVolume(els.ambientVolume);
  updateVolumeLabels();
  saveVolumeSettings();
  if (state.ambient?.gain) {
    state.ambient.gain.gain.value = volume;
  }
  if (state.ambient?.audio) {
    state.ambient.audio.volume = volume;
  }
}

function currentStory() {
  return getStory(state.storyId);
}

function currentVersion() {
  return getVersion(currentStory(), state.durationId);
}

function currentVoice() {
  return getVoice(state.voiceId);
}

function currentAmbient() {
  return ambiences.find((ambient) => ambient.id === state.ambientId) || ambiences[0];
}

function audioFileName() {
  return `audio/${state.storyId}-${state.durationId}-${currentVoice().edgeName}.mp3`;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.handle);
  showToast.handle = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function renderSelectors() {
  els.voiceSelect.replaceChildren(
    ...voices.map((voice) => {
      const option = document.createElement("option");
      option.value = voice.id;
      option.textContent = `${voice.name} · ${voice.edgeName}`;
      return option;
    })
  );
  els.voiceSelect.value = state.voiceId;

  els.ambientSelect.replaceChildren(
    ...ambiences.map((ambient) => {
      const option = document.createElement("option");
      option.value = ambient.id;
      option.textContent = ambient.name;
      return option;
    })
  );
  els.ambientSelect.value = state.ambientId;
}

function versionReadyLabel(story) {
  const version = getVersion(story, state.durationId);
  return hasText(version) ? "已填正文" : "待填正文";
}

function renderStoryList() {
  const ready = stories.filter((story) => hasText(getVersion(story, state.durationId))).length;
  els.readyCount.textContent = `${ready}/${stories.length} 已有长版`;
  els.storyList.replaceChildren(
    ...stories.map((story) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `story-card${story.id === state.storyId ? " active" : ""}`;
      button.innerHTML = `
        <span class="tag">${story.region}</span>
        <h3>${story.title}</h3>
        <p>${story.summary}</p>
        <span class="state">${story.category} · ${versionReadyLabel(story)}</span>
      `;
      button.addEventListener("click", () => {
        stopAll();
        state.storyId = story.id;
        const version = getVersion(story, state.durationId);
        state.voiceId = version.voice || "xiaoxiao";
        state.ambientId = story.defaultAmbient || "rain";
        render();
      });
      return button;
    })
  );
}

function renderStory() {
  const story = currentStory();
  const version = currentVersion();
  const duration = durations.find((item) => item.id === state.durationId);
  els.storyMeta.textContent = `${story.region} · ${story.category} · ${duration.label}`;
  els.storyTitle.textContent = story.title;
  els.storySummary.textContent = story.summary;
  els.versionState.textContent = hasText(version) ? `${version.text.length} 段` : "正文待补";

  if (!hasText(version)) {
    els.storyText.innerHTML = `
      <div class="empty-state">
        这一版还没有正文。把你生成好的故事填进 <code>src/stories.js</code> 对应主题的 <code>${state.durationId}</code> 版本里，再运行 <code>npm run generate:audio</code> 生成旁白音频。
      </div>
    `;
    return;
  }

  els.storyText.replaceChildren(
    ...version.text.map((paragraph) => {
      const p = document.createElement("p");
      if (/^\[[^\]]+\]$/.test(paragraph.trim())) {
        p.className = "cue";
      }
      p.textContent = paragraph;
      return p;
    })
  );
}

function renderTimers() {
  const options = [
    { label: "不定时", value: 0 },
    { label: "10 分钟", value: 10 },
    { label: "20 分钟", value: 20 },
    { label: "30 分钟", value: 30 }
  ];

  els.timerButtons.replaceChildren(
    ...options.map((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      button.className = option.value === state.timerMinutes ? "active" : "";
      button.addEventListener("click", () => {
        state.timerMinutes = option.value;
        armTimer();
        renderTimers();
      });
      return button;
    })
  );
  updateTimerStatus();
}

function updateTimerStatus() {
  els.timerStatus.textContent = state.timerMinutes ? `${state.timerMinutes} 分钟后停止` : "不定时";
}

function render() {
  renderSelectors();
  renderStoryList();
  renderStory();
  renderTimers();
  updateProgress(0);
}

function createNoiseBuffer(audioCtx, seconds = 2) {
  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * seconds, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createNoiseSource(audioCtx, filterType, frequency) {
  const source = audioCtx.createBufferSource();
  source.buffer = createNoiseBuffer(audioCtx);
  source.loop = true;
  const filter = audioCtx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = frequency;
  source.connect(filter);
  return { source, output: filter };
}

function startAmbient() {
  stopAmbient();
  if (state.ambientId === "none") {
    return;
  }

  const ambientConfig = currentAmbient();
  if (ambientConfig.file) {
    startFileAmbient(ambientConfig);
    return;
  }

  startSyntheticAmbient();
}

function startFileAmbient(ambientConfig) {
  const volume = inputVolume(els.ambientVolume);
  const ambient = { audio: null, audioCtx: null, gain: null, intervals: [], nodes: [] };
  const audio = new Audio(ambientConfig.file);
  audio.volume = volume;
  audio.loop = !ambientConfig.interval;
  audio.preload = "auto";
  ambient.audio = audio;

  const graph = createMediaAudioGraph(audio, volume);
  if (graph) {
    audio.volume = 1;
    ambient.audioCtx = graph.audioCtx;
    ambient.gain = graph.gain;
    ambient.nodes.push(graph.source, graph.gain);
    resumeAudioContext(graph.audioCtx);
  }

  state.ambient = ambient;
  setAmbientVolume();

  if (ambientConfig.interval) {
    const schedulePageTurn = () => {
      const handle = window.setTimeout(() => {
        if (state.ambient !== ambient) {
          return;
        }
        audio.currentTime = 0;
        setAmbientVolume();
        resumeAudioContext(ambient.audioCtx).then(() => audio.play()).catch(() => {});
        schedulePageTurn();
      }, 12000 + Math.random() * 8000);
      ambient.intervals.push(handle);
    };
    schedulePageTurn();
    return;
  }

  resumeAudioContext(ambient.audioCtx).then(() => audio.play()).catch(() => {
    if (state.ambient === ambient) {
      stopAmbient();
      startSyntheticAmbient();
    }
  });
}

function startSyntheticAmbient() {
  const audioCtx = createAudioContext();
  if (!audioCtx) {
    return;
  }

  const gain = audioCtx.createGain();
  gain.gain.value = inputVolume(els.ambientVolume);
  gain.connect(audioCtx.destination);

  const ambient = { audioCtx, gain, nodes: [], intervals: [] };
  const addLoop = (filterType, frequency) => {
    const node = createNoiseSource(audioCtx, filterType, frequency);
    node.output.connect(gain);
    node.source.start();
    ambient.nodes.push(node.source, node.output);
  };

  if (state.ambientId === "rain") {
    addLoop("bandpass", 1800);
    addLoop("highpass", 4200);
  } else if (state.ambientId === "fireplace") {
    addLoop("lowpass", 520);
    ambient.intervals.push(window.setInterval(() => playCrackle(audioCtx, gain), 1300 + Math.random() * 1400));
  } else if (state.ambientId === "wind") {
    addLoop("lowpass", 760);
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.035;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    ambient.nodes.push(lfo, lfoGain);
  } else if (state.ambientId === "pages") {
    addLoop("lowpass", 380);
    ambient.intervals.push(window.setInterval(() => playPageTurn(audioCtx, gain), 12000 + Math.random() * 8000));
  } else if (state.ambientId === "ocean") {
    addLoop("lowpass", 420);
    addLoop("bandpass", 760);
  }

  state.ambient = ambient;
  resumeAudioContext(audioCtx);
}

function playCrackle(audioCtx, output) {
  const source = audioCtx.createBufferSource();
  source.buffer = createNoiseBuffer(audioCtx, 0.08);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
  source.connect(gain);
  gain.connect(output);
  source.start();
  source.stop(audioCtx.currentTime + 0.09);
}

function playPageTurn(audioCtx, output) {
  const source = audioCtx.createBufferSource();
  source.buffer = createNoiseBuffer(audioCtx, 0.22);
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1600;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.22);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  source.start();
  source.stop(audioCtx.currentTime + 0.24);
}

function stopAmbient() {
  if (!state.ambient) {
    return;
  }
  for (const interval of state.ambient.intervals) {
    window.clearInterval(interval);
    window.clearTimeout(interval);
  }
  for (const node of state.ambient.nodes) {
    try {
      if (typeof node.stop === "function") node.stop();
      if (typeof node.disconnect === "function") node.disconnect();
    } catch {
      // stopped nodes can throw in Safari; ignore.
    }
  }
  if (state.ambient.audio) {
    state.ambient.audio.pause();
    state.ambient.audio.removeAttribute("src");
    state.ambient.audio.load();
  }
  if (state.ambient.audioCtx) {
    state.ambient.audioCtx.close();
  }
  state.ambient = null;
}

function updateProgress(value) {
  const percent = Math.max(0, Math.min(100, value));
  els.progressBar.style.width = `${percent}%`;
}

function armTimer() {
  window.clearTimeout(state.timerHandle);
  state.timerHandle = null;
  if (!state.timerMinutes || state.audioMode === "idle") {
    updateTimerStatus();
    return;
  }
  state.timerHandle = window.setTimeout(() => {
    stopAll();
    showToast("定时已停止播放。");
  }, state.timerMinutes * 60 * 1000);
  updateTimerStatus();
}

function playGeneratedAudio() {
  const audio = els.narrationAudio;
  const graph = ensureNarrationGraph();
  audio.src = audioFileName();
  setNarrationVolume();
  audio.playbackRate = NARRATION_PLAYBACK_RATE;
  audio.preservesPitch = true;
  audio.webkitPreservesPitch = true;
  audio.mozPreservesPitch = true;
  audio.currentTime = 0;

  const onTimeUpdate = () => {
    if (audio.duration) {
      updateProgress((audio.currentTime / audio.duration) * 100);
    }
  };
  const cleanup = () => {
    audio.removeEventListener("timeupdate", onTimeUpdate);
    audio.removeEventListener("ended", onEnded);
  };
  const onEnded = () => {
    cleanup();
    stopAll(false);
  };

  audio.addEventListener("timeupdate", onTimeUpdate);
  audio.addEventListener("ended", onEnded);

  return resumeAudioContext(graph?.audioCtx).then(() => audio.play()).then(() => {
    state.audioMode = "file";
    els.playbackStatus.textContent = "正在播放生成音频 · 原速";
    armTimer();
  }).catch((error) => {
    cleanup();
    if (error?.name === "NotAllowedError") {
      throw error;
    }
    return playSpeechPreview();
  });
}

function playSpeechPreview() {
  if (!("speechSynthesis" in window)) {
    showToast("当前浏览器不能直接朗读，请先用脚本生成 mp3。");
    return Promise.resolve();
  }
  const version = currentVersion();
  const paragraphs = version.text.filter(Boolean);
  state.audioMode = "speech";
  state.speaking = true;
  state.speechIndex = 0;
  els.playbackStatus.textContent = "正在用浏览器朗读预览 · 睡前慢速";
  armTimer();
  speakNext(paragraphs);
  return Promise.resolve();
}

function speakNext(paragraphs) {
  if (!state.speaking) {
    return;
  }
  if (state.speechIndex >= paragraphs.length) {
    stopAll(false);
    return;
  }

  const paragraph = paragraphs[state.speechIndex];
  state.speechIndex += 1;
  updateProgress((state.speechIndex / paragraphs.length) * 100);

  if (/^\[[^\]]+\]$/.test(paragraph.trim())) {
    const delay = paragraph.includes("三秒") ? LONG_CUE_PAUSE_MS : SHORT_CUE_PAUSE_MS;
    state.cueHandle = window.setTimeout(() => speakNext(paragraphs), delay);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(paragraph);
  const voice = currentVoice();
  utterance.lang = "zh-CN";
  utterance.rate = voice.speech.rate * SPEECH_SLEEP_RATE;
  utterance.pitch = voice.speech.pitch;
  utterance.volume = inputVolume(els.narrationVolume) * voice.speech.volume;
  const browserVoice = window.speechSynthesis
    .getVoices()
    .find((item) => item.lang?.toLowerCase().startsWith("zh") && item.name.includes(voice.name));
  if (browserVoice) {
    utterance.voice = browserVoice;
  }
  utterance.onend = () => {
    state.cueHandle = window.setTimeout(() => speakNext(paragraphs), SPEECH_PARAGRAPH_PAUSE_MS);
  };
  utterance.onerror = () => {
    state.cueHandle = window.setTimeout(() => speakNext(paragraphs), SPEECH_PARAGRAPH_PAUSE_MS);
  };
  window.speechSynthesis.speak(utterance);
}

function stopAll(resetProgress = true) {
  els.narrationAudio.pause();
  els.narrationAudio.removeAttribute("src");
  els.narrationAudio.load();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  window.clearTimeout(state.timerHandle);
  window.clearTimeout(state.cueHandle);
  state.timerHandle = null;
  state.cueHandle = null;
  state.speaking = false;
  state.audioMode = "idle";
  stopAmbient();
  els.playButton.textContent = "播放";
  els.playbackStatus.textContent = "未播放";
  if (resetProgress) {
    updateProgress(0);
  }
}

function playCurrent() {
  const version = currentVersion();
  if (!hasText(version)) {
    showToast("这一版还没有正文，先把故事填进 src/stories.js。");
    return;
  }
  stopAll();
  startAmbient();
  els.playButton.textContent = "播放中";
  playGeneratedAudio().catch(() => {
    showToast("浏览器拦截了播放，请再点一次播放。");
    stopAll();
  });
}

function copyPrompt() {
  const story = currentStory();
  const duration = durations.find((item) => item.id === state.durationId);
  const prompt = `你是一个中文睡前故事作者。我要为一个手机网页生成历史主题睡前音频文案。请写《${story.title}》的${duration.label}，主题类型是${story.category}。风格要求：低刺激、慢节奏、像有人在夜里轻声讲给用户听；不要写成历史课，不要制造悬念和冲突，不要用总结性口号；多写空间、声音、气味、器物和动作，让句子自然连起来，适合 TTS 朗读。输出只要正文，可以用方括号标注少量声音提示，例如[雨声轻轻落下]、[停顿三秒]。`;
  navigator.clipboard?.writeText(prompt).then(
    () => showToast("已复制生成提示。"),
    () => showToast(prompt)
  );
}

els.voiceSelect.addEventListener("change", () => {
  state.voiceId = els.voiceSelect.value;
});

els.ambientSelect.addEventListener("change", () => {
  state.ambientId = els.ambientSelect.value;
  if (state.audioMode !== "idle") {
    startAmbient();
  }
});

els.ambientVolume.addEventListener("input", () => setAmbientVolume());

els.narrationVolume.addEventListener("input", () => setNarrationVolume());

els.playButton.addEventListener("click", playCurrent);
els.stopButton.addEventListener("click", () => stopAll());
els.copyPromptButton.addEventListener("click", copyPrompt);

window.speechSynthesis?.addEventListener?.("voiceschanged", () => {});

loadVolumeSettings();
render();
