const bgLayer = document.getElementById("bg-layer");
const bgPath = "/mc/pic";
const bgList = [
  "bg1.png",
  "bg2.png",
  "bg3.png"
  // 你可以继续加
];

function randomBg() {
  const img = bgList[Math.floor(Math.random() * bgList.length)];
  bgLayer.style.opacity = 0;

  setTimeout(() => {
    bgLayer.style.backgroundImage = `url(${bgPath + img})`;
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
  navigator.clipboard.writeText(ip);
  alert("IP 已复制！");
}

// 菜单点击处理
document.querySelectorAll('.menu a').forEach(link => {
  link.addEventListener('click', function(e) {
    // 移除所有active
    document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
    // 添加active到当前
    this.classList.add('active');
  });
});

