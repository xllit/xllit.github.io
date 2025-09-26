document.addEventListener('DOMContentLoaded', function() {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // 为每个卡片添加关闭按钮和内容包装器
    document.querySelectorAll('.feature-card').forEach(card => {
        // 优化：使用 DocumentFragment 批量更新 DOM，减少重绘
        const fragment = document.createDocumentFragment();

        // 添加关闭按钮
        const closeBtn = document.createElement('div');
        closeBtn.className = 'close-btn';
        fragment.appendChild(closeBtn);

        // 包装现有内容
        const content = document.createElement('div');
        content.className = 'card-content';
        // 将卡片内现有元素移入内容容器
        while (card.firstChild) {
            content.appendChild(card.firstChild);
        }

        // 添加详细描述
        const details = document.createElement('div');
        details.className = 'card-details';
        details.innerHTML = `
            <h3>详细信息</h3>
            <p>${content.querySelector('.card-title').textContent}的详细描述...</p>
            <div class="details-content">
                <p>点击连接将会使您跳转到别的页面</p>
            </div>
        `;
        content.appendChild(details);
        fragment.appendChild(content);
        card.appendChild(fragment);

        // 添加点击展开事件
        card.addEventListener('click', function(e) {
            // 优化：防止在动画过程中重复点击，并确保不是点击关闭按钮
            if (!this.classList.contains('expanded') && !this.classList.contains('animating') && !e.target.closest('.close-btn')) {
                expandCard(this);
            }
        });

        // 添加关闭按钮事件
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡到卡片上
            collapseCard(this.closest('.feature-card'));
        });
    });

    // 展开卡片
    function expandCard(card) {
        // --- FLIP 动画技术 (展开) ---
        // 1. First: 记录初始状态
        const first = card.getBoundingClientRect();
        card._sourceRect = first; // 将初始位置信息存储在元素上，供关闭时使用

        // 2. Last: 添加 class，让元素在CSS中到达最终状态
        card.classList.add('expanded');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const last = card.getBoundingClientRect();

        // 3. Invert: 计算初始和最终状态的差异
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;
        const deltaW = first.width / last.width;
        const deltaH = first.height / last.height;

        // 4. Play: 应用反向变换，让元素看起来还在初始位置
        card.style.transformOrigin = 'top left';
        card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;

        // 在下一帧，移除反向变换，让其平滑过渡到最终状态
        requestAnimationFrame(() => {
            card.classList.add('animating');
            card.style.transform = '';
        });

        // 动画结束后清理行内样式和状态
        card.addEventListener('transitionend', () => {
            card.classList.remove('animating');
            card.style.transformOrigin = '';
        }, { once: true });
    }

    // 收起卡片
    function collapseCard(card) {
        // --- FLIP 动画技术 (收起) ---
        // 1. First: 获取当前展开状态的位置
        const first = card.getBoundingClientRect();
        
        // 2. Last: 获取目标位置 (即展开前的原始位置)
        const last = card._sourceRect;

        // 计算从目标位置到当前位置的变换，这是我们动画的起点
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;
        const deltaW = first.width / last.width;
        const deltaH = first.height / last.height;

        // 移除 expanded 类，让卡片回到其在文档流中的原始样式和位置
        card.classList.remove('expanded');
        
        // 3. Invert & 4. Play:
        // 立即应用变换，让卡片看起来“好像”还在展开的位置
        card.style.transformOrigin = 'top left';
        card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;

        // 触发遮罩层和页面滚动的恢复
        overlay.classList.remove('active');
        document.body.style.overflow = '';

        // 在下一帧，添加动画类并移除变换，让其平滑地回到原始位置
        requestAnimationFrame(() => {
            card.classList.add('animating');
            card.style.transform = '';
        });

        // 动画结束后清理
        card.addEventListener('transitionend', () => {
            card.classList.remove('animating');
            card.style.transformOrigin = '';
            card.style.transform = ''; // 确保清理
        }, { once: true });
    }

    // 点击遮罩层关闭
    overlay.addEventListener('click', function() {
        const expandedCard = document.querySelector('.feature-card.expanded');
        if (expandedCard) {
            collapseCard(expandedCard);
        }
    });

    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const expandedCard = document.querySelector('.feature-card.expanded');
            if (expandedCard) {
                collapseCard(expandedCard);
            }
        }
    });
});