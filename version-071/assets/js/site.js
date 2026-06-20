(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var nav = document.querySelector(".top-nav");
    var toggle = document.querySelector(".nav-toggle");

    if (nav && toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    var filterInput = document.querySelector("[data-filter-input]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty]");
    var activeFilter = "all";

    function applyFilter() {
      if (!cards.length) {
        return;
      }

      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var search = (card.getAttribute("data-search") || "").toLowerCase();
        var genre = (card.getAttribute("data-genre") || "").toLowerCase();
        var year = (card.getAttribute("data-year") || "").toLowerCase();
        var matchKeyword = !keyword || search.indexOf(keyword) !== -1;
        var matchFilter = activeFilter === "all" || genre.indexOf(activeFilter) !== -1 || year.indexOf(activeFilter) !== -1 || search.indexOf(activeFilter) !== -1;
        var show = matchKeyword && matchFilter;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter-button") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });

    applyFilter();
  });
})();
