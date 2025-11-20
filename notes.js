function isLoggedIn() {
    const login = document.querySelector('.panel-lewy input[type="text"]').value.trim();
    const haslo = document.querySelector('.panel-lewy input[type="password"]').value.trim();
    const role = document.querySelector('.panel-lewy select').value;
    return login !== "" && haslo !== "" && role !== "";
}

document.querySelector('.przycisk-logowania').addEventListener('click', function() {
    const main = document.getElementById('panel-glowny');

    if(isLoggedIn()) {
        main.classList.add('po-zalogowaniu');

        main.innerHTML = `
            <section id="sekcja-tablica" class="blok-tresci aktywne">
                <h2>📋 Tablica nauczyciela</h2>
                <textarea class="form-control" rows="6"></textarea>
                <button class="btn przycisk-logowania mt-3">Zapisz tablicę</button>
            </section>

            <section id="sekcja-czat" class="blok-tresci">
                <h2>💭 Czat grupowy</h2>
                <p>Tu pojawi się czat.</p>
            </section>

            <section id="sekcja-notatki" class="blok-tresci">
                <h2>📝 Notatki</h2>
                <textarea class="form-control" rows="6"></textarea>
            </section>
        `;
    } else {
        alert("Wpisz login i hasło!");
    }
});

document.querySelectorAll('.panel-lewy a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('data-przejdz');
        const main = document.getElementById('panel-glowny');

        main.querySelectorAll('.blok-tresci').forEach(sec => sec.classList.remove('aktywne'));

        if(!main.classList.contains('po-zalogowaniu')) {
            main.innerHTML = `
                <div class="content-box text-center">
                    <h2>🔒 Zaloguj się</h2>
                    <p>Aby zobaczyć tę sekcję, musisz się zalogować.</p>
                </div>
            `;
        } else {
            const section = document.getElementById(target);
            if(section) section.classList.add('aktywne');
        }
    });
});
