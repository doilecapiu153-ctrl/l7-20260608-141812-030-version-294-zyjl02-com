(() => {
    const menuButton = document.querySelector("[data-menu-button]");
    const menuPanel = document.querySelector("[data-menu-panel]");

    if (menuButton && menuPanel) {
        menuButton.addEventListener("click", () => {
            menuPanel.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;

        const setSlide = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === current);
            });
        };

        if (slides.length > 0) {
            setSlide(0);
            dots.forEach((dot, index) => dot.addEventListener("click", () => setSlide(index)));
            prev?.addEventListener("click", () => setSlide(current - 1));
            next?.addEventListener("click", () => setSlide(current + 1));
            window.setInterval(() => setSlide(current + 1), 5200);
        }
    }

    document.querySelectorAll("[data-search-scope]").forEach((scope) => {
        const input = scope.querySelector("[data-search-input]");
        const cards = Array.from(scope.querySelectorAll(".movie-card"));

        if (!input || cards.length === 0) {
            return;
        }

        input.addEventListener("input", () => {
            const term = input.value.trim().toLowerCase();
            cards.forEach((card) => {
                const haystack = (card.dataset.search || "").toLowerCase();
                card.hidden = Boolean(term && !haystack.includes(term));
            });
        });
    });

    document.querySelectorAll(".filter-row").forEach((row) => {
        const scope = row.closest("[data-search-scope]") || document;
        const cards = Array.from(scope.querySelectorAll(".movie-card"));
        const buttons = Array.from(row.querySelectorAll("[data-filter]"));

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const filter = button.dataset.filter || "all";
                buttons.forEach((item) => item.classList.toggle("is-active", item === button));
                cards.forEach((card) => {
                    const haystack = `${card.dataset.search || ""} ${card.dataset.tags || ""}`;
                    card.hidden = filter !== "all" && !haystack.includes(filter);
                });
            });
        });
    });

    document.querySelectorAll("[data-player]").forEach((player) => {
        const video = player.querySelector("video");
        const button = player.querySelector("[data-play-button]");
        const stream = player.getAttribute("data-stream");
        let attached = false;

        const start = () => {
            if (!video || !stream) {
                return;
            }

            if (!attached) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                video.setAttribute("controls", "controls");
                attached = true;
            }

            button?.classList.add("is-hidden");
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {});
            }
        };

        button?.addEventListener("click", start);
        video?.addEventListener("click", () => {
            if (!attached) {
                start();
            }
        });
    });
})();
