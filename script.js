document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('feed-container');
    const videos = document.querySelectorAll('video');
    const containers = document.querySelectorAll('.video-container');
    let currentVideoIndex = 0;

    // Video Control System
    class VideoController {
        constructor(container) {
            this.container = container;
            this.video = container.querySelector('video');
            this.playPauseBtn = container.querySelector('.play-pause');
            this.progressBar = container.querySelector('.progress-bar');
            this.durationDisplay = container.querySelector('.video-duration');
            this.isPlaying = false;

            // Remove loop attribute from video
            this.video.removeAttribute('loop');

            this.initializeControls();
        }

        initializeControls() {
            // Play/Pause button
            this.playPauseBtn.addEventListener('click', () => this.togglePlay());

            // Video progress
            this.video.addEventListener('timeupdate', () => this.updateProgress());
            this.video.addEventListener('loadedmetadata', () => this.updateDuration());

            // Handle video end
            this.video.addEventListener('ended', () => {
                this.pause();
                this.video.currentTime = 0;
                this.updateProgress();
            });

            // Progress bar click
            const progressContainer = this.container.querySelector('.video-progress');
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                this.video.currentTime = pos * this.video.duration;
            });
        }

        togglePlay() {
            if (this.video.paused) {
                this.play();
            } else {
                this.pause();
            }
        }

        play() {
            this.video.play();
            this.playPauseBtn.textContent = '❚❚';
            this.isPlaying = true;
        }

        pause() {
            this.video.pause();
            this.playPauseBtn.textContent = '▶';
            this.isPlaying = false;
        }

        updateProgress() {
            const progress = (this.video.currentTime / this.video.duration) * 100;
            this.progressBar.style.width = `${progress}%`;
            this.updateDuration();
        }

        updateDuration() {
            const current = this.formatTime(this.video.currentTime);
            const total = this.formatTime(this.video.duration);
            this.durationDisplay.textContent = `${current} / ${total}`;
        }

        formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            seconds = Math.floor(seconds % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Initialize video controllers
    const videoControllers = Array.from(containers).map(container =>
        new VideoController(container)
    );

    // Navigation System
    const navigateTo = (index) => {
        if (index < 0 || index >= videos.length) return;

        // Pause current video
        videoControllers[currentVideoIndex].pause();

        // Update current index
        currentVideoIndex = index;

        // Scroll to new position
        const targetY = index * window.innerHeight;
        feedContainer.scrollTo({
            top: targetY,
            behavior: 'smooth'
        });
    };

    // Navigation Controls
    document.querySelector('.prev').addEventListener('click', () => {
        if (currentVideoIndex > 0) {
            navigateTo(currentVideoIndex - 1);
        }
    });

    document.querySelector('.next').addEventListener('click', () => {
        if (currentVideoIndex < videos.length - 1) {
            navigateTo(currentVideoIndex + 1);
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
            navigateTo(currentVideoIndex - 1);
        } else if (e.key === 'ArrowDown' && currentVideoIndex < videos.length - 1) {
            navigateTo(currentVideoIndex + 1);
        } else if (e.key === ' ') {
            e.preventDefault();
            videoControllers[currentVideoIndex].togglePlay();
        }
    });

    // Handle scroll events to update current index
    feedContainer.addEventListener('scroll', () => {
        const newIndex = Math.round(feedContainer.scrollTop / window.innerHeight);
        if (newIndex !== currentVideoIndex) {
            videoControllers[currentVideoIndex].pause();
            currentVideoIndex = newIndex;
        }
    });
});