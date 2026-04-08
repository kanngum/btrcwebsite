/* ================================================
   BTRC - Bamenda Technological Research Center
   Main JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initNavigation();
    initScrollReveal();
    initCounters();
    initSlider();
    initSmoothScroll();
    initFormValidation();
});

/* ================================================
   NAVIGATION
   ================================================ */
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    // Scroll effect for navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function() {
            navbarToggle.classList.toggle('active');
            navbarMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navbarMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navbarToggle.contains(e.target) && !navbarMenu.contains(e.target)) {
                navbarToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking on a link
        const menuLinks = navbarMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // Set active link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/* ================================================
   SCROLL REVEAL ANIMATIONS
   ================================================ */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    if (revealElements.length === 0) return;
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    };
    
    // Initial check
    revealOnScroll();
    
    // Scroll event
    window.addEventListener('scroll', revealOnScroll);
}

/* ================================================
   ANIMATED COUNTERS
   ================================================ */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number, .dashboard-card h3');
    
    if (counters.length === 0) return;
    
    let countersAnimated = false;
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target') || counter.innerText.replace(/\D/g, ''));
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        const duration = 2000; // Animation duration in ms
        const increment = target / (duration / 16); // 60fps
        
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            
            if (current < target) {
                counter.innerText = prefix + Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = prefix + target + suffix;
            }
        };
        
        updateCounter();
    };
    
    const startCounters = () => {
        if (countersAnimated) return;
        
        const statsSection = document.querySelector('.stats');
        if (!statsSection) {
            counters.forEach(counter => animateCounter(counter));
            countersAnimated = true;
            return;
        }
        
        const statsSectionTop = statsSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (statsSectionTop < windowHeight - 100) {
            counters.forEach(counter => animateCounter(counter));
            countersAnimated = true;
        }
    };
    
    // Initial check
    startCounters();
    
    // Scroll event
    window.addEventListener('scroll', startCounters);
}

/* ================================================
   PROJECT SLIDER
   ================================================ */
function initSlider() {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const sliderDots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');
    
    if (!sliderWrapper) return;
    
    const slides = sliderWrapper.querySelectorAll('.project-slide');
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let slideInterval;
    const totalSlides = slides.length;
    
    // Function to go to specific slide
    const goToSlide = (index) => {
        currentSlide = index;
        
        if (currentSlide >= totalSlides) currentSlide = 0;
        if (currentSlide < 0) currentSlide = totalSlides - 1;
        
        sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update dots
        sliderDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    };
    
    // Next slide
    const nextSlide = () => {
        goToSlide(currentSlide + 1);
    };
    
    // Previous slide
    const prevSlide = () => {
        goToSlide(currentSlide - 1);
    };
    
    // Auto slide
    const startAutoSlide = () => {
        slideInterval = setInterval(nextSlide, 5000);
    };
    
    const stopAutoSlide = () => {
        clearInterval(slideInterval);
    };
    
    // Event listeners for arrows
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    // Event listeners for dots
    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });
    
    // Pause on hover
    sliderWrapper.addEventListener('mouseenter', stopAutoSlide);
    sliderWrapper.addEventListener('mouseleave', startAutoSlide);
    
    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    
    sliderWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    }, { passive: true });
    
    sliderWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoSlide();
    }, { passive: true });
    
    const handleSwipe = () => {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    };
    
    // Initialize
    goToSlide(0);
    startAutoSlide();
}

/* ================================================
   SMOOTH SCROLLING
   ================================================ */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ================================================
   FORM VALIDATION
   ================================================ */
function initFormValidation() {
    const contactForm = document.querySelector('.contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        const formGroups = this.querySelectorAll('.form-group');
        
        // Reset previous errors
        formGroups.forEach(group => {
            group.classList.remove('error');
        });
        
        // Validate each field
        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            const label = group.querySelector('label');
            
            if (input && label) {
                const fieldName = label.textContent.toLowerCase();
                
                // Required validation
                if (input.hasAttribute('required') && !input.value.trim()) {
                    showError(group, `${fieldName} is required`);
                    isValid = false;
                    return;
                }
                
                // Email validation
                if (input.type === 'email' && input.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        showError(group, 'Please enter a valid email address');
                        isValid = false;
                        return;
                    }
                }
                
                // Phone validation (if applicable)
                if (input.type === 'tel' && input.value.trim()) {
                    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                    if (!phoneRegex.test(input.value)) {
                        showError(group, 'Please enter a valid phone number');
                        isValid = false;
                        return;
                    }
                }
                
                // Minimum length validation
                if (input.minLength && input.value.length < input.minLength) {
                    showError(group, `${fieldName} must be at least ${input.minLength} characters`);
                    isValid = false;
                    return;
                }
            }
        });
        
        if (isValid) {
            // Show success message
            const formSuccess = this.querySelector('.form-success');
            if (formSuccess) {
                formSuccess.classList.add('show');
                
                // Reset form
                this.reset();
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    formSuccess.classList.remove('show');
                }, 5000);
            }
        }
    });
    
    // Real-time validation
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const group = this.closest('.form-group');
            const label = group.querySelector('label');
            
            if (this.hasAttribute('required') && !this.value.trim()) {
                showError(group, `${label.textContent.toLowerCase()} is required`);
            } else if (this.type === 'email' && this.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.value)) {
                    showError(group, 'Please enter a valid email address');
                } else {
                    group.classList.remove('error');
                }
            } else {
                group.classList.remove('error');
            }
        });
        
        // Remove error on input
        input.addEventListener('input', function() {
            const group = this.closest('.form-group');
            group.classList.remove('error');
        });
    });
    
    function showError(group, message) {
        group.classList.add('error');
        let errorElement = group.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            group.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }
}

/* ================================================
   NEWSLETTER FORM
   ================================================ */
function initNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        
        if (emailInput && emailInput.value.trim()) {
            // Show success (in real scenario, this would send to server)
            alert('Thank you for subscribing to our newsletter!');
            emailInput.value = '';
        }
    });
}

// Initialize newsletter
document.addEventListener('DOMContentLoaded', initNewsletter);

/* ================================================
   PAGINATION
   ================================================ */
function initPagination() {
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    
    if (paginationBtns.length === 0) return;
    
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Don't do anything for active or disabled buttons
            if (this.classList.contains('active') || this.disabled) return;
            
            const page = this.getAttribute('data-page');
            
            if (page) {
                // Update active state
                paginationBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Scroll to content
                const postsGrid = document.querySelector('.posts-grid');
                if (postsGrid) {
                    postsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// Initialize pagination
document.addEventListener('DOMContentLoaded', initPagination);

/* ================================================
   PROGRESS BARS
   ================================================ */
function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    if (progressBars.length === 0) return;
    
    let animated = false;
    
    const animateProgress = () => {
        if (animated) return;
        
        const progressSection = document.querySelector('.progress-section');
        if (!progressSection) {
            progressBars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-width');
                if (targetWidth) {
                    bar.style.width = targetWidth;
                }
            });
            animated = true;
            return;
        }
        
        const sectionTop = progressSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight - 100) {
            progressBars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-width');
                if (targetWidth) {
                    bar.style.width = targetWidth;
                }
            });
            animated = true;
        }
    };
    
    // Initial check
    animateProgress();
    
    // Scroll event
    window.addEventListener('scroll', animateProgress);
}

// Initialize progress bars
document.addEventListener('DOMContentLoaded', initProgressBars);

/* ================================================
   MOBILE MENU ACTIVE LINK
   ================================================ */
function setActiveLink() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';
    
    const navLinks = document.querySelectorAll('.navbar-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href === pageName || (pageName === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize active link
document.addEventListener('DOMContentLoaded', setActiveLink);

/* ================================================
   UTILITY FUNCTIONS
   ================================================ */

// Debounce function for scroll events
function debounce(func, wait = 10, immediate = true) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Throttle function for resize events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for use in other scripts
window.BTRC = {
    debounce,
    throttle
};
