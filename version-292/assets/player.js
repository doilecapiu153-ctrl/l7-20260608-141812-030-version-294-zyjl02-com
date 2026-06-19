(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector("[data-player-overlay]");
            var source = player.getAttribute("data-src") || "";
            var hlsInstance = null;
            var initialized = false;

            function initialize() {
                if (!video || initialized || !source) {
                    return;
                }
                initialized = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }

            function play() {
                initialize();
                if (!video) {
                    return;
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!initialized || video.paused) {
                        play();
                    }
                });
                video.addEventListener("playing", function () {
                    if (overlay) {
                        overlay.classList.add("hidden");
                    }
                });
                video.addEventListener("pause", function () {
                    if (overlay && video.currentTime === 0) {
                        overlay.classList.remove("hidden");
                    }
                });
            }
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
