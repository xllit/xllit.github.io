async function fetchSayings() {
    try {
        const response = await fetch('indexpage/saying.txt');
        const text = await response.text();
        return text.split('\n').map(line => line.trim()).filter(Boolean);
    } catch (error) {
        console.error("获取名言失败：", error);
        return [];
    }
}

function showTyped(element, text, onComplete, options = {}) {
    if (element._typed) {
        element._typed.destroy();
    }
    element.textContent = '';
    const typed = new Typed(element, {
        strings: [text],
        typeSpeed: options.typeSpeed || 40,
        backSpeed: options.backSpeed || 0,
        showCursor: options.showCursor !== false,
        cursorChar: options.cursorChar || '|',
        smartBackspace: options.smartBackspace || false,
        fadeOut: false,
        loop: false,
        onComplete: onComplete ? () => setTimeout(onComplete, options.pause || 2000) : null
    });
    element._typed = typed;
}

window.addEventListener('DOMContentLoaded', async () => {
    const mainTitle = document.getElementById('mainTitle');
    const sayings = await fetchSayings();

    const initialText = "欢迎来到雨猫岛";
    showTyped(mainTitle, initialText, () => loopSayings(), { typeSpeed: 60, pause: 30000 });

    function loopSayings() {
        if (sayings.length === 0) return;
        const index = Math.floor(Math.random() * sayings.length);
        showTyped(mainTitle, sayings[index], () => loopSayings(), { typeSpeed: 45, pause: 20000 });
    }
});