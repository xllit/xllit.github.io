const photoCount = 5; // 修改为你的图片数量
const photos = Array.from({length: photoCount}, (_, i) => `index/photos/${i+1}.jpg`);
const slideshow = document.querySelector('.bg-slideshow');
let current = 0;

// 初始化图片元素
photos.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    if (i === 0) img.classList.add('active');
    slideshow.appendChild(img);
});
const imgs = slideshow.querySelectorAll('img');

setInterval(() => {
    imgs[current].classList.remove('active');
    current = (current + 1) % imgs.length;
    imgs[current].classList.add('active');
}, 60000); // 1分钟切换