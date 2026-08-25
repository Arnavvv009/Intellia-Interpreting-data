// Four core datasets — one per data representation type.
// Every representation shows a real classroom-style survey so children
// can see the SAME idea of "data" told four different ways.

export const DATASETS = {
  pictograph: {
    title: "Favourite Fruits of P3 Pupils",
    unit: "pupils",
    key: "Each 🍎 = 1 pupil",
    items: [
      { label: "Apple", emoji: "🍎", value: 4 },
      { label: "Banana", emoji: "🍌", value: 7 },
      { label: "Orange", emoji: "🍊", value: 3 },
      { label: "Grapes", emoji: "🍇", value: 5 },
      { label: "Watermelon", emoji: "🍉", value: 2 },
    ],
  },
  bar: {
    title: "Pets Owned by Classmates",
    unit: "classmates",
    items: [
      { label: "Dogs", emoji: "🐶", value: 8, color: "#4A90D9" },
      { label: "Cats", emoji: "🐱", value: 6, color: "#FF8A50" },
      { label: "Fish", emoji: "🐟", value: 4, color: "#A78BFA" },
      { label: "Birds", emoji: "🐦", value: 3, color: "#34D399" },
      { label: "Hamsters", emoji: "🐹", value: 2, color: "#ffbe1a" },
    ],
  },
  table: {
    title: "Storybooks Read Each Day This Week",
    unit: "storybooks",
    items: [
      { label: "Mon", emoji: "📗", value: 2 },
      { label: "Tue", emoji: "📘", value: 3 },
      { label: "Wed", emoji: "📙", value: 1 },
      { label: "Thu", emoji: "📕", value: 4 },
      { label: "Fri", emoji: "📚", value: 5 },
    ],
  },
  line: {
    title: "Afternoon Temperature This Week (°C)",
    unit: "°C",
    items: [
      { label: "Mon", value: 27 },
      { label: "Tue", value: 29 },
      { label: "Wed", value: 30 },
      { label: "Thu", value: 28 },
      { label: "Fri", value: 31 },
    ],
  },
};

// Helper stats used across the app (Total / Highest / Lowest)
function getTotal(items) { return items.reduce((sum, i) => sum + i.value, 0); }
function getHighest(items) { return items.reduce((a, b) => (b.value > a.value ? b : a)); }
function getLowest(items) { return items.reduce((a, b) => (b.value < a.value ? b : a)); }

export const REPRESENTATIONS = {
  pictograph: {
    id: "pictograph",
    name: "Picture Graph",
    emoji: "🖼️",
    color: "#4A90D9",
    dataset: DATASETS.pictograph,
    total: getTotal(DATASETS.pictograph.items),
    highest: getHighest(DATASETS.pictograph.items),
    lowest: getLowest(DATASETS.pictograph.items),
    usesKey: true,
    usesAxis: false,
    bestForTrends: false,
    funFact: "Every picture stands for a fixed number of items — always check the key first!",
    propertyDescription: "a key, one row of pictures per category, and a total of 21 pupils",
    netDescription: "Uses pictures or icons, with a key showing what each icon means",
  },
  bar: {
    id: "bar",
    name: "Bar Graph",
    emoji: "📊",
    color: "#FF8A50",
    dataset: DATASETS.bar,
    total: getTotal(DATASETS.bar.items),
    highest: getHighest(DATASETS.bar.items),
    lowest: getLowest(DATASETS.bar.items),
    usesKey: false,
    usesAxis: true,
    bestForTrends: false,
    funFact: "Taller bars mean bigger numbers — bar graphs make comparing amounts super easy!",
    propertyDescription: "bars of different heights on a scale, and a total of 23 classmates",
    netDescription: "Uses rectangular bars of different heights to show amounts",
  },
  table: {
    id: "table",
    name: "Table",
    emoji: "🗂️",
    color: "#A78BFA",
    dataset: DATASETS.table,
    total: getTotal(DATASETS.table.items),
    highest: getHighest(DATASETS.table.items),
    lowest: getLowest(DATASETS.table.items),
    usesKey: false,
    usesAxis: false,
    bestForTrends: false,
    funFact: "Tables organise data neatly into rows and columns so nothing gets mixed up!",
    propertyDescription: "rows and columns of exact numbers, and a total of 15 storybooks",
    netDescription: "Uses rows and columns to organise numbers neatly",
  },
  line: {
    id: "line",
    name: "Line Graph",
    emoji: "📈",
    color: "#34D399",
    dataset: DATASETS.line,
    total: getTotal(DATASETS.line.items),
    highest: getHighest(DATASETS.line.items),
    lowest: getLowest(DATASETS.line.items),
    usesKey: false,
    usesAxis: true,
    bestForTrends: true,
    funFact: "Line graphs are perfect for showing how something changes over time, like the weather!",
    propertyDescription: "points joined by a line that rises and falls, and a total of 145 across the week",
    netDescription: "Uses points joined by lines to show change over time",
  },
};

export const PROPERTY_COMPARISON = [
  { rep: "Picture Graph", total: REPRESENTATIONS.pictograph.total, highest: REPRESENTATIONS.pictograph.highest.value, lowest: REPRESENTATIONS.pictograph.lowest.value, usesKey: true },
  { rep: "Bar Graph", total: REPRESENTATIONS.bar.total, highest: REPRESENTATIONS.bar.highest.value, lowest: REPRESENTATIONS.bar.lowest.value, usesKey: false },
  { rep: "Table", total: REPRESENTATIONS.table.total, highest: REPRESENTATIONS.table.highest.value, lowest: REPRESENTATIONS.table.lowest.value, usesKey: false },
  { rep: "Line Graph", total: REPRESENTATIONS.line.total, highest: REPRESENTATIONS.line.highest.value, lowest: REPRESENTATIONS.line.lowest.value, usesKey: false },
];
