document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.overlay');
    const isCalculatorPage = document.body.classList.contains('calculator-page');
    
    // Function to check if mobile menu should be shown
    function shouldShowMobileMenu() {
        // Show mobile menu if width <= 768px OR in landscape with height <= 500px
        return window.innerWidth <= 768 || (window.innerHeight <= 500 && window.matchMedia('(orientation: landscape)').matches);
    }
    
    // Special handling for calculator page
    if (isCalculatorPage) {
        const navLinks = document.querySelector('.nav-links');
        
        // Initial state setup for calculator page
        if (shouldShowMobileMenu()) {
            menuToggle.style.display = 'flex';
            if (navLinks) navLinks.style.display = 'none';
        } else {
            menuToggle.style.display = 'none';
            if (navLinks) navLinks.style.display = 'flex';
        }
        
        // Handle resize events for calculator page
        window.addEventListener('resize', function() {
            if (shouldShowMobileMenu()) {
                menuToggle.style.display = 'flex';
                if (navLinks) navLinks.style.display = 'none';
            } else {
                menuToggle.style.display = 'none';
                if (navLinks) navLinks.style.display = 'flex';
            }
        });
    } else {
        // Regular pages handling
        // Initial check for menu visibility
        if (shouldShowMobileMenu()) {
            menuToggle.style.display = 'flex';
        } else {
            menuToggle.style.display = 'none';
        }
        
        // Check visibility on resize and orientation change
        window.addEventListener('resize', function() {
            if (shouldShowMobileMenu()) {
                menuToggle.style.display = 'flex';
            } else {
                menuToggle.style.display = 'none';
            }
        });
    }
    
    // Also listen for orientation changes explicitly
    window.addEventListener('orientationchange', function() {
        if (isCalculatorPage) {
            const navLinks = document.querySelector('.nav-links');
            if (shouldShowMobileMenu()) {
                menuToggle.style.display = 'flex';
                if (navLinks) navLinks.style.display = 'none';
            } else {
                menuToggle.style.display = 'none';
                if (navLinks) navLinks.style.display = 'flex';
            }
        } else {
            if (shouldShowMobileMenu()) {
                menuToggle.style.display = 'flex';
            } else {
                menuToggle.style.display = 'none';
            }
        }
    });
    
    // Toggle mobile menu when hamburger is clicked
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    // Close menu when overlay is clicked
    overlay.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Close menu when a link is clicked
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
}); 