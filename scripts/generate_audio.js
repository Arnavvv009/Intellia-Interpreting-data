import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import dotenv from 'dotenv';
import slugify from 'slugify';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: '.env.local' });

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

const phrases = [
  // Wonder Phase
  { text: "Ms. Tan wrote down a messy list of numbers about her class's favourite fruits. It was hard to read! Then she turned it into a picture with bars. What could that picture be called?", style: 'question' },
  { text: "It's a Bar Graph! Graphs and tables turn messy numbers into clear data we can read at a glance. Let's explore more in the story.", style: 'celebration' },

  // Story Phase Slides
  { text: "Ms. Tan asked her class about their favourite fruits, pets, reading habits, and the weather. She collected lots of numbers — but a long list is hard to read! Let's find out how to show information clearly.", style: 'statement' },
  { text: "A picture graph uses pictures or icons to show data. Each icon stands for a fixed number of items, shown in a key. Counting the apples, bananas, and oranges tells us exactly how many pupils liked each fruit!", style: 'statement' },
  { text: "A bar graph uses bars of different heights to show amounts. The taller the bar, the bigger the number! It has a scale on the side so we can read the exact value of each bar.", style: 'statement' },
  { text: "A table organises numbers neatly into rows and columns — great for exact values. A line graph joins points with a line to show how something changes over time, like rising and falling temperatures across the week!", style: 'statement' },

  // Simulate Phase Stations
  { text: "Welcome to the Graph Explorer! Choose a data representation, and toggle highlights to find the total, highest, and lowest values.", style: 'instruction' },
  { text: "In the Data Counter, let's read the numbers. Tap the chart to explore, then use the number pad to fill in the grid.", style: 'instruction' },
  { text: "Let's match the descriptions on the left with the correct graph names on the right.", style: 'instruction' },
  { text: "Welcome to the Trend Sandbox. Tell me which features each graph type has, then click watch it to see why!", style: 'instruction' },

  // Play Phase
  { text: "Excellent!", style: 'celebration' },
  { text: "Well done!", style: 'celebration' },
  { text: "Brilliant!", style: 'celebration' },
  { text: "You got it!", style: 'celebration' },
  { text: "Super smart!", style: 'celebration' },
  { text: "Not quite! Look at the hints and try again.", style: 'encouragement' },
  { text: "Oh no! You have run out of hearts. Let's retry this world.", style: 'statement' },

  // Reflect Phase
  { text: "Tell me one way you could collect data about your classmates!", style: 'question' },
  { text: "What's your favourite way to show data — pictures, bars, tables, or lines?", style: 'question' },
  { text: "Can you name a graph type that uses a key?", style: 'question' },
  { text: "Where might you spot a bar graph or line graph in real life?", style: 'question' },
  { text: "What's the difference between a picture graph and a table?", style: 'question' },
  { text: "Time to reflect.", style: 'statement' },
  { text: "Excellent reflection! Let's see your results.", style: 'celebration' }
];

const API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
const AUDIO_DIR = join(__dirname, '..', 'public', 'assets', 'audio');
const AUDIO_MAP_PATH = join(__dirname, '..', 'src', 'utils', 'audioMap.js');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAudio() {
  if (!API_KEY) {
    console.error('Error: VITE_ELEVENLABS_API_KEY not found in .env.local');
    process.exit(1);
  }

  if (!existsSync(AUDIO_DIR)) {
    await mkdir(AUDIO_DIR, { recursive: true });
  }

  const audioMap = {};

  for (let i = 0; i < phrases.length; i++) {
    const { text, style } = phrases[i];
    const settings = voiceSettings[style] || voiceSettings.statement;
    const slug = slugify(text.toLowerCase(), { replacement: '_', lower: true, strict: true });
    const filename = `${slug}_${i}.mp3`;
    const filePath = join(AUDIO_DIR, filename);

    try {
      console.log(`Generating ${i + 1}/${phrases.length}: "${text}" (${style})...`);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': API_KEY
          },
          body: JSON.stringify({
              text,
              model_id: MODEL_ID,
              voice_settings: settings
            })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      await writeFile(filePath, Buffer.from(buffer));
      audioMap[text] = `/assets/audio/${filename}`;
      console.log(`Saved to ${filePath}`);

      await sleep(500);
    } catch (err) {
      console.error(`Error generating "${text}":`, err);
    }
  }

  const audioMapContent = `export const audioMap = ${JSON.stringify(audioMap, null, 2)};`;
  await writeFile(AUDIO_MAP_PATH, audioMapContent);
  console.log('audioMap.js generated successfully!');
  console.log('Done!');
}

generateAudio().catch(console.error);
