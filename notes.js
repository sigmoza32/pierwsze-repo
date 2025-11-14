document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();

        const target = this.getAttribute("href");

        document.querySelectorAll(".content-section").forEach(sec => {
            sec.classList.remove("active");
        });

        document.querySelector(target).classList.add("active");
    });
});
