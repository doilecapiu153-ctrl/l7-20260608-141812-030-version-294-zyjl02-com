(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      show(0);
      start();
    }

    var grid = document.querySelector("[data-filter-grid]");
    var searchInput = document.querySelector("[data-search-input]");
    var regionFilter = document.querySelector("[data-region-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var resultCount = document.querySelector("[data-result-count]");

    if (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
      }

      function valueOf(node) {
        return node ? node.value.trim().toLowerCase() : "";
      }

      function applyFilters() {
        var query = valueOf(searchInput);
        var region = valueOf(regionFilter);
        var type = valueOf(typeFilter);
        var year = valueOf(yearFilter);
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.textContent + " " + (card.getAttribute("data-keywords") || "")).toLowerCase();
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesRegion = !region || (card.getAttribute("data-region") || "").toLowerCase() === region;
          var matchesType = !type || (card.getAttribute("data-type") || "").toLowerCase() === type;
          var matchesYear = !year || (card.getAttribute("data-year") || "") === year;
          var show = matchesQuery && matchesRegion && matchesType && matchesYear;

          card.hidden = !show;

          if (show) {
            visible += 1;
          }
        });

        if (resultCount) {
          resultCount.textContent = "当前筛选显示 " + visible + " 部影片";
        }
      }

      [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (node) {
        if (node) {
          node.addEventListener("input", applyFilters);
          node.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }
  });
}());
