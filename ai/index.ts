import { openai } from "@ai-sdk/openai";

import { customMiddleware } from "./custom-middleware";

export const chatGpt4oModel = openai("gpt-4o");

export const chatGpt4oMiniModel = openai("gpt-4o-mini");

// Keep the old exports for compatibility
export const geminiProModel = chatGpt4oModel;
export const geminiFlashModel = chatGpt4oMiniModel;
