(function () {
  function createCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";

    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    article.innerHTML = [
      "<a href=\"" + movie.url + "\" class=\"poster-link\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-glow\"></span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"card-tags\">" + tags + "</div>",
      "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "</div>"
    ].join("");

    return article;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function searchMovies(keyword) {
    var list = window.SITE_MOVIES || [];
    var normalized = keyword.toLowerCase();

    if (!normalized) {
      return list.slice(0, 60);
    }

    return list.filter(function (movie) {
      return movie.searchText.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);
  }

  function render() {
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    var keyword = getQuery();

    if (input) {
      input.value = keyword;
    }

    if (!results) {
      return;
    }

    var matches = searchMovies(keyword);
    results.innerHTML = "";

    matches.forEach(function (movie) {
      results.appendChild(createCard(movie));
    });

    if (empty) {
      empty.style.display = matches.length ? "none" : "block";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
