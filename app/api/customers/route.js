import prisma from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { name, customerNumber } = await req.json()
  const customer = await prisma.customer.create({
    data: { name, customerNumber: parseInt(customerNumber) },
  })
  return NextResponse.json(customer)
}

export async function GET() {
  const customers = await prisma.customer.findMany({
    include: { reservations: true },
  })
  return NextResponse.json(customers)
}
