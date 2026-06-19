(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
            document.body.classList.toggle("is-locked", !expanded);
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            slides[index].classList.remove("is-active");
            if (dots[index]) {
                dots[index].classList.remove("is-active");
            }
            index = (next + slides.length) % slides.length;
            slides[index].classList.add("is-active");
            if (dots[index]) {
                dots[index].classList.add("is-active");
            }
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var section = panel.parentElement;
            if (!section) {
                return;
            }
            var input = panel.querySelector(".filter-input");
            var category = panel.querySelector(".filter-category");
            var year = panel.querySelector(".filter-year");
            var items = Array.prototype.slice.call(section.querySelectorAll(".filter-item"));
            var empty = panel.querySelector(".no-results");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (query && input) {
                input.value = query;
            }
            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }
            function apply() {
                var text = normalize(input && input.value);
                var cat = category ? category.value : "";
                var selectedYear = year ? year.value : "";
                var visible = 0;
                items.forEach(function (item) {
                    var haystack = normalize(item.getAttribute("data-search"));
                    var itemCategory = item.getAttribute("data-category") || "";
                    var itemYear = item.getAttribute("data-year") || "";
                    var matched = (!text || haystack.indexOf(text) !== -1) && (!cat || itemCategory === cat) && (!selectedYear || itemYear === selectedYear);
                    item.classList.toggle("is-hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            [input, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupImages() {
        Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (image) {
            image.addEventListener("error", function () {
                image.style.opacity = "0";
            }, { once: true });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-video-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-overlay");
            var stream = player.getAttribute("data-stream");
            var initialized = false;
            var hls = null;
            function initialize() {
                if (!video || !stream || initialized) {
                    return;
                }
                initialized = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }
            }
            function play() {
                initialize();
                if (button) {
                    button.classList.add("is-hidden");
                }
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            }
            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                });
            }
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupImages();
        setupPlayers();
    });
})();
