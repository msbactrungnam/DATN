import Peer from "peerjs";
import React, {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { ws } from "../ws";
import { PeersReducer, PeerState } from "../Reducers/PeersReducer";
import {
  addPeerAction,
  removePeerAction,
  addAllPeersAction,
} from "../Reducers/PeerActions";
import { v4 as uuidv4 } from "uuid";
import { IPeer } from "../Types/types";

interface RoomValue {
  stream?: MediaStream;
  screenStream?: MediaStream;
  peers: PeerState;
  me?: Peer;
}

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomContext = createContext<RoomValue>({
  peers: {},
});

const initialize = (id: string) => {
  try {
    const peer = new Peer(id);
    peer.on("error", (error) => {
      console.error("PeerJS error:", error);
    });
    return peer;
  } catch (error) {
    console.error("Failed to initialize peer:", error);
    return undefined;
  }
};

export const RoomProvider: React.FunctionComponent<RoomProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [me, setMe] = useState<Peer>();
  const [stream, setStream] = useState<MediaStream>();
  const [peers, dispatch] = useReducer(PeersReducer, {});

  const endRoom = (peerId: string) => {
    window.confirm("The call has ended!");
    dispatch(removePeerAction(peerId));
    navigate("/");
  };

  const roomFull = (peerId: string) => {
    window.confirm("Room is fulled!");
    dispatch(removePeerAction(peerId));
    navigate("/");
  };

  const getUsers = ({
    participants,
  }: {
    participants: Record<string, IPeer>;
  }) => {
    dispatch(addAllPeersAction(participants));
    console.log("participants", participants);
  };

  const removePeer = (peerId: string) => {
    dispatch(removePeerAction(peerId));
  };

  useEffect(() => {
    const newId = uuidv4();
    const peer = initialize(newId);
    setMe(peer);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
      })
      .catch((error) => {
        console.error("Failed to get user media:", error);
      });

    ws.on("get-users", getUsers);
    ws.on("user-disconnected", removePeer);
    ws.on("room-ended", endRoom);
    ws.on("room-full", roomFull);

    return () => {
      if (peer) {
        peer.destroy();
      }
      ws.off("get-users", getUsers);
      ws.off("user-disconnected", removePeer);
      ws.off("room-ended", endRoom);
      ws.off("room-full", roomFull);
      ws.off("user-joined");
    };
  }, []);

  useEffect(() => {
    if (!me || !stream) {
      return;
    }
    ws.on("user-joined", ({ peerId }) => {
      const call = me.call(peerId, stream);
      if (call) {
        call.on("stream", (peerStream) => {
          dispatch(addPeerAction(peerId, peerStream));
        });
        call.on("close", () => {
          dispatch(removePeerAction(peerId));
        });
      } else {
        console.log("Failed to create call with peerId:", peerId);
      }
    });

    me.on("call", (call) => {
      if (stream) {
        call.answer(stream);
        call.on("stream", (peerStream) => {
          dispatch(addPeerAction(call.peer, peerStream));
        });
      }
    });

    return () => {
      ws.off("user-joined");
    };
  }, [me, stream]);

  return (
    <RoomContext.Provider
      value={{
        stream,
        peers,
        me,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
