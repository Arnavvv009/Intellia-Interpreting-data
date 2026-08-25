import { audioMap } from './audioMap.js';

const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';
const MODEL_ID = 'eleven_multilingual_v2';

const voiceSettings = {
  celebration: { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true },
  encouragement: { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true },
  question: { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true },
  emphasis: { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true },
  thinking: { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true },
  statement: { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
  instruction: { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true }
};

const segmentHelpers = {
  say: (text) => ({ text, style: 'statement' }),
  ask: (text) => ({ text, style: 'question' }),
  cheer: (text) => ({ text, style: 'encouragement' }),
  emphasize: (text) => ({ text, style: 'emphasis' }),
  think: (text) => ({ text, style: 'thinking' }),
  celebrate: (text) => ({ text, style: 'celebration' }),
  instruct: (text) => ({ text, style: 'instruction' })
};

const { say, ask, cheer, emphasize, think, celebrate, instruct } = segmentHelpers;

let isPlaying = false;
let currentAudio = null;

async function getAudioUrl(text, style = 'statement') {
  if (audioMap[text]) {
    return audioMap[text];
  }

  try {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey) return null;
    const settings = voiceSettings[style] || voiceSettings.statement;
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: settings
        })
      }
    );
    if (!response.ok) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Error fetching audio:', e);
    return null;
  }
}

async function playAudio(url, rate = 1.0) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.playbackRate = rate;
    audio.onended = () => resolve();
    audio.onerror = () => reject();
    audio.play();
  });
}

async function narrate(segments, preloadNext = true) {
  if (!segments || segments.length === 0) return;
  stopNarration();
  isPlaying = true;
  for (let i = 0; i < segments.length; i++) {
    const { text, style } = segments[i];
    const url = await getAudioUrl(text, style);
    if (!url) continue;
    if (preloadNext && i + 1 < segments.length) {
      getAudioUrl(segments[i + 1].text, segments[i + 1].style);
    }
    try {
      await playAudio(url);
    } catch (e) {
      console.warn('Error playing audio:', e);
    }
  }
  isPlaying = false;
}

function stopNarration() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  isPlaying = false;
}

async function speakText(text, style = 'statement', rate = 1.0) {
  const url = await getAudioUrl(text, style);
  if (url) {
    try {
      stopNarration();
      await playAudio(url, rate);
    } catch (e) {
      console.warn('Error playing audio:', e);
    }
  }
}

export {
  say,
  ask,
  cheer,
  emphasize,
  think,
  celebrate,
  instruct,
  narrate,
  stopNarration,
  getAudioUrl,
  speakText
};
