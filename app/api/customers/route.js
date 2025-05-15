import prisma from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const customers = await prisma.customer.findMany({
    include: { reservations: true },
  })
  return NextResponse.json(customers)
}

export async function POST(req) {
  const { name, customerNumber, phone, email } = await req.json()

  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        customerNumber: parseInt(customerNumber),
        phone,
        email: email || null,
      },
    })
    return NextResponse.json(customer)
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Kundennummer existiert bereits.' },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// DELETE via Query-Parameter: /api/customers?id=123
export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID fehlt' }, { status: 400 })
  }

  await prisma.reservation.deleteMany({ where: { customerId: parseInt(id) } }) // clean up
  await prisma.customer.delete({ where: { id: parseInt(id) } })

  return NextResponse.json({ success: true })
}