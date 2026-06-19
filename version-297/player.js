(() => {
    const video = document.getElementById('movie-player');
    const overlay = document.querySelector('.player-overlay');

    if (!video) {
        return;
    }

    const streamUrl = video.getAttribute('data-stream');
    let attached = false;
    let hls = null;

    const attachStream = () => {
        if (attached || !streamUrl) {
            return Promise.resolve();
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            return new Promise(resolve => {
                hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                hls.on(window.Hls.Events.ERROR, (event, data) => {
                    if (data.fatal && data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                });
            });
        }

        video.src = streamUrl;
        return Promise.resolve();
    };

    const playVideo = async () => {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        await attachStream();
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    };

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('play', () => {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', () => {
        if (overlay && !video.ended) {
            overlay.classList.remove('is-hidden');
        }
    });

    video.addEventListener('ended', () => {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    });

    video.addEventListener('click', () => {
        if (video.paused) {
            playVideo();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (hls) {
            hls.destroy();
        }
    });
})();
