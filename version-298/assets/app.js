(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  const catalogInputs = Array.from(document.querySelectorAll('.catalog-search'));
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const emptyState = document.querySelector('[data-empty-state]');
  let activeFilter = '全部';

  const normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };

  const applyFilter = function () {
    const query = normalize(catalogInputs.map(function (input) {
      return input.value;
    }).find(Boolean) || '');
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = normalize(card.getAttribute('data-search'));
      const filterMatched = activeFilter === '全部' || haystack.indexOf(normalize(activeFilter)) !== -1;
      const queryMatched = !query || haystack.indexOf(query) !== -1;
      const matched = filterMatched && queryMatched;
      card.classList.toggle('is-hidden', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
      emptyState.classList.toggle('is-hidden', visible !== 0);
    }
  };

  if (catalogInputs.length && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('q') || '';

    catalogInputs.forEach(function (input) {
      if (keyword) {
        input.value = keyword;
      }
      input.addEventListener('input', applyFilter);
    });

    document.querySelectorAll('[data-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || '全部';
        document.querySelectorAll('[data-filter]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });

    applyFilter();
  }

  const backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 520);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
