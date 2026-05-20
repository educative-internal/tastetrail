document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.querySelector('.compose-form input[type="file"]');
    const fileNameEl = document.querySelector("[data-file-name]");

    if (fileInput && fileNameEl) {
        fileInput.addEventListener("change", () => {
            const name = fileInput.files[0]?.name;
            fileNameEl.textContent = name || "No file chosen";
        });
    }

    document.querySelectorAll("form[data-confirm]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            const message = form.getAttribute("data-confirm");
            if (!window.confirm(message)) {
                event.preventDefault();
            }
        });
    });
});
