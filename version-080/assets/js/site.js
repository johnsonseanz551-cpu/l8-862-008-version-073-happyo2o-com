(function () {
  const body = document.body;
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', function () {
      siteNav.classList.toggle('open');
      body.classList.toggle('lock-scroll', siteNav.classList.contains('open'));
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-soft-hide');
    });
  });

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;
  let heroTimer = null;

  function setHeroSlide(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(heroTimer);
    heroTimer = setInterval(function () {
      setHeroSlide(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHeroSlide(index);
      startHero();
    });
  });

  setHeroSlide(0);
  startHero();

  const filterPanels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards(panel) {
    const scope = panel.parentElement || document;
    const input = panel.querySelector('[data-search-input]');
    const region = panel.querySelector('[data-filter-region]');
    const type = panel.querySelector('[data-filter-type]');
    const year = panel.querySelector('[data-filter-year]');
    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const empty = scope.querySelector('[data-empty-state]');
    const query = normalize(input ? input.value : '');
    const regionValue = region ? region.value : '';
    const typeValue = type ? type.value : '';
    const yearValue = year ? year.value : '';
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = normalize(card.dataset.keywords + ' ' + card.dataset.title);
      const matchQuery = !query || haystack.includes(query);
      const matchRegion = !regionValue || card.dataset.region === regionValue;
      const matchType = !typeValue || card.dataset.type === typeValue;
      const matchYear = !yearValue || card.dataset.year === yearValue;
      const show = matchQuery && matchRegion && matchType && matchYear;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('visible', visible === 0);
    }
  }

  filterPanels.forEach(function (panel) {
    panel.querySelectorAll('input, select').forEach(function (control) {
      control.addEventListener('input', function () {
        filterCards(panel);
      });
      control.addEventListener('change', function () {
        filterCards(panel);
      });
    });
    filterCards(panel);
  });

  let loadingHls = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (loadingHls) {
      return loadingHls;
    }
    loadingHls = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return loadingHls;
  }

  function initPlayer() {
    const video = document.querySelector('[data-movie-player]');
    const overlay = document.querySelector('[data-play-button]');
    const state = document.querySelector('[data-player-state]');

    if (!video) {
      return;
    }

    const source = video.dataset.src;
    let attached = false;
    let hls = null;

    function setState(message) {
      if (state) {
        state.textContent = message;
      }
    }

    async function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      setState('正在连接播放源');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      try {
        const Hls = await loadHlsLibrary();
        if (Hls && Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setState('播放源已就绪');
          });
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              hls.destroy();
              hls = null;
              video.src = source;
            }
          });
          return;
        }
      } catch (error) {
        video.src = source;
      }

      if (!video.src) {
        video.src = source;
      }
    }

    async function playVideo() {
      await attachSource();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
          setState('点击继续播放');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
      setState('正在播放');
    });

    video.addEventListener('pause', function () {
      if (overlay) {
        overlay.classList.remove('hidden');
      }
      setState('已暂停');
    });

    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('hidden');
      }
      setState('播放结束');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  initPlayer();
})();
