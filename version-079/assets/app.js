(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero(hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilter(form) {
    var target = document.querySelector(form.getAttribute("data-target"));
    if (!target) {
      return;
    }
    var items = Array.prototype.slice.call(target.querySelectorAll("[data-movie-card]"));
    var input = form.querySelector("input[name='q']");
    var region = form.querySelector("select[name='region']");
    var year = form.querySelector("select[name='year']");
    function apply() {
      var q = normalize(input && input.value);
      var r = normalize(region && region.value);
      var y = normalize(year && year.value);
      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-tags"),
          item.getAttribute("data-region"),
          item.getAttribute("data-year"),
          item.getAttribute("data-type")
        ].join(" "));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (r && normalize(item.getAttribute("data-region")) !== r) {
          ok = false;
        }
        if (y && normalize(item.getAttribute("data-year")) !== y) {
          ok = false;
        }
        item.hidden = !ok;
      });
    }
    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  ready(function () {
    initNav();
    document.querySelectorAll("[data-hero]").forEach(initHero);
    document.querySelectorAll("[data-filter-form]").forEach(initFilter);
  });
})();
