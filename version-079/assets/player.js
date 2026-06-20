(function () {
  function attachPlayer(player, source) {
    var root = document.querySelector(player.selector);
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var button = root.querySelector(".play-cover");
    var loaded = false;
    var hls = null;
    function load() {
      if (loaded || !video || !source) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      root._movieHls = hls;
    }
    function start() {
      load();
      root.classList.add("is-playing");
      if (video) {
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }
    }
    if (button) {
      button.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        root.classList.add("is-playing");
      });
    }
  }

  window.initMoviePlayers = function (players) {
    (players || []).forEach(function (player) {
      attachPlayer(player, player.src);
    });
  };
})();
