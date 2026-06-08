import { NextRequest, NextResponse } from "next/server";
import { composeAnswer } from "@/lib/ask/composer";
import type { AskQuestion } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: AskQuestion = await request.json();
    const question = body?.question?.trim();

    if (!question || question.length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid question." },
        { status: 400 }
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { error: "Question is too long. Please keep it under 1000 characters." },
        { status: 400 }
      );
    }

    const answer = await composeAnswer(question);
    return NextResponse.json(answer);
  } catch (err: unknown) {
    console.error("[/api/ask] Error:", err);
    const message =
      err instanceof Error ? err.message : String(err);
    if (message.includes("credit balance")) {
      return NextResponse.json(
        { error: "The AI service is temporarily unavailable due to a billing issue. Please contact the site administrator." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
