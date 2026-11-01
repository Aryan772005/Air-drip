"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, Send, Sparkles, X } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Props = { context: { city?: string; lat?: number; lon?: number } };
const chips = ["Ludhiana ka AQI?", "Aaj baarish hogi?", "Diwali night pollution?"];

export default function ChatWidget({ context }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: "Hi! Ask me about weather or air quality. Ludhiana is my default city." }]);
  const [sessionId] = useState(() => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `session-${Date.now()}`);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, busy, open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setMessages((old) => [...old, { role: "user", content: message }]);
    setInput(""); setBusy(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:8001/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, session_id: sessionId, context }),
      });
      if (!response.ok) throw new Error("Chat service unavailable");
      const result = await response.json();
      setMessages((old) => [...old, { role: "assistant", content: result.reply }]);
    } catch {
      setMessages((old) => [...old, { role: "assistant", content: "Chat service unavailable. Please start the chatbot API on port 8001." }]);
    } finally { setBusy(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void send(input); }
  return <>
    {open && <section className="fixed bottom-24 right-4 z-[5000] flex h-[min(610px,calc(100vh-8rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-950/90 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl">
      <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-3">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300"><Bot size={20} /></div><div><div className="flex items-center gap-1.5 text-sm font-bold">DiwaliAir Assistant <Sparkles size={13} className="text-amber-300" /></div><div className="text-[11px] text-slate-400">Weather & air quality · {context.city || "Ludhiana"}</div></div></div>
        <button aria-label="Minimize chat" onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"><ChevronDown size={19} /></button>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((item, index) => <div key={`${index}-${item.role}`} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${item.role === "user" ? "ml-auto rounded-br-md bg-cyan-500/20 text-cyan-50" : "rounded-bl-md border border-white/10 bg-white/[0.07] text-slate-100"}`}>{item.content}</div>)}
        {busy && <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.07] px-4 py-3"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.2s]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.1s]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300"/><span className="ml-1 text-xs text-slate-400">Checking conditions</span></div>}
        <div ref={bottomRef}/>
      </div>
      {messages.length < 3 && <div className="flex gap-2 overflow-x-auto px-4 pb-3">{chips.map((chip) => <button key={chip} onClick={() => void send(chip)} className="shrink-0 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1.5 text-[11px] text-cyan-100 transition hover:bg-cyan-300/20">{chip}</button>)}</div>}
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 p-3"><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about weather or AQI…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"/><button disabled={busy || !input.trim()} aria-label="Send message" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:opacity-40"><Send size={16}/></button></form>
      <p className="px-3 pb-3 text-center text-[10px] text-slate-500">AQI is an approximate modelled estimate, not official CPCB data.</p>
    </section>}
    <button onClick={() => setOpen(!open)} aria-label={open ? "Close chat" : "Open DiwaliAir chat"} className="fixed bottom-5 right-5 z-[5001] flex h-14 items-center gap-2 rounded-full border border-cyan-200/30 bg-slate-950/85 px-4 text-sm font-semibold text-white shadow-xl shadow-cyan-950/30 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-slate-900"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950"><Bot size={18}/></span>{open ? <X size={16}/> : "Ask DiwaliAir"}</button>
  </>;
}
