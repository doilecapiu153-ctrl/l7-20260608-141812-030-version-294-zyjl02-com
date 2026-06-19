(() => {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        let index = 0;

        const setSlide = nextIndex => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener('click', () => setSlide(dotIndex));
        });

        if (slides.length > 1) {
            window.setInterval(() => setSlide(index + 1), 5200);
        }
    }

    const localFilter = document.querySelector('[data-local-filter]');
    const localCards = Array.from(document.querySelectorAll('[data-card]'));

    if (localFilter && localCards.length) {
        localFilter.addEventListener('input', () => {
            const keyword = localFilter.value.trim().toLowerCase();
            localCards.forEach(card => {
                const text = (card.getAttribute('data-search') || '').toLowerCase();
                card.hidden = keyword.length > 0 && !text.includes(keyword);
            });
        });
    }

    const searchPage = document.querySelector('[data-search-page]');

    if (searchPage && window.siteMovies) {
        const params = new URLSearchParams(window.location.search);
        const query = (params.get('q') || '').trim();
        const input = searchPage.querySelector('[data-search-input]');
        const title = searchPage.querySelector('[data-search-title]');
        const results = searchPage.querySelector('#search-results');

        if (input) {
            input.value = query;
        }

        const escapeHtml = value => String(value || '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');

        const renderCard = movie => {
            const tags = (movie.tags || []).slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
            const searchText = [movie.title, movie.region, movie.type, movie.genre, movie.year, (movie.tags || []).join(' ')].join(' ');

            return `<article class="movie-card" data-card data-search="${escapeHtml(searchText)}">
                <a class="poster-link" href="${escapeHtml(movie.url)}" aria-label="${escapeHtml(movie.title)}">
                    <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                    <span class="poster-badge">${escapeHtml(movie.type)}</span>
                    <span class="poster-score">${escapeHtml(movie.score)}</span>
                </a>
                <div class="movie-card-body">
                    <div class="movie-meta-line">
                        <span>${escapeHtml(movie.year)}</span>
                        <span>${escapeHtml(movie.region)}</span>
                    </div>
                    <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
                    <p>${escapeHtml(movie.oneLine)}</p>
                    <div class="tag-row">${tags}</div>
                </div>
            </article>`;
        };

        if (query && results) {
            const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
            const matched = window.siteMovies.filter(movie => {
                const text = [movie.title, movie.region, movie.type, movie.genre, movie.year, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
                return keywords.every(keyword => text.includes(keyword));
            }).slice(0, 120);

            if (title) {
                title.textContent = matched.length ? `“${query}”相关内容` : `没有找到“${query}”`;
            }

            results.innerHTML = matched.length
                ? matched.map(renderCard).join('')
                : '<p class="empty-state">换一个关键词试试，也可以进入分类浏览更多影片。</p>';
        }
    }
})();
