import { useEffect, useRef } from "react";
import { ShieldAlert, ShieldCheck, ImageIcon, Loader2 } from "lucide-react";
import { EventType, MatrixClient, MatrixEvent, MsgType, type Room } from "matrix-js-sdk";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  client: MatrixClient;
  room: Room;
  events: MatrixEvent[];
  canLoadMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function senderName(room: Room, sender: string) {
  return room.getMember(sender)?.name ?? sender;
}

function MessageBubble({
  client,
  room,
  event,
  mine,
}: {
  client: MatrixClient;
  room: Room;
  event: MatrixEvent;
  mine: boolean;
}) {
  const content = event.getContent();
  const sender = event.getSender() ?? "";
  const encrypted = event.isEncrypted();
  const decryptionFailure = event.isDecryptionFailure();
  const msgtype = content.msgtype as string;

  let body: React.ReactNode;
  if (decryptionFailure) {
    body = (
      <span className="flex items-center gap-1.5 text-amber-300 italic">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        Unable to decrypt this message (missing keys from before you joined)
      </span>
    );
  } else if (msgtype === MsgType.Image && content.url) {
    const url = client.mxcUrlToHttp(content.url, 600, 600, "scale");
    body = (
      <span className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="underline">
            {content.body || "Image"}
          </a>
        ) : (
          content.body || "Image"
        )}
      </span>
    );
  } else if (msgtype === MsgType.Emote) {
    body = (
      <span className="italic">
        {senderName(room, sender)} {content.body}
      </span>
    );
  } else {
    body = <span className="whitespace-pre-wrap break-words">{content.body}</span>;
  }

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
          mine
            ? "bg-emerald-600 text-white rounded-br-md"
            : "bg-slate-800 text-slate-100 rounded-bl-md",
        )}
      >
        {!mine && (
          <p className="text-xs font-semibold text-emerald-300 mb-0.5">
            {senderName(room, sender)}
          </p>
        )}
        <div>{body}</div>
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-[10px]",
            mine ? "text-emerald-100/70 justify-end" : "text-slate-400",
          )}
        >
          <span>{formatTime(event.getTs())}</span>
          {encrypted && <ShieldCheck className="w-3 h-3" />}
        </div>
      </div>
    </div>
  );
}

export default function MessageList({
  client,
  room,
  events,
  canLoadMore,
  loadingMore,
  onLoadMore,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const myUserId = client.getUserId();

  const messages = events.filter(
    (e) =>
      e.getType() === EventType.RoomMessage ||
      e.getType() === EventType.RoomMessageEncrypted,
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, room.roomId]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
      <div className="flex justify-center pb-2">
        {canLoadMore ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-slate-400 hover:text-white text-xs"
          >
            {loadingMore && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            Load earlier messages
          </Button>
        ) : (
          <p className="text-xs text-slate-600">Beginning of conversation</p>
        )}
      </div>

      {room.hasEncryptionStateEvent() && (
        <div className="flex justify-center">
          <p className="text-[11px] text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />
            Messages in this room are end-to-end encrypted. Only participants
            can read them.
          </p>
        </div>
      )}

      {messages.map((event) => (
        <MessageBubble
          key={event.getId() ?? event.getTxnId()}
          client={client}
          room={room}
          event={event}
          mine={event.getSender() === myUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
