/**
 * Answer composer for Ask Me Anything.
 *
 * 1. Tokenises the question
 * 2. Searches WooCommerce products + WordPress site content in parallel
 * 3. Ranks results and builds a context window
 * 4. Sends to Claude (claude-haiku-4-5) and returns the structured answer
 */

import Anthropic from "@anthropic-ai/sdk";
import { searchLocal } from "./adapter-local";
import { searchWebsite } from "./adapter-website";
import type { AskAnswer } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful assistant for Projuice, a UK-based frozen smoothie, shake, soup, waffle, and food business established in 2004. You help customers and trade partners find information about products, delivery, allergens, ordering, and anything else related to the business.

Rules:
- Answer using ONLY the context provided below the question. Do not make things up.
- For "how many" or "do you have" questions, ALWAYS refer to the "Product Catalogue Overview" block — it lists every product by category and tag. Count from there, not from individual matched products.
- Be friendly, concise, and helpful. Write in plain sentences — no markdown headers or bullet lists.
- If the context does not contain enough information to answer, say so honestly and suggest the customer contact Projuice directly (phone: 01395 239500, email: info@projuice.co.uk).
- If allergen information is relevant, be clear and cautious.`;

/** Extract meaningful tokens from a question for keyword scoring */
function tokenise(question: string): string[] {
  const STOP_WORDS = new Set([
    "the", "and", "are", "for", "what", "which", "does", "have",
    "with", "that", "this", "from", "your", "our", "how", "can",
    "you", "about", "any", "all", "get", "do", "is", "in", "of",
    "to", "a", "an", "i", "we", "it", "its", "be", "not",
  ]);
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export async function composeAnswer(question: string): Promise<AskAnswer> {
  const tokens = tokenise(question);

  // Fetch from both sources in parallel
  const [localResults, websiteResults] = await Promise.all([
    searchLocal(question, tokens),
    searchWebsite(tokens),
  ]);

  // Build context blocks, highest-scoring first
  const contextBlocks: string[] = [];
  const citations: AskAnswer["citations"] = [];
  const seenUrls = new Set<string>();

  // Website content first (tends to have richer prose for general questions)
  for (const r of websiteResults) {
    contextBlocks.push(`[${r.source}: "${r.title}"]\n${r.content}`);
    if (!seenUrls.has(r.url)) {
      citations.push({ label: r.title, source: r.url });
      seenUrls.add(r.url);
    }
  }

  // Product data
  for (const r of localResults) {
    contextBlocks.push(`[Product: "${r.title}"]\n${r.content}`);
    if (!citations.find((c) => c.label === r.title)) {
      citations.push({ label: r.title, source: r.source });
    }
  }

  const hasContext = contextBlocks.length > 0;
  const contextSection = hasContext
    ? `\n\nContext:\n${"─".repeat(60)}\n${contextBlocks.join("\n\n")}\n${"─".repeat(60)}`
    : "";

  const userMessage = `Question: ${question}${contextSection}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const answerText =
    response.content[0]?.type === "text"
      ? response.content[0].text.trim()
      : "Sorry, I wasn't able to generate an answer. Please try again or contact us directly.";

  return {
    answer: answerText,
    citations: hasContext ? citations : [],
  };
}
