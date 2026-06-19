(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(root) {
    var video = root.querySelector("video");
    var playButton = root.querySelector("[data-play]");
    var stream = root.getAttribute("data-stream");
    var attached = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else {
        video.src = stream;
      }

      attached = true;
    }

    function play() {
      attach();
      video.play().catch(function () {});
    }

    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    }

    video.addEventListener("click", function () {
      attach();

      if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      root.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      root.classList.remove("is-playing");
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
}());
