// ==========================================
// CONFIGURATION (EDIT NAMES HERE)
// ==========================================
const weddingConfig = {
    brideName: "Juby",
    groomName: "Jijo",
    initials: "J&J"
};
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // Apply configuration to DOM
    document.title = `${weddingConfig.groomName} & ${weddingConfig.brideName} Wedding Invitation`;
    document.getElementById('seal-initials').innerText = weddingConfig.initials;
    document.getElementById('bride-name-1').innerText = weddingConfig.brideName;
    document.getElementById('groom-name-1').innerText = weddingConfig.groomName;
    // document.getElementById('bride-name-2').innerText = weddingConfig.brideName;
    // document.getElementById('groom-name-2').innerText = weddingConfig.groomName;
    
    // --- Elements ---
    const doorContainer = document.getElementById('door-screen');
    const openBtn = document.getElementById('open-btn');
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    const musicToggle = document.getElementById('music-toggle');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');

    // --- Auto Scroll Logic ---
    let isAutoScrolling = false;
    let autoScrollAnimationId;

    function startAutoScroll() {
        isAutoScrolling = true;
        let currentScroll = window.scrollY;
        
        function scrollStep() {
            if (!isAutoScrolling) return;
            
            // Scroll down very slowly (0.4 pixels per frame)
            currentScroll += 0.4;
            window.scrollTo(0, currentScroll);
            
            // Stop if we reach the bottom
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                isAutoScrolling = false;
                return;
            }
            
            autoScrollAnimationId = requestAnimationFrame(scrollStep);
        }
        
        autoScrollAnimationId = requestAnimationFrame(scrollStep);
    }

    // Stop auto-scroll if user interacts manually
    window.addEventListener('touchstart', () => isAutoScrolling = false, {passive: true});
    window.addEventListener('wheel', () => isAutoScrolling = false, {passive: true});
    window.addEventListener('mousedown', () => isAutoScrolling = false, {passive: true});

    // --- Door Opening & Music ---
    let isMusicPlaying = false;

    openBtn.addEventListener('click', () => {
        // Add open class to trigger CSS transition
        doorContainer.classList.add('open');
        mainContent.classList.add('visible');
        
        // Show bottom nav after short delay
        setTimeout(() => {
            bottomNav.classList.remove('hidden');
            
            // Trigger reflow to ensure CSS transition works
            void bottomNav.offsetWidth; 
            
            bottomNav.classList.add('visible');
            
            // Play music (if browser allows it)
            playMusic();

            // After animation finishes, we can remove the door container from DOM to save memory
            setTimeout(() => {
                doorContainer.style.display = 'none';
                
                // Start the slow auto-scroll down the page
                startAutoScroll();
            }, 1500); // 1.5s matches CSS transition duration
            
        }, 500); 
    });

    // --- Web Audio API for background music without lock screen controls ---
    let audioContext;
    let audioBuffer;
    let sourceNode;
    let audioInitialized = false;
    let audioInitPromise = null;

    function initAudio() {
        if (audioInitPromise) return audioInitPromise;
        
        audioInitPromise = (async () => {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            try {
                const response = await fetch('assets/audio/golden_hour.mp3');
                const arrayBuffer = await response.arrayBuffer();
                audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                audioInitialized = true;
            } catch (error) {
                console.error('Error loading audio:', error);
                audioInitPromise = null; // Allow retrying if it failed
            }
        })();
        
        return audioInitPromise;
    }

    // Call initAudio early to start downloading the audio file immediately
    initAudio();

    function playMusic() {
        if (!audioInitialized) {
            // Wait for the already-started initialization to finish
            initAudio().then(() => {
                if (audioBuffer) startAudio();
            });
        } else {
            startAudio();
        }
    }

    function startAudio() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        if (!sourceNode) {
            sourceNode = audioContext.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.loop = true;
            sourceNode.connect(audioContext.destination);
            sourceNode.start(0);
        }
        isMusicPlaying = true;
        updateMusicIcons();
    }

    function pauseMusic() {
        if (audioContext && audioContext.state === 'running') {
            audioContext.suspend();
        }
        isMusicPlaying = false;
        updateMusicIcons();
    }

    function updateMusicIcons() {
        if (isMusicPlaying) {
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
        } else {
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
        }
    }

    musicToggle.addEventListener('click', (e) => {
        e.preventDefault();
        if (isMusicPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    });

    // --- Page Visibility Logic ---
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (isMusicPlaying && audioContext && audioContext.state === 'running') {
                audioContext.suspend();
            }
        } else {
            if (isMusicPlaying && audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
        }
    });


    // --- Countdown Timer ---
    // Target date: Thursday, 28th May 2026 14:30:00 (2:30 PM)
    const targetDate = new Date("May 28, 2026 14:30:00").getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            // Event has passed
            daysEl.innerText = "00";
            hoursEl.innerText = "00";
            minutesEl.innerText = "00";
            secondsEl.innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Add leading zeros
        daysEl.innerText = days < 10 ? "0" + days : days;
        hoursEl.innerText = hours < 10 ? "0" + hours : hours;
        minutesEl.innerText = minutes < 10 ? "0" + minutes : minutes;
        secondsEl.innerText = seconds < 10 ? "0" + seconds : seconds;
    }

    // Initial call
    updateCountdown();
    // Update every second
    setInterval(updateCountdown, 1000);


    // --- Scroll Animations ---
    // Simple intersection observer to fade in elements as you scroll
    const animatedElements = document.querySelectorAll('.detail-block, .wish-item, .section-title');
    
    // Add fade-up class to them initially
    animatedElements.forEach(el => {
        el.classList.add('fade-up');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // Optional: stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px 0px -50px 0px"
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // --- Location Modal Logic ---
    const locationToggle = document.getElementById('location-toggle');
    const locationModal = document.getElementById('location-modal');
    const closeLocationModal = document.getElementById('close-location-modal');

    if (locationToggle && locationModal && closeLocationModal) {
        locationToggle.addEventListener('click', (e) => {
            e.preventDefault();
            locationModal.classList.remove('hidden');
        });

        closeLocationModal.addEventListener('click', () => {
            locationModal.classList.add('hidden');
        });

        // Close modal when clicking outside
        locationModal.addEventListener('click', (e) => {
            if (e.target === locationModal) {
                locationModal.classList.add('hidden');
            }
        });
    }

    // --- Particles System ---
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;

        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        setCanvasSize();

        window.addEventListener('resize', () => {
            setCanvasSize();
            initParticles();
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2.5 + 0.5; // 0.5 to 3 px
                this.speedX = Math.random() * 0.4 - 0.2; // -0.2 to 0.2 (slower drifting)
                this.speedY = Math.random() * 0.4 + 0.1; // 0.1 to 0.5 (falling downwards)
                // Snow-like color palette
                const colors = ['rgba(255, 255, 255, 0.9)', 'rgba(240, 248, 255, 0.7)', 'rgba(255, 250, 250, 0.6)', 'rgba(255, 255, 255, 0.4)'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Wrap around edges (snow falls down)
                if (this.y > canvas.height) {
                    this.y = 0 - this.size;
                    this.x = Math.random() * canvas.width;
                }
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Add a subtle glow
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.color;
            }
        }

        function initParticles() {
            particlesArray = [];
            let numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000); // Responsive amount
            if(numberOfParticles > 60) numberOfParticles = 60; // Cap it so it's not too much
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();
    }

});
