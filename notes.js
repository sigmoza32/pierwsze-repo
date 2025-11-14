//notatki
document.querySelector('a[href="#section-notes"]').addEventListener("click", function (e) {
    e.preventDefault();

    // Ukryj wszystkie sekcje
    document.querySelectorAll(".content-section").forEach(sec => {
        sec.classList.remove("active");
    });

    // Pokaż sekcję notatek
    document.querySelector("#section-notes").classList.add("active");
});
