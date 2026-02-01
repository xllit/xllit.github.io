// Initialize Lucide Icons
lucide.createIcons();

const questions = [
    { q: "我是否觉得我比周围大多数人都更优秀、更独特？" },
    { q: "我是否经常沉溺于关于权力、美貌或完美爱情的幻想？" },
    { q: "我是否认为自己理应得到特殊的优待，规则不一定适用于我？" },
    { q: "如果别人没有赞美或关注我，我是否会感到愤怒或极度失落？" },
    { q: "为了达成我的目标，我是否觉得利用一下别人也是理所应当的？" },
    { q: "别人向我倾诉痛苦时，我是否觉得索然无味，甚至感到不耐烦？" },
    { q: "我是否经常觉得别人都在嫉妒我，或者我非常嫉妒别人的成功？" },
    { q: "我是否被评价为傲慢、自大或目中无人？" },
    { q: "面对批评时，我是否会立刻感到羞辱，并想反击对方？" },
    { q: "我交朋友是否主要是看对方能不能提升我的地位或对我有利？" },
    { q: "事情搞砸时，我第一反应是不是寻找他人的错误而非反省自己？" },
    { q: "在“强大”的外表下，我是否其实非常害怕被看穿自己的“平庸”？" },
    { q: "当事情不按我的意愿发展时，我是否会变得极度不耐烦和愤怒？" },
    { q: "我是否倾向于打断别人，或在对话中占据主导地位？" },
    { q: "我是否认为我的问题是独一无二的，只有少数特殊的人才能理解？" },
    { q: "我是否对规则和社交规范感到蔑视，觉得它们不适用于我？" },
    { q: "我是否在没有足够成就的情况下，期待被认为是优越的？" },
    { q: "我是否难以识别或承认他人的感受和需求？" },
    { q: "我是否经常将自己的错误归咎于他人或外部环境？" },
    { q: "我是否觉得与“普通”或“地位低下”的人交往有损我的身份？" }
];

let scores = []; // Store scores for each question (1-5)
let currentQuestion = 0;

function renderQuestion() {
    const container = document.getElementById('quiz-container');
    if (currentQuestion < questions.length) {
        const q = questions[currentQuestion];
        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between text-xs text-slate-400 font-mono">
                    <span>QUESTION ${currentQuestion + 1}/${questions.length}</span>
                    <span>PROGRESS: ${Math.round((currentQuestion / questions.length) * 100)}%</span>
                </div>
                <p class="text-lg md:text-xl font-medium text-slate-800">${q.q}</p>
                <div class="flex flex-wrap gap-2 mt-4">
                    <label class="flex-1 min-w-[60px] text-center py-2 px-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                        <input type="radio" name="q${currentQuestion}" value="1" class="hidden" onclick="handleAnswer(1)">
                        <span class="font-bold text-sm">1 - 从未</span>
                    </label>
                    <label class="flex-1 min-w-[60px] text-center py-2 px-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                        <input type="radio" name="q${currentQuestion}" value="2" class="hidden" onclick="handleAnswer(2)">
                        <span class="font-bold text-sm">2 - 很少</span>
                    </label>
                    <label class="flex-1 min-w-[60px] text-center py-2 px-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                        <input type="radio" name="q${currentQuestion}" value="3" class="hidden" onclick="handleAnswer(3)">
                        <span class="font-bold text-sm">3 - 有时</span>
                    </label>
                    <label class="flex-1 min-w-[60px] text-center py-2 px-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                        <input type="radio" name="q${currentQuestion}" value="4" class="hidden" onclick="handleAnswer(4)">
                        <span class="font-bold text-sm">4 - 经常</span>
                    </label>
                    <label class="flex-1 min-w-[60px] text-center py-2 px-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                        <input type="radio" name="q${currentQuestion}" value="5" class="hidden" onclick="handleAnswer(5)">
                        <span class="font-bold text-sm">5 - 总是</span>
                    </label>
                </div>
            </div>
        `;
    } else {
        showResult();
    }
}

function handleAnswer(score) {
    // A slight delay to show selection feedback
    setTimeout(() => {
        scores.push(score);
        currentQuestion++;
        renderQuestion();
    }, 150);
}

function showResult() {
    document.getElementById('quiz-container').classList.add('hidden');
    const resultBox = document.getElementById('quiz-result');
    resultBox.classList.remove('hidden');
    
    const title = document.getElementById('result-title');
    const desc = document.getElementById('result-desc');
    const buttonContainer = document.getElementById('result-buttons');

    const highTendencyCount = scores.filter(score => score >= 4).length; // Count scores that are 4 or 5

    if (highTendencyCount >= 12) { // New threshold for 20 questions
        title.innerText = "高倾向觉察：你需要警惕自恋防御";
        desc.innerText = "你的回答显示出较多的 NPD 特质。但这并不意味着你一定是 NPD。有时，极度的自卑或童年的心理创伤也会表现为类似的防御机制。建议找专业心理咨询师聊聊，学习如何建立更健康的自尊。";
    } else if (highTendencyCount >= 5) { // New threshold for 20 questions
        title.innerText = "中等倾向：每个人都有点“自恋”";
        desc.innerText = "你拥有一定的自恋特质，这在普通人中很常见。只要这些特质没有严重损害你的人际关系或共情能力，就不必过度焦虑。保持觉察，多关注他人的真实需求。";
    } else {
        title.innerText = "低倾向：你的心理结构相对健康";
        desc.innerText = "你表现出的 NPD 特质非常低。你可能拥有较好的共情能力和自省能力。请继续保持对他人的尊重和对自我的客观认知。";
    }
    
    // Add the navigation buttons
    buttonContainer.innerHTML = `
        <button onclick="showSection('knowledge')" class="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold">查看硬核知识</button>
        <button onclick="showSection('defense')" class="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-bold">查看防御指南</button>
    `;
}

function resetQuiz() {
    scores = []; // Reset scores
    currentQuestion = 0;
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('result-buttons').innerHTML = ''; // Clear the buttons
    renderQuestion();
}

function showSection(sectionId) {
    document.querySelectorAll('.section-content').forEach(s => s.classList.add('hidden'));
    document.getElementById(sectionId + '-section').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Init
renderQuestion();
