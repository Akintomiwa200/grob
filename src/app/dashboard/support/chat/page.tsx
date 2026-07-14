"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

const QUICK_REPLIES = [
  "How do I deploy my project?",
  "My build is failing",
  "How do I add a custom domain?",
  "I need help with environment variables",
];

const BOT_RESPONSES: Record<string, string> = {
  deploy: "To deploy your project, push code to your connected Git repository. Grob will automatically build and deploy it. You can also trigger manual deploys from the dashboard.",
  build: "Common build failures include:\n\n1. Missing dependencies – make sure your package.json is correct\n2. Wrong build command – check Settings → General\n3. Missing output directory – verify your build output path\n4. TypeScript errors – check your build logs for details\n\nWould you like me to walk you through debugging a specific error?",
  domain: "To add a custom domain:\n\n1. Go to your project → Settings → Domains\n2. Enter your domain name\n3. Follow the DNS configuration instructions\n4. Wait for SSL certificate provisioning\n\nDNS propagation can take up to 48 hours, but usually completes within minutes.",
  env: "Environment variables are set in:\n\nProject → Settings → Environment Variables\n\nClick 'Add Variable', enter the key and value, and choose whether it's available at build time or runtime only.",
};

export default function LiveChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      content:
        "Hi! I'm Grob's support assistant. How can I help you today? You can type a question or click one of the quick replies below.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getResponse(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes("deploy")) return BOT_RESPONSES.deploy;
    if (lower.includes("build") || lower.includes("fail") || lower.includes("error"))
      return BOT_RESPONSES.build;
    if (lower.includes("domain") || lower.includes("dns"))
      return BOT_RESPONSES.domain;
    if (lower.includes("env") || lower.includes("variable"))
      return BOT_RESPONSES.env;
    return "Thanks for your message! For more complex issues, I'd recommend opening a support ticket so our team can look into it in detail. You can do that from the Support dashboard.";
  }

  function sendMessage(content: string) {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const agentMsg: Message = {
        id: `a-${Date.now()}`,
        role: "agent",
        content: getResponse(content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      <div className="sidebar-scroll flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "agent" ? "bg-accent/10" : "bg-muted/10"
              }`}
            >
              {msg.role === "agent" ? (
                <Bot className="w-4 h-4 text-accent" />
              ) : (
                <User className="w-4 h-4 text-muted" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-text"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="bg-surface border border-border rounded-xl px-4 py-3 text-sm text-muted">
              <span className="animate-pulse">Typing...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_REPLIES.map((qr) => (
            <button
              key={qr}
              onClick={() => sendMessage(qr)}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-muted hover:text-accent hover:border-accent/50 transition-colors"
            >
              {qr}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-bg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="p-3 rounded-xl bg-accent text-white hover:opacity-90 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-muted mt-2 text-center">
          Live chat is available 9am–6pm EST. For urgent issues outside business hours, please{" "}
          <Link href="/dashboard/support/tickets/new" className="text-accent hover:underline">
            open a ticket
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
