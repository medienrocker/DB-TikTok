document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('feed-container');
    const videos = document.querySelectorAll('video');
    const containers = document.querySelectorAll('.video-container');
    let currentVideoIndex = 0;

    // Like System
    class LikeSystem {
        constructor() {
            this.initializeLikes();
        }

        initializeLikes() {
            document.querySelectorAll('.like-button').forEach(button => {
                const container = button.closest('.video-container');
                const videoId = container.dataset.videoId;
                const likeCount = container.querySelector('.like-count');

                // Initialize from localStorage or default value
                const initialLikes = this.getLikes(videoId);
                const isLiked = this.isLiked(videoId);

                // Update display
                likeCount.textContent = initialLikes;
                if (isLiked) {
                    button.classList.add('liked');
                }

                // Add click handler
                button.addEventListener('click', () => this.toggleLike(videoId, button));
            });
        }

        getLikes(videoId) {
            const stored = localStorage.getItem(`video_${videoId}_likes`);
            return stored ? parseInt(stored) : parseInt(this.getInitialLikes(videoId));
        }

        getInitialLikes(videoId) {
            const button = document.querySelector(`[data-video-id="${videoId}"] .like-button`);
            return button.dataset.likes || "0";
        }

        isLiked(videoId) {
            return localStorage.getItem(`video_${videoId}_liked`) === 'true';
        }

        toggleLike(videoId, button) {
            const container = button.closest('.video-container');
            const likeCount = container.querySelector('.like-count');
            const currentLikes = this.getLikes(videoId);
            const isCurrentlyLiked = this.isLiked(videoId);

            // Toggle like state
            const newLikes = isCurrentlyLiked ? currentLikes - 1 : currentLikes + 1;

            // Update localStorage
            localStorage.setItem(`video_${videoId}_likes`, newLikes.toString());
            localStorage.setItem(`video_${videoId}_liked`, (!isCurrentlyLiked).toString());

            // Update display
            likeCount.textContent = newLikes;
            button.classList.toggle('liked');

            // Add animation
            button.classList.remove('like-animation');
            void button.offsetWidth; // Trigger reflow
            button.classList.add('like-animation');

            // Optional: Log for backend integration
            console.log('Like update:', {
                videoId,
                likes: newLikes,
                isLiked: !isCurrentlyLiked,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Video Controller Class
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

    // Initialize like system
    const likeSystem = new LikeSystem();

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