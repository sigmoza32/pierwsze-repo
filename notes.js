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
                <section id="sekcja-tablica" class="blok-tresci aktywne">
                    <h2>📋 Tablica nauczyciela</h2>
                    <textarea class="form-control rounded-3" rows="6"></textarea>
                    <button class="btn mt-3 text-light rounded-3" 
                            style="background: var(--turquoise-dark); border-color: var(--turquoise);">
                        Zapisz tablicę
                    </button>
                </section>

                <section id="sekcja-czat" class="blok-tresci">
                    <h2>💭 Czat grupowy</h2>
                    <p>Tu pojawi się czat.</p>
                </section>

                <section id="sekcja-notatki" class="blok-tresci">
                    <h2>📝 Notatki</h2>
                    <textarea class="form-control rounded-3" rows="6"></textarea>
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
