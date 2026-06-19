const state = {
    hlsModulePromise: null
};

function getRoot() {
    return document.body.dataset.root || "";
}

function initMenus() {
    const button = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", () => {
        const isHidden = menu.hasAttribute("hidden");
        if (isHidden) {
            menu.removeAttribute("hidden");
            button.textContent = "×";
            button.setAttribute("aria-label", "收起导航");
        } else {
            menu.setAttribute("hidden", "");
            button.textContent = "☰";
            button.setAttribute("aria-label", "展开导航");
        }
    });
}

function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            const input = form.querySelector("input[name='q']");
            const query = input ? input.value.trim() : "";
            if (!query) {
                event.preventDefault();
                if (input) {
                    input.focus();
                }
            }
        });
    });
}

function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-slide-to]"));
    if (slides.length <= 1) {
        return;
    }

    let activeIndex = 0;

    function showSlide(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, current) => {
            slide.classList.toggle("is-active", current === activeIndex);
        });
        dots.forEach((dot, current) => {
            dot.classList.toggle("is-active", current === activeIndex);
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.slideTo || 0));
        });
    });

    window.setInterval(() => {
        showSlide(activeIndex + 1);
    }, 5000);
}

function initCardFilter() {
    const input = document.querySelector("[data-card-filter]");
    const list = document.querySelector("[data-card-list]");
    const empty = document.querySelector("[data-empty-filter]");
    if (!input || !list) {
        return;
    }

    const cards = Array.from(list.querySelectorAll(".movie-card"));
    input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        let visibleCount = 0;
        cards.forEach((card) => {
            const haystack = (card.dataset.search || "").toLowerCase();
            const matched = !query || haystack.includes(query);
            card.hidden = !matched;
            if (matched) {
                visibleCount += 1;
            }
        });
        if (empty) {
            empty.hidden = visibleCount !== 0;
        }
    });
}

function movieCardTemplate(movie, root) {
    const safe = (value) => String(value || "").replace(/[&<>'"]/g, (character) => {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            "\"": "&quot;"
        }[character];
    });

    const tags = (movie.tags || []).slice(0, 2).map((tag) => `<span>${safe(tag)}</span>`).join("");
    const detail = `${root}${movie.detail}`;
    const cover = `${root}${movie.cover}`;
    const searchText = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine, (movie.tags || []).join(" ")].join(" ");

    return `
        <article class="movie-card" data-search="${safe(searchText)}">
            <a class="movie-card__poster poster-frame" href="${safe(detail)}" aria-label="观看 ${safe(movie.title)}">
                <img src="${safe(cover)}" alt="${safe(movie.title)}" loading="lazy" onerror="this.style.opacity='0';">
                <span class="movie-card__play">▶</span>
                <span class="movie-card__badge">${safe(movie.category)}</span>
            </a>
            <div class="movie-card__body">
                <h3><a href="${safe(detail)}">${safe(movie.title)}</a></h3>
                <p class="movie-card__meta">${safe(movie.region)} · ${safe(movie.year)} · ${safe(movie.type)}</p>
                <p class="movie-card__desc">${safe(movie.oneLine || "")}</p>
                <div class="tag-list">${tags}</div>
            </div>
        </article>`;
}

function initSearchPage() {
    const results = document.getElementById("search-results");
    const status = document.getElementById("search-status");
    if (!results || !status || !window.MOVIES) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    const input = document.querySelector(".page-hero input[name='q']");
    if (input) {
        input.value = query;
    }

    if (!query) {
        status.textContent = "请输入关键词开始搜索。";
        return;
    }

    const lowerQuery = query.toLowerCase();
    const matched = window.MOVIES.filter((movie) => {
        const haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine, movie.summary, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        return haystack.includes(lowerQuery);
    });

    status.textContent = `关于“${query}”共找到 ${matched.length} 部影片。`;
    results.innerHTML = matched.slice(0, 240).map((movie) => movieCardTemplate(movie, getRoot())).join("");

    if (matched.length > 240) {
        status.textContent += " 当前显示前 240 条，可继续增加关键词缩小范围。";
    }

    if (matched.length === 0) {
        results.innerHTML = "";
    }
}

async function loadHlsModule() {
    if (!state.hlsModulePromise) {
        state.hlsModulePromise = import("./video-player-dru42stk.js")
            .then((module) => module.H)
            .catch(() => null);
    }
    return state.hlsModulePromise;
}

async function initPlayers() {
    const players = Array.from(document.querySelectorAll("[data-player]"));
    if (!players.length) {
        return;
    }

    const Hls = await loadHlsModule();

    players.forEach((player) => {
        const video = player.querySelector("video[data-src]");
        const loading = player.querySelector("[data-player-loading]");
        const errorBox = player.querySelector("[data-player-error]");
        const toggle = player.querySelector("[data-player-toggle]");
        const mute = player.querySelector("[data-player-mute]");
        const fullscreen = player.querySelector("[data-player-fullscreen]");
        const source = video ? video.dataset.src : "";

        if (!video || !source) {
            return;
        }

        function hideLoading() {
            if (loading) {
                loading.hidden = true;
            }
        }

        function showError(message) {
            hideLoading();
            if (errorBox) {
                errorBox.hidden = false;
                errorBox.textContent = message;
            }
        }

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, hideLoading);
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data && data.fatal) {
                    showError("视频加载失败，请刷新页面或稍后重试。");
                    hls.destroy();
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", hideLoading, { once: true });
        } else {
            showError("当前浏览器不支持 HLS 播放，请使用 Chrome、Edge、Safari 或 Firefox 最新版本。 ");
        }

        video.addEventListener("canplay", hideLoading, { once: true });
        video.addEventListener("play", () => {
            if (toggle) {
                toggle.textContent = "暂停";
            }
        });
        video.addEventListener("pause", () => {
            if (toggle) {
                toggle.textContent = "▶ 播放";
            }
        });

        async function togglePlayback() {
            if (video.paused) {
                try {
                    await video.play();
                } catch (_error) {
                    showError("浏览器阻止了自动播放，请再次点击播放器或播放按钮。");
                }
            } else {
                video.pause();
            }
        }

        if (toggle) {
            toggle.addEventListener("click", togglePlayback);
        }
        video.addEventListener("click", togglePlayback);

        if (mute) {
            mute.addEventListener("click", () => {
                video.muted = !video.muted;
                mute.textContent = video.muted ? "取消静音" : "静音";
            });
        }

        if (fullscreen) {
            fullscreen.addEventListener("click", () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            });
        }
    });
}

initMenus();
initSearchForms();
initHero();
initCardFilter();
initSearchPage();
initPlayers();
