import type { ChatMessage } from "@/lib/generator/system-prompt";

export const MAX_HISTORY_MESSAGES = 10;
export const MAX_HISTORY_MESSAGE_LENGTH = 2000;
export const MAX_HISTORY_TOTAL_LENGTH = 8000;

export function sanitizeHistory(history: ChatMessage[]): ChatMessage[] {
  const allowed = history.filter(
    (message): message is ChatMessage =>
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string",
  );

  const recent = allowed.slice(-MAX_HISTORY_MESSAGES);
  const sanitized: ChatMessage[] = [];
  let totalLength = 0;

  for (const message of recent) {
    const content = message.content.trim().slice(0, MAX_HISTORY_MESSAGE_LENGTH);
    if (!content) {
      continue;
    }

    if (totalLength + content.length > MAX_HISTORY_TOTAL_LENGTH) {
      break;
    }

    sanitized.push({ role: message.role, content });
    totalLength += content.length;
  }

  return sanitized;
}
