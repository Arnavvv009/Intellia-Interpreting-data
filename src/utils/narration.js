import { say, ask, cheer, emphasize, think, celebrate, instruct } from './audio.js';

export function wonderNarration() {
  return [
    ask("Ms. Tan wrote down a messy list of numbers about her class's favourite fruits. It was hard to read! Then she turned it into a picture with bars. What could that picture be called?")
  ];
}

export function storySlideNarration(slideIndex) {
  const texts = [
    "Ms. Tan asked her class about their favourite fruits, pets, reading habits, and the weather. She collected lots of numbers — but a long list is hard to read! Let's find out how to show information clearly.",
    "A picture graph uses pictures or icons to show data. Each icon stands for a fixed number of items, shown in a key. Counting the apples, bananas, and oranges tells us exactly how many pupils liked each fruit!",
    "A bar graph uses bars of different heights to show amounts. The taller the bar, the bigger the number! It has a scale on the side so we can read the exact value of each bar.",
    "A table organises numbers neatly into rows and columns — great for exact values. A line graph joins points with a line to show how something changes over time, like rising and falling temperatures across the week!"
  ];
  return [say(texts[slideIndex] || "")];
}

export function simulateStationNarration(stationIndex) {
  const texts = [
    "Welcome to the Graph Explorer! Choose a data representation, and toggle highlights to find the total, highest, and lowest values.",
    "In the Data Counter, let's read the numbers. Tap the chart to explore, then use the number pad to fill in the grid.",
    "Let's match the descriptions on the left with the correct graph names on the right.",
    "Welcome to the Trend Sandbox. Tell me which features each graph type has, then click watch it to see why!"
  ];
  return [instruct(texts[stationIndex] || "")];
}

export function praiseNarration() {
  const phrases = ["Excellent!", "Well done!", "Brilliant!", "You got it!", "Super smart!"];
  const random = phrases[Math.floor(Math.random() * phrases.length)];
  return [celebrate(random)];
}

export function reflectPromptNarration(promptText) {
  return [say("Time to reflect."), ask(promptText)];
}
