"use client";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
} from "amazon-chime-sdk-js";

function RoomContent() {
  const params = useSearchParams();
  const meetingId = params.get("meetingId");
  const attendeeId = params.get("attendeeId");
  const token = params.get("token");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <main className="container mx-auto p-4 space-y-4">
      <div className="relative w-full h-[80vh]">
        <video ref={remoteVideoRef} className="w-full h-full bg-black" autoPlay />
        <video
          ref={localVideoRef}
          className="absolute bottom-4 right-4 w-40 h-32 bg-black"
          autoPlay
        />
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
