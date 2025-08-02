import prisma from '@/app/lib/prisma'

// ➕ Reservierung erstellen
export async function POST(req) {
  try {
    const { customerId, type, description } = await req.json()

    if (!customerId || !type) {
      return new Response(JSON.stringify({ error: 'customerId und type sind erforderlich.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const customerExists = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!customerExists) {
      return new Response(JSON.stringify({ error: 'Kunde nicht gefunden.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const reservation = await prisma.reservation.create({
      data: {
        type,
        description: description || null,
        customerId,
      },
    })

    return new Response(JSON.stringify(reservation), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return new Response(JSON.stringify({ error: 'Interner Serverfehler.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// ✏️ Reservierung bearbeiten
export async function PATCH(req) {
  try {
    const { id, type, description } = await req.json()

    if (!id || !type) {
      return new Response(JSON.stringify({ error: 'id und type sind erforderlich.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const reservationExists = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservationExists) {
      return new Response(JSON.stringify({ error: 'Reservierung nicht gefunden.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        type,
        description: description || null,
      },
    })

    return new Response(JSON.stringify(updatedReservation), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating reservation:', error)
    return new Response(JSON.stringify({ error: 'Interner Serverfehler.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// 🗑️ Reservierung löschen
export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id'))

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID fehlt' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    await prisma.reservation.delete({ where: { id } })
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return new Response(JSON.stringify({ error: 'Interner Serverfehler.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
