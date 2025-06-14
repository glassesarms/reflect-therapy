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
  LogIn,
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
  const bookingId = params.get("bookingId");
  const role = params.get("role");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const meetingSessionRef = useRef<DefaultMeetingSession>();
  const previewDeviceController = useRef<DefaultDeviceController>();

  const [hasJoined, setHasJoined] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transcriptionStarted, setTranscriptionStarted] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Setup video preview before joining
  useEffect(() => {
    async function setupPreview() {
      const deviceController = new DefaultDeviceController(new ConsoleLogger("Preview", LogLevel.ERROR));
      previewDeviceController.current = deviceController;

      const videoDevices = await deviceController.listVideoInputDevices();
      if (videoDevices[0]) {
        await deviceController.startVideoInput(videoDevices[0].deviceId);
        await deviceController.startVideoPreviewForVideoInput(localVideoRef.current!);
      }
    }

    setupPreview();
    return () => {
      const controller = previewDeviceController.current;
      if (controller && localVideoRef.current) {
        controller.stopVideoPreviewForVideoInput(localVideoRef.current);
        controller.stopVideoInput();
      }
    };
  }, []);

  // Full meeting setup after clicking "Join"
  const joinMeeting = async () => {
    if (!meetingId || !attendeeId || !token) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/meetings/${meetingId}`);
      const data = await res.json();
      if (!res.ok || !data.meeting) {
        console.error(data.error || "Failed to fetch meeting");
        return;
      }

      const logger = new ConsoleLogger("Chime", LogLevel.WARN);
      const deviceController = new DefaultDeviceController(logger);
      const meetingSession = new DefaultMeetingSession(
        new MeetingSessionConfiguration(
          { Meeting: data.meeting } as any,
          { Attendee: { AttendeeId: attendeeId, JoinToken: token } } as any
        ),
        logger,
        deviceController
      );
      meetingSessionRef.current = meetingSession;

      const audioInputs = await meetingSession.audioVideo.listAudioInputDevices();
      if (audioInputs[0]) {
        await meetingSession.audioVideo.startAudioInput(audioInputs[0].deviceId);
      }

      const videoInputs = await meetingSession.audioVideo.listVideoInputDevices();
      if (videoInputs[0]) {
        await meetingSession.audioVideo.startVideoInput(videoInputs[0].deviceId);
      }

      if (audioElementRef.current) {
        meetingSession.audioVideo.bindAudioElement(audioElementRef.current);
      }

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
      if (bookingId && role === 'admin') {
        await startTranscription();
      }
      setHasJoined(true);
      setLoading(false);
    } catch (err) {
      console.error("Join error:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasJoined) return;
      if (e.key.toLowerCase() === "m") toggleAudio();
      if (e.key.toLowerCase() === "v") toggleVideo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasJoined, audioMuted, videoOff]);

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

  useEffect(() => {
    if (!transcriptionStarted || !bookingId) return;
    let timer: NodeJS.Timeout;
    const fetchTranscript = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/transcript`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.transcript) setTranscript(data.transcript);
        }
      } catch {
        // ignore errors
      }
    };
    fetchTranscript();
    timer = setInterval(fetchTranscript, 5000);
    return () => clearInterval(timer);
  }, [transcriptionStarted, bookingId]);

  const startTranscription = async () => {
    if (!bookingId) return;
    const res = await fetch(`/api/bookings/${bookingId}/start-transcription`, {
      method: 'POST',
    });
    if (res.ok) setTranscriptionStarted(true);
  };

  if (!meetingId || !attendeeId || !token)
    return <p className="p-4 text-red-500">Missing meeting parameters.</p>;

  return (
    <TooltipProvider>
      <main className="container mx-auto p-4 space-y-6">
        <audio ref={audioElementRef} hidden />

        {!hasJoined ? (
          <>
            <h1 className="text-center text-xl font-medium text-gray-800 dark:text-gray-200">
              Preview your camera before joining
            </h1>
            <div className="max-w-lg mx-auto rounded-2xl overflow-hidden shadow-lg bg-neutral-900 h-[60vh]">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover opacity-90"
                autoPlay
                muted
                playsInline
              />
            </div>
            <div className="flex justify-center mt-4">
              <Button onClick={joinMeeting} className="flex gap-2 items-center px-6 py-3">
                <LogIn className="w-5 h-5" />
                Join Meeting
              </Button>
            </div>
          </>
        ) : (
          <>
            {loading && <p className="text-center text-gray-600">Connecting to meeting...</p>}
            <div className="flex flex-col sm:flex-row gap-4 h-[75vh]">
              <div className="w-full sm:w-1/3 max-h-64 sm:max-h-full rounded-2xl overflow-y-auto bg-neutral-900 shadow-lg p-2 text-sm whitespace-pre-wrap">
                {transcript
                  ? transcript
                  : transcriptionStarted
                  ? 'Waiting for transcript...'
                  : 'Transcription not started.'}
              </div>
              <div className="w-full sm:w-1/3 rounded-2xl overflow-hidden bg-neutral-900 shadow-lg">
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
              {role === 'admin' && (
                transcriptionStarted ? (
                  !transcript && (
                    <span className="px-3 py-3 text-green-500">Transcribing...</span>
                  )
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button className="px-6 py-3 rounded-xl flex items-center gap-2" variant="secondary" onClick={startTranscription}>
                        Start Transcription
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Begin transcribing</TooltipContent>
                  </Tooltip>
                )
              )}
            </div>
          </>
        )}
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
