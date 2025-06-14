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
    const logger = new ConsoleLogger("Chime", LogLevel.WARN);
    const deviceController = new DefaultDeviceController(logger);
    const meetingSession = new DefaultMeetingSession(
      new MeetingSessionConfiguration(
        { Meeting: { MeetingId: meetingId } } as any,
        { Attendee: { AttendeeId: attendeeId, JoinToken: token } } as any
      ),
      logger,
      deviceController
    );

    meetingSession.audioVideo.addObserver({
      videoTileDidUpdate: (tile) => {
        if (!tile.boundAttendeeId) return;
        const el = tile.localTile ? localVideoRef.current : remoteVideoRef.current;
        if (el) meetingSession.audioVideo.bindVideoElement(tile.tileId, el);
      },
    });

    async function start() {
      const devices = await meetingSession.audioVideo.listVideoInputDevices();
      if (devices[0]) await meetingSession.audioVideo.chooseVideoInputDevice(devices[0].deviceId);
      const audio = await meetingSession.audioVideo.listAudioInputDevices();
      if (audio[0]) await meetingSession.audioVideo.chooseAudioInputDevice(audio[0].deviceId);
      meetingSession.audioVideo.start();
      meetingSession.audioVideo.startLocalVideoTile();
    }
    start();
    return () => {
      meetingSession.audioVideo.stop();
    };
  }, [meetingId, attendeeId, token]);

  if (!meetingId || !attendeeId || !token) return <p className="p-4">Missing parameters</p>;

  return (
    <main className="container mx-auto p-4 space-y-4">
      <div className="flex gap-4 w-full h-[80vh]">
        <video ref={localVideoRef} className="flex-1 bg-black" autoPlay />
        <video ref={remoteVideoRef} className="flex-1 bg-black" autoPlay />
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
