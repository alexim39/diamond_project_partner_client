import { ApiEnvelope } from '../../../core/auth/auth.models';

/** Directory-safe node — mirrors backend `toNetworkNode` (+ tree fields). */
export interface NetworkNode {
  id: string;
  username: string;
  name: string;
  surname: string;
  role: string;
  plan: string;
  profileImage?: string | null;
  joinedAt?: string;
  children: NetworkNode[];
  childCount: number;
  truncated: boolean;
}

export interface NetworkTreeMeta {
  depth: number;
  total: number;
  perLevel: number[];
  truncated: boolean;
}

export interface NetworkTreeEnvelope extends ApiEnvelope<{ tree: NetworkNode; meta: NetworkTreeMeta }> {
  data: { tree: NetworkNode; meta: NetworkTreeMeta };
}

export interface UplineEnvelope extends ApiEnvelope<{ chain: NetworkNode[]; depth: number }> {
  data: { chain: NetworkNode[]; depth: number };
}

/** Positioned node for the SVG tidy-tree layout. */
export interface PositionedNode extends NetworkNode {
  x: number;
  y: number;
  depth: number;
}

export interface TreeEdge {
  d: string;
}
