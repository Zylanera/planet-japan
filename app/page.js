'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [customers, setCustomers] = useState([])
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')

  async function addCustomer() {
    const res = await fetch('/api/customers', {
      method: 'POST',
      body: JSON.stringify({ name, customerNumber: number }),
    })
    const newCustomer = await res.json()
    setCustomers([...customers, newCustomer])
    setName('')
    setNumber('')
  }

  async function addReservation(customerId, type) {
    await fetch('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({ customerId, type }),
    })
    loadCustomers()
  }

  async function loadCustomers() {
    const res = await fetch('/api/customers')
    const data = await res.json()
    setCustomers(data)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Kundenverwaltung</h1>
      <div className="mb-4 space-x-2">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Kundennummer"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <button onClick={addCustomer}>Kunde hinzufügen</button>
      </div>

      <div>
        {customers.map((c) => (
          <div key={c.id} className="border p-3 mb-3">
            <h2>{c.name} (#{c.customerNumber})</h2>
            <div className="space-x-2">
              {['MERCH', 'MANGA', 'FIGUR', 'SONSTIGES'].map((type) => (
                <button key={type} onClick={() => addReservation(c.id, type)}>
                  {type}
                </button>
              ))}
            </div>
            <ul className="mt-2">
              {c.reservations.map((r) => (
                <li key={r.id}>
                  {r.type} – {new Date(r.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  )
}
