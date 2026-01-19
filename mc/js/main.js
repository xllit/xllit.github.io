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

        // 1. 选择一张新图片
        const imgName = bgList[Math.floor(Math.random() * bgList.length)];
        const newImgSrc = `${bgPath}/${imgName}`;

        // 如果新图片和当前图片相同，则不执行任何操作 (对于只有两张图片的情况，这会减少不必要的刷新)
        if (bgLayer.style.backgroundImage.includes(newImgSrc)) {
            return;
        }

        // 2. 在后台预加载新图片
        const img = new Image();
        img.src = newImgSrc;

        // 3. 当图片加载成功后执行切换动画
        img.onload = () => {
            // a. 淡出当前背景
            bgLayer.style.opacity = 0;
            
            // b. 在淡出动画（800ms）结束后，更换图片并淡入
            setTimeout(() => {
                bgLayer.style.backgroundImage = `url(${newImgSrc})`;
                bgLayer.style.opacity = 1;
            }, 800); // 这个时间必须和CSS中的 transition-duration 一致
        };

        // 4. 处理图片加载失败的情况
        img.onerror = () => {
            console.error(`背景图片加载失败: ${newImgSrc}`);
        };
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
        themeBtn.addEventListener('click', (e) => {
            const isDark = document.body.classList.contains('dark');

            // 浏览器不支持 View Transitions API 或设置了 prefers-reduced-motion
            if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.body.classList.toggle('dark');
                themeBtn.innerText = isDark ? '🌙' : '☀️';
                return;
            }

            // 获取点击位置
            const x = e.clientX;
            const y = e.clientY;
            // 计算到最远角的距离，作为最终的半径
            const endRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            // 开始视图过渡
            const transition = document.startViewTransition(() => {
                document.body.classList.toggle('dark');
                themeBtn.innerText = isDark ? '🌙' : '☀️';
            });

            // 当新旧DOM都准备好，可以开始动画
            transition.ready.then(() => {
                // 使用 Web Animations API 制作剪裁动画
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0% at ${x}px ${y}px)`,
                            `circle(${endRadius}px at ${x}px ${y}px)`
                        ]
                    },
                    {
                        duration: 500, // 动画时长
                        easing: 'ease-in-out', // 缓动函数
                        // 指定要应用动画的伪元素
                        pseudoElement: '::view-transition-new(root)'
                    }
                );
            });
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