const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Pfad zur users.json-Datei
const usersFilePath = path.join(__dirname, 'users.json');

// Hilfsfunktion zum Laden der Benutzerdaten
function loadUsers() {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
}

// Hilfsfunktion zum Speichern der Benutzerdaten
function saveUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (path === '/') {
        // HTML-Seite ausliefern
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
        
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bonusprogramm</title>
            <style>
            /* Basis-Stile */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    color: #333;
    margin: 0;
    padding: 20px;
}

h1 {
    color: #4CAF50;
    text-align: center;
    margin-bottom: 20px;
}

/* Container */
.container {
    width: 80%;
    max-width: 1000px;
    margin: 0 auto;
}

/* Formular zum Hinzufügen eines Benutzers */
.add-user-form {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
}

.add-user-form h2 {
    margin-bottom: 15px;
    color: #333;
}

.add-user-form input {
    padding: 10px;
    margin: 10px 0;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.add-user-form button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.add-user-form button:hover {
    background-color: #45a049;
}

/* Suchformular */
#searchForm {
    display: flex;
    justify-content: left;
    margin-bottom: 30px;
}

#searchForm input {
    padding: 10px;
    margin-right: 10px;
    width: 350px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

#searchForm button {
    padding: 10px 20px;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

#searchForm button:hover {
    background-color: #1E88E5;
}

/* Benutzerliste */
#userList {
    margin-top: 30px;
}

/* Benutzerkarte */
.user {
    background-color: #fff;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* Name & Punkteanzeige */
.user strong {
    font-size: 1.2em;
}

.user div {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* Punktestand */
.user span {
    font-weight: bold;
    font-size: 1.1em;
}

/* Input-Feld zur Punkteeinlösung */
.user input {
    padding: 5px;
    width: auto;
    border: 1px solid #ccc;
    border-radius: 4px;
}

/* Buttons */
.user button {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.3s ease;
}

.user button:hover {
    opacity: 0.8;
}

.plus-btn {
    width: auto;
    align-items: center;
    padding: 5px; 
    margin: 0px;
}

/* + Punkte Button */
.add-point-btn {
    background-color: #4CAF50;
    color: white;
}

.add-point-btn:hover {
    background-color: #45a049;
}

/* Einlösen Button */
.use-points-btn {
    background-color: #FFA500;
    color: white;
}

.use-points-btn:hover {
    background-color: #FF8C00;
}

/* Löschen Button */
.delete-btn {
    background-color: red;
    color: white;
    margin-top: 10px;
    width: 200px;
}

.delete-btn:hover {
    background-color: darkred;
}

/* Fehlernachricht */
.error {
    color: red;
    font-size: 0.9em;
}

/* Medienabfragen für mobile Geräte */
@media (max-width: 768px) {
    .container {
        width: 95%;
    }

    .add-user-form input,
    .add-user-form button,
    #searchForm input,
    #searchForm button {
        width: 100%;
    }

    .user {
        padding: 10px;
    }

    .user button {
        padding: 6px 10px;
    }
}

            
            </style>
        </head>
        <body>
            <h1>Bonusprogramm</h1>

            <!-- Formular zum Hinzufügen eines Benutzers ganz oben -->
            <div class="add-user-form">
                <h2>Neuen Benutzer hinzufügen</h2>
                <form id="addUserForm">
                    <input type="text" id="userName" placeholder="Name" required>
                    <input type="text" id="userBarcode" placeholder="Barcode" required>
                    <button type="submit">Hinzufügen</button>
                </form>
            </div>

            <!-- Suchformular -->
            <form id="searchForm">
                <input type="text" id="searchInput" placeholder="Barcode oder Name eingeben">
                <button type="submit">Suchen</button>
            </form>

            <!-- Benutzerliste -->
            <div id="userList"></div>

            <script>
                function loadUsers() {
                    fetch('/users')
                        .then(response => response.json())
                        .then(data => {
                            const userList = document.getElementById('userList');
                            userList.innerHTML = '';
                            data.forEach(user => {
                                const userDiv = document.createElement('div');
                                userDiv.className = 'user';
                                userDiv.innerHTML = \`
                                <strong>\${user.name}</strong>
                                <div>Punkte: \${user.points} <button class="plus-btn" onclick="addPoint(\${user.id})">+</button></div>
                                <div><input class="usePoints" type="number" id="usePointsInput\${user.id}" placeholder="Punkte eingeben" min="1">
                                <button onclick="usePoints(\${user.id})">Einlösen</button></div>
                                <button class="delete-btn" onclick="deleteUser(\${user.id})">Kundenkarte Löschen</button>
                                <div id="error\${user.id}" class="error"></div>
                                
                                \`;
                                userList.appendChild(userDiv);
                            });
                        });
                }

                function addPoint(userId) {
                    fetch(\`/addPoint/\${userId}\`, { method: 'POST' })
                        .then(() => loadUsers());
                }

                function usePoints(userId) {
                    const pointsToUse = parseInt(document.getElementById(\`usePointsInput\${userId}\`).value, 10);
                    if (isNaN(pointsToUse) || pointsToUse <= 0) {
                        document.getElementById(\`error\${userId}\`).innerText = 'Bitte eine gültige Punkteanzahl eingeben.';
                        return;
                    }
                    fetch(\`/usePoints/\${userId}?points=\${pointsToUse}\`, { method: 'POST' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                document.getElementById(\`error\${userId}\`).innerText = data.error;
                            } else {
                                document.getElementById(\`error\${userId}\`).innerText = '';
                                loadUsers();
                            }
                        });
                }

                function deleteUser(userId) {
                    fetch(\`/deleteUser/\${userId}\`, { method: 'POST' })
                        .then(() => loadUsers());
                }

                document.getElementById('addUserForm').addEventListener('submit', function(event) {
                    event.preventDefault();
                    const userName = document.getElementById('userName').value;
                    const userBarcode = document.getElementById('userBarcode').value;
                    fetch('/addUser', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: userName, barcode: userBarcode })
                    }).then(() => loadUsers());
                });

                document.getElementById('searchForm').addEventListener('submit', function(event) {
                    event.preventDefault();
                    const searchInput = document.getElementById('searchInput').value;
                    fetch(\`/search?query=\${encodeURIComponent(searchInput)}\`)
                        .then(response => response.json())
                        .then(data => {
                            const userList = document.getElementById('userList');
                            userList.innerHTML = '';
                            if (data.length > 0) {
                                data.forEach(user => {
                                    const userDiv = document.createElement('div');
                                    userDiv.className = 'user';
                                    userDiv.innerHTML = \`
                                    <strong>\${user.name}</strong>
                                    <div>Punkte: \${user.points} <button class="plus-btn" onclick="addPoint(\${user.id})">+</button></div>
                                    <div><input class="usePoints" type="number" id="usePointsInput\${user.id}" placeholder="Punkte eingeben" min="1">
                                    <button onclick="usePoints(\${user.id})">Einlösen</button></div>
                                    <button class="delete-btn" onclick="deleteUser(\${user.id})">Kundenkarte Löschen</button>
                                    <div id="error\${user.id}" class="error"></div>
                                    \`;
                                    userList.appendChild(userDiv);
                                });
                            } else {
                                userList.innerHTML = '<p>Keine Benutzer gefunden.</p>';
                            } 
                        });
                });

                loadUsers();
            </script>
        </body>
        </html>
        
        `);
    } else if (path === '/users') {
        // Alle Benutzer zurückgeben
        const users = loadUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    } else if (path.startsWith('/addPoint/')) {
        // Punkte eines Benutzers erhöhen
        const userId = parseInt(path.split('/')[2], 10);
        const users = loadUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.points += 1;
            saveUsers(users);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Benutzer nicht gefunden' }));
        }
    } else if (path.startsWith('/usePoints/')) {
        // Punkte eines Benutzers verringern
        const userId = parseInt(path.split('/')[2], 10);
        const pointsToUse = parseInt(query.points, 10);
        const users = loadUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            if (pointsToUse > user.points) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Nicht genug Punkte vorhanden' }));
            } else {
                user.points -= pointsToUse;
                saveUsers(users);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Benutzer nicht gefunden' }));
        }
    } else if (path.startsWith('/deleteUser/')) {
        // Benutzer löschen
        const userId = parseInt(path.split('/')[2], 10);
        let users = loadUsers();
        users = users.filter(u => u.id !== userId);
        saveUsers(users);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
    } else if (path === '/search') {
        // Benutzer suchen
        const queryString = query.query.toLowerCase();
        const users = loadUsers();
        const filteredUsers = users.filter(user => 
            user.barcode.includes(queryString) || 
            user.id.toString().includes(queryString) ||
            user.name.toLowerCase().includes(queryString)
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filteredUsers));
    } else if (path === '/addUser') {
        // Neuen Benutzer hinzufügen
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const { name, barcode } = JSON.parse(body);
            const users = loadUsers();
            const newUser = {
                id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
                name,
                barcode,
                points: 0
            };
            users.push(newUser);
            saveUsers(users);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
        });
    } else {
        // 404 Fehler
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});