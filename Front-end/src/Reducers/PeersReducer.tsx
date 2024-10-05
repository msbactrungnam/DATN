import { IPeer } from "../Types/types";
import { ADD_PEER, REMOVE_PEER, ADD_ALL_PEERS } from "./PeerActions";

export type PeerState = Record<
  string,
  { stream?: MediaStream; peerId: string }
>;

type PeerAction =
  | { type: typeof ADD_PEER; payload: { peerId: string; stream: MediaStream } }
  | { type: typeof REMOVE_PEER; payload: { peerId: string } }
  | {
      type: typeof ADD_ALL_PEERS;
      payload: {
        peers: Record<string, IPeer>;
      };
    };
export const PeersReducer = (state: PeerState, action: PeerAction) => {
  switch (action.type) {
    case ADD_PEER:
      return {
        ...state,
        [action.payload.peerId]: {
          ...state[action.payload.peerId],
          stream: action.payload.stream,
        },
      };
    case REMOVE_PEER: {
      return {
        ...state,
        [action.payload.peerId]: {
          ...state[action.payload.peerId],
          stream: undefined,
        },
      };
    }
    case ADD_ALL_PEERS:
      return { ...state, ...action.payload.peers };
    default:
      return { ...state };
  }
};
