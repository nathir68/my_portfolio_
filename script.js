document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       3D BUSINESS CARD INTRO OVERLAY & TIMING
       ========================================================================== */
    const cardOverlay = document.getElementById('card-overlay');
    const introCard = document.getElementById('intro-card');
    const skipCardBtn = document.getElementById('skip-card-btn');

    let introTimeout;
    let fadeOutTimeout;
    let isIntroFinished = false;

    function finishIntro() {
        if (isIntroFinished) return;
        isIntroFinished = true;

        // Clear any pending timeouts
        clearTimeout(introTimeout);
        clearTimeout(fadeOutTimeout);

        // Stage 1: Card flies off-screen
        if (introCard) {
            introCard.classList.add('vanish');
        }

        // Stage 2: Overlay fades out and hides
        fadeOutTimeout = setTimeout(() => {
            if (cardOverlay) {
                cardOverlay.classList.add('fade-out');
            }
            // Enable scrolling on body once intro is done
            document.body.style.overflowY = '';
        }, 600);
    }

    // Lock scrolling on page load while intro runs
    document.body.style.overflowY = 'hidden';

    // Auto-vanish after 3 seconds
    introTimeout = setTimeout(finishIntro, 3000);

    // Skip Button Event
    if (skipCardBtn) {
        skipCardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            finishIntro();
        });
    }

    // 3D Parallax Tilt Effect on Intro Card
    if (cardOverlay && introCard) {
        cardOverlay.addEventListener('mousemove', (e) => {
            if (isIntroFinished) return;

            const overlayRect = cardOverlay.getBoundingClientRect();
            // Mouse position relative to the viewport center
            const x = e.clientX - overlayRect.left - overlayRect.width / 2;
            const y = e.clientY - overlayRect.top - overlayRect.height / 2;

            // Calculate tilt degrees (subtle rotation)
            const rotateX = -(y / (overlayRect.height / 2)) * 15; // max 15deg
            const rotateY = (x / (overlayRect.width / 2)) * 15; // max 15deg

            // Apply transform
            introCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        cardOverlay.addEventListener('mouseleave', () => {
            if (isIntroFinished) return;
            introCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    }

    /* ==========================================================================
       STICKY NAVBAR & MOBILE MENU TOGGLE
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Navbar on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close Menu when clicking a Nav Link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });


    /* ==========================================================================
       SCROLL REVEAL & NAV ACTIVE LINK HIGHLIGHTER
       ========================================================================== */
    const sections = document.querySelectorAll('section');
    
    // Intersection Observer for Scroll Reveal & Active Links
    const observerOptions = {
        root: null,
        threshold: 0.2, // Trigger when 20% of section is visible
        rootMargin: '0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Add visible class for scroll reveal
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Highlight corresponding nav link
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    // Observe all sections and fade-in elements
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    const fadeInUpElements = document.querySelectorAll('.fade-in-up');
    fadeInUpElements.forEach(el => {
        sectionObserver.observe(el);
    });


    /* ==========================================================================
       DYNAMIC AMBIENT BLOBS (MOUSE PARALLAX)
       ========================================================================== */
    const blobs = document.querySelectorAll('.blob');
    
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        // Move blobs slightly in opposite directions of mouse
        blobs.forEach((blob, idx) => {
            const speed = (idx + 1) * 20; // different speed for each blob
            blob.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px) scale(${1 + Math.abs(mouseX) * 0.1})`;
        });
    });


    /* ==========================================================================
       PROFILE CARD 3D TILT EFFECT
       ========================================================================== */
    const imageCard = document.getElementById('profile-tilt-card');
    
    if (imageCard) {
        imageCard.addEventListener('mousemove', (e) => {
            const cardRect = imageCard.getBoundingClientRect();
            
            // Mouse position relative to the card top-left
            const x = e.clientX - cardRect.left;
            const y = e.clientY - cardRect.top;
            
            // Normalized percentages (0 to 1)
            const px = x / cardRect.width;
            const py = y / cardRect.height;
            
            // Centered percentages (-0.5 to 0.5)
            const cx = px - 0.5;
            const cy = py - 0.5;
            
            // Calculate rotation angles
            const rotateX = cy * -15; // pitch
            const rotateY = cx * 15;  // yaw
            
            // Apply coordinates as CSS variables for highlight reflections
            imageCard.style.setProperty('--glow-x', `${px * 100}%`);
            imageCard.style.setProperty('--glow-y', `${py * 100}%`);
            
            // Apply rotation in 3D perspective space
            imageCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
        });

        imageCard.addEventListener('mouseleave', () => {
            imageCard.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
        });
    }


    /* ==========================================================================
       PROJECTS FILTERING
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Add simple fade-out/in transition
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95) translateY(10px)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        card.classList.remove('hide');
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1) translateY(0)';
                        }, 50);
                    } else {
                        card.classList.add('hide');
                    }
                }, 300);
            });
        });
    });


    /* ==========================================================================
       CONTACT FORM HANDLING (SIMULATION)
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const formSubmit = document.getElementById('form-submit');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Disable submit button and show loading state
            formSubmit.disabled = true;
            formSubmit.innerHTML = 'Sending Message... <i class="fas fa-spinner fa-spin" style="margin-left: 8px;"></i>';
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            // Simulate form submission API delay
            setTimeout(() => {
                const name = document.getElementById('form-name').value.trim();
                const email = document.getElementById('form-email').value.trim();
                const message = document.getElementById('form-message').value.trim();

                if (name && email && message) {
                    formStatus.textContent = `Thank you, ${name}! Your message has been sent successfully.`;
                    formStatus.classList.add('success');
                    contactForm.reset();
                } else {
                    formStatus.textContent = 'Oops! Please fill in all fields correctly.';
                    formStatus.classList.add('error');
                }

                // Reset button status
                formSubmit.disabled = false;
                formSubmit.innerHTML = 'Send Message <i class="fas fa-paper-plane" style="margin-left: 8px;"></i>';
            }, 1500);
        });
    }
});
