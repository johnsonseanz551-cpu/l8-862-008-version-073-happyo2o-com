(function () {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            const isOpen = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;
        let timer = null;

        const showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        };

        const start = function () {
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        };

        const restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
                restart();
            });
        });

        showSlide(0);
        start();
    }

    const scopes = Array.from(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
        const form = scope.querySelector('[data-filter-form]');
        const input = scope.querySelector('[data-filter-input]');
        const year = scope.querySelector('[data-filter-year]');
        const type = scope.querySelector('[data-filter-type]');
        const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
        const empty = scope.querySelector('[data-empty-state]');

        if (!form || !input) {
            return;
        }

        if (scope.hasAttribute('data-search-page')) {
            const params = new URLSearchParams(window.location.search);
            const query = params.get('q');
            if (query) {
                input.value = query;
            }
        }

        const applyFilter = function () {
            const keyword = input.value.trim().toLowerCase();
            const selectedYear = year ? year.value : '';
            const selectedType = type ? type.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const text = (card.getAttribute('data-search') || '').toLowerCase();
                const cardYear = card.getAttribute('data-year') || '';
                const cardType = card.getAttribute('data-type') || '';
                const keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                const yearMatch = !selectedYear || cardYear.indexOf(selectedYear) !== -1;
                const typeMatch = !selectedType || cardType.indexOf(selectedType) !== -1;
                const matched = keywordMatch && yearMatch && typeMatch;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        form.addEventListener('input', applyFilter);
        form.addEventListener('change', applyFilter);
        form.addEventListener('reset', function () {
            window.setTimeout(applyFilter, 0);
        });

        applyFilter();
    });

    const players = Array.from(document.querySelectorAll('.movie-player'));

    players.forEach(function (video) {
        const shell = video.closest('.player-shell');
        const overlay = shell ? shell.querySelector('.play-overlay') : null;
        const sourceElement = video.querySelector('source');
        const stream = sourceElement ? sourceElement.getAttribute('src') : video.currentSrc;
        let ready = false;
        let hls = null;

        const prepare = function () {
            if (ready || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            ready = true;
        };

        const play = function () {
            prepare();
            video.setAttribute('controls', 'controls');
            const request = video.play();
            if (request && typeof request.then === 'function') {
                request.catch(function () {});
            }
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        };

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
