'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [customers, setCustomers] = useState([])
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  async function loadCustomers() {
    const res = await fetch('/api/customers')
    const data = await res.json()
    setCustomers(data)
  }

  async function addCustomer() {
    if (!name || !number || !phone) {
      alert('Name, Kundennummer und Telefonnummer sind Pflicht')
      return
    }

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, customerNumber: number, phone, email }),
    })
    if (res.ok) {
      await loadCustomers()
      setName('')
      setNumber('')
      setPhone('')
      setEmail('')
    }
  }

  async function deleteCustomer(id) {
    if (!confirm('Diesen Kunden wirklich löschen?')) return
    await fetch(`/api/customers?id=${id}`, { method: 'DELETE' })
    loadCustomers()
  }

  async function addReservation(customerId, type) {
    await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, type }),
    })
    loadCustomers()
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Kundenverwaltung</h1>

      <div className="mb-6 max-w-md space-y-2 flex flex-col">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Kundennummer" value={number} onChange={(e) => setNumber(e.target.value)} />
        <input placeholder="Telefonnummer" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="E-Mail (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={addCustomer}>➕ Kunde hinzufügen</button>
      </div>

      <div>
        {customers.map((c) => (
          <div key={c.id} className="border p-4 mb-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{c.name} (#{c.customerNumber})</h2>
                <p>📞 {c.phone}</p>
                {c.email && <p>📧 {c.email}</p>}
              </div>
              <button onClick={() => deleteCustomer(c.id)} className="text-red-600">🗑️ Löschen</button>
            </div>

            <div className="mt-2 space-x-2">
              {['MERCH', 'MANGA', 'FIGUR', 'SONSTIGES'].map((type) => (
                <button key={type} onClick={() => addReservation(c.id, type)}>{type}</button>
              ))}
            </div>

            {c.reservations?.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {c.reservations.map((r) => (
                  <li key={r.id}>
                    {r.type} – {new Date(r.createdAt).toLocaleString()}
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
