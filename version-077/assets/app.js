(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = document.getElementById("movie-filter");
        var year = document.getElementById("year-filter");
        var type = document.getElementById("type-filter");
        var category = document.getElementById("category-filter");
        var empty = document.getElementById("filter-empty");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input && query) {
            input.value = query;
        }
        function apply() {
            var key = normalize(input ? input.value : "");
            var selectedYear = normalize(year ? year.value : "");
            var selectedType = normalize(type ? type.value : "");
            var selectedCategory = normalize(category ? category.value : "");
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year")
                ].join(" "));
                var matchesKey = !key || haystack.indexOf(key) !== -1;
                var matchesYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
                var matchesType = !selectedType || normalize(card.getAttribute("data-type")) === selectedType;
                var matchesCategory = !selectedCategory || normalize(card.getAttribute("data-category")) === selectedCategory;
                var visible = matchesKey && matchesYear && matchesType && matchesCategory;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }
        [input, year, type, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            window.clearInterval(timer);
            start();
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        start();
    }

    ready(function () {
        setupMobileMenu();
        setupFilters();
        setupHero();
    });
})();
