const TOKEN_KEY = "test_token";
const API = "http://10.103.8.110/jm4/repo2/api";

// -------------------------------------------
// TOKEN + ALERT
// -------------------------------------------

function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
}

function show(msg) {
    console.log(msg);
    alert(msg);
}

// -------------------------------------------
// LOGOWANIE
// -------------------------------------------

async function login() {
    try {
        let r = await fetch(`${API}/login.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: loginName.value,
                password: loginPass.value
            })
        });

        let data = await r.json();
        if (!data.token) return show("Błąd logowania");

        localStorage.setItem(TOKEN_KEY, data.token);

        userInfo.innerText = `Zalogowano jako: ${data.user.name} (${data.user.role})`;

        showByRole(data.user.role);

        // po zalogowaniu pobierz raz
        getMessages();
        getBoard();
        getNote();

    } catch (e) {
        show("Błąd połączenia");
    }
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    userInfo.innerText = "Wylogowano";
    hideAll();
}

// -------------------------------------------
// POKAZYWANIE/CHOWANIE
// -------------------------------------------

function hideAll() {
    chatSection.style.display = "none";
    boardSection.style.display = "none";
    noteSection.style.display = "none";
}

function showByRole(role) {
    hideAll();
    chatSection.style.display = "block";

    if (role === "teacher") {
        boardSection.style.display = "block";
        saveBoardBtn.style.display = "inline-block";
        noteSection.style.display = "block";  // nauczyciel widzi notatki
    }

    if (role === "student") {
        boardSection.style.display = "block"; 
        saveBoardBtn.style.display = "none";
        noteSection.style.display = "block";  // UCZEŃ również widzi notatki
    }
}


// -------------------------------------------
// WIADOMOŚCI
// -------------------------------------------

async function sendMessage() {
    try {
        let r = await fetch(`${API}/messages.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getToken()
            },
            body: JSON.stringify({ text: msg.value })
        });

        let data = await r.json();
        if (data.ok) msg.value = "";
        else show("Błąd wysłania");

    } catch (e) {
        show("Błąd połączenia");
    }
}

async function getMessages() {
    if (!getToken()) return;

    let r = await fetch(`${API}/messages.php`);
    let data = await r.json();

    chatOutput.innerHTML = "";
    data.forEach(m => {
        let p = document.createElement("p");
        p.textContent = `${m.name}: ${m.text}`;
        chatOutput.appendChild(p);
    });
}

// -------------------------------------------
// TABLICA
// -------------------------------------------

async function setBoard() {
    let r = await fetch(`${API}/board.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": getToken()
        },
        body: JSON.stringify({ content: board.value })
    });

    let data = await r.json();
    if (!data.ok) show("Błąd zapisu tablicy");
}

async function getBoard() {
    if (!getToken()) return;

    let r = await fetch(`${API}/board.php`);
    let data = await r.json();
    board.value = data.content || "";
}

// -------------------------------------------
// NOTATKI
// -------------------------------------------

async function saveNote() {
    let r = await fetch(`${API}/notes.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": getToken()
        },
        body: JSON.stringify({ content: note.value })
    });

    let data = await r.json();
    if (!data.ok) show("Błąd zapisu notatki");
}

async function getNote() {
    if (!getToken()) return;

    let r = await fetch(`${API}/notes.php`, {
        headers: { "Authorization": getToken() }
    });

    let data = await r.json();
    note.value = data.content || "";
}

// -------------------------------------------
// AUTO-REFRESH CO 2 SEKUNDY
// -------------------------------------------

setInterval(() => {
    let token = getToken();
    if (!token) return;

    // czat zawsze
    getMessages();

    // odczyt roli
    let user = JSON.parse(atob(token));

    // uczeń odświeża tablicę
    if (user.role === "student") {
        getBoard();
    }

    // notatki i tablica nauczyciela NIE odświeżają się automatycznie
}, 2000);
