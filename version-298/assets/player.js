import { H as Hls } from "./hls.js";

export function initMoviePlayer(sourceUrl) {
  const video = document.querySelector('[data-player-video]');
  const cover = document.querySelector('[data-player-cover]');
  const status = document.querySelector('[data-player-status]');
  const buttons = Array.from(document.querySelectorAll('[data-player-button]'));
  let hlsInstance = null;
  let ready = false;

  if (!video || !sourceUrl) {
    return;
  }

  const setStatus = function (message) {
    if (status) {
      status.textContent = message || '';
    }
  };

  const attachSource = function () {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            setStatus('播放暂时不可用，请稍后重试');
            hlsInstance.destroy();
          }
        }
      });
      return;
    }

    video.src = sourceUrl;
  };

  const playVideo = function () {
    attachSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        setStatus('点击视频区域即可继续播放');
      });
    }
  };

  buttons.forEach(function (button) {
    button.addEventListener('click', playVideo);
  });

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
    setStatus('');
  });

  video.addEventListener('error', function () {
    setStatus('播放暂时不可用，请稍后重试');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
