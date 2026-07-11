import { useCallback, useEffect, useState } from "react";
import {
  MatrixClient,
  MatrixEvent,
  MatrixEventEvent,
  RoomEvent,
} from "matrix-js-sdk";

export function useTimeline(client: MatrixClient | null, roomId: string | null) {
  const [events, setEvents] = useState<MatrixEvent[]>([]);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!client || !roomId) {
      setEvents([]);
      return;
    }
    const room = client.getRoom(roomId);
    if (!room) {
      setEvents([]);
      return;
    }

    const timeline = room.getLiveTimeline();

    const update = () => {
      setEvents([...timeline.getEvents()]);
      setCanLoadMore(
        timeline.getPaginationToken("b" as never) !== null ||
          timeline.getEvents().length === 0,
      );
    };

    const onTimeline = (
      _event: MatrixEvent,
      roomArg: typeof room | undefined,
      toStartOfTimeline: boolean | undefined,
    ) => {
      if (roomArg?.roomId !== roomId || toStartOfTimeline) return;
      update();
    };

    const onDecrypted = (event: MatrixEvent) => {
      if (event.getRoomId() === roomId) update();
    };

    update();
    client.on(RoomEvent.Timeline, onTimeline);
    client.on(MatrixEventEvent.Decrypted, onDecrypted);
    return () => {
      client.off(RoomEvent.Timeline, onTimeline);
      client.off(MatrixEventEvent.Decrypted, onDecrypted);
    };
  }, [client, roomId]);

  const loadMore = useCallback(async () => {
    if (!client || !roomId || loadingMore) return;
    const room = client.getRoom(roomId);
    if (!room) return;
    const timeline = room.getLiveTimeline();
    setLoadingMore(true);
    try {
      const more = await client.paginateEventTimeline(timeline, {
        backwards: true,
        limit: 30,
      });
      setCanLoadMore(more);
      setEvents([...timeline.getEvents()]);
    } finally {
      setLoadingMore(false);
    }
  }, [client, roomId, loadingMore]);

  return { events, canLoadMore, loadingMore, loadMore };
}
