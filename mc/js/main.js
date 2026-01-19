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
        if (bgLayer.style.opacity === '1') {
            bgLayer.style.opacity = 0;
        }
        setTimeout(() => {
            bgLayer.style.backgroundImage = `url(${bgPath}/${img})`;
            bgLayer.style.opacity = 1;
        }, 800);
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

    const DEFAULTS = {
        duration: 600,
        delay: 0,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transformFrom: 'translateY(30px)',
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
    }, { threshold: 0.1 });


    // 页面加载完成后执行
    document.addEventListener('DOMContentLoaded', () => {
        // 初始化背景轮换
        randomBg();
        setInterval(randomBg, 60000);

        // 初始化滚动动画元素
        const elementsToAnimate = document.querySelectorAll('[data-animate-on-scroll]');
        elementsToAnimate.forEach(element => {
            element.style.opacity = DEFAULTS.opacityFrom;
            observer.observe(element);
        });

        // ---------------------------------
        // 新增：自动隐藏导航栏 & 浮动效果
        // ---------------------------------
        const nav = document.querySelector('.nav');
        if (nav) {
            let lastScrollY = window.scrollY;
            window.addEventListener('scroll', () => {
                if (window.scrollY > 10) {
                    nav.classList.add('sticky');
                } else {
                    nav.classList.remove('sticky');
                }

                if (window.scrollY > lastScrollY && window.scrollY > 200) {
                    nav.style.transform = 'translateY(-120%)'; // 向下滚动时隐藏
                } else {
                    nav.style.transform = 'translateY(0)'; // 向上滚动时显示
                }
                lastScrollY = window.scrollY;
            });
        }
        
        // ---------------------------------
        // 新增：客户端模态框 (Modal)
        // ---------------------------------
        const modal = document.getElementById('client-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const clientBtns = document.querySelectorAll('.client-btn');
        const closeModalBtn = document.querySelector('.modal-close-btn');

        const clientDetails = {
            '电脑版': {
                title: '💻 电脑版客户端',
                body: '<p>推荐使用最新版本的 Java 版 Minecraft 客户端。</p><p>请将服务器地址 <strong>106.53.104.199</strong> 添加到您的服务器列表。期待您的加入！</p>'
            },
            '手机版': {
                title: '📱 手机版客户端',
                body: '<p>手机版玩家 (BE) 请在服务器页面点击 "添加服务器"。</p><p>服务器名称：落雨岛<br>服务器地址：106.53.104.199<br>端口：19132</p><p>填写完毕后即可加入。</p>'
            }
        };

        function openModal(type) {
            const details = clientDetails[type];
            if (!details || !modal) return;
            
            modalTitle.innerHTML = details.title;
            modalBody.innerHTML = details.body;
            modal.classList.add('visible');
        }

        function closeModal() {
            if (!modal) return;
            modal.classList.remove('visible');
        }

        clientBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.innerText.includes('电脑版') ? '电脑版' : '手机版';
                openModal(type);
            });
        });

        if(closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }
        if(modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
    });

})(window, document);