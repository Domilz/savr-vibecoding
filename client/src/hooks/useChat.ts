import { useState, useCallback } from "react";
import { api } from "../api/client";
import type { ChatMessage, ChatAction } from "../types";

export function useChat(onAction?: (action: ChatAction) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = { role: "user", content };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await api.post<{ reply: string; action?: ChatAction }>("/chat", { messages: updated });
      setMessages([...updated, { role: "assistant", content: res.reply }]);
      if (res.action && onAction) {
        onAction(res.action);
      }
    } catch (err: any) {
      setMessages([
        ...updated,
        { role: "assistant", content: `Fel: ${err.message || "Kunde inte ansluta till AI"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, onAction]);

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, loading, sendMessage, clearChat };
}
