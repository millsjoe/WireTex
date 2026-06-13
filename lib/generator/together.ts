import Together from "together-ai";
import type { ChatMessage } from "@/lib/generator/system-prompt";
import {
  GenerationServiceError,
  toGenerationServiceError,
} from "@/lib/generator/together-errors";

const TOGETHER_TIMEOUT_MS = 20_000;

let client: Together | null = null;

function getTogetherClient(): Together {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    throw new GenerationServiceError(
      "config",
      "Generation is temporarily unavailable.",
    );
  }

  if (!client) {
    client = new Together({ apiKey });
  }

  return client;
}

function getModel(): string {
  const model = process.env.TOGETHER_MODEL;
  if (!model) {
    throw new GenerationServiceError(
      "config",
      "Generation is temporarily unavailable.",
    );
  }

  return model;
}

export async function callTogetherChat(
  messages: ChatMessage[],
): Promise<string> {
  try {
    const response = await getTogetherClient().chat.completions.create(
      {
        model: getModel(),
        messages,
        temperature: 0.3,
        max_tokens: 2048,
      },
      {
        signal: AbortSignal.timeout(TOGETHER_TIMEOUT_MS),
      },
    );

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new GenerationServiceError(
        "empty_response",
        "The model returned an empty response. Please try again.",
      );
    }

    return content;
  } catch (error) {
    throw toGenerationServiceError(error);
  }
}
