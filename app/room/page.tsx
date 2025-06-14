"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
} from "amazon-chime-sdk-js";
import { Button } from "@/components/ui/button";

function RoomContent() {
  const params = useSearchParams();
  const router = useRouter();
  const meetingId = params.get("meetingId");
  const attendeeId = params.get("attendeeId");
  const token = params.get("token");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const meetingSessionRef = useRef<DefaultMeetingSession>();
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    if (!meetingId || !attendeeId || !token) return;
    let meetingSession: DefaultMeetingSession | undefined;

    async function start() {
      const res = await fetch(`/api/meetings/${meetingId}`);
      const data = await res.json();
      if (!res.ok || !data.meeting) {
        console.error(data.error || 'Failed to fetch meeting');
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

      meetingSession.audioVideo.addObserver({
        videoTileDidUpdate: (tile) => {
          if (!tile.boundAttendeeId) return;
          const el = tile.localTile ? localVideoRef.current : remoteVideoRef.current;
          if (el && tile.tileId != null)
            meetingSession!.audioVideo.bindVideoElement(tile.tileId, el);
        },
      });

      const devices = await meetingSession.audioVideo.listVideoInputDevices();
      if (devices[0]) await meetingSession.audioVideo.startVideoInput(devices[0].deviceId);
      const audio = await meetingSession.audioVideo.listAudioInputDevices();
      if (audio[0]) await meetingSession.audioVideo.startAudioInput(audio[0].deviceId);
      meetingSession.audioVideo.start();
      meetingSession.audioVideo.startLocalVideoTile();
    }

    start();
    return () => {
      meetingSession?.audioVideo.stop();
    };
  }, [meetingId, attendeeId, token]);

  if (!meetingId || !attendeeId || !token) return <p className="p-4">Missing parameters</p>;

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

  return (
    <main className="container mx-auto p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-[80vh] rounded-lg overflow-hidden bg-black">
        <video ref={remoteVideoRef} className="w-full h-full object-contain bg-black" autoPlay />
        <video ref={localVideoRef} className="w-full h-full object-contain bg-black" autoPlay muted />
      </div>
      <div className="flex justify-center gap-4">
        <Button variant="secondary" onClick={toggleAudio}>
          {audioMuted ? "Unmute" : "Mute"}
        </Button>
        <Button variant="secondary" onClick={toggleVideo}>
          {videoOff ? "Start Video" : "Stop Video"}
        </Button>
        <Button variant="destructive" onClick={hangUp}>
          Hang Up
        </Button>
      </div>
    </main>
  );
}

export default function RoomPage() {
  return (
    <Suspense>
      <RoomContent />
    </Suspense>
  );
}
