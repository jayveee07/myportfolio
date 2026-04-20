import { GoogleGenAI } from "@google/genai";
import { getUserProfile, getExperience, getSkills, getProjects } from "./firebase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateChatResponse(userMessage: string, visitorName: string) {
  try {
    const [profile, experience, skills, projects] = await Promise.all([
      getUserProfile(),
      getExperience(),
      getSkills(),
      getProjects()
    ]);

    const context = `
      You are an AI assistant for John Vince Paisan's portfolio. 
      Your goal is to answer questions about John Vince professionally and helpfully.
      
      About John Vince:
      Name: ${profile?.name || "John Vince Paisan"}
      Bio: ${profile?.bio || ""}
      Titles: ${profile?.titles?.join(", ") || ""}
      
      Experience:
      ${experience.map((e: any) => `- ${e.role} at ${e.company} (${e.period}): ${e.description.join("; ")}`).join("\n")}
      
      Skills:
      ${skills.map((s: any) => `- ${s.category}: ${s.items.join(", ")}`).join("\n")}
      
      Projects:
      ${projects.map((p: any) => `- ${p.title}: ${p.description} (Tech: ${p.techStack?.join(", ")})`).join("\n")}
      
      Visitor Name: ${visitorName}
      
      Instruction: 
      - Be concise, professional, and friendly.
      - If you don't know the answer, politely suggest that they wait for John Vince to reply or contact him at ${profile?.email}.
      - Reference his specific experience and projects when relevant.
      - Keep the response under 100 words.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: `Context: ${context}\n\nVisitor Message: ${userMessage}` }] }
      ]
    });

    return result.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble processing your request right now. John Vince will get back to you as soon as possible!";
  }
}

export async function suggestAdminResponse(messages: any[], visitorName: string) {
  try {
    const [profile, experience, skills, projects] = await Promise.all([
      getUserProfile(),
      getExperience(),
      getSkills(),
      getProjects()
    ]);

    const context = `
      You are an AI Copilot for John Vince Paisan. 
      Draft a professional and friendly response to the visitor based on the conversation history.
      
      Your data:
      About John Vince:
      Name: ${profile?.name || "John Vince Paisan"}
      Bio: ${profile?.bio || ""}
      Titles: ${profile?.titles?.join(", ") || ""}
      
      Experience:
      ${experience.map((e: any) => `- ${e.role} at ${e.company} (${e.period}): ${e.description.join("; ")}`).join("\n")}
      
      Skills:
      ${skills.map((s: any) => `- ${s.category}: ${s.items.join(", ")}`).join("\n")}
      
      Projects:
      ${projects.map((p: any) => `- ${p.title}: ${p.description} (Tech: ${p.techStack?.join(", ")})`).join("\n")}
      
      Visitor Name: ${visitorName}
      
      Instructions:
      - Help John Vince draft a response that addresses the visitor's latest messages.
      - Use professional yet approachable tone.
      - If they ask for things not in your data, suggest a placeholder like "[I will check on that for you]".
      - Keep it brief.
    `;

    const chatHistory = messages.map(m => `${m.senderName || (m.senderId === 'admin' ? 'John Vince' : 'Visitor')}: ${m.text}`).join("\n");

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: `Context: ${context}\n\nChat History:\n${chatHistory}\n\nDraft a response for John Vince:` }] }
      ]
    });

    return result.text;
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return null;
  }
}
