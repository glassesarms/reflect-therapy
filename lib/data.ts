import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

export interface Booking {
  id: string;
  date: string;
  time: string;
  notes: string;
  roomUrl?: string;
}

// In-memory store used when running tests or if the table isn't configured
export const bookings: Booking[] = [];

const TABLE = process.env.BOOKINGS_TABLE_NAME;
const useMemory = !TABLE || process.env.NODE_ENV === 'test';

let client: DynamoDBDocumentClient | undefined;
if (!useMemory) {
  client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
}

export async function listBookings(): Promise<Booking[]> {
  if (useMemory) return bookings;
  const res = await client!.send(new ScanCommand({ TableName: TABLE }));
  return (res.Items || []) as Booking[];
}

export async function createBooking(b: Booking): Promise<void> {
  if (useMemory) {
    bookings.push(b);
    return;
  }
  await client!.send(new PutCommand({ TableName: TABLE, Item: b }));
}

export async function getBooking(id: string): Promise<Booking | undefined> {
  if (useMemory) return bookings.find((b) => b.id === id);
  const res = await client!.send(new GetCommand({ TableName: TABLE, Key: { id } }));
  return res.Item as Booking | undefined;
}

export async function setRoomUrl(id: string, roomUrl: string): Promise<void> {
  if (useMemory) {
    const booking = bookings.find((b) => b.id === id);
    if (booking) booking.roomUrl = roomUrl;
    return;
  }
  await client!.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: 'SET roomUrl = :url',
      ExpressionAttributeValues: { ':url': roomUrl },
    })
  );
}
