(function(window, document) {
    'use strict';

    // ---------------------------------
    // 滚动触发动画（根据 GEMINI.md）
    // ---------------------------------

    const DEFAULTS = {
        duration: 800,
        delay: 0,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transformFrom: 'translateY(20px)',
        opacityFrom: 0,
        transformTo: 'translateY(0)',
        opacityTo: 1,
    };

    function animate(element) {
        const duration = parseInt(element.dataset.animationDuration, 10) || DEFAULTS.duration;
        const delay = parseInt(element.dataset.animationDelay, 10) || DEFAULTS.delay;
        const easing = element.dataset.animationEasing || DEFAULTS.easing;
        const transformFrom = element.dataset.animationTransformFrom || DEFAULTS.transformFrom;
        const opacityFrom = parseFloat(element.dataset.animationOpacityFrom) || DEFAULTS.opacityFrom;

        const keyframes = [
            { transform: transformFrom, opacity: opacityFrom },
            { transform: DEFAULTS.transformTo, opacity: DEFAULTS.opacityTo }
        ];

        const options = {
            duration: duration,
            delay: delay,
            easing: easing,
            fill: 'forwards'
        };

        element.animate(keyframes, options);
    }

    const observer = new IntersectionObserver((entries, self) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target);
                self.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    function observeAll() {
        const elementsToAnimate = document.querySelectorAll('[data-animate-on-scroll]');
        elementsToAnimate.forEach(element => {
            element.style.opacity = DEFAULTS.opacityFrom.toString();
            if ('IntersectionObserver' in window) {
                observer.observe(element);
            } else {
                // fallback: simple on-scroll check
                element.classList.add('no-io');
            }
        });
    }

    // simple fallback for browsers without IntersectionObserver
    function fallbackScrollCheck() {
        const els = document.querySelectorAll('.no-io');
        const vh = window.innerHeight || document.documentElement.clientHeight;
        els.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < vh * 0.9) {
                animate(el);
                el.classList.remove('no-io');
            }
        });
        if (document.querySelectorAll('.no-io').length === 0) {
            window.removeEventListener('scroll', fallbackScrollCheck);
            window.removeEventListener('resize', fallbackScrollCheck);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        observeAll();
        if (!('IntersectionObserver' in window)) {
            window.addEventListener('scroll', fallbackScrollCheck, { passive: true });
            window.addEventListener('resize', fallbackScrollCheck);
            // run once in case some elements are already visible
            fallbackScrollCheck();
        }
    });

})(window, document);
