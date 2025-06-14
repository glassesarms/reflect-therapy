import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

export interface Booking {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  notes: string;
  roomUrl?: string;
  status?: 'booked' | 'cancelled';
}

export interface Blockout {
  id: string;
  date: string;
  time: string;
  reason?: string;
}

// In-memory store used when running tests or if the table isn't configured
export const bookings: Booking[] = [];
export const blockouts: Blockout[] = [];

const BOOKING_TABLE = process.env.BOOKINGS_TABLE_NAME;
const BLOCKOUT_TABLE = process.env.BLOCKOUTS_TABLE_NAME;
const useBookingMemory = !BOOKING_TABLE || process.env.NODE_ENV === 'test';
const useBlockoutMemory = !BLOCKOUT_TABLE || process.env.NODE_ENV === 'test';

let client: DynamoDBDocumentClient | undefined;
if (!useBookingMemory || !useBlockoutMemory) {
  client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
}

export async function listBookings(): Promise<Booking[]> {
  if (useBookingMemory) return bookings;
  const res = await client!.send(new ScanCommand({ TableName: BOOKING_TABLE }));
  return (res.Items || []) as Booking[];
}

export async function createBooking(b: Booking): Promise<void> {
  if (useBookingMemory) {
    bookings.push(b);
    return;
  }
  await client!.send(new PutCommand({ TableName: BOOKING_TABLE, Item: b }));
}

export async function getBooking(id: string): Promise<Booking | undefined> {
  if (useBookingMemory) return bookings.find((b) => b.id === id);
  const res = await client!.send(new GetCommand({ TableName: BOOKING_TABLE, Key: { id } }));
  return res.Item as Booking | undefined;
}

export async function setRoomUrl(id: string, roomUrl: string): Promise<void> {
  if (useBookingMemory) {
    const booking = bookings.find((b) => b.id === id);
    if (booking) booking.roomUrl = roomUrl;
    return;
  }
  await client!.send(
    new UpdateCommand({
      TableName: BOOKING_TABLE,
      Key: { id },
      UpdateExpression: 'SET roomUrl = :url',
      ExpressionAttributeValues: { ':url': roomUrl },
    })
  );
}

export async function cancelBooking(id: string): Promise<void> {
  if (useBookingMemory) {
    const booking = bookings.find((b) => b.id === id);
    if (booking) booking.status = 'cancelled';
    return;
  }
  await client!.send(
    new UpdateCommand({
      TableName: BOOKING_TABLE,
      Key: { id },
      UpdateExpression: 'SET #st = :s',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: { ':s': 'cancelled' },
    })
  );
}

export async function listBlockouts(): Promise<Blockout[]> {
  if (useBlockoutMemory) return blockouts;
  const res = await client!.send(new ScanCommand({ TableName: BLOCKOUT_TABLE }));
  return (res.Items || []) as Blockout[];
}

export async function createBlockout(b: Blockout): Promise<void> {
  if (useBlockoutMemory) {
    blockouts.push(b);
    return;
  }
  await client!.send(new PutCommand({ TableName: BLOCKOUT_TABLE, Item: b }));
}

export async function deleteBlockout(id: string): Promise<void> {
  if (useBlockoutMemory) {
    const idx = blockouts.findIndex((b) => b.id === id);
    if (idx !== -1) blockouts.splice(idx, 1);
    return;
  }
  await client!.send(
    new DeleteCommand({
      TableName: BLOCKOUT_TABLE,
      Key: { id },
    })
  );
}
