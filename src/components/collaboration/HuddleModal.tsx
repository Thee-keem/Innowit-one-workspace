import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Users,
  Radio,
  FileText,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HuddleSessionRecord, HuddleParticipant } from '@/types';

interface HuddleModalProps {
  isOpen: boolean;
  onClose: () => void;
  huddle: HuddleSessionRecord;
  onUpdateNotes: (notes: string) => void;
  currentUserId: string;
}

export function HuddleModal({
  isOpen,
  onClose,
  huddle,
  onUpdateNotes,
  currentUserId,
}: HuddleModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState(huddle.meetingNotes);

  if (!isOpen) return null;

  const handleNotesChange = (val: string) => {
    setMeetingNotes(val);
    onUpdateNotes(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl rounded-2xl border border-[#2D3A52] bg-[#141B29] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header in 30% Slate Blue */}
        <div className="flex items-center justify-between border-b border-[#243048] px-6 py-3.5 bg-[#1B2436]">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full bg-[#E03616] animate-pulse" />
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Huddle in #{huddle.channelName}</span>
            </h3>
            <Badge variant="bloodOrange" className="text-[10px] font-bold font-mono">
              LIVE SIGNAL
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#D8E2EC] bg-[#141B29] px-2.5 py-1 rounded border border-[#2D3A52] flex items-center gap-1.5">
              <Users size={12} className="text-[#E03616]" /> {huddle.participants.length} Active
            </span>
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-[#243048] cursor-pointer"
            >
              Minimize
            </button>
          </div>
        </div>

        {/* Demo Mode Notice Banner */}
        <div className="bg-[#1B2436] px-6 py-2 border-b border-[#243048] flex items-center justify-between text-[11px] text-slate-300 font-mono">
          <span className="flex items-center gap-2">
            <Radio size={13} className="text-[#E03616]" />
            [HUDDLE DEMONSTRATION MODE - WebRTC Signaling Abstraction]
          </span>
          <span className="text-slate-400">Audio/Video presence verified</span>
        </div>

        {/* Center Grid: Video Tiles & Participants */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0F172A]">
          {/* Simulated Screen Share Frame if Active */}
          {isSharingScreen && (
            <div className="mb-4 rounded-xl border border-[#E03616]/40 bg-[#161E2E] p-4 text-center space-y-2">
              <div className="text-xs font-bold text-[#E03616] flex items-center justify-center gap-1.5">
                <Monitor size={14} /> Screen Share: Safari — Innowit General Ledger Dashboard
              </div>
              <div className="h-44 bg-[#0F172A] rounded-lg border border-[#243048] flex items-center justify-center text-xs text-slate-400 font-mono">
                [Simulated 1080p Screen Stream active · 60 FPS · Hardware H.264]
              </div>
            </div>
          )}

          {/* Participant Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {huddle.participants.map((p) => {
              const isCurrentUser = p.userId === currentUserId;
              const muted = isCurrentUser ? isMuted : p.isMuted;
              const videoOn = isCurrentUser ? isVideoOn : p.isVideoOn;

              return (
                <div
                  key={p.userId}
                  className={`relative rounded-xl border p-4 flex flex-col items-center justify-between min-h-[160px] transition-all ${
                    p.isSpeaking && !muted
                      ? 'border-[#E03616] bg-[#1E2638] ring-2 ring-[#E03616]/30 shadow-md'
                      : 'border-[#243048] bg-[#161D2C]'
                  }`}
                >
                  {/* Speaking indicator wave */}
                  {p.isSpeaking && !muted && (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[10px] font-mono text-[#E03616] font-bold">
                      <Volume2 size={12} className="animate-pulse" /> Speaking
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5">
                    {muted ? (
                      <span className="p-1 rounded bg-red-500/20 text-red-400 inline-block">
                        <MicOff size={11} />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 inline-block">
                        <Mic size={11} />
                      </span>
                    )}
                  </div>

                  {/* Avatar / Camera frame */}
                  <div className="my-auto text-center">
                    {videoOn ? (
                      <div className="h-16 w-16 rounded-full bg-[#27334D] border-2 border-[#E03616]/50 flex items-center justify-center text-lg font-bold text-white shadow-sm mx-auto">
                        {p.avatar}
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-[#1B2436] border border-[#2D3A52] flex items-center justify-center text-xs text-slate-400 mx-auto">
                        <VideoOff size={18} />
                      </div>
                    )}
                  </div>

                  <div className="w-full text-center mt-2">
                    <div className="text-xs font-bold text-white truncate">{p.fullName}</div>
                    <div className="text-[10px] text-[#D8E2EC] font-mono uppercase">{p.role}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meeting Notes / Scratchpad */}
          <div className="mt-6 rounded-xl border border-[#243048] bg-[#161D2C] p-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-white">
              <FileText size={14} className="text-[#E03616]" />
              <span>Live Huddle Meeting Notes</span>
            </div>
            <textarea
              rows={3}
              placeholder="Record decisions, task assignments, or follow-up items..."
              value={meetingNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="w-full rounded-lg border border-[#243048] bg-[#0F172A] p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-[#E03616] focus:outline-none"
            />
          </div>
        </div>

        {/* Bottom Control Bar in Slate Blue */}
        <div className="flex items-center justify-between border-t border-[#243048] px-6 py-3.5 bg-[#1B2436]">
          <div className="text-xs text-slate-400 font-mono">
            Started: {huddle.startedAt}
          </div>

          {/* Central Controls */}
          <div className="flex items-center gap-2.5">
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-red-500 text-white'
                  : 'bg-[#27334D] text-white hover:bg-[#334261]'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Video Camera Toggle */}
            <button
              type="button"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                !isVideoOn
                  ? 'bg-red-500 text-white'
                  : 'bg-[#27334D] text-white hover:bg-[#334261]'
              }`}
              title={isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
            >
              {!isVideoOn ? <VideoOff size={16} /> : <Video size={16} />}
            </button>

            {/* Screen Share Toggle */}
            <button
              type="button"
              onClick={() => setIsSharingScreen(!isSharingScreen)}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isSharingScreen
                  ? 'bg-[#E03616] text-white'
                  : 'bg-[#27334D] text-white hover:bg-[#334261]'
              }`}
              title="Toggle Screen Sharing"
            >
              <Monitor size={16} />
            </button>

            {/* End / Leave Huddle Button */}
            <button
              type="button"
              onClick={onClose}
              className="ml-3 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Leave Huddle"
            >
              <PhoneOff size={14} /> Leave Huddle
            </button>
          </div>

          <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> 24ms PTT
          </div>
        </div>
      </div>
    </div>
  );
}
