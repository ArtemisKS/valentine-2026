import type { Question } from '../types/Question';

export const questions: Question[] = [
  {
    id: 'q1',
    type: 'multipleChoice',
    question: 'What makes your heart skip a beat when we\'re together?',
    designVariant: 'gradient-rose',
    videoSrc: 'videos/1-cat-piano.webm',
    options: [
      {
        text: 'When you hold my hand unexpectedly',
        letterSegment: 'Every time your fingers intertwine with mine, the world feels complete.',
      },
      {
        text: 'Your laugh that lights up the room',
        letterSegment: 'Your laughter is the melody that makes every moment magical.',
      },
      {
        text: 'The way you look at me',
        letterSegment: 'In your eyes, I see forever — and I never want to look away.',
      },
      {
        text: 'Our quiet moments together',
        letterSegment: 'The silence between us speaks louder than any words ever could.',
      },
    ],
  },
  {
    id: 'q2',
    type: 'heartRating',
    question: 'How would you rate the butterflies you feel when you think of us?',
    designVariant: 'hearts-pattern',
    maxHearts: 5,
    options: [
      { hearts: 1, letterSegment: 'You make me smile in ways I never knew possible.' },
      { hearts: 2, letterSegment: 'Thinking of you brings warmth to my coldest days.' },
      { hearts: 3, letterSegment: 'You\'ve become the highlight of every single day.' },
      { hearts: 4, letterSegment: 'My heart races every time I know I\'ll see you soon.' },
      { hearts: 5, letterSegment: 'You are the love story I never dared to dream of.' },
    ],
  },
  {
    id: 'q3',
    type: 'yesNo',
    question: 'Do you believe we\'re writing the most beautiful story together?',
    designVariant: 'romantic-purple',
    videoSrc: 'videos/2-cat-funny-clip.webm',
    options: [
      {
        value: 'yes',
        text: 'Absolutely, every chapter with you',
        letterSegment: 'With you, I\'m writing the love story I\'ve always wanted to live.',
      },
      {
        value: 'no',
        text: 'It\'s even better than a story',
        letterSegment: 'What we have transcends stories — it\'s pure magic, impossibly real.',
      },
    ],
  },
  {
    id: 'q4',
    type: 'emojiReaction',
    question: 'How does your heart feel when you imagine our future together?',
    designVariant: 'pastel-dream',
    options: [
      {
        emoji: '🥰',
        label: 'Overflowing with love',
        letterSegment: 'Our future is a canvas, and I want to paint it with endless love.',
      },
      {
        emoji: '✨',
        label: 'Sparkling with excitement',
        letterSegment: 'Every tomorrow with you feels like opening a gift I\'ve always wanted.',
      },
      {
        emoji: '🌈',
        label: 'Bright and colorful',
        letterSegment: 'You bring color to every corner of my life and every dream I hold.',
      },
      {
        emoji: '💫',
        label: 'Starstruck and dreamy',
        letterSegment: 'Dreaming of forever with you feels like reaching for the stars and catching them.',
      },
    ],
  },
  {
    id: 'q5',
    type: 'multipleChoice',
    question: 'What\'s your favorite thing about the way we connect?',
    designVariant: 'love-bubbles',
    videoSrc: 'videos/3-cat-japanese.webm',
    options: [
      {
        text: 'We understand each other without words',
        letterSegment: 'You know my heart in the quiet spaces where words aren\'t needed.',
      },
      {
        text: 'We make each other laugh endlessly',
        letterSegment: 'With you, laughter isn\'t just sound — it\'s the rhythm of our love.',
      },
      {
        text: 'We support each other\'s dreams',
        letterSegment: 'You believe in me so fiercely that I\'ve started believing in myself too.',
      },
      {
        text: 'We\'re perfectly imperfect together',
        letterSegment: 'Our flaws fit together like puzzle pieces made just for us.',
      },
    ],
  },
  {
    id: 'q6',
    type: 'heartRating',
    question: 'How excited are you to create more memories with me?',
    designVariant: 'soft-crimson',
    maxHearts: 5,
    options: [
      { hearts: 1, letterSegment: 'Every moment with you is a memory I want to treasure.' },
      { hearts: 2, letterSegment: 'I look forward to every adventure, big or small, by your side.' },
      { hearts: 3, letterSegment: 'The thought of making memories with you fills me with joy.' },
      { hearts: 4, letterSegment: 'I can\'t wait to fill our story with moments we\'ll never forget.' },
      { hearts: 5, letterSegment: 'Creating memories with you is the greatest gift life could give me.' },
    ],
  },
  {
    id: 'q7',
    type: 'yesNo',
    question: 'Would you say that being with me feels like home?',
    designVariant: 'golden-glow',
    videoSrc: 'videos/4-tyn-tyn.webm',
    options: [
      {
        value: 'yes',
        text: 'Yes, you are my safe place',
        letterSegment: 'In your arms, I\'ve found the home I\'ve been searching for all along.',
      },
      {
        value: 'no',
        text: 'It\'s even more than home',
        letterSegment: 'You\'re not just home — you\'re the entire universe where I belong.',
      },
    ],
  },
];
