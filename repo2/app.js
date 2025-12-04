// app.js - kompletny, gotowy plik
// Ustawienia:
const TOKEN_KEY = "test_token";
const API = "http://10.103.8.110/jm4/repo2/api";

// Helpery elementów (będą zainicjowane w init)
let loginName, loginPass, btnLogin, btnLogout, userInfo;
let chatSection, chatOutput, msgInput, btnSend;
let boardSection, boardEl, saveBoardBtn;
let noteSection, noteEl, saveNoteBtn;

// Blokady pisania (notatki) — żeby nie nadpisać wpisywanego tekstu
let typingNote = false;
let typingTimeoutNote = null;

// Pobierz token i usera z tokena (token = base64(JSON))
function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
}
function getUserFromToken() {
    const t = getToken();
    if (!t) return null;
    try {
        return JSON.parse(atob(t));
    } catch {
        return null;
    }
}

// Mały UI helper
function show(msg) { console.log(msg); alert(msg); }

// ----------------- inicjalizacja elementów i eventy -----------------
function init() {
    // element references
    loginName = document.getElementById("loginName");
    loginPass = document.getElementById("loginPass");
    btnLogin = document.getElementById("btnLogin");
    btnLogout = document.getElementById("btnLogout");
    userInfo = document.getElementById("userInfo");

    chatSection = document.getElementById("chatSection");
    chatOutput = document.getElementById("chatOutput");
    msgInput = document.getElementById("msg");
    btnSend = document.getElementById("btnSend");

    boardSection = document.getElementById("boardSection");
    boardEl = document.getElementById("board");
    saveBoardBtn = document.getElementById("saveBoardBtn");

    noteSection = document.getElementById("noteSection");
    noteEl = document.getElementById("note");
    saveNoteBtn = document.getElementById("saveNoteBtn");

    // eventy
    btnLogin.addEventListener("click", login);
    btnLogout.addEventListener("click", logout);
    btnSend.addEventListener("click", sendMessage);

    saveBoardBtn.addEventListener("click", setBoard);
    saveNoteBtn.addEventListener("click", saveNote);

    // blokada nadpisywania notatek podczas pisania
    if (noteEl) {
        noteEl.addEventListener("input", () => {
            typingNote = true;
            clearTimeout(typingTimeoutNote);
            typingTimeoutNote = setTimeout(() => typingNote = false, 1200);
        });
    }

    // Po starcie: jeśli token jest, ustaw UI i pobierz raz dane
    const user = getUserFromToken();
    if (user) {
        userInfo.innerText = `Zalogowano jako: ${user.name} (${user.role})`;
        showByRole(user.role);
        // ładowanie jednorazowe
        getMessages();
        getBoard();
        getNote();
    } else {
        hideAll();
    }

    // AUTO-REFRESH:
    // - getMessages co 2s jeśli zalogowany
    // - getBoard co 2s tylko jeśli zalogowany student
    setInterval(() => {
        const u = getUserFromToken();
        if (!u) return; // nikt nie jest zalogowany
        // czat zawsze odświeżamy gdy zalogowany
        getMessages().catch(e => console.error("getMessages error", e));

        // tablica odświeżana tylko dla studentów
        if (u.role === "student") {
            // student widzi tablicę, ale nie edytuje -> safe to refresh
            // notatki nie odświeżamy
            getBoard().catch(e => console.error("getBoard error", e));
        }
    }, 2000);
}

// ----------------- widoczność sekcji -----------------
function hideAll() {
    chatSection.classList.add("hidden");
    boardSection.classList.add("hidden");
    noteSection.classList.add("hidden");
}
function showByRole(role) {
    hideAll();
    chatSection.classList.remove("hidden");

    if (role === "teacher") {
        boardSection.classList.remove("hidden");
        saveBoardBtn.style.display = "inline-block";
        boardEl.readOnly = false; // nauczyciel może edytować
        noteSection.classList.remove("hidden"); // nauczyciel też widzi swoje notatki
    } else if (role === "student") {
        boardSection.classList.remove("hidden");
        saveBoardBtn.style.display = "none"; // uczeń nie ma przycisku zapisu
        boardEl.readOnly = true; // readonly dla ucznia
        noteSection.classList.remove("hidden"); // uczeń widzi swoje notatki
    }
}

// ----------------- AUTH (login/logout) -----------------
async function login() {
    try {
        const resp = await fetch(`${API}/login.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: loginName.value,
                password: loginPass.value
            })
        });
        const data = await resp.json();
        if (!data.token) {
            show(data.error || "Błąd logowania");
            return;
        }
        // zapis tokena i ustaw UI
        localStorage.setItem(TOKEN_KEY, data.token);
        const user = getUserFromToken();
        userInfo.innerText = `Zalogowano jako: ${user.name} (${user.role})`;
        showByRole(user.role);

        // Pobranie danych jednorazowo po zalogowaniu
        await getMessages();
        await getBoard();
        await getNote();
        show("Zalogowano");
    } catch (e) {
        console.error(e);
        show("Błąd połączenia");
    }
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    userInfo.innerText = "Wylogowano";
    hideAll();
    // wyczyść pola
    chatOutput.innerHTML = "";
    boardEl.value = "";
    noteEl.value = "";
}

// ----------------- MESSAGES (czat) -----------------
async function sendMessage() {
    const token = getToken();
    if (!token) { show("Zaloguj się aby wysyłać wiadomości"); return; }
    const text = msgInput.value.trim();
    if (!text) return;
    try {
        const r = await fetch(`${API}/messages.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ text })
        });
        const data = await r.json();
        if (data.ok) {
            msgInput.value = "";
            await getMessages();
        } else {
            show(data.error || "Błąd wysyłania");
        }
    } catch (e) {
        console.error(e);
        show("Błąd połączenia");
    }
}

async function getMessages() {
    // require login
    if (!getToken()) return;
    try {
        const r = await fetch(`${API}/messages.php`);
        const list = await r.json();
        chatOutput.innerHTML = "";
        (list || []).forEach(m => {
            const p = document.createElement("p");
            p.textContent = `${m.name}: ${m.text}`;
            chatOutput.appendChild(p);
        });
        // przewiń do dołu
        chatOutput.scrollTop = chatOutput.scrollHeight;
    } catch (e) {
        console.error("getMessages error", e);
    }
}

// ----------------- BOARD (tablica) -----------------
async function getBoard() {
    // require login (we only show content for logged)
    if (!getToken()) return;
    try {
        const r = await fetch(`${API}/board.php`);
        const data = await r.json();
        // Jeżeli uczeń edytuje (ale uczeń jest readonly), notatka nie będzie nadpisana.
        // Dla zachowania bezpieczeństwa: nie nadpisuj notatki, jeśli note użytkownik edytuje (dot. notatek)
        boardEl.value = data.content || "";
    } catch (e) {
        console.error("getBoard error", e);
    }
}

async function setBoard() {
    const token = getToken();
    if (!token) { show("Zaloguj się"); return; }
    // tylko nauczyciel ma przycisk widoczny i może zapisać
    try {
        const r = await fetch(`${API}/board.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ content: boardEl.value })
        });
        const data = await r.json();
        if (data.ok) show("Tablica zapisana");
        else show(data.error || "Błąd zapisu");
    } catch (e) {
        console.error(e);
        show("Błąd połączenia");
    }
}

// ----------------- NOTES (notatki prywatne) -----------------
async function getNote() {
    if (!getToken()) return;
    try {
        const r = await fetch(`${API}/notes.php`, {
            headers: { "Authorization": getToken() }
        });
        const data = await r.json();
        // nie nadpisuj, jeśli użytkownik aktualnie wpisuje
        if (!typingNote) noteEl.value = data.content || "";
    } catch (e) {
        console.error("getNote error", e);
    }
}

async function saveNote() {
    const token = getToken();
    if (!token) { show("Zaloguj się"); return; }
    try {
        const r = await fetch(`${API}/notes.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ content: noteEl.value })
        });
        const data = await r.json();
        if (data.ok) show("Notatka zapisana");
        else show(data.error || "Błąd zapisu notatki");
    } catch (e) {
        console.error(e);
        show("Błąd połączenia");
    }
}

// ----------------- expose for inline onclicks (if needed) -----------------
window.login = login;
window.logout = logout;
window.sendMessage = sendMessage;
window.setBoard = setBoard;
window.saveNote = saveNote;

// start init after DOM loaded
document.addEventListener("DOMContentLoaded", init);
