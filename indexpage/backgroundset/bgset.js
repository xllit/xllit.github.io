const bgCount = 2; // 图片数量，请确保 background 文件夹内有 1.png、2.png
const bgFolder = 'indexpage/background/';
const bgSwitchInterval = 60000; // 背景切换间隔
let currentBg = 0;
let bgDivA, bgDivB, isAActive = true;

// 随机获取背景图片索引，排除上一次的索引
function getRandomBgIndex(exclude) {
    let idx;
    do {
        idx = Math.floor(Math.random() * bgCount) + 1;
    } while (idx === exclude);
    return idx;
}

// 预加载图片并进行淡入淡出切换
function preloadAndSetBg(index) {
    const activeDiv = isAActive ? bgDivA : bgDivB;
    const inactiveDiv = isAActive ? bgDivB : bgDivA;
    const imgUrl = `${bgFolder}${index}.png`;
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
        inactiveDiv.style.backgroundImage = `url('${imgUrl}')`;
        inactiveDiv.classList.add('active');
        activeDiv.classList.remove('active');
        currentBg = index;
        isAActive = !isAActive;
    };
}

window.addEventListener('DOMContentLoaded', () => {
    // 动态创建两个背景层
    bgDivA = document.createElement('div');
    bgDivB = document.createElement('div');
    bgDivA.className = 'bg-fade active';
    bgDivB.className = 'bg-fade';
    document.body.prepend(bgDivB);
    document.body.prepend(bgDivA);
    
    // 初始化第一个背景
    const firstIndex = getRandomBgIndex(0);
    bgDivA.style.backgroundImage = `url('${bgFolder}${firstIndex}.png')`;
    currentBg = firstIndex;
    
    // 定时切换背景
    setInterval(() => {
        const nextIndex = getRandomBgIndex(currentBg);
        preloadAndSetBg(nextIndex);
    }, bgSwitchInterval);
});