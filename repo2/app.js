const TOKEN_KEY = "token_aplikacji";
const API = "http://10.103.8.110/jm4/repo2/api";

let currentUser = null;

// ----------------------------------------------------
// Helpery tokenu
// ----------------------------------------------------
function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
}
function saveToken(t) {
    localStorage.setItem(TOKEN_KEY, t);
}
function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

// ----------------------------------------------------
// Elementy UI (od razu istnieją, bo w HTML są statyczne)
// ----------------------------------------------------
const boardSection = document.getElementById("boardSection");
const chatSection = document.getElementById("chatSection");
const noteSection = document.getElementById("noteSection");

const boardArea = document.getElementById("board");
const noteArea = document.getElementById("note");
const chatOutput = document.getElementById("chatOutput");

const userInfo = document.getElementById("userInfo");
const saveBoardBtn = document.getElementById("saveBoardBtn");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const msgInput = document.getElementById("msg");

// Przyciski logowania
document.getElementById("btnLogin").addEventListener("click", login);
document.getElementById("btnLogout").addEventListener("click", logout);
document.getElementById("btnSend").addEventListener("click", sendMessage);
saveNoteBtn.addEventListener("click", saveNote);

// ----------------------------------------------------
// Logowanie
// ----------------------------------------------------
async function login() {
    const name = document.getElementById("loginName").value.trim();
    const password = document.getElementById("loginPass").value.trim();

    if (!name || !password) return alert("Podaj login i hasło!");

    try {
        let r = await fetch(`${API}/login.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password })
        });

        let data = await r.json();

        if (data.error) return alert(data.error);

        saveToken(data.token);
        currentUser = data.user;

        userInfo.innerText = `${currentUser.name} `;

        showByRole(currentUser.role);
        loadAllOnce();

    } catch (e) {
        alert("Błąd połączenia z serwerem");
    }
}

function logout() {
    clearToken();
    currentUser = null;
    userInfo.innerText = "Nie zalogowano";
    hideAll();
}

// ----------------------------------------------------
// UI — pokazywanie sekcji wg roli
// ----------------------------------------------------
function hideAll() {
    boardSection.classList.remove("aktywne");
    chatSection.classList.remove("aktywne");
    noteSection.classList.remove("aktywne");

    boardSection.style.display = "none";
    chatSection.style.display = "none";
    noteSection.style.display = "none";
}

function showByRole(role) {
    hideAll(); // ukryj wszystkie sekcje

    // odblokuj/ustaw dostęp do elementów zależnie od roli
    if (role === "teacher") {
        boardArea.readOnly = false;
        saveBoardBtn.style.display = "inline-block";

        noteArea.readOnly = false;
        saveNoteBtn.style.display = "inline-block";
    }

    if (role === "student") {
        boardArea.readOnly = true;        // uczeń nie może edytować
        saveBoardBtn.style.display = "none";

        noteArea.readOnly = false;        // uczeń może edytować notatki
        saveNoteBtn.style.display = "inline-block";
    }
}

// ----------------------------------------------------
// Menu (panel lewy — przełączanie sekcji)
// ----------------------------------------------------
document.querySelector(".sidebar").addEventListener("click", (e) => {
    const link = e.target.closest("a[data-go]");
    if (!link) return;

    if (!currentUser) {
        alert("Zaloguj się, aby korzystać z sekcji!");
        return;
    }

    hideAll();

    const sectionId = link.getAttribute("data-go");
    document.getElementById(sectionId).style.display = "block";
    document.getElementById(sectionId).classList.add("aktywne");
});

// ----------------------------------------------------
// CZAT
// ----------------------------------------------------
async function sendMessage() {
    const text = msgInput.value.trim();
    if (!text) return;

    let r = await fetch(`${API}/messages.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": getToken()
        },
        body: JSON.stringify({ text })
    });

    let data = await r.json();

    if (data.ok) {
        msgInput.value = "";
        getMessages();
    }
}

async function getMessages() {
    let r = await fetch(`${API}/messages.php`);
    let data = await r.json();

    chatOutput.innerHTML = "";

    // odwracamy kolejność: najstarsze na górze, najnowsze na dole
    data.reverse().forEach(m => {
        chatOutput.innerHTML += `<p><b>${m.name}:</b> ${m.text}</p>`;
    });

    // przewinięcie czatu na dół
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

// ----------------------------------------------------
// TABLICA
// ----------------------------------------------------
async function setBoard() {
    const content = boardArea.value;

    await fetch(`${API}/board.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": getToken()
        },
        body: JSON.stringify({ content })
    });
}

async function getBoard() {
    let r = await fetch(`${API}/board.php`);
    let data = await r.json();
    boardArea.value = data.content || "";
}

saveBoardBtn.addEventListener("click", setBoard);

// ----------------------------------------------------
// NOTATKI
// ----------------------------------------------------
async function saveNote() {
    const content = noteArea.value;

    await fetch(`${API}/notes.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": getToken()
        },
        body: JSON.stringify({ content })
    });
}

async function getNote() {
    let r = await fetch(`${API}/notes.php`, {
        headers: { "Authorization": getToken() }
    });

    let data = await r.json();
    noteArea.value = data.content || "";
}

// ----------------------------------------------------
// AUTO ODSWIEŻANIE
// ----------------------------------------------------
setInterval(() => {
    if (!currentUser) return;

    getMessages();

    if (currentUser.role === "student") {
        getBoard();
    }

}, 2000);

// ----------------------------------------------------
// Ładowanie po zalogowaniu
// ----------------------------------------------------
function loadAllOnce() {
    getMessages();
    getBoard();
    getNote();
}
