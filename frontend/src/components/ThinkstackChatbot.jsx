import { useMemo, useState } from "react";
import { MessageCircle, RotateCcw, X } from "lucide-react";

const THINKSTACK_CHATBOT_ID = "69b04a3ff38a1be9423af046";

function encodeBase64(value) {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(value);
  }
  return value;
}

function buildThinkstackIframeUrl(seed) {
  const innerUrl = new URL("https://app.thinkstack.ai/bot/index.html");
  innerUrl.searchParams.set("chatbot_id", THINKSTACK_CHATBOT_ID);
  innerUrl.searchParams.set("type", "inline");
  innerUrl.searchParams.set("conversation_id", String(seed));
  innerUrl.searchParams.set("session_seed", String(seed));
  innerUrl.searchParams.set("ts", String(seed));

  const previewUrl = new URL("https://app.thinkstack.ai/bot/previews/iframeview.html");
  previewUrl.searchParams.set("bot", encodeBase64(innerUrl.toString()));
  previewUrl.searchParams.set("session_seed", String(seed));
  return previewUrl.toString();
}

export function ThinkstackChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionSeed, setSessionSeed] = useState(() => Date.now() + Math.floor(Math.random() * 1000));

  const iframeSrc = useMemo(() => buildThinkstackIframeUrl(sessionSeed), [sessionSeed]);

  function openFreshChat() {
    setSessionSeed(Date.now() + Math.floor(Math.random() * 1000));
    setIsOpen(true);
  }

  function closeChat() {
    setIsOpen(false);
    setSessionSeed(Date.now() + Math.floor(Math.random() * 1000));
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {isOpen ? (
        <button
          type="button"
          onClick={closeChat}
          className="pointer-events-auto absolute inset-0 bg-slate-900/25 backdrop-blur-[1px] sm:hidden"
          aria-label="Close chatbot backdrop"
        />
      ) : null}

      <div className="pointer-events-none absolute bottom-3 left-1 right-1 sm:bottom-5 sm:left-auto sm:right-5">
        {isOpen ? (
          <section className="pointer-events-auto mb-3 flex h-[min(88vh,760px)] w-full max-w-[560px] animate-reveal-soft flex-col overflow-hidden rounded-[1.6rem] border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f5faff_100%)] shadow-[0_30px_65px_-34px_rgba(30,136,229,0.62)] sm:w-[560px]">
            <header className="flex items-center justify-between border-b border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#e8f5ff_100%)] px-4 py-3.5">
              <div>
                <p className="text-sm font-semibold text-slate-800">MedInsight AI Assistant</p>
                <p className="text-xs font-medium text-slate-500">Clinical Support Agent</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700 sm:inline-flex">
                  Online
                </span>
                <button
                  type="button"
                  onClick={openFreshChat}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-medical-primary hover:text-medical-primary"
                  aria-label="Start a new chatbot session"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New
                </button>
                <button
                  type="button"
                  onClick={closeChat}
                  className="rounded-lg border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-1.5 text-slate-500 transition hover:border-medical-primary hover:text-medical-primary"
                  aria-label="Close chatbot"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 bg-white">
              <iframe
                key={sessionSeed}
                title="Thinkstack Clinical Assistant"
                src={iframeSrc}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        ) : null}

        <div className="pointer-events-auto flex justify-end">
          <button
            type="button"
            onClick={() => (isOpen ? closeChat() : openFreshChat())}
            className="interactive-lift inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2f80ed_0%,#1e67c5_100%)] px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:brightness-[1.04]"
          >
            <MessageCircle className="h-5 w-5" />
            {isOpen ? "Close Assistant" : "AI Assistant"}
          </button>
        </div>
      </div>
    </div>
  );
}
