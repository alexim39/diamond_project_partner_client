import { ApiEnvelope } from '../../core/auth/auth.models';

export type PostKind = 'standard' | 'announcement' | 'recognition' | 'training' | 'event';
export type AudienceScope = 'global' | 'team' | 'leadership';

export const POST_KIND_LABELS: Record<PostKind, string> = {
  standard: 'Post',
  announcement: 'Announcement',
  recognition: 'Recognition',
  training: 'Training',
  event: 'Event',
};

export interface DirectoryLabel {
  username: string;
  name: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  kind: PostKind;
  title: string;
  body: string;
  link: string;
  scope: AudienceScope;
  pinned: boolean;
  auto: boolean;
  createdAt: string;
  author: DirectoryLabel | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
}

export interface FeedComment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  author: DirectoryLabel | null;
  likeCount: number;
  likedByMe: boolean;
}

export interface FeedEnvelope extends ApiEnvelope<{ items: FeedPost[]; nextCursor: string | null; viewerLevel: string | null }> {
  data: { items: FeedPost[]; nextCursor: string | null; viewerLevel: string | null };
}

export interface PostEnvelope extends ApiEnvelope<FeedPost> {
  data: FeedPost;
}

export interface CommentsEnvelope extends ApiEnvelope<FeedComment[]> {
  data: FeedComment[];
}

export interface CommentEnvelope extends ApiEnvelope<FeedComment> {
  data: FeedComment;
}

export interface CreatePostPayload {
  kind: PostKind;
  title?: string;
  body: string;
  link?: string;
  scope: AudienceScope;
}
