'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [isbnInput, setIsbnInput] = useState('');
  const [isbnList, setIsbnList] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('titleGerman');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    async function loadStoredData() {
      try {
        const res = await axios.get('/api/isbn-info');
        setResults(res.data || []);
      } catch (e) {
        console.error('Fehler beim Laden der gespeicherten Daten', e);
      }
    }
    loadStoredData();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isbnInput.trim()) {
      const cleanedIsbn = isbnInput.trim();
      const existing = results.find((r) => r.isbn === cleanedIsbn);

      if (existing) {
        setResults((prev) =>
          prev.map((r) =>
            r.isbn === cleanedIsbn ? { ...r, count: r.count + 1 } : r
          )
        );
      } else {
        setIsbnList((prev) => [...prev, cleanedIsbn]);
      }

      setIsbnInput('');
    }
  };

  const handleSubmit = async () => {
    if (isbnList.length === 0) return;
    setLoading(true);

    try {
      const res = await axios.post('/api/isbn-info', { isbns: isbnList });
      const fetched = res.data;

      const updated = [...results];
      fetched.forEach((item) => {
        const index = updated.findIndex((r) => r.isbn === item.isbn);
        if (index !== -1) {
          updated[index] = { ...updated[index], ...item };
        } else {
          updated.push(item);
        }
      });

      setResults(updated);
      setIsbnList([]);
    } catch (err) {
      alert('Fehler beim Abrufen der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = (isbn, value) => {
    const num = parseInt(value, 10);
    setResults((prev) =>
      prev.map((r) =>
        r.isbn === isbn ? { ...r, count: isNaN(num) ? 0 : num } : r
      )
    );
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    let valA = a[sortBy] ?? '';
    let valB = b[sortBy] ?? '';

    if (sortBy === 'publishedDate') {
      valA = new Date(valA.split('.').reverse().join('-'));
      valB = new Date(valB.split('.').reverse().join('-'));
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }

    return sortOrder === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const renderSortButton = (label, field) => (
    <button onClick={() => handleSort(field)} className="underline hover:text-blue-600">
      {label} {sortBy === field && (sortOrder === 'asc' ? '▲' : '▼')}
    </button>
  );

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📘 Manga ISBN Checker</h1>

      <input
        type="text"
        value={isbnInput}
        onChange={(e) => setIsbnInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="ISBN eingeben und Enter drücken"
        className="border p-2 w-full mb-2"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? 'Lade...' : 'Infos abrufen'}
      </button>

      {isbnList.length > 0 && (
        <div className="mb-4">
          <h2 className="font-semibold">Eingegebene ISBNs (noch nicht geladen):</h2>
          <ul className="list-disc ml-6">
            {isbnList.map((isbn, i) => (
              <li key={i}>{isbn}</li>
            ))}
          </ul>
        </div>
      )}

      {results.length > 0 && (
        <table className="w-full text-left border mt-4">
          <thead>
            <tr>
              <th className="border p-2">Cover</th>
              <th className="border p-2 sortable" onClick={() => handleSort('isbn')}>
                ISBN{' '}
                {sortBy === 'isbn' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th className="border p-2 sortable" onClick={() => handleSort('titleGerman')}>
                Titel{' '}
                {sortBy === 'titleGerman' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th className="border p-2 sortable" onClick={() => handleSort('publisher')}>
                Publisher{' '}
                {sortBy === 'publisher' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th className="border p-2 sortable" onClick={() => handleSort('author')}>
                Autor{' '}
                {sortBy === 'author' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th className="border p-2 sortable" onClick={() => handleSort('publishedDate')}>
                Erschienen{' '}
                {sortBy === 'publishedDate' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th className="border p-2 sortable" onClick={() => handleSort('count')}>
                Anzahl{' '}
                {sortBy === 'count' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
            </tr>

          </thead>
          <tbody>
            {sortedResults.map((item, idx) => (
              <tr key={idx}>
                <td className="border p-2">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt="Cover" className="w-16" />
                  ) : (
                    '–'
                  )}
                </td>
                <td className="border p-2">{item.isbn}</td>
                <td className="border p-2">{item.titleGerman || '–'}</td>
                <td className="border p-2">{item.publisher || '–'}</td>
                <td className="border p-2">{item.author || '–'}</td>
                <td className="border p-2">{item.publishedDate || '–'}</td>
                <td className="border p-2">
                  <input
                    type="number"
                    min="0"
                    value={item.count}
                    onChange={(e) => handleCountChange(item.isbn, e.target.value)}
                    className="w-16 p-1 border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
