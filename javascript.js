// ─── PARALLAX SCROLL ───
(function() {
    const wrapper = document.querySelector('.plx-wrapper');
    const bg      = document.querySelector('.plx-bg');
    const content = document.querySelector('.plx-content');
    const hint    = document.querySelector('.plx-scroll-hint');

    if (!wrapper) return;

    function updateParallax() {
        const rect      = wrapper.getBoundingClientRect();
        const maxScroll = Math.max(1, wrapper.offsetHeight - window.innerHeight);
        const scrolled  = -rect.top;

        // Clamp progress instead of early-returning (Bug 4 + Bug 5 fixed)
        const progress = Math.max(0, Math.min(1, scrolled / maxScroll));

        // Background drifts UP using the bottom buffer (Bug 2 + Bug 3 fixed)
        // Safe max ≈ 8.3% — using 7% for margin
        if (bg) {
            bg.style.transform = `translateY(${-progress * 7}%)`;
        }

        // Text drifts up and fades
        if (content) {
            content.style.transform = `translateX(-50%) translateY(${-progress * 100}px)`;
            content.style.opacity   = (1 - progress * 0.9).toFixed(2);
        }

        // Hide scroll hint after user starts scrolling
        if (hint) {
            hint.style.opacity = Math.max(0, 1 - progress * 3).toFixed(2);
        }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });   // ← perf win, prevents scroll jank

    window.addEventListener('resize', updateParallax);
    updateParallax();
})();


// ─── IMAGE CAROUSEL ───
(function() {
    const leftBtn  = document.querySelector('.plx-arrow-left');
    const rightBtn = document.querySelector('.plx-arrow-right');
    const items    = document.querySelectorAll('.plx-item');

    if (!leftBtn || !rightBtn || !items.length) return;

    let animating = false;

    function rotate(direction) {
        if (animating) return;
        animating = true;

        items.forEach(item => {
            if (direction === 'next') {
                if (item.classList.contains('pos-right')) {
                    item.classList.replace('pos-right', 'pos-center');
                } else if (item.classList.contains('pos-center')) {
                    item.classList.replace('pos-center', 'pos-left');
                } else if (item.classList.contains('pos-left')) {
                    item.classList.replace('pos-left', 'pos-right');
                }
            } else {
                if (item.classList.contains('pos-left')) {
                    item.classList.replace('pos-left', 'pos-center');
                } else if (item.classList.contains('pos-center')) {
                    item.classList.replace('pos-center', 'pos-right');
                } else if (item.classList.contains('pos-right')) {
                    item.classList.replace('pos-right', 'pos-left');
                }
            }
        });

        // Bug 6 fix: unlock on real transition end, with a fallback timer
        const centerItem = document.querySelector('.plx-item.pos-center');
        let unlocked = false;

        const unlock = () => {
            if (unlocked) return;
            unlocked = true;
            animating = false;
        };

        if (centerItem) {
            centerItem.addEventListener('transitionend', unlock, { once: true });
        }
        setTimeout(unlock, 1000);   // safety fallback
    }

    leftBtn.addEventListener('click', () => rotate('prev'));
    rightBtn.addEventListener('click', () => rotate('next'));
})();