/**
 * Image Lazy Loading and Optimization
 * Automatically applies lazy loading to all images in blog posts
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        rootMargin: '50px 0px',
        threshold: 0.01,
        loadedClass: 'loaded',
        loadingClass: 'loading'
    };

    /**
     * Initialize lazy loading for all images
     */
    function initLazyLoading() {
        // Get all images in the content area that aren't already processed
        const images = document.querySelectorAll('article img:not([data-lazy-processed])');

        if ('IntersectionObserver' in window) {
            // Use IntersectionObserver for modern browsers
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, config);

            images.forEach(img => {
                // Skip images that are already loaded
                if (!img.complete) {
                    prepareImage(img);
                    imageObserver.observe(img);
                }
                img.setAttribute('data-lazy-processed', 'true');
            });
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                loadImage(img);
                img.setAttribute('data-lazy-processed', 'true');
            });
        }
    }

    /**
     * Prepare image for lazy loading
     */
    function prepareImage(img) {
        // Add loading attribute if not present
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }

        // Add decoding attribute for better performance
        if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }

        // Add loading class for visual feedback
        img.classList.add(config.loadingClass);

        // Store original src if data-src is used
        if (img.dataset.src && !img.src) {
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        }
    }

    /**
     * Load the actual image
     */
    function loadImage(img) {
        // If using data-src pattern
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }

        // If using data-srcset pattern
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
        }

        // Remove loading class and add loaded class
        img.classList.remove(config.loadingClass);
        img.classList.add(config.loadedClass);

        // Trigger custom event
        img.dispatchEvent(new CustomEvent('lazyloaded', {
            bubbles: true,
            detail: { img }
        }));
    }

    /**
     * Add responsive image support
     */
    function makeImagesResponsive() {
        const contentImages = document.querySelectorAll('article img:not([data-responsive-processed])');

        contentImages.forEach(img => {
            // Ensure max-width is set for responsive behavior
            if (!img.style.maxWidth && !img.classList.contains('no-responsive')) {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
            }

            // Add alt text if missing
            if (!img.alt && img.src) {
                const filename = img.src.split('/').pop().split('.')[0];
                img.alt = filename.replace(/[-_]/g, ' ');
            }

            img.setAttribute('data-responsive-processed', 'true');
        });
    }

    /**
     * WebP support detection and fallback
     */
    function checkWebPSupport() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    /**
     * Convert image sources to WebP if supported
     */
    async function enableWebPIfSupported() {
        const supportsWebP = await checkWebPSupport();

        if (supportsWebP) {
            document.documentElement.classList.add('webp-supported');

            // Convert applicable images to use WebP
            const images = document.querySelectorAll('article img[src$=".jpg"], article img[src$=".jpeg"], article img[src$=".png"]');

            images.forEach(img => {
                const originalSrc = img.src;
                const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');

                // Check if WebP version exists by attempting to load it
                const testImg = new Image();
                testImg.onload = () => {
                    // WebP version exists, update the source
                    img.dataset.originalSrc = originalSrc;
                    img.src = webpSrc;
                };
                testImg.onerror = () => {
                    // WebP version doesn't exist, keep original
                    console.log(`WebP version not found for: ${originalSrc}`);
                };
                testImg.src = webpSrc;
            });
        }
    }

    /**
     * Initialize everything when DOM is ready
     */
    function init() {
        initLazyLoading();
        makeImagesResponsive();
        enableWebPIfSupported();

        // Re-run on dynamic content changes
        const observer = new MutationObserver(() => {
            initLazyLoading();
            makeImagesResponsive();
        });

        const content = document.querySelector('main, article, .content');
        if (content) {
            observer.observe(content, {
                childList: true,
                subtree: true
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API for manual trigger
    window.imageLazyLoad = {
        init,
        loadImage,
        checkWebPSupport
    };
})();

// Add necessary CSS
const style = document.createElement('style');
style.textContent = `
    /* Loading state for images */
    img.loading {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: img-loading 1.5s ease-in-out infinite;
    }

    img.loaded {
        background: none;
        animation: none;
        transition: opacity 0.3s ease;
    }

    @keyframes img-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    /* Ensure images don't exceed container width */
    article img,
    .content img {
        max-width: 100%;
        height: auto;
    }

    /* Dark mode adjustments */
    body.dark img.loading {
        background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    }
`;
document.head.appendChild(style);