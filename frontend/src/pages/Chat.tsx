import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // backend

export default function Chat() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on("message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    socket.emit("message", t);
    setText("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Simple Chat</h2>

      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Write message..."
      />
      <button onClick={send} style={{ marginLeft: 8 }}>
        Send
      </button>
    </div>
  );
}
