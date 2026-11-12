import {
  ChannelRecord,
  MessageRecord,
  ThreadReplyRecord,
  WorkspaceFile,
  SharedNoteRecord,
  HuddleSessionRecord,
} from '@/types';
import {
  SEED_CHANNELS,
  SEED_MESSAGES,
  SEED_THREAD_REPLIES,
  SEED_WORKSPACE_FILES,
  SEED_SHARED_NOTES,
  SEED_HUDDLE_SESSION,
} from '@/data/collaborationSeed';

const STORAGE_KEY = 'innowit_collaboration_v2';

export interface CollaborationState {
  channels: ChannelRecord[];
  messages: MessageRecord[];
  threadReplies: Record<string, ThreadReplyRecord[]>;
  files: WorkspaceFile[];
  notes: SharedNoteRecord[];
  huddle: HuddleSessionRecord;
}

export function loadCollaborationState(): CollaborationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.channels && parsed.messages) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load collaboration state from localStorage:', err);
  }

  return {
    channels: SEED_CHANNELS,
    messages: SEED_MESSAGES,
    threadReplies: SEED_THREAD_REPLIES,
    files: SEED_WORKSPACE_FILES,
    notes: SEED_SHARED_NOTES,
    huddle: SEED_HUDDLE_SESSION,
  };
}

export function saveCollaborationState(state: CollaborationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save collaboration state to localStorage:', err);
  }
}
