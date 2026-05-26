import { getUserProfile, getExperience, getSkills, getProjects } from "./firebase";
import { ADMIN_EMAIL } from "./messaging";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// IMPORTANT:
// Frontend builds must not bundle/resolve @google/genai.
// The actual Gemini calls should be implemented on the server (see gemini.server.ts)
// and invoked from the frontend via an API route.
//
// For now we return safe offline fallbacks so Vite build always succeeds.

export async function generateChatResponse(userMessage: string, visitorName: string) {
  if (!API_KEY) {
    return "The AI assistant is currently offline. Please contact John Vince directly.";
  }

  // If you wire an API route later, replace this with a fetch() call.
  // Example:
  // const res = await fetch('/api/gemini/chat', { method:'POST', body: JSON.stringify({userMessage, visitorName})});
  // return (await res.json()).text;

  void userMessage;
  void visitorName;
  return "The AI assistant is currently offline. Please contact John Vince directly.";
}

export async function suggestAdminResponse(messages: any[], visitorName: string) {
  if (!API_KEY) return null;

  // Placeholder; implement server-side endpoint and call it from here.
  void messages;
  void visitorName;
  return null;
}

