const TOKEN_KEY = "test_token";
const API = "http://10.103.8.110/jm4/repo2/api";  // Twój adres LAN + ścieżka


function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
}

function show(msg) {
    console.log(msg);
    alert(msg);
}


async function login() {
    try {
        let r = await fetch(`${API}/login.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: document.getElementById("loginName").value,
                password: document.getElementById("loginPass").value
            })
        });

        let data = await r.json();
        console.log(data);

        if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
            document.getElementById("userInfo").innerText = 
                "Zalogowano jako: " + data.user.name + " (" + data.user.role + ")";
            show("OK");
        } else {
            show("Błąd logowania");
        }

    } catch (e) {
        show("Błąd połączenia");
    }
}


function logout() {
    localStorage.removeItem(TOKEN_KEY);
    document.getElementById("userInfo").innerText = "Wylogowano";
}


async function sendMessage() {
    console.log("Token wysyłany:", getToken());
    try {
        let text = document.getElementById("msg").value;

        let r = await fetch(`${API}/messages.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getToken()
            },
            body: JSON.stringify({ text })
        });

        let data = await r.json();
        console.log(data);

        if (data.ok) show("Wysłano");
        else show("Błąd wysyłania");

    } catch (e) {
        show("Błąd połączenia");
    }
}


async function getMessages() {
    let r = await fetch(`${API}/messages.php`);
    let data = await r.json();

    let chat = document.getElementById("chatOutput");
    chat.innerHTML = "";

    data.forEach(m => {
        let p = document.createElement("p");
        p.textContent = m.name + ": " + m.text;
        chat.appendChild(p);
    });
}


async function setBoard() {
    let r = await fetch(`${API}/board.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": getToken()
        },
        body: JSON.stringify({
            content: document.getElementById("board").value
        })
    });

    let data = await r.json();
    console.log(data);

    if (data.ok) show("Tablica zapisana");
    else show("Błąd");
}


async function getBoard() {
    let r = await fetch(`${API}/board.php`);
    let data = await r.json();
    document.getElementById("board").value = data.content || "";
}


async function saveNote() {
    let r = await fetch(`${API}/notes.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": getToken()
        },
        body: JSON.stringify({
            content: document.getElementById("note").value
        })
    });

    let data = await r.json();
    if (data.ok) show("Notatka OK");
}


async function getNote() {
    let r = await fetch(`${API}/notes.php`, {
        headers: { "Authorization": getToken() }
    });

    let data = await r.json();
    document.getElementById("note").value = data.content || "";
}
