import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';

const slidesData = [
  {
    title: "Ms. Tan's Data Detective Day",
    body: "Ms. Tan asked her class about their favourite fruits, pets, reading habits, and the weather. She collected lots of numbers — but a long list is hard to read! Let's find out how to show information clearly.",
    fact: "4 Ways to Show Data to Discover!",
    nudge: "Let's turn these messy numbers into clear pictures!",
    image: "/assets/ChatGPT Image Jul 4, 2026, 09_46_00 PM.png"
  },
  {
    title: "The Picture Graph",
    body: "A picture graph uses pictures or icons to show data. Each icon stands for a fixed number of items, shown in a key. Counting the apples, bananas, and oranges tells us exactly how many pupils liked each fruit!",
    fact: "Picture Graph: uses icons + a key",
    nudge: "Always check the key before counting the pictures!",
    image: "/assets/ChatGPT Image Jul 4, 2026, 09_59_32 PM.png"
  },
  {
    title: "The Bar Graph",
    body: "A bar graph uses bars of different heights to show amounts. The taller the bar, the bigger the number! It has a scale on the side so we can read the exact value of each bar.",
    fact: "Bar Graph: tall bars + a scale",
    nudge: "Compare bar heights to see which is more or less!",
    image: "/assets/ChatGPT Image Jul 4, 2026, 10_08_23 PM.png"
  },
  {
    title: "Tables and Line Graphs",
    body: "A table organises numbers neatly into rows and columns — great for exact values. A line graph joins points with a line to show how something changes over time, like rising and falling temperatures across the week!",
    fact: "Table: exact rows · Line Graph: change over time",
    nudge: "Now you know all four ways to show data — let's go practice!",
    image: "/assets/ChatGPT Image Jul 4, 2026, 10_11_22 PM.png"
  }
];

export default function StoryPhase({ onNext, speak }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const currentSlide = slidesData[slideIdx];

  useEffect(() => {
    speak(currentSlide.body);
  }, [slideIdx, speak]);

  const handleNext = () => {
    if (slideIdx < slidesData.length - 1) {
      setSlideIdx(prev => prev + 1);
    } else {
      onNext();
    }
  };

  const handlePrev = () => {
    if (slideIdx > 0) {
      setSlideIdx(prev => prev - 1);
    }
  };

  const pct = Math.round(((slideIdx + 1) / slidesData.length) * 100);

  return (
    <div style={{ width: '100%' }}>
      <div className="story-header">
        <span>Slide {slideIdx + 1} of 4</span>
        <div className="story-dots">
          {slidesData.map((_, idx) => (
            <div
              key={idx}
              className={`story-dot ${idx === slideIdx ? 'story-dot--active' : ''}`}
            />
          ))}
        </div>
        <span>{pct}%</span>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="main-card" style={{ paddingBottom: '32px' }}>
        <div className="story-img-bleed">
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <div className="story-content-section">
          <h2 className="story-title">{currentSlide.title}</h2>
          <p className="story-body">{currentSlide.body}</p>
          <div className="hint-fact-pill" style={{ alignSelf: 'flex-start' }}>
            ✨ {currentSlide.fact} ✨
          </div>
          <Mascot mood="idle" bubble={currentSlide.nudge} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <button
          className="btn-nav-outline"
          onClick={handlePrev}
          disabled={slideIdx === 0}
          style={{ opacity: slideIdx === 0 ? 0.5 : 1 }}
        >
          ← Previous
        </button>
        <button className="btn-nav-outline" onClick={handleNext}>
          {slideIdx < slidesData.length - 1 ? "Next ➔" : "Go to Simulation ➔"}
        </button>
      </div>
    </div>
  );
}
