import { NextResponse } from 'next/server';

const AI_ORACLE_ADDRESS = process.env.AI_ORACLE_ADDRESS;

export async function GET() {
  return NextResponse.json({ status: 'ok', oracle: AI_ORACLE_ADDRESS });
}
