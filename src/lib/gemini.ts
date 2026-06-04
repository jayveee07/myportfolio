import { ADMIN_EMAIL } from "./supabase";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

export async function generateChatResponse(userMessage: string, visitorName: string) {
  if (!API_KEY) {
    return "The AI assistant is currently offline. Please contact John Vince directly.";
  }

  void userMessage;
  void visitorName;
  return "The AI assistant is currently offline. Please contact John Vince directly.";
}

export async function suggestAdminResponse(messages: unknown[], visitorName: string) {
  if (!API_KEY) return null;

  void messages;
  void visitorName;
  return null;
}
