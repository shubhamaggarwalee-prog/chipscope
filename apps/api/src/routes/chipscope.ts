import { Router } from "express";
import { AskChipScopeQuestionBody, AskChipScopeQuestionResponse } from "@workspace/api-zod";
import { loadBundle } from "../lib/chipscope-bundle";
import { generateAnswer } from "../lib/chipscope-ai";
import { DailyLimitError, reserveAnswer } from "../lib/chipscope-quota";

const router = Router();
let activeAnswers = 0;

router.get("/chipscope/bundle", async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=60").json(await loadBundle());
  } catch {
    req.log.warn("ChipScope dataset fetch failed");
    res.status(503).json({ message: "Updates are temporarily unavailable. Your offline dataset still works." });
  }
});

router.post("/chipscope/ask", async (req, res) => {
  const parsed = AskChipScopeQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Ask a question between 3 and 1,000 characters." });
    return;
  }
  const question = parsed.data.question.trim();
  if (question.length < 3) {
    res.status(400).json({ message: "Ask a slightly longer question." });
    return;
  }
  if (activeAnswers >= 3) {
    res.set("Retry-After", "15").status(429).json({ message: "Ask AI is busy. Please try again shortly." });
    return;
  }
  if (!process.env.OPENAI_API_KEY) {
    res.status(503).json({ message: "Ask AI is not configured yet." });
    return;
  }
  activeAnswers++;
  try {
    const bundle = await loadBundle();
    await reserveAnswer(req.ip ?? req.socket.remoteAddress ?? "unknown");
    res.json(AskChipScopeQuestionResponse.parse(await generateAnswer(question, bundle)));
  } catch (error) {
    if (error instanceof DailyLimitError) {
      const seconds = Math.ceil((new Date().setUTCHours(24, 0, 0, 0) - Date.now()) / 1000);
      res.set("Retry-After", String(seconds)).status(429).json({
        message: "Today's free AI limit has been reached. Please try again tomorrow.",
      });
    } else {
      req.log.warn("ChipScope AI request failed");
      res.status(503).json({ message: "Ask AI is temporarily unavailable. Please try again later." });
    }
  } finally {
    activeAnswers--;
  }
});

export default router;
