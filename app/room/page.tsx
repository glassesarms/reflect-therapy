"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
  AudioVideoObserver,
} from "amazon-chime-sdk-js";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function RoomContent() {
  const params = useSearchParams();
  const router = useRouter();
  const meetingId = params.get("meetingId");
  const attendeeId = params.get("attendeeId");
  const token = params.get("token");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const meetingSessionRef = useRef<DefaultMeetingSession>();

  const [audioMuted, setAudioMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meetingId || !attendeeId || !token) return;

    let meetingSession: DefaultMeetingSession | undefined;

    async function startMeeting() {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`);
        const data = await res.json();
        if (!res.ok || !data.meeting) {
          console.error(data.error || "Failed to fetch meeting");
          return;
        }

        const logger = new ConsoleLogger("Chime", LogLevel.WARN);
        const deviceController = new DefaultDeviceController(logger);
        meetingSession = new DefaultMeetingSession(
          new MeetingSessionConfiguration(
            { Meeting: data.meeting } as any,
            { Attendee: { AttendeeId: attendeeId, JoinToken: token } } as any
          ),
          logger,
          deviceController
        );
        meetingSessionRef.current = meetingSession;

        // AUDIO IN
        const audioInputs = await meetingSession.audioVideo.listAudioInputDevices();
        if (audioInputs[0]) {
          await meetingSession.audioVideo.startAudioInput(audioInputs[0].deviceId);
        }

        // VIDEO IN
        const videoInputs = await meetingSession.audioVideo.listVideoInputDevices();
        if (videoInputs[0]) {
          await meetingSession.audioVideo.startVideoInput(videoInputs[0].deviceId);
        }

        // AUDIO OUT
        if (audioElementRef.current) {
          meetingSession.audioVideo.bindAudioElement(audioElementRef.current);
        }

        // Bind video tiles
        meetingSession.audioVideo.addObserver({
          videoTileDidUpdate: (tile) => {
            const el = tile.localTile ? localVideoRef.current : remoteVideoRef.current;
            if (el && tile.tileId != null) {
              meetingSession?.audioVideo.bindVideoElement(tile.tileId, el);
            }
          },
        } as AudioVideoObserver);

        meetingSession.audioVideo.start();
        meetingSession.audioVideo.startLocalVideoTile();
        setLoading(false);
      } catch (err) {
        console.error("Meeting setup error:", err);
      }
    }

    startMeeting();
    return () => {
      meetingSession?.audioVideo.stop();
    };
  }, [meetingId, attendeeId, token]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m") toggleAudio();
      if (e.key.toLowerCase() === "v") toggleVideo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [audioMuted, videoOff]);

  const toggleAudio = () => {
    const session = meetingSessionRef.current;
    if (!session) return;
    if (audioMuted) {
      session.audioVideo.realtimeUnmuteLocalAudio();
    } else {
      session.audioVideo.realtimeMuteLocalAudio();
    }
    setAudioMuted(!audioMuted);
  };

  const toggleVideo = () => {
    const session = meetingSessionRef.current;
    if (!session) return;
    if (videoOff) {
      session.audioVideo.startLocalVideoTile();
    } else {
      session.audioVideo.stopLocalVideoTile();
    }
    setVideoOff(!videoOff);
  };

  const hangUp = () => {
    meetingSessionRef.current?.audioVideo.stop();
    router.push("/");
  };

  if (!meetingId || !attendeeId || !token)
    return <p className="p-4 text-red-500">Missing meeting parameters.</p>;

  return (
    <TooltipProvider>
      <main className="container mx-auto p-4 space-y-6">
        {loading && <p className="text-center text-gray-600">Connecting to meeting...</p>}
        <audio ref={audioElementRef} hidden />

        <div className="flex flex-col sm:flex-row gap-4 h-[75vh]">
          <div className="flex-1 rounded-2xl overflow-hidden bg-neutral-900 shadow-lg">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover bg-neutral-900"
              autoPlay
              playsInline
            />
          </div>
          <div className="w-full sm:w-1/3 max-h-64 sm:max-h-full rounded-2xl overflow-hidden bg-neutral-800 shadow-lg border border-gray-700">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover bg-neutral-800 opacity-90"
              autoPlay
              muted
              playsInline
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="px-6 py-3 rounded-xl flex items-center gap-2" variant="secondary" onClick={toggleAudio}>
                {audioMuted ? <MicOff className="w-5 h-5 text-red-500" /> : <Mic className="w-5 h-5 text-green-500" />}
                {audioMuted ? "Unmute" : "Mute"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Shortcut: M</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="px-6 py-3 rounded-xl flex items-center gap-2" variant="secondary" onClick={toggleVideo}>
                {videoOff ? <VideoOff className="w-5 h-5 text-red-500" /> : <Video className="w-5 h-5 text-green-500" />}
                {videoOff ? "Start Video" : "Stop Video"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Shortcut: V</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="px-6 py-3 rounded-xl flex items-center gap-2" variant="destructive" onClick={hangUp}>
                <PhoneOff className="w-5 h-5" />
                Hang Up
              </Button>
            </TooltipTrigger>
            <TooltipContent>Leave Meeting</TooltipContent>
          </Tooltip>
        </div>
      </main>
    </TooltipProvider>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<p className="p-4 text-gray-500">Loading room...</p>}>
      <RoomContent />
    </Suspense>
  );
}
