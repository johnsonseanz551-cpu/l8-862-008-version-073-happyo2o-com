(function () {
    function initMoviePlayer(url, videoId, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hls;
        var started = false;
        if (!video || !overlay) {
            return;
        }
        function attach() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
            video.controls = true;
        }
        function play() {
            attach();
            overlay.hidden = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    overlay.hidden = false;
                });
            }
        }
        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                play();
            }
        });
        video.addEventListener("ended", function () {
            overlay.hidden = false;
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
    window.initMoviePlayer = initMoviePlayer;
})();
