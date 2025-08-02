import axios from 'axios';
import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import path from 'path';

// Falls du ES Module nutzt, __dirname definieren:
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfad relativ zu diesem Skript
const dataFilePath = path.resolve(__dirname, '../../../../data/appdata.json');

export async function GET() {
  try {
    const file = await fs.readFile(dataFilePath, 'utf8');
    const storedData = JSON.parse(file);
    return new Response(JSON.stringify(storedData), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { isbns } = body;

    if (!Array.isArray(isbns)) {
      return new Response(JSON.stringify({ error: 'isbns muss ein Array sein' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let storedData = [];
    try {
      const file = await fs.readFile(dataFilePath, 'utf8');
      storedData = JSON.parse(file);
    } catch {
      storedData = [];
    }

    const counts = isbns.reduce((acc, isbn) => {
      acc[isbn] = (acc[isbn] || 0) + 1;
      return acc;
    }, {});

    const uniqueIsbns = [...new Set(isbns)];
    const results = [];

    for (const isbn of uniqueIsbns) {
      const existingIndex = storedData.findIndex((item) => item.isbn === isbn);
      let entry = existingIndex !== -1 ? { ...storedData[existingIndex] } : null;

      try {
        const url = `https://www.isbn.de/buch/${isbn}`;
        const { data } = await axios.get(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          },
        });

        const $ = cheerio.load(data);

        const titleGerman = $('data[itemprop="product-id"]').text().trim();

        let author = '';
        let publisher = '';
        let publishedDate = '';
        $('div').each((i, el) => {
          const label = $(el).find('div').first().text().trim();
          const value = $(el).find('div').eq(1).text().trim();
          if (label === 'Autor') author = $(el).find('a').first().text().trim() || value;
          if (label === 'Verlag') publisher = $(el).find('a').first().text().trim() || value;
          if (label === 'erschienen am') {
             const text = $(el).text().replace(/erschienen am/i, '').trim();
             if (/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
               publishedDate = text;
             }
           }
        });

        const coverUrl = `https://buch.isbn.de/cover/${isbn}.jpg`;

        const newEntry = {
          isbn,
          titleGerman,
          author,
          publisher,
          coverUrl,
          publishedDate,
          count: counts[isbn],
        };

        if (entry) {
          // Update vorhandene Felder nur wenn sich was geändert hat
          entry.titleGerman = newEntry.titleGerman || entry.titleGerman;
          entry.author = newEntry.author || entry.author;
          entry.publisher = newEntry.publisher || entry.publisher;
          entry.coverUrl = newEntry.coverUrl || entry.coverUrl;
          entry.publishedDate = newEntry.publishedDate || entry.publishedDate;
          entry.count += newEntry.count;

          storedData[existingIndex] = entry;
          results.push(entry);
        } else {
          storedData.push(newEntry);
          results.push(newEntry);
        }
      } catch (err) {
        console.error(`Fehler beim Abrufen von ISBN ${isbn}:`, err.message);
        // Wenn es den Eintrag schon gibt, übernimm ihn einfach wie er ist
        if (entry) {
          entry.count += counts[isbn];
          storedData[existingIndex] = entry;
          results.push(entry);
        } else {
          const fallbackEntry = {
            isbn,
            error: 'Fehler beim Abrufen',
            detail: err.message,
            count: counts[isbn],
          };
          storedData.push(fallbackEntry);
          results.push(fallbackEntry);
        }
      }
    }

    try {
      await fs.writeFile(dataFilePath, JSON.stringify(storedData, null, 2), 'utf8');
    } catch (e) {
      console.error('Fehler beim Schreiben in Datei:', e);
      return new Response(
        JSON.stringify({ error: 'Fehler beim Speichern der Daten' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    console.error('Unerwarteter Fehler im POST:', e);
    return new Response(
      JSON.stringify({ error: 'Interner Serverfehler' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
