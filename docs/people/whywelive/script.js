// --- Navigation Logic ---
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// --- Section 1: Schopenhauer's Pendulum Logic ---
const pendulumCtx = document.getElementById('pendulumChart').getContext('2d');
const desireRange = document.getElementById('desireRange');
const stateText = document.getElementById('stateText');

const pendulumChart = new Chart(pendulumCtx, {
    type: 'doughnut',
    data: {
        labels: ['痛苦 (欲望未满)', '平静/平衡', '无聊 (欲望已满)'],
        datasets: [{
            data: [25, 50, 25], // Initial state
            backgroundColor: [
                '#ef4444', // Red for Pain
                '#e7e5e4', // Stone for Balance
                '#64748b'  // Slate for Boredom
            ],
            borderWidth: 0,
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { font: { family: "'Noto Sans SC', sans-serif" } }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.label;
                    }
                }
            }
        },
        cutout: '70%',
    }
});

desireRange.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    let painVal, balanceVal, boredomVal;
    let status = "";
    let statusColor = "";

    // Dynamic Logic based on Schopenhauer's concept
    if (val < 30) {
        // High Boredom
        boredomVal = 60 + (30 - val);
        painVal = 10;
        balanceVal = 100 - boredomVal - painVal;
        status = "感到空虚与无聊";
        statusColor = "text-slate-600";
    } else if (val > 70) {
        // High Pain
        painVal = 60 + (val - 70);
        boredomVal = 10;
        balanceVal = 100 - painVal - boredomVal;
        status = "感到焦虑与痛苦";
        statusColor = "text-red-600";
    } else {
        // Balance
        painVal = 20;
        boredomVal = 20;
        balanceVal = 60;
        status = "暂时的平静与麻木";
        statusColor = "text-stone-600";
    }

    // Update Chart
    pendulumChart.data.datasets[0].data = [painVal, balanceVal, boredomVal];
    pendulumChart.update();

    // Update Text
    stateText.textContent = `状态：${status}`;
    stateText.className = `p-4 bg-stone-50 rounded border border-stone-200 text-center font-serif text-lg transition-all duration-300 ${statusColor}`;
});

// --- Section 2: Logic of Suicide ---
const btnYes = document.getElementById('btn-suicide-yes');
const btnNo = document.getElementById('btn-suicide-no');
const respCard = document.getElementById('response-card');
const respTitle = document.getElementById('response-title');
const respText = document.getElementById('response-text');
const respIcon = document.getElementById('response-icon');

function showResponse(type) {
    respCard.classList.remove('opacity-50', 'pointer-events-none');
    respCard.classList.add('opacity-100');

    if (type === 'yes') {
        respIcon.textContent = "🛑";
        respTitle.textContent = "加缪的质疑：这是真诚的吗？";
        respText.textContent = "如果你真的相信人生不值得一活，为何还在这里？加缪讽刺那些谈笑间讨论虚无的人。如果你选择死亡，你就输给了荒诞。这并非反抗，而是逃避。";
        respCard.classList.add('border-l-4', 'border-red-500');
        respCard.classList.remove('border-accent-clay');
    } else {
        respIcon.textContent = "✨";
        respTitle.textContent = "加缪的答案：荒诞的英雄";
        respText.textContent = "既然人生十之八九不如意，你依然选择活下去。为什么？因为你在通过“活着”这件小事，对诸神进行最倔强的反抗。你成为了荒诞的主人。";
        respCard.classList.add('border-l-4', 'border-accent-clay');
        respCard.classList.remove('border-red-500');
    }
}

btnYes.addEventListener('click', () => showResponse('yes'));
btnNo.addEventListener('click', () => showResponse('no'));


// --- Section 3: Sisyphus Canvas Simulation ---
const canvas = document.getElementById('sisyphusCanvas');
const ctx = canvas.getContext('2d');
const pushBtn = document.getElementById('push-btn');
const heightDisplay = document.getElementById('height-val');
const pushCountDisplay = document.getElementById('push-count');
const overlay = document.getElementById('canvas-overlay');

// Set canvas resolution
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let rockState = {
    x: 50, // Starting X
    y: canvas.height - 30, // Starting Y (Bottom)
    radius: 15,
    progress: 0, // 0 to 1
    pushForce: 0.08, // How much progress per click
    gravity: 0.003, // Constant downward pull
    totalPushes: 0
};

// Draw Loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Hill (Triangle)
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, 50); // Peak
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fillStyle = '#e7e5e4'; // Stone-200
    ctx.fill();
    ctx.strokeStyle = '#a8a29e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Calculate Rock Position based on progress
    // Start: (20, height-20), End: (width-20, 50)
    const startX = 30;
    const startY = canvas.height - 30;
    const endX = canvas.width - 40;
    const endY = 40; // Top of hill margin

    rockState.x = startX + (endX - startX) * rockState.progress;
    rockState.y = startY + (endY - startY) * rockState.progress;

    // Draw Rock
    ctx.beginPath();
    ctx.arc(rockState.x, rockState.y, rockState.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#44403c'; // Stone-700
    ctx.fill();
    
    // Apply Gravity
    if (rockState.progress > 0) {
        rockState.progress -= rockState.gravity;
        if (rockState.progress < 0) rockState.progress = 0;
    }

    // Check if reached top (The Absurd Cycle)
    if (rockState.progress >= 1) {
        triggerFall();
    }

    // Update UI text
    heightDisplay.textContent = Math.floor(rockState.progress * 100);
    
    requestAnimationFrame(draw);
}

function triggerFall() {
    rockState.progress = 0;
    overlay.style.opacity = '1';
    setTimeout(() => {
        overlay.style.opacity = '0';
    }, 1000);
}

function pushRock() {
    rockState.progress += rockState.pushForce;
    rockState.totalPushes++;
    pushCountDisplay.textContent = rockState.totalPushes;
    
    if(rockState.progress > 1.05) rockState.progress = 1.05;
}

pushBtn.addEventListener('click', pushRock);
// Also allow spacebar
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent scroll
        pushRock();
    }
});

// Start animation
draw();


// --- Section 4: Rebellion Analysis (Radar Chart) ---
const rebellionCtx = document.getElementById('rebellionChart').getContext('2d');
new Chart(rebellionCtx, {
    type: 'radar',
    data: {
        labels: ['痛苦感知', '坚持毅力', '希望', '荒诞感', '反抗精神'],
        datasets: [{
            label: '西西弗斯的心灵',
            data: [80, 100, 60, 90, 100],
            fill: true,
            backgroundColor: 'rgba(180, 83, 9, 0.2)', // Accent Clay transparent
            borderColor: '#b45309',
            pointBackgroundColor: '#b45309',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#b45309'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: { color: '#e5e7eb' },
                grid: { color: '#e5e7eb' },
                pointLabels: {
                    font: {
                        size: 12,
                        family: "'Noto Sans SC', sans-serif"
                    },
                    color: '#4b5563'
                },
                suggestedMin: 0,
                suggestedMax: 100
            }
        },
        plugins: {
            legend: { display: false }
        }
    }
});

// Simple observer for entrance animation on new sections
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in-section').forEach(section => {
    observer.observe(section);
});
