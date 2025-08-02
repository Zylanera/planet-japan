'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function loadCustomers() {
    const res = await fetch('/api/customers')
    const data = await res.json()
    setCustomers(data)
    setFilteredCustomers(data)
  }

  // Filtert Kunden basierend auf Suchbegriff (Name, Telefonnummer, E-Mail, Kundennummer)
  useEffect(() => {
  if (!search.trim()) {
    setFilteredCustomers(customers)
    return
  }

  const lowerSearch = search.toLowerCase()

  const filtered = customers.filter((c) => {
    const customerMatch =
      c.name.toLowerCase().includes(lowerSearch) ||
      c.phone.toLowerCase().includes(lowerSearch) ||
      (c.email && c.email.toLowerCase().includes(lowerSearch)) ||
      c.customerNumber.toString().includes(lowerSearch)

    const reservationMatch = c.reservations?.some((r) =>
      r.type.toLowerCase().includes(lowerSearch) ||
      (r.description && r.description.toLowerCase().includes(lowerSearch)) ||
      new Date(r.createdAt).toLocaleDateString().includes(lowerSearch)
    )

    return customerMatch || reservationMatch
  })

  setFilteredCustomers(filtered)
}, [search, customers])


  async function addCustomer() {
    setError('')

    if (!name || !number || !phone) {
      setError('Name, Kundennummer und Telefonnummer sind Pflicht.')
      return
    }

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, customerNumber: number, phone, email }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Fehler beim Speichern.')
      return
    }

    await loadCustomers()
    setName('')
    setNumber('')
    setPhone('')
    setEmail('')
  }

async function editCustomer(customer) {
  const newName = prompt('Neuer Name:', customer.name)
  if (newName === null) return

  const newPhone = prompt('Neue Telefonnummer:', customer.phone)
  if (newPhone === null) return

  const newEmail = prompt('Neue E-Mail (optional):', customer.email || '')
  if (newEmail === null) return

  const res = await fetch('/api/customers', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: customer.id,
      name: newName,
      phone: newPhone,
      email: newEmail,
      customerNumber: customer.customerNumber,
    }),
  })

  if (!res.ok) {
    alert('Fehler beim Bearbeiten des Kunden.')
    return
  }

  await loadCustomers()
}


  async function deleteCustomer(id) {
    if (!confirm('Diesen Kunden wirklich löschen?')) return
    await fetch(`/api/customers?id=${id}`, { method: 'DELETE' })
    await loadCustomers()
  }

  async function addReservation(customerId, type) {
  const description = prompt(`Beschreibung für ${type} eingeben:`)
  if (description === null) return // Abbrechen

  const res = await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId, type, description }),
  })

  if (!res.ok) {
    alert('Fehler beim Hinzufügen der Reservierung.')
    return
  }

  await loadCustomers()
}




async function editReservation(reservation) {
  const newType = prompt('Neuer Typ:', reservation.type)
  if (!newType) return

  const newDescription = prompt('Neue Beschreibung:', reservation.description || '')
  if (newDescription === null) return

  const res = await fetch('/api/reservations', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: reservation.id,
      type: newType,
      description: newDescription,
    }),
  })

  if (!res.ok) {
    alert('Fehler beim Bearbeiten der Reservierung.')
    return
  }

  await loadCustomers()
}

async function deleteReservation(id) {
  if (!confirm('Diese Reservierung wirklich löschen?')) return

  const res = await fetch(`/api/reservations?id=${id}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    alert('Fehler beim Löschen der Reservierung.')
    return
  }

  await loadCustomers()
}



  useEffect(() => {
    loadCustomers()
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Kundenverwaltung</h1>

      <div className="mb-6 max-w-md space-y-2 flex flex-col">
        <input placeholder="Suche nach Name, Telefonnummer, E-Mail oder Kundennummer" value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>

      <div className="mb-6 max-w-md space-y-2 flex flex-col">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Kundennummer" value={number} onChange={(e) => setNumber(e.target.value)} />
        <input placeholder="Telefonnummer" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="E-Mail (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={addCustomer}>Kunde hinzufügen</button>
        {error && <p className="text-red-600">{`\n` + error}</p>}
      </div>

      <div>
        {filteredCustomers.length === 0 && <p>Keine Kunden gefunden.</p>}
        {filteredCustomers.map((c) => (
          <div key={c.id} className="border p-4 mb-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div
  className="cursor-pointer hover:bg-gray-100 p-2 rounded"
  onClick={() => editCustomer(c)}
>
  <h2 className="font-semibold">
    {c.name} (#{c.customerNumber})
  </h2>
  <p>{c.phone}</p>
  {c.email && <p>{c.email}</p>}
</div>

              <button onClick={() => deleteCustomer(c.id)} className="text-red-600">Kunde Löschen</button>
            </div>

            <div className="mt-2 space-x-2">
              {['MERCH', 'MANGA', 'FIGUR', 'SONSTIGES'].map((type) => (
                <button key={type} onClick={() => addReservation(c.id, type)}>{type}</button>
              ))}
            </div>

            {c.reservations?.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {[...c.reservations]
                  .sort((a, b) => a.type.localeCompare(b.type))
                  .map((r) => (
                    <li
                      key={r.id}
                      onClick={() => editReservation(r)}
                      className="cursor-pointer hover:bg-gray-100 p-1 rounded flex justify-between items-center"
                    >
                      <span>
                        {r.type}{r.description ? ` (${r.description})` : ''} – {new Date(r.createdAt).toISOString().split('T')[0]}
                  
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Verhindert, dass der Klick das editReservation auslöst
                          deleteReservation(r.id);
                        }}
                        className="ml-2 text-red-600"
                      >
                        Löschen
                      </button>
                    </li>
                  ))}
              </ul>
            )}


          </div>
        ))}
      </div>
    </main>
  )
}
