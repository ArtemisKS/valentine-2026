/**
 * Valentine Quiz -- White-Label Configuration
 * =============================================
 *
 * Edit this file to customise every piece of user-facing text in the quiz.
 * No other source files need to be changed.
 *
 * Sections:
 *   names        - Recipient and sender names used across all screens
 *   pageTitle    - The browser tab / window title
 *   intro        - Welcome screen text and button labels
 *   scoreReveal  - The "100 % match" results screen
 *   loveLetter   - The personalised love letter screen
 *   valentine    - The "Will you be my Valentine?" prompt screen
 *   footer       - Small text at the bottom of every page
 *
 * Theme colours are controlled by Tailwind classes in the components and
 * by src/styles/questionVariants.ts -- edit those if you want different
 * colour palettes.
 */
export const config = {
  // ─── Names ──────────────────────────────────────────────────────────
  /** The recipient's name (the person taking the quiz) */
  recipientName: 'Tanya',

  /** The sender's name (the person who created the quiz) */
  senderName: 'Vitas',

  // ─── Page title ─────────────────────────────────────────────────────
  /** Shown in the browser tab */
  pageTitle: "Valentine's Day Quiz",

  // ─── Intro screen ──────────────────────────────────────────────────
  intro: {
    /** Greeting line above the recipient's name */
    greeting: "Happy Valentine's Day",
    /** Main message paragraph */
    message: "I've created something special for you \u2014 a journey through our love story.",
    /** Instruction text below the message */
    instruction: 'Answer next 7 questions please :3',
    /** Text on the start button (emoji is appended automatically) */
    startButton: 'Begin Our Journey',
    /** Small note below the button */
    timeEstimate: 'Takes about 2 minutes',
  },

  // ─── Score reveal screen ───────────────────────────────────────────
  scoreReveal: {
    /** Heading after the animated percentage */
    title: 'Perfect Match!',
    /** Body text explaining the score */
    message:
      "Your answers reveal something beautiful \u2014 you're absolutely perfect for each other. Every response shows the depth of your connection.",
    /** Label on the continue button (emoji appended automatically) */
    continueButton: 'See Your Love Letter',
  },

  // ─── Love letter screen ────────────────────────────────────────────
  loveLetter: {
    /** Section heading */
    heading: 'A Letter For You',
    /** Closing line before signature */
    closing: 'With all my love,',
    /** Signature prefix -- the senderName is appended automatically */
    signaturePrefix: 'Forever yours',
    /** Label on the continue button (emoji appended automatically) */
    continueButton: 'One Last Thing...',
  },

  // ─── Valentine prompt screen ───────────────────────────────────────
  valentine: {
    /** The big question */
    question: 'Will you be my Valentine?',
    /** Subtitle under the question */
    subtitle: "You know there's only one right answer...",
    /** Label on the Yes button (emoji appended automatically) */
    yesButton: 'Yes!',
    /** Label on the No button */
    noButton: 'No',
    /** Hint text at the bottom */
    hintText: '(Try clicking "No" if you dare...)',
    /** Witty messages shown when the No button is clicked */
    noClickMessages: [
      'Nice try! But the answer is Yes!',
      'Oops! Wrong button!',
      'Are you sure? Think again!',
      "That button doesn't work here!",
      'The only answer is Yes!',
    ],
  },

  // ─── Footer ────────────────────────────────────────────────────────
  footer: {
    /** Footer text template. {sender} and {recipient} are replaced automatically. */
    text: 'Made with love by {sender} for {recipient}',
  },
};
