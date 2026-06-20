(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
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

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    });

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    document.querySelectorAll("[data-card-list]").forEach(function (list) {
        var scope = list.parentElement || document;
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search], [data-card-filter]"));
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        function applyFilters() {
            var searchInput = document.querySelector("[data-card-search]");
            var query = normalize(searchInput ? searchInput.value : "");
            var filters = {};

            inputs.forEach(function (input) {
                var key = input.getAttribute("data-card-filter");
                if (key) {
                    filters[key] = normalize(input.value);
                }
            });

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                var visible = !query || haystack.indexOf(query) !== -1;

                Object.keys(filters).forEach(function (key) {
                    var expected = filters[key];
                    if (!expected) {
                        return;
                    }
                    var actual = normalize(card.getAttribute("data-" + key));
                    if (actual.indexOf(expected) === -1) {
                        visible = false;
                    }
                });

                card.style.display = visible ? "" : "none";
            });
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", applyFilters);
            input.addEventListener("change", applyFilters);
        });

        if (scope) {
            applyFilters();
        }
    });
})();
