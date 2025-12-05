// Sprawdzanie logowania
function isLoggedIn() {
    const login = document.querySelector('.panel-lewy input[type="text"]').value.trim();
    const haslo = document.querySelector('.panel-lewy input[type="password"]').value.trim();
    return login !== "" && haslo !== "";
}

// Kliknięcie ZALOGUJ
document.querySelector('.przycisk-logowania').addEventListener('click', function() {
    const main = document.getElementById('panel-glowny');

    if (isLoggedIn()) {
        main.classList.add('po-zalogowaniu');

        // Dodaj sekcje do DOM jeśli jeszcze ich nie ma
        if (!document.getElementById('sekcja-tablica')) {
            main.innerHTML = `
                <section id="boardSection" class="section hidden">
                    <h2>📋 Tablica nauczyciela</h2>
                    <textarea class="form-control rounded-3" rows="6" id="board"></textarea>
                    <button id="saveBoardBtn" onclick="setBoard()" class="btn mt-3 text-light rounded-3" 
                            style="background: var(--turquoise-dark); border-color: var(--turquoise);">
                        Zapisz tablicę
                    </button>
                </section>

                <section id="chatSection" class="section hidden"">
                    <h2>💭 Czat grupowy</h2>
                    <p>Tu pojawi się czat.</p>
                    <div id="chatOutput" style="border:1px solid #fff; height:150px; overflow:auto;"></div>
                    <input id="msg" placeholder="Wpisz wiadomość">
                    <button id="btnSend" onclick="sendMessage()">Wyślij</button>
                </section>

                <section id="noteSection" class="section hidden">
                    <h2>📝 Notatki</h2>
                    <textarea class="form-control rounded-3" rows="6" id="note"></textarea>
                    <button id="saveNoteBtn">Zapisz notatkę</button>
                </section>
            `;
        } else {
            document.querySelectorAll('.blok-tresci').forEach(sec => sec.classList.remove('aktywne'));
            document.getElementById('sekcja-tablica').classList.add('aktywne');
        }

    } else {
        alert("Wpisz login i hasło!");
    }
});

// Obsługa menu – delegacja
document.querySelector('.panel-lewy').addEventListener('click', function(e) {
    const link = e.target.closest('a[data-przejdz]');
    if (!link) return;

    e.preventDefault();
    const target = link.getAttribute('data-przejdz');
    const main = document.getElementById('panel-glowny');

    if (!main.classList.contains('po-zalogowaniu')) {
        main.innerHTML = `
            <div class="text-center mt-5">
                <h2>🔒 Zaloguj się</h2>
                <p>Aby zobaczyć tę sekcję, musisz się zalogować.</p>
            </div>
        `;
        return;
    }

    main.querySelectorAll('.blok-tresci').forEach(sec => sec.classList.remove('aktywne'));
    const section = document.getElementById(target);
    if (section) section.classList.add('aktywne');
});
