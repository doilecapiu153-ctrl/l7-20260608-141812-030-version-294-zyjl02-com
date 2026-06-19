(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        selectAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var value = input ? input.value.trim() : "";
                var target = "search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var background = hero.querySelector("[data-hero-bg]");
            var title = hero.querySelector("[data-hero-title]");
            var desc = hero.querySelector("[data-hero-desc]");
            var meta = hero.querySelector("[data-hero-meta]");
            var links = selectAll("[data-hero-link]", hero);
            var panelImage = hero.querySelector("[data-hero-panel-img]");
            var panelTitle = hero.querySelector("[data-hero-panel-title]");
            var thumbs = selectAll("[data-hero-thumb]", hero);
            var current = 0;

            function applySlide(index) {
                var button = thumbs[index];
                if (!button) {
                    return;
                }
                current = index;
                thumbs.forEach(function (thumb) {
                    thumb.classList.remove("active");
                });
                button.classList.add("active");
                var image = button.getAttribute("data-cover") || "";
                var href = button.getAttribute("data-link") || "#";
                var movieTitle = button.getAttribute("data-title") || "";
                var movieDesc = button.getAttribute("data-desc") || "";
                var movieMeta = button.getAttribute("data-meta") || "";
                if (background) {
                    background.style.backgroundImage = "url('" + image + "')";
                }
                if (panelImage) {
                    panelImage.src = image;
                    panelImage.alt = movieTitle;
                }
                if (title) {
                    title.textContent = movieTitle;
                }
                if (desc) {
                    desc.textContent = movieDesc;
                }
                if (meta) {
                    meta.textContent = movieMeta;
                }
                links.forEach(function (item) {
                    item.href = href;
                });
                if (panelTitle) {
                    panelTitle.textContent = movieTitle;
                }
            }

            thumbs.forEach(function (button, index) {
                button.addEventListener("click", function () {
                    applySlide(index);
                });
            });

            applySlide(0);
            window.setInterval(function () {
                if (thumbs.length > 1) {
                    applySlide((current + 1) % thumbs.length);
                }
            }, 5200);
        }

        var searchPage = document.querySelector("[data-search-page]");
        if (searchPage) {
            var params = new URLSearchParams(window.location.search);
            var queryInput = searchPage.querySelector("[data-filter-query]");
            var categorySelect = searchPage.querySelector("[data-filter-category]");
            var yearSelect = searchPage.querySelector("[data-filter-year]");
            var cards = selectAll("[data-movie-card]", searchPage);
            var empty = searchPage.querySelector("[data-empty-state]");
            var initialQuery = params.get("q") || "";
            if (queryInput) {
                queryInput.value = initialQuery;
            }

            function includesText(source, value) {
                return source.toLowerCase().indexOf(value.toLowerCase()) !== -1;
            }

            function filterCards() {
                var query = queryInput ? queryInput.value.trim() : "";
                var category = categorySelect ? categorySelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = card.getAttribute("data-search") || "";
                    var cardCategory = card.getAttribute("data-category") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = true;
                    if (query && !includesText(haystack, query)) {
                        matched = false;
                    }
                    if (category && cardCategory !== category) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    card.style.display = matched ? "block" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            [queryInput, categorySelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filterCards);
                    control.addEventListener("change", filterCards);
                }
            });

            filterCards();
        }
    });
})();
