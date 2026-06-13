"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseWireTex } from "@/lib/wiretex/parse";
import { render } from "@/lib/wiretex/renderer";
import {
  createCustomTheme,
  defaultThemes,
  type Theme,
} from "@/lib/site/themes";
import type { RateLimitStatus } from "@/lib/generator/types";
import type { ChatMessage } from "@/lib/generator/system-prompt";
import {
  generateWireframe,
  getRateLimitStatus,
} from "@/app/actions/generate-wireframe";
import { AppToolbar } from "@/components/editor/AppToolbar";
import { ThemePanel } from "@/components/editor/ThemePanel";
import { WireframePreview } from "@/components/editor/WireframePreview";

type Device = "web" | "mobile";

interface UiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  markup?: string;
}

function formatResetTime(resetAt: number): string {
  const minutes = Math.max(1, Math.ceil((resetAt - Date.now()) / 60_000));
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

function nextMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const CAPTCHA_REQUIRED = Boolean(TURNSTILE_SITE_KEY);

export function ChatApp() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [latestMarkup, setLatestMarkup] = useState("");
  const [device, setDevice] = useState<Device>("web");
  const [themeId, setThemeId] = useState(defaultThemes[0].id);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const activeTheme = useMemo(() => {
    if (themeId === "custom" && customTheme) return customTheme;
    return defaultThemes.find((theme) => theme.id === themeId) ?? defaultThemes[0];
  }, [themeId, customTheme]);

  const { html, parseError } = useMemo(() => {
    if (!latestMarkup || latestMarkup.startsWith("ERROR:")) {
      return { html: "", parseError: null as string | null };
    }

    try {
      return {
        html: render(parseWireTex(latestMarkup)),
        parseError: null as string | null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Parse error";
      return { html: "", parseError: message };
    }
  }, [latestMarkup]);

  const refreshRateLimit = useCallback(async () => {
    try {
      const status = await getRateLimitStatus();
      setRateLimit(status);
    } catch {
      setRateLimit(null);
    }
  }, []);

  useEffect(() => {
    void refreshRateLimit();
  }, [refreshRateLimit]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleThemeChange = useCallback((id: string) => {
    setThemeId(id);
    if (id !== "custom") {
      setCustomTheme(null);
      setShowThemeEditor(false);
    }
  }, []);

  const handleCustomiseToggle = useCallback(() => {
    if (showThemeEditor) {
      setShowThemeEditor(false);
      return;
    }

    setCustomTheme((prev) =>
      prev ?? createCustomTheme("Custom", themeId === "custom" ? "sketch" : themeId),
    );
    setThemeId("custom");
    setShowThemeEditor(true);
  }, [showThemeEditor, themeId]);

  const handleThemeVarChange = useCallback((key: string, value: string) => {
    setCustomTheme((prev) => {
      const base =
        prev ??
        createCustomTheme("Custom", themeId === "custom" ? "sketch" : themeId);
      return {
        ...base,
        vars: { ...base.vars, [key]: value },
      };
    });
    setThemeId("custom");
    setShowThemeEditor(true);
  }, [themeId]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmed = prompt.trim();
      if (!trimmed || isGenerating) {
        return;
      }

      if (rateLimit && rateLimit.remaining <= 0) {
        setError(
          rateLimit.resetAt
            ? `Rate limit reached. Try again in ${formatResetTime(rateLimit.resetAt)}.`
            : "Rate limit reached. Try again later.",
        );
        return;
      }

      if (CAPTCHA_REQUIRED && !turnstileToken) {
        setError("Complete the captcha before generating.");
        return;
      }

      setError(null);
      setIsGenerating(true);

      const userMessage: UiMessage = {
        id: nextMessageId(),
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMessage]);
      setPrompt("");

      const history: ChatMessage[] = messages.map((message) =>
        message.role === "user"
          ? { role: "user" as const, content: message.content }
          : {
              role: "assistant" as const,
              content: message.markup ?? message.content,
            },
      );

      try {
        const result = await generateWireframe(trimmed, history, turnstileToken);

        if (CAPTCHA_REQUIRED) {
          turnstileRef.current?.reset();
          setTurnstileToken("");
        }

        if (!result.ok) {
          setError(result.message);
          if (typeof result.remaining === "number") {
            setRateLimit((prev) =>
              prev
                ? {
                    ...prev,
                    remaining: result.remaining ?? prev.remaining,
                    resetAt: result.resetAt ?? prev.resetAt,
                  }
                : prev,
            );
          }
          return;
        }

        setLatestMarkup(result.markup);
        setMessages((prev) => [
          ...prev,
          {
            id: nextMessageId(),
            role: "assistant",
            content: result.isGeneratorError
              ? result.markup
              : "Wireframe generated.",
            markup: result.markup,
          },
        ]);
        setRateLimit((prev) =>
          prev
            ? {
                ...prev,
                remaining: result.remaining,
                resetAt: result.resetAt,
              }
            : prev,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setIsGenerating(false);
        void refreshRateLimit();
      }
    },
    [prompt, isGenerating, rateLimit, messages, refreshRateLimit, turnstileToken],
  );

  const rateLimitLabel = useMemo(() => {
    if (!rateLimit) {
      return "Checking usage…";
    }

    if (rateLimit.remaining <= 0 && rateLimit.resetAt) {
      return `Limit reached · resets in ${formatResetTime(rateLimit.resetAt)}`;
    }

    return `${rateLimit.remaining} of ${rateLimit.maxRequests} requests left this hour`;
  }, [rateLimit]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1>Generate</h1>
            <p>Describe a screen and get WireTex markup with a live preview</p>
          </div>
          <div className="chat-header-meta">
            <span className="chat-rate-limit" aria-live="polite">
              {rateLimitLabel}
            </span>
            <AppToolbar
              themeId={themeId}
              customTheme={customTheme}
              showThemeEditor={showThemeEditor}
              device={device}
              onThemeChange={handleThemeChange}
              onCustomiseToggle={handleCustomiseToggle}
              onDeviceChange={setDevice}
            />
          </div>
        </div>
        {showThemeEditor && customTheme && (
          <ThemePanel theme={customTheme} onVarChange={handleThemeVarChange} />
        )}
      </header>

      <main className="app-main app-main-chat">
        <section className="panel panel-chat">
          <div className="panel-header">Chat</div>
          <div className="chat-messages" aria-live="polite">
            {messages.length === 0 && !isGenerating && (
              <div className="chat-empty">
                <p>Try prompts like:</p>
                <ul>
                  <li>Simple login form with remember me</li>
                  <li>Checkout page with order summary and payment</li>
                  <li>Analytics dashboard with KPI cards and a chart</li>
                </ul>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message chat-message-${message.role}`}
              >
                <div className="chat-message-label">
                  {message.role === "user" ? "You" : "WireTex"}
                </div>
                <div className="chat-message-body">{message.content}</div>
              </div>
            ))}

            {isGenerating && (
              <div className="chat-message chat-message-assistant">
                <div className="chat-message-label">WireTex</div>
                <div className="chat-message-body chat-message-loading">
                  Generating wireframe…
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            {error && <p className="chat-error">{error}</p>}
            <textarea
              className="chat-input"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the wireframe you want…"
              rows={3}
              disabled={isGenerating}
              maxLength={4000}
              aria-label="Wireframe prompt"
            />
            {CAPTCHA_REQUIRED && (
              <div className="chat-turnstile">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={setTurnstileToken}
                  onExpire={() => setTurnstileToken("")}
                  onError={() => setTurnstileToken("")}
                  options={{ theme: "dark", size: "flexible" }}
                />
              </div>
            )}
            <div className="chat-form-actions">
              <span className="chat-form-hint">
                {prompt.length}/4000 · {rateLimitLabel}
              </span>
              <button
                type="submit"
                className="chat-submit"
                disabled={
                  isGenerating ||
                  prompt.trim().length < 3 ||
                  (rateLimit?.remaining ?? 1) <= 0 ||
                  (CAPTCHA_REQUIRED && !turnstileToken)
                }
              >
                {isGenerating ? "Generating…" : "Generate"}
              </button>
            </div>
          </form>
        </section>

        <section className="panel panel-editor">
          <div className="panel-header">Output</div>
          <textarea
            className="editor-textarea"
            value={latestMarkup}
            onChange={(event) => setLatestMarkup(event.target.value)}
            spellCheck={false}
            aria-label="WireTex markup output"
            placeholder="Generated markup will appear here. You can edit it directly."
          />
          {latestMarkup.startsWith("ERROR:") && (
            <pre className="parse-error">{latestMarkup}</pre>
          )}
          {parseError && <pre className="parse-error">{parseError}</pre>}
        </section>

        <section className="panel panel-preview">
          <div className="panel-header">Preview</div>
          {latestMarkup && !latestMarkup.startsWith("ERROR:") && html ? (
            <WireframePreview
              html={html}
              themeVars={activeTheme.vars}
              device={device}
            />
          ) : (
            <div className="chat-preview-empty">
              {latestMarkup.startsWith("ERROR:")
                ? "That request could not be turned into a wireframe."
                : parseError
                  ? "Fix parse errors in the output to preview."
                  : "Generate a wireframe to see the preview."}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
