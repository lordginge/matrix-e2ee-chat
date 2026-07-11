import { useEffect, useState } from "react";
import {
  ClientEvent,
  MatrixClient,
  Room,
  RoomEvent,
  KnownMembership,
} from "matrix-js-sdk";

export interface RoomInfo {
  roomId: string;
  name: string;
  encrypted: boolean;
  lastActivity: number;
  membership: string;
  isDirect: boolean;
}

function toRoomInfo(client: MatrixClient, room: Room): RoomInfo {
  const lastEvent = room.getLastLiveEvent();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const directData = client.getAccountData("m.direct" as any)?.getContent() as
    | Record<string, string[]>
    | undefined;
  const isDirect = directData
    ? Object.values(directData).some((ids) => ids.includes(room.roomId))
    : false;
  return {
    roomId: room.roomId,
    name: room.name || room.roomId,
    encrypted: room.hasEncryptionStateEvent(),
    lastActivity: lastEvent?.getTs() ?? 0,
    membership: room.getMyMembership(),
    isDirect,
  };
}

export function useRooms(client: MatrixClient | null) {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);

  useEffect(() => {
    if (!client) return;

    const update = () => {
      const list = client
        .getRooms()
        .filter(
          (r) =>
            r.getMyMembership() === KnownMembership.Join ||
            r.getMyMembership() === KnownMembership.Invite,
        )
        .map((r) => toRoomInfo(client, r))
        .sort((a, b) => b.lastActivity - a.lastActivity);
      setRooms(list);
    };

    update();
    client.on(RoomEvent.Timeline, update);
    client.on(RoomEvent.Name, update);
    client.on(RoomEvent.MyMembership, update);
    client.on(ClientEvent.Sync, update);
    client.on(ClientEvent.Room, update);
    return () => {
      client.off(RoomEvent.Timeline, update);
      client.off(RoomEvent.Name, update);
      client.off(RoomEvent.MyMembership, update);
      client.off(ClientEvent.Sync, update);
      client.off(ClientEvent.Room, update);
    };
  }, [client]);

  return rooms;
}
