(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMenu() {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".menu-toggle");
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = header.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function filterCards(term, category) {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var matched = 0;
        var keyword = normalize(term);
        var selected = category || "all";
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var cardCategory = card.getAttribute("data-category") || "";
            var keywordPass = !keyword || text.indexOf(keyword) !== -1;
            var categoryPass = selected === "all" || cardCategory === selected;
            var show = keywordPass && categoryPass;
            card.hidden = !show;
            if (show) {
                matched += 1;
            }
        });
        Array.prototype.slice.call(document.querySelectorAll(".empty-state")).forEach(function (empty) {
            empty.hidden = matched !== 0;
        });
    }

    function initSearch() {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || params.get("search") || "";
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search-form input"));
        inputs.forEach(function (input) {
            input.value = initial;
        });
        if (initial && document.querySelector(".movie-card")) {
            filterCards(initial, "all");
            var target = document.getElementById("all");
            if (target) {
                setTimeout(function () {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 120);
            }
        }
        Array.prototype.slice.call(document.querySelectorAll(".site-search-form")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input");
                var value = input ? input.value.trim() : "";
                if (document.querySelector(".movie-card") && location.pathname.endsWith("index.html")) {
                    event.preventDefault();
                    filterCards(value, "all");
                    var active = document.querySelector(".filter-pill.is-active");
                    if (active) {
                        active.classList.remove("is-active");
                    }
                    var all = document.querySelector('[data-filter-button="all"]');
                    if (all) {
                        all.classList.add("is-active");
                    }
                }
            });
        });
    }

    function initFilters() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
        if (!buttons.length) {
            return;
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                var searchInput = document.querySelector(".site-search-form input");
                filterCards(searchInput ? searchInput.value : "", button.getAttribute("data-filter-button"));
            });
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
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
                clearInterval(timer);
            }
            timer = setInterval(function () {
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
        restart();
    }

    ready(function () {
        initMenu();
        initSearch();
        initFilters();
        initHero();
    });
})();

function startMoviePlayer(videoUrl) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !overlay || !videoUrl) {
        return;
    }
    var bound = false;
    var hlsInstance = null;

    function bindVideo() {
        if (bound) {
            return;
        }
        bound = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal || !hlsInstance) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        } else {
            video.src = videoUrl;
        }
    }

    function play() {
        bindVideo();
        overlay.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
        if (!video.ended) {
            return;
        }
        overlay.classList.remove("is-hidden");
    });
}
