import prisma from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { customerId, type } = await req.json()
  const reservation = await prisma.reservation.create({
    data: { customerId: parseInt(customerId), type },
  })
  return NextResponse.json(reservation)
}
