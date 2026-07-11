import { useState } from "react";
import { SendHorizonal, Lock } from "lucide-react";
import { MatrixClient, MsgType } from "matrix-js-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  client: MatrixClient;
  roomId: string;
  encrypted: boolean;
}

export default function Composer({ client, roomId, encrypted }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    setSending(true);
    try {
      await client.sendMessage(roomId, {
        msgtype: MsgType.Text,
        body,
      });
    } catch (e) {
      console.error("Failed to send message", e);
      setText(body); // restore on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="border-t border-slate-800 p-3 flex items-center gap-2 bg-slate-900/50"
    >
      <div className="flex-1 relative">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            encrypted ? "Send an encrypted message…" : "Send a message…"
          }
          className="bg-slate-950 border-slate-700 text-white pr-9"
          disabled={sending}
        />
        {encrypted && (
          <Lock className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
      </div>
      <Button
        type="submit"
        size="icon"
        disabled={!text.trim() || sending}
        className="bg-emerald-600 hover:bg-emerald-500 shrink-0"
      >
        <SendHorizonal className="w-4 h-4" />
      </Button>
    </form>
  );
}
