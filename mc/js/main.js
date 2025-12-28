const bgLayer = document.getElementById("bg-layer");
const bgPath = "/mc/pic";
const bgList = [
  "bg1.png",
  "bg2.png",
  "bg3.png"
];

function randomBg() {
  const img = bgList[Math.floor(Math.random() * bgList.length)];
  bgLayer.style.transition = "opacity 0.8s ease";
  bgLayer.style.opacity = 0;
  setTimeout(() => {
    bgLayer.style.backgroundImage = `url(${bgPath}/${img})`;
    bgLayer.style.opacity = 1;
  }, 800);
}

// 初始随机
randomBg();

// 每 60 秒轮换
setInterval(randomBg, 60000);

// 复制 IP
function copyIP() {
  const ip = document.getElementById("server-ip").innerText;
  navigator.clipboard.writeText(ip).then(() => alert("IP 已复制！"));
}

// 菜单点击处理
document.querySelectorAll('.menu a').forEach(link => {
  link.addEventListener('click', function(e) {
    document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
    this.classList.add('active');
  });
});

// 主题切换
document.querySelector('.theme-btn').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

