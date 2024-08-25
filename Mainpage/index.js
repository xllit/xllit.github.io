document.addEventListener('DOMContentLoaded', () => {
    const playerBtn = document.querySelector('.player-btn');
    const playList = document.getElementById('playList');
    const playPause = document.getElementById('playPause');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    let isExpanded = false;
    let isPlaying = false;
    let currentPage = 0;
    const itemsPerPage = 5;
    let audio = new Audio(); // 创建音频对象

    // 播放按钮点击事件
    playerBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        playerBtn.classList.toggle('expanded', isExpanded);
        playList.classList.toggle('active', isExpanded);
        if (isExpanded) {
            // 扩展时显示播放控制按钮
            playPause.textContent = isPlaying ? '⏸️' : '▶️';
        } else {
            // 收起时隐藏播放控制按钮
            playPause.textContent = '';
            audio.pause(); // 收起时暂停音乐
            isPlaying = false;
        }
    });

    // 播放/暂停按钮点击事件
    playPause.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playPause.textContent = '▶️';
        } else {
            audio.play();
            playPause.textContent = '⏸️';
        }
        isPlaying = !isPlaying;
    });

    // 播放列表项点击事件
    playList.addEventListener('click', (event) => {
        if (event.target.classList.contains('song')) {
            const src = event.target.getAttribute('data-src');
            audio.src = src;
            audio.play();
            playPause.textContent = '⏸️';
            isPlaying = true;
            // 收起按钮并播放音乐
            if (isExpanded) {
                playerBtn.click(); // 点击按钮收起
            }
        }
    });

    // 翻页按钮点击事件
    prevPage.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            updatePlayList();
        }
    });

    nextPage.addEventListener('click', () => {
        const totalItems = document.querySelectorAll('.play-list .song').length;
        if ((currentPage + 1) * itemsPerPage < totalItems) {
            currentPage++;
            updatePlayList();
        }
    });

    // 更新播放列表显示
    function updatePlayList() {
        const songs = document.querySelectorAll('.play-list .song');
        songs.forEach((song, index) => {
            song.style.display = (index >= currentPage * itemsPerPage && index < (currentPage + 1) * itemsPerPage) ? 'block' : 'none';
        });
        prevPage.disabled = currentPage === 0;
        nextPage.disabled = (currentPage + 1) * itemsPerPage >= songs.length;
    }

    // 初始化播放列表显示
    updatePlayList();
});
