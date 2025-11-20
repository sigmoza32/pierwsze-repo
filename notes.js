// Kliknięcie w "Notatki"
document.querySelector('a[data-target="sekcja-notatki"]').addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelectorAll(".sekcja").forEach(sec => {
        sec.classList.remove("widoczna");
    });

    const target = this.getAttribute("data-target");
    document.getElementById(target).classList.add("widoczna");
});


// Sprawdzenie loginu
function isLoggedIn() {
    const login = document.querySelector('.panel-boczny input[type="text"]').value.trim();
    const haslo = document.querySelector('.panel-boczny input[type="password"]').value.trim();
    const role = document.querySelector('.panel-boczny select').value;

    return login !== "" && haslo !== "" && role !== "";
}


// Logowanie
document.querySelector('.btn-zaloguj').addEventListener('click', function() {
    const main = document.getElementById('glowna-zawartosc');

    if (isLoggedIn()) {
        main.classList.add('logged-in');

        main.innerHTML = `
            <section id="sekcja-tablica" class="sekcja widoczna">
                <h2>📋 Tablica nauczyciela</h2>
                <textarea class="form-control" rows="6"></textarea>
                <button class="btn btn-success mt-3">Zapisz tablicę</button>
            </section>

            <section id="sekcja-czat" class="sekcja">
                <h2>💭 Czat grupowy</h2>
                <p>Tu pojawi się czat.</p>
            </section>

            <section id="sekcja-notatki" class="sekcja">
                <h2>📝 Notatki</h2>
                <textarea class="form-control" rows="6"></textarea>
            </section>
        `;
    } else {
        alert("Wpisz login i hasło!");
    }
});


// Klikanie w menu
document.querySelectorAll('.panel-boczny a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('data-target');
        const main = document.getElementById('glowna-zawartosc');

        main.querySelectorAll('.sekcja').forEach(sec => sec.classList.remove('widoczna'));

        if (!main.classList.contains('logged-in')) {
            main.innerHTML = `
                <div class="blok-informacyjny text-center">
                    <h2>🔒 Zaloguj się</h2>
                    <p>Aby zobaczyć tę sekcję, musisz się zalogować.</p>
                </div>
            `;
        } else {
            const section = document.getElementById(target);
            if (section) section.classList.add('widoczna');
        }
    });
});
