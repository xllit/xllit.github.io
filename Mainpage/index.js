// 获取相关元素
const playerBtn = document.querySelector('.player-btn');
const playList = document.querySelector('.play-list');
const playPauseBtn = document.getElementById('playPause');
const audioPlayer = document.querySelector('audio'); // 确保有音频播放器元素
let isExpanded = false;

// 添加点击事件监听器
playerBtn.addEventListener('click', () => {
    if (isExpanded) {
        // 收起播放器
        playerBtn.classList.remove('expanded');
        playList.classList.remove('active');
        // 隐藏播放控件
        document.querySelector('.player-controls').style.display = 'none';
        isExpanded = false;
    } else {
        // 展开播放器
        playerBtn.classList.add('expanded');
        playList.classList.add('active');
        // 显示播放控件
        document.querySelector('.player-controls').style.display = 'flex';
        isExpanded = true;
    }
});

// 确保按钮点击时音乐继续播放
playPauseBtn.addEventListener('click', () => {
    if (audioPlayer) {
        if (audioPlayer.paused) {
            audioPlayer.play(); // 播放音乐
            playPauseBtn.textContent = '❚❚'; // 更改为暂停图标
        } else {
            audioPlayer.pause(); // 暂停音乐
            playPauseBtn.textContent = '▶️'; // 更改为播放图标
        }
    }
});
