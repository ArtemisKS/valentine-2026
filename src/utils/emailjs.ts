/**
 * EmailJS Integration Utility
 *
 * Handles sending quiz answers via EmailJS.
 * Uses environment variables for configuration (VITE_ prefix for client-side vars in Vite).
 *
 * Environment Variables Required:
 * - VITE_EMAILJS_SERVICE_ID: EmailJS service ID (e.g., "service_abc123")
 * - VITE_EMAILJS_TEMPLATE_ID: EmailJS template ID (e.g., "template_xyz789")
 * - VITE_EMAILJS_PUBLIC_KEY: EmailJS public key (e.g., "pk_abc123xyz")
 *
 * Note: VITE_ prefix is required because these are client-side environment variables.
 * Vite only exposes variables prefixed with VITE_ to the browser for security.
 */

import emailjs from "@emailjs/browser";

/**
 * Type definition for quiz answer payload
 */
export interface QuizAnswerPayload {
  user_name: string;
  user_email: string;
  answers: string; // JSON stringified answers or formatted text
  timestamp?: string;
  [key: string]: string | undefined; // Allow additional template variables
}

/**
 * Initialize EmailJS with public key
 * Called once on app startup
 */
export function initializeEmailJS(): void {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!publicKey) {
    console.warn(
      "EmailJS public key not configured. Email sending will be disabled. " +
        "Set VITE_EMAILJS_PUBLIC_KEY in .env file."
    );
    return;
  }

  try {
    emailjs.init(publicKey);
    console.log("EmailJS initialized successfully");
  } catch (error) {
    console.error("Failed to initialize EmailJS:", error);
  }
}

/**
 * Send quiz answers via EmailJS
 *
 * @param answers - Quiz answer payload with user info and responses
 * @returns Promise<string> - EmailJS response ID on success, empty string on failure
 *
 * Error Handling:
 * - Gracefully handles missing configuration (logs warning, returns empty string)
 * - Catches and logs EmailJS errors without breaking UX
 * - Allows quiz to complete even if email fails
 */
export async function sendQuizAnswers(
  answers: QuizAnswerPayload
): Promise<string> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // Graceful degradation: if not configured, log and return empty string
  if (!serviceId || !templateId || !publicKey) {
    console.warn(
      "EmailJS not fully configured. Skipping email send. " +
        "Configure VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in .env"
    );
    return "";
  }

  try {
    const response = await emailjs.send(serviceId, templateId, answers, publicKey);
    console.log("Quiz answers sent successfully:", response.status);
    return response.text;
  } catch (error) {
    // Log error but don't throw - allow quiz to complete even if email fails
    console.error("Failed to send quiz answers via EmailJS:", error);

    // Provide helpful error context
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }

    return "";
  }
}

/**
 * Check if EmailJS is properly configured
 * Useful for conditional UI rendering (e.g., show/hide email confirmation message)
 */
export function isEmailJSConfigured(): boolean {
  return !!(
    import.meta.env.VITE_EMAILJS_SERVICE_ID &&
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
}
