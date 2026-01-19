(function(window, document) {
    'use strict';

    // -------------------
    // 现有功能
    // -------------------

    // 随机背景
    const bgLayer = document.getElementById("bg-layer");
    const bgPath = "pic"; // 相对路径
    const bgList = [
        "bg1.png",
        "bg2.png"
    ];

    function randomBg() {
        if (!bgLayer) return;
        const img = bgList[Math.floor(Math.random() * bgList.length)];
        // 使用淡出淡入效果，而不是直接改变透明度
        if (bgLayer.style.opacity === '1') {
            bgLayer.style.opacity = 0;
        }
        setTimeout(() => {
            bgLayer.style.backgroundImage = `url(${bgPath}/${img})`;
            bgLayer.style.opacity = 1;
        }, 800); // 等待淡出完成
    }

    // 复制 IP
    const copyIpBtn = document.getElementById('copy-ip-btn');
    if (copyIpBtn) {
        copyIpBtn.addEventListener('click', () => {
            const ip = document.getElementById("server-ip").innerText;
            navigator.clipboard.writeText(ip).then(() => {
                const originalText = copyIpBtn.innerText;
                copyIpBtn.innerText = "已复制!";
                setTimeout(() => {
                    copyIpBtn.innerText = originalText;
                }, 1500);
            });
        });
    }


    // 菜单点击处理
    const menuLinks = document.querySelectorAll('.menu a');
    if (menuLinks.length > 0) {
        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                menuLinks.forEach(a => a.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }


    // 主题切换
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark');
        });
    }

    // ---------------------------------
    // 新增：滚动触发动画（根据 GEMINI.md）
    // ---------------------------------

    // 1. 定义默认动画配置参数
    const DEFAULTS = {
        duration: 600, // 动画时长 (毫秒)
        delay: 0, // 动画延迟 (毫秒)
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // 更平滑的缓动
        transformFrom: 'translateY(30px)', // 起始 Transform 状态
        opacityFrom: 0, // 起始透明度
        transformTo: 'translateY(0)', // 结束 Transform 状态
        opacityTo: 1, // 结束透明度
    };

    /**
     * 2. 动画函数
     * @param {HTMLElement} element - 需要应用动画的DOM元素
     */
    function animate(element) {
        // 从元素的 data-* 属性读取自定义配置，如果不存在则使用默认值
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

    /**
     * 3. 使用 Intersection Observer API 监听元素是否进入视区
     */
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


    // 页面加载完成后执行
    document.addEventListener('DOMContentLoaded', () => {
        // 初始化背景轮换
        randomBg();
        setInterval(randomBg, 60000);

        // 初始化动画元素
        const elementsToAnimate = document.querySelectorAll('[data-animate-on-scroll]');
        elementsToAnimate.forEach(element => {
            element.style.opacity = DEFAULTS.opacityFrom;
            observer.observe(element);
        });
    });

})(window, document);