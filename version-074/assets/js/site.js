(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.getAttribute('data-hero-dot'));
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  const searchResults = document.querySelector('[data-search-results]');
  const searchHeading = document.querySelector('[data-search-heading]');
  const searchInput = document.querySelector('[data-search-input]');

  if (searchResults && window.SEARCH_INDEX) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();

    if (searchInput) {
      searchInput.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function card(item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + item.link + '" aria-label="' + item.title + '">',
        '    <img src="' + item.image + '" alt="' + item.title + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="play-mark">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <a class="movie-title" href="' + item.link + '">' + item.title + '</a>',
        '    <p class="movie-meta">' + item.meta + '</p>',
        '    <p class="movie-desc">' + item.text + '</p>',
        '    <div class="tag-row">' + item.tags.map(function (tag) { return '<span>' + tag + '</span>'; }).join('') + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    if (query) {
      const terms = normalize(query).split(/\s+/).filter(Boolean);
      const matches = window.SEARCH_INDEX.filter(function (item) {
        const haystack = normalize([item.title, item.meta, item.text, item.tags.join(' ')].join(' '));
        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      }).slice(0, 120);

      if (searchHeading) {
        searchHeading.textContent = query + ' 相关影片';
      }

      searchResults.innerHTML = matches.length
        ? matches.map(card).join('')
        : '<article class="text-panel"><h2>换一个关键词试试</h2><p>可以使用片名、题材、地区、年份或标签进行搜索。</p></article>';
    }
  }
})();
