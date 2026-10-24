// --- EXISTING SLIDER CODE ---
const slides = document.querySelectorAll(".slide");
let slideIndex = 0;

setInterval(() => {
    slides.forEach(s => s.classList.remove("active"));
    slides[slideIndex].classList.add("active");
    slideIndex = (slideIndex + 1) % slides.length;
}, 4000);
function changeLanguage() {
        const langSelect = document.getElementById('lang-select');
        const selectedLang = langSelect.value;
        
        if (selectedLang !== 'index.html') {
            window.location.href = selectedLang;
        }
        // If English is selected, stay on current page (index.html)
    }

    // Set current language as selected
    document.addEventListener('DOMContentLoaded', function() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const langSelect = document.getElementById('lang-select');
        for (let option of langSelect.options) {
            if (option.value === currentPath) {
                option.selected = true;
                break;
            }
        }
    });
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Optional: Hamburger ko 'X' shape me badalne ke liye
        menuToggle.classList.toggle('is-active');
    });

    // Bahar click karne par menu band ho jaye
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
