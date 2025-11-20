//notatki
document.querySelector('a[data-target="section-notes"]').addEventListener("click", function (e) {
    e.preventDefault();

    // Ukryj wszystkie sekcje
    document.querySelectorAll(".content-section").forEach(sec => {
        sec.classList.remove("active");
    });

    // Pokaż sekcję notatek
    const target = this.getAttribute("data-target");
    document.getElementById(target).classList.add("active");
});

// Funkcja sprawdzająca, czy użytkownik jest zalogowany
function isLoggedIn() {
    const login = document.querySelector('.sidebar input[type="text"]').value.trim();
    const haslo = document.querySelector('.sidebar input[type="password"]').value.trim();
    const role = document.querySelector('.sidebar select').value;
    return login !== "" && haslo !== "" && role !== "";
}

// Obsługa kliknięcia w przycisk "Zaloguj"
document.querySelector('.btn-login').addEventListener('click', function() {
    const main = document.getElementById('main-content');

    if(isLoggedIn()) {
        main.classList.add('logged-in');

        main.innerHTML = `
            <section id="section-board" class="content-section active">
                <h2>📋 Tablica nauczyciela</h2>
                <textarea class="form-control" rows="6"></textarea>
                <button class="btn btn-login mt-3">Zapisz tablicę</button>
            </section>

            <section id="section-chat" class="content-section">
                <h2>💭 Czat grupowy</h2>
                <p>Tu pojawi się czat.</p>
            </section>

            <section id="section-notes" class="content-section">
                <h2>📝 Notatki</h2>
                <textarea class="form-control" rows="6"></textarea>
            </section>
        `;
    } else {
        alert("Wpisz login i hasło!");
    }
});

// Obsługa kliknięcia w menu
document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('data-target');
        const main = document.getElementById('main-content');

        // Ukryj wszystkie sekcje
        main.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));

        // Jeśli nie zalogowany → pokaż tylko "Zaloguj się" dla wszystkich sekcji
        if(!main.classList.contains('logged-in')) {
            main.innerHTML = `
                <div class="content-box text-center">
                    <h2>🔒 Zaloguj się</h2>
                    <p>Aby zobaczyć tę sekcję, musisz się zalogować.</p>
                </div>
            `;
        } else {
            // Pokaż wybraną sekcję po zalogowaniu
            const section = document.getElementById(target);
            if(section) section.classList.add('active');
        }
    });
});