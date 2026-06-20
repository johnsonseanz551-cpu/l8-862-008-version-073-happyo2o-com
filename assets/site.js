(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function getBasePath() {
        return document.body.getAttribute('data-base-path') || './';
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        var backgrounds = Array.prototype.slice.call(root.querySelectorAll('[data-hero-bg]'));
        var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-hero-tab]'));
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-hero-card]'));
        if (!backgrounds.length || !tabs.length || !cards.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + backgrounds.length) % backgrounds.length;
            backgrounds.forEach(function (item, itemIndex) {
                item.classList.toggle('active', itemIndex === current);
            });
            tabs.forEach(function (item, itemIndex) {
                item.classList.toggle('active', itemIndex === current);
            });
            cards.forEach(function (item, itemIndex) {
                item.hidden = itemIndex !== current;
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        tabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function renderSearchResults(box, items, query) {
        var results = box.querySelector('[data-search-results]');
        if (!results) {
            return;
        }
        if (!query) {
            results.classList.remove('open');
            results.innerHTML = '';
            return;
        }
        var basePath = getBasePath();
        var html = items.slice(0, 8).map(function (item) {
            var title = escapeHtml(item.title);
            var meta = escapeHtml([item.type, item.region, item.year].filter(Boolean).join(' · '));
            var cover = escapeHtml(item.cover);
            var url = escapeHtml(item.url);
            return [
                '<a class="search-result-item" href="' + basePath + url + '">',
                '<img src="' + basePath + cover + '" alt="' + title + '" loading="lazy">',
                '<span>',
                '<strong>' + title + '</strong>',
                '<span>' + meta + '</span>',
                '</span>',
                '</a>'
            ].join('');
        }).join('');
        if (!html) {
            html = '<div class="search-result-item"><span><strong>暂无匹配影片</strong><span>换个关键词试试</span></span></div>';
        }
        results.innerHTML = html;
        results.classList.add('open');
    }

    function initSearch() {
        var movies = window.SITE_MOVIES || [];
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));
        boxes.forEach(function (box) {
            var input = box.querySelector('[data-search-input]');
            var button = box.querySelector('[data-search-button]');
            if (!input) {
                return;
            }

            function run() {
                var query = normalize(input.value);
                var parts = query.split(/\s+/).filter(Boolean);
                var matched = movies.filter(function (movie) {
                    var text = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' '));
                    return parts.every(function (part) {
                        return text.indexOf(part) !== -1;
                    });
                });
                renderSearchResults(box, matched, query);
            }

            input.addEventListener('input', run);
            input.addEventListener('focus', run);
            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    run();
                });
            }
        });
        document.addEventListener('click', function (event) {
            boxes.forEach(function (box) {
                if (!box.contains(event.target)) {
                    var results = box.querySelector('[data-search-results]');
                    if (results) {
                        results.classList.remove('open');
                    }
                }
            });
        });
    }

    window.initMoviePlayer = function (videoUrl) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.querySelector('[data-player-overlay]');
        var button = document.querySelector('[data-player-button]');
        if (!video || !videoUrl) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add('hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 && overlay) {
                overlay.classList.remove('hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initSearch();
    });
})();
