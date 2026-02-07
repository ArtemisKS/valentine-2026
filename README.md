# Valentine's Day Quiz 2026 ❤️

A romantic, interactive Valentine's Day quiz built with React, TypeScript, and Tailwind CSS. The quiz generates a personalized love letter based on your answers and includes a fun "runaway button" surprise at the end.

## Features

- **Interactive Quiz**: 7 thoughtfully designed questions with multiple question types
  - Multiple choice questions
  - Heart rating scales (1-5)
  - Yes/No questions
  - Emoji reaction selections
- **Personalized Love Letter**: Answers are assembled into a unique love letter
- **Beautiful Design**: 7 unique visual themes with gradient backgrounds and animations
- **Confetti Celebrations**: Animated confetti bursts at key moments
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Email Integration**: Quiz answers can be sent via EmailJS (optional)
- **Accessibility**: Respects `prefers-reduced-motion` for users with motion sensitivity

## Local Setup

### Prerequisites
- [Bun](https://bun.sh) (fast JavaScript runtime)

### Installation

```bash
# Install dependencies
bun install

# Start development server with hot reload
bun run dev
```

The app will be available at `http://localhost:5173/valentine-2026/`

### Available Commands

```bash
# Development server
bun run dev

# Build for production
bun run build

# Preview production build locally
bun run preview

# Run tests
bun run test
```

## EmailJS Setup (Optional)

To enable email notifications when quiz answers are submitted:

1. Follow the detailed setup guide: [SETUP_EMAILJS.md](./SETUP_EMAILJS.md)
2. Create a `.env` file with your EmailJS credentials:
   ```
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```
3. The quiz will gracefully handle missing configuration (won't break if EmailJS isn't set up)

## Customization

### Update Quiz Questions

Edit `/src/data/questions.ts` to modify:
- Question text and options
- Letter segments (text that appears in the final love letter)
- Design variants (visual themes)
- Question types

### Update Love Letter Recipient

The love letter is addressed to "Tanya" (hardcoded). To change:
1. Edit `/src/components/LoveLetter.tsx`
2. Replace `"Dear Tanya,"` with the desired name

### Customize Design Variants

Edit `/src/styles/questionVariants.ts` to modify:
- Background gradients
- Card styling
- Text colors
- Accent colors
- Decorative patterns

## Deployment

### Automatic Deployment to GitHub Pages

This project uses GitHub Actions for automatic deployment:

1. Push changes to the `main` branch
2. GitHub Actions automatically:
   - Installs dependencies
   - Runs tests
   - Builds the project
   - Deploys to GitHub Pages

The workflow is defined in `.github/workflows/deploy.yml`

**Live URL**: `https://millon15.github.io/valentine-2026/`

### Manual Deployment

```bash
# Build the project
bun run build

# The dist/ folder is ready to deploy
```

## Project Structure

```
src/
├── components/          # React components
│   ├── IntroScreen.tsx
│   ├── QuestionCard.tsx
│   ├── ProgressBar.tsx
│   ├── ScoreReveal.tsx
│   ├── LoveLetter.tsx
│   ├── ValentinePrompt.tsx
│   └── ...
├── data/
│   └── questions.ts     # Quiz questions and letter segments
├── styles/
│   └── questionVariants.ts  # Design themes
├── utils/
│   ├── confetti.ts      # Celebration animations
│   └── emailjs.ts       # Email integration
├── App.tsx              # Main app component
├── index.css            # Global styles
└── main.tsx             # Entry point
```

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool
- **Vitest** - Testing framework
- **EmailJS** - Email notifications (optional)
- **canvas-confetti** - Celebration animations

## Testing

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test --watch

# Run specific test file
bun run test QuestionCard.test.tsx
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Bundle Size**: ~232 KB JavaScript (73 KB gzipped)
- **CSS**: ~49 KB (8 KB gzipped)
- **Load Time**: <2 seconds on 4G
- **Mobile Optimized**: Reduced animations and particle counts on mobile devices

## Accessibility

- ✅ Keyboard navigation support
- ✅ Respects `prefers-reduced-motion` media query
- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Color contrast meets WCAG AA standards

## License

Private project - All rights reserved

## Questions?

For setup issues or customization help, refer to:
- [SETUP_EMAILJS.md](./SETUP_EMAILJS.md) - Email configuration guide
- [CLAUDE.md](./CLAUDE.md) - Development guidelines
