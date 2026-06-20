(function () {
  function setupPlayer(root) {
    var video = root.querySelector("video");
    var overlay = root.querySelector("[data-play-overlay]");
    var button = root.querySelector("[data-play-button]");
    var state = root.querySelector("[data-player-state]");

    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var loaded = false;
    var hls = null;

    function setState(message) {
      if (state) {
        state.textContent = message || "";
      }
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      loaded = true;
      setState("正在加载...");

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState("");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setState("正在重连...");
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setState("正在恢复...");
            hls.recoverMediaError();
          } else {
            setState("暂时无法播放当前内容");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.addEventListener("loadedmetadata", function () {
          setState("");
        }, { once: true });
      } else {
        setState("暂时无法播放当前内容");
      }
    }

    function playVideo() {
      loadStream();
      var promise = video.play();
      if (promise && typeof promise.then === "function") {
        promise.then(function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
          setState("");
        }).catch(function () {
          setState("点击播放");
        });
      } else if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", toggleVideo);
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  function init() {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
