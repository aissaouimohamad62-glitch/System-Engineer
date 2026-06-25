// ==========================================

// LOADING SCREEN SYSTEM
// ==========================================
window.addEventListener('load', () => {
    const prog = document.getElementById('loadProgress');
    prog.style.width = '100%';
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => document.getElementById('loadingScreen').remove(), 500);
    }, 1200);
});

// ==========================================
// AVATAR BORDERS MAP
// ==========================================
const BORDER_STYLES_MAP = {
    "border-shadow-recruit": "border-2 border-purple-900/60 shadow-[0_0_12px_rgba(176,38,255,0.4)]",
    "border-elite-knight": "border-2 border-[var(--sys-cyan,#00f0ff)] shadow-[0_0_18px_rgba(0,240,255,0.7)] animate-pulse",
    "border-shadow-commander": "border-4 border-double border-purple-600 shadow-[0_0_25px_rgba(147,51,234,0.9)]",
    "border-shadow-monarch": "border-2 border-sys-gold shadow-[0_0_35px_rgba(255,215,0,0.95),_inset_0_0_15px_rgba(176,38,255,0.6)]"
};

function applyEquippedAvatarBorder() {
    const avatarContainer = document.getElementById('avatar-container');
    if (!avatarContainer) return;

    const currentBorderId = localStorage.getItem('equipped_avatar_border');

    Object.values(BORDER_STYLES_MAP).forEach(cssClass => {
        cssClass.split(" ").forEach(cls => avatarContainer.classList.remove(cls));
    });

    if (currentBorderId && BORDER_STYLES_MAP[currentBorderId]) {
        const targetClasses = BORDER_STYLES_MAP[currentBorderId].split(" ");
        targetClasses.forEach(cls => avatarContainer.classList.add(cls));
    }
}

window.addEventListener('DOMContentLoaded', applyEquippedAvatarBorder);


// ==========================================
// UTILITIES & UI
// ==========================================
const UI = {
    toggleTimerSettings() {
        if (typeof SoundEffects !== 'undefined') SoundEffects.playSystemClick();
        document.getElementById('timerModal').classList.toggle('hidden');
    }
};

const Toast = {
    show(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        const colors = {
            success: 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
            error: 'border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.3)]',
            info: 'border-[var(--sys-cyan)] text-[var(--sys-cyan)] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
        };
        toast.className = `pointer-events-auto px-5 py-3 bg-[#02040a]/95 border backdrop-blur-md text-sm font-bold sys-font tracking-wide animate-system-pop ${colors[type] || colors.info}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
    }
};

// ==========================================
// SYSTEM RESET ENGINE (HARD RESET)
// ==========================================
const SystemReset = {
    confirmAndReset() {
        if(window.SoundEffects) SoundEffects.playSystemClick();

        const firstConfirm = confirm("⚠️ تحذير أمني سيادي: هل أنت متأكد أنك تريد مسح جميع البيانات؟\n(سيعود المستوى إلى 1، وتفقد كل الذهب، الخبرة، المهام، والسجلات ولن يمكنك استرجاعها).");
        if (!firstConfirm) return;

        const secondConfirm = confirm("‼️ تأكيد نهائي: هذه العملية ستعيد النظام إلى نقطة الصفر. هل تريد تنفيذ 'مسح الذاكرة'؟");
        if (!secondConfirm) return;

        const keysToReset = [
            'monarch_system_data', 
            'sovereign_active_quest', 
            'directive_start_time', 
            'sovereign_active_program', 
            'SL_QUESTS', 
            'sovereign_system_logs',
            'sovereign_titles_index',
            'sl_onboarding_complete',
            'sl_player_data'
        ];

        keysToReset.forEach(key => localStorage.removeItem(key));

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('title_cache_')) {
                localStorage.removeItem(key);
            }
        });

        alert("🔄 تم مسح الذاكرة وإعادة ضبط النظام بالكامل. سيتم توجيهك إلى بوابة التسجيل.");

        window.location.href = 'index.html';
    }
};

// ==========================================
// SOUND EFFECTS
// ==========================================
const SoundEffects = {
    track1: new Audio('SHADOWBORN.mp3'),
    track2: new Audio('Kingdom_of_Iron.mp3'),
    currentTrackNumber: null,
    isMusicPlaying: false,

    init() {
        this.track1.loop = true;
        this.track2.loop = true;
    },

    toggleMusic(trackNumber) {
        const icon1 = document.getElementById('musicIcon1');
        const icon2 = document.getElementById('musicIcon2');

        if (this.isMusicPlaying && this.currentTrackNumber === trackNumber) {
            this.stopAllAudio();
            return;
        }
        if (this.isMusicPlaying) this.stopAllAudio();

        this.isMusicPlaying = true;
        this.currentTrackNumber = trackNumber;

        if (trackNumber === 1) {
            this.track1.play().catch(err => console.log("Auto-play blocked:", err));
            if (icon1) icon1.textContent = '⏸️';
            if (icon2) icon2.textContent = '🎼';
        } else if (trackNumber === 2) {
            this.track2.play().catch(err => console.log("Auto-play blocked:", err));
            if (icon1) icon1.textContent = '🎵';
            if (icon2) icon2.textContent = '⏸️';
        }
    },

    stopAllAudio() {
        this.track1.pause(); this.track1.currentTime = 0;
        this.track2.pause(); this.track2.currentTime = 0;
        const icon1 = document.getElementById('musicIcon1');
        const icon2 = document.getElementById('musicIcon2');
        if (icon1) icon1.textContent = '🎵';
        if (icon2) icon2.textContent = '🎼';
        this.isMusicPlaying = false;
        this.currentTrackNumber = null;
    },

    playSystemClick() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.1);
        } catch(e) {}
    },

    playSuccess() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.1);
                osc.stop(ctx.currentTime + i * 0.1 + 0.3);
            });
        } catch(e) {}
    },

    playLevelUp() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [440, 554, 659, 880, 1108];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
                gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.4);
            });
        } catch(e) {}
    }
};
SoundEffects.init();

// ==========================================
// DIRECTIVE TIMER ENGINE
// ==========================================
const DirectiveTimer = {
    startTime: null,
    timerInterval: null,
    isRunning: false,

    start(savedStartTime) {
        if (this.isRunning) return;
        this.startTime = savedStartTime || Date.now();
        this.isRunning = true;
        localStorage.setItem('directive_start_time', this.startTime.toString());
        localStorage.setItem('active_theme_bg', 'shadow_monarch_video.mp4');
        localStorage.setItem('name_glow_color', '#00f0ff');
        this.update();
        this.timerInterval = setInterval(() => this.update(), 1000);
    },

    stop() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.startTime = null;
        localStorage.removeItem('directive_start_time');
    },

    update() {
        if (!this.startTime) return;
        const elapsed = Date.now() - this.startTime;
        const timerEl = document.getElementById('directiveTimer');
        const progressEl = document.getElementById('directiveProgressBar');
        if (timerEl) timerEl.textContent = this.formatTime(elapsed);
        if (progressEl) {
            const progress = Math.min((elapsed / (25 * 60 * 1000)) * 100, 100);
            progressEl.style.width = `${progress}%`;
        }
    },

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    },

    reset() {
        this.stop();
        const timerEl = document.getElementById('directiveTimer');
        const progressEl = document.getElementById('directiveProgressBar');
        if (timerEl) timerEl.textContent = '00:00:00';
        if (progressEl) progressEl.style.width = '0%';
    }
};

// ==========================================
// ANIME POPUP ENGINE
// ==========================================
const AnimePopup = {
    currentQuest: null,
    questStartTime: null,
    playerLevel: 1,
    playerXP: 0,
    playerGold: 0,

    show(title, description, timeLimit, rewardXP) {
        if(window.SoundEffects) SoundEffects.playSystemClick();
        this.syncPlayerState();

        this.currentQuest = { 
            title: title, 
            rewardXP: rewardXP || 10, 
            timeLimit: timeLimit || "25:00",
            type: this.inferQuestType(title),
            details: description,
            acceptedAt: null,
            active: false
        };

        document.getElementById('animePopupTitle').textContent = title;
        document.getElementById('animePopupDesc').innerHTML = description;
        document.getElementById('animePopupTime').textContent = `TIME: ${this.currentQuest.timeLimit}`;
        document.getElementById('animePopupReward').textContent = `REWARD: +${this.currentQuest.rewardXP} EXP`;
        document.getElementById('directiveTargetTime').textContent = this.currentQuest.timeLimit;

        const modal = document.getElementById('animeSystemPopup');
        modal.classList.remove('hidden');
    },

    inferQuestType(title) {
        const t = title.toLowerCase();
        if (t.match(/برمج|code|هندس|ai|تطوير|برمجية/)) return 'coding_ai';
        if (t.match(/رياض|بدني|ppl|جري|تدريب|قتال/)) return 'sports';
        if (t.match(/لغة|إنجليز|english|كتاب|قرآن|روح|شرع/)) return 'languages_books';
        if (t.match(/زنزان|dungeon|ذهن|شطرنج|سودوكو|ذاكرة/)) return 'dungeons';
        return 'coding_ai';
    },

    syncPlayerState() {
        try {
            const coreData = JSON.parse(localStorage.getItem('monarch_system_data')) || {};
            this.playerLevel = coreData.level || 1;
            this.playerXP = coreData.xp || 0;
            this.playerGold = coreData.gold || 0;
        } catch(e) {}
    },

    acceptQuest() {
        if(window.SoundEffects) SoundEffects.playSystemClick();
        document.getElementById('animeSystemPopup').classList.add('hidden');
        if(this.currentQuest) {
            this.currentQuest.acceptedAt = Date.now();
            this.currentQuest.active = true;
            localStorage.setItem('sovereign_active_quest', JSON.stringify(this.currentQuest));

            document.getElementById('activeDirectiveText').textContent = this.currentQuest.title;
            document.getElementById('activeDirectiveBar').classList.remove('hidden');
            DirectiveTimer.start(this.currentQuest.acceptedAt);

            if(window.SovereignEngine) SovereignEngine.state.activeQuest = this.currentQuest;
            if(window.Toast) Toast.show('تم تفعيل المهمة: ' + this.currentQuest.title, 'success');
        }
    },

  completeQuest() {
        let quest = this.currentQuest || (window.SovereignEngine ? SovereignEngine.state.activeQuest : null);
        if (!quest) {
            try { quest = JSON.parse(localStorage.getItem('sovereign_active_quest')); } catch(e){}
        }
        if (!quest) {
            document.getElementById('activeDirectiveBar').classList.add('hidden');
            if (window.DirectiveTimer) DirectiveTimer.stop();
            return;
        }

        const questType = quest.type || 'coding_ai';
        const baseReward = (window.SovereignEngine ? SovereignEngine.config.weights[questType] : null) || 10;
        const acceptedAt = quest.acceptedAt || Date.now();
        const elapsedMinutes = Math.floor((Date.now() - acceptedAt) / 60000);

        let timeBonus = 0;
        if (elapsedMinutes >= 25) timeBonus = 10;
        if (elapsedMinutes >= 60) timeBonus = 25;

        const totalXP = baseReward + timeBonus;
        const goldReward = totalXP * 2;

        if(window.PlayerState) {
            PlayerState.addXP(totalXP);
            PlayerState.addGold(goldReward);
        }

        if(window.SovereignEngine) {
            SovereignEngine.logToSystem('quest', `تصفية مهمة: [${quest.title}] | +${totalXP} XP`);
        }

        document.getElementById('activeDirectiveBar').classList.add('hidden');
        if (window.DirectiveTimer) DirectiveTimer.stop();
        localStorage.removeItem('sovereign_active_quest');
        localStorage.removeItem('directive_start_time');
        if(window.SovereignEngine) SovereignEngine.state.activeQuest = null;
        this.currentQuest = null;

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 140,
                spread: 80,
                origin: { y: 0.5 },
                colors: ['#00f0ff', '#7000ff', '#120024'], 
                scalar: 0.5,     
                gravity: 0.8,     
                startVelocity: 45, 
                ticks: 80
            });

            setTimeout(() => {
                confetti({
                    particleCount: 40,
                    spread: 360,
                    origin: { y: 0.45 },
                    colors: ['#ffb700', '#ffffff'],
                    scalar: 0.4,
                    gravity: 0.2,
                    startVelocity: 15,
                    ticks: 120
                });
            }, 250);
        }

        const systemMessage = `Quest Completed: [${quest.title}] | +${totalXP} XP | +${goldReward} GOLD`;
        if(window.Toast) {
            Toast.show(systemMessage, 'success');
        }
    },

    cancelQuest() {
        if(window.SoundEffects) SoundEffects.playSystemClick();
        let questToCancel = this.currentQuest || (window.SovereignEngine ? SovereignEngine.state.activeQuest : null);
        if (!questToCancel) {
            try { questToCancel = JSON.parse(localStorage.getItem('sovereign_active_quest')); } catch(e){}
        }

        DirectiveTimer.stop();
        document.getElementById('activeDirectiveBar').classList.add('hidden');

        if(questToCancel && window.PlayerState) {
            PlayerState.addXP(-10);
            if(window.SovereignEngine) SovereignEngine.logToSystem('penalty', `إلغاء مهمة: [${questToCancel.title}] | -10 XP`);
            if(window.Toast) Toast.show('تم إلغاء المهمة! عقوبة: -10 XP', 'error');
        }

        localStorage.removeItem('sovereign_active_quest');
        localStorage.removeItem('directive_start_time');
        if(window.SovereignEngine) SovereignEngine.state.activeQuest = null;
        this.currentQuest = null;
    }
};

// ==========================================
// SYSTEM PLAYER STATE ENGINE (ANTI-OVERWRITE SHIELD) - UPDATED & MATCHED
// ==========================================
const PlayerState = {
    data: {
        level: 1,
        xp: 0,
        gold: 0,
        title: "[مبتدئ الكتل]",
        avatar: "", 
        stats: { str: 10, vit: 10, agi: 10, int: 10, sen: 10 },
        inventory: [] 
    },

    init() {
        let saved = localStorage.getItem('monarch_system_data');

        if (!saved) {
            const legacyData = localStorage.getItem('sl_player_data');
            if (legacyData) {
                try {
                    const parsedLegacy = JSON.parse(legacyData);
                    this.data.name = parsedLegacy.name || this.data.name;
                    this.data.title = parsedLegacy.title || this.data.title;
                    this.data.level = parsedLegacy.level || this.data.level;
                    this.data.xp = parsedLegacy.exp || this.data.xp;
                    this.data.registeredAt = parsedLegacy.registeredAt || this.data.registeredAt;
                    this.save();
                    saved = localStorage.getItem('monarch_system_data');
                } catch(e) {}
            }
        }

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.data = {
                    ...this.data,
                    ...parsed,
                    stats: { ...this.data.stats, ...(parsed.stats || {}) },
                    inventory: parsed.inventory || []
                };
            } catch (e) {
                console.error("[System Shield]: خطأ أثناء دمج السجلات المركزية", e);
            }
        } else {
            this.save();
        }
        this.updateUI();
        this.updateNameDisplay();
    },

    save() {
        try {
            if (window.SovereignCore) {
                // تفويض الحفظ والبث لمحرك الحالة المركزي — قناة بث واحدة مشتركة
                // بدل إنشاء BroadcastChannel جديدة عند كل استدعاء حفظ
                SovereignCore.save(this.data);
            } else {
                localStorage.setItem('monarch_system_data', JSON.stringify(this.data));
                if (typeof BroadcastChannel !== 'undefined') {
                    const bc = new BroadcastChannel('sovereign_sync');
                    bc.postMessage({ type: 'SYSTEM_DATA_UPDATED' });
                }
            }
        } catch (e) {
            console.error("[System Shield]: فشل تأمين الحفظ السحابي المحلي", e);
        }
    },

    addStat(statName, amount) {
        if (this.data.stats[statName] !== undefined) {
            this.data.stats[statName] += amount;
            if (this.data.stats[statName] < 0) this.data.stats[statName] = 0;
            this.save();
            this.updateUI();
        }
    },

    spendAP(statName) {
        if ((this.data.authority || 0) >= 5) {
            this.data.authority -= 5;
            this.addStat(statName, 5);
            if(window.Toast) Toast.show(`+5 ${statName.toUpperCase()} consumed 5 Authority`, 'success');
        } else {
            if(window.Toast) Toast.show('Insufficient Authority Points!', 'error');
        }
    },

    updateAvatar(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            if(window.Toast) Toast.show("⚠️ حجم الصورة كبير جداً! اختر صورة أقل من 3 ميجابايت", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            this.data.avatar = base64Image;
            document.getElementById('monarch-avatar-display').src = base64Image;
            this.save();
            if(window.Toast) Toast.show("🔮 تم دمج ملامح الهالة السيادية بنجاح", "success");
        };
        reader.readAsDataURL(file);
    },

    addXP(amount) {
        this.data.xp += amount;
        if (this.data.xp < 0) this.data.xp = 0;
        let xpNeeded = this.data.level * 100;
        while (this.data.xp >= xpNeeded) {
            this.data.xp -= xpNeeded;
            this.data.level++;
            xpNeeded = this.data.level * 100;
            if(window.SoundEffects) SoundEffects.playLevelUp();
            if(window.Milestone) Milestone.show(this.data.level);
        }
        this.save();
        this.updateUI();
    },

    addGold(amount) {
        this.data.gold += amount;
        if (this.data.gold < 0) this.data.gold = 0;
        this.save();
        this.updateUI();
    },

    addReward(xpAmount, goldAmount) {
        this.addXP(xpAmount);
        this.addGold(goldAmount);
    },

updateNameDisplay() {
        // 1. تحديث اسم اللاعب
        const nameEl = document.getElementById('playerNameDisplay');
        if (nameEl && this.data.name) {
            nameEl.textContent = this.data.name;
        }

        // 2. تحديث اللقب (JOB) - الكود الذي كان مفقوداً
        const titleEl = document.getElementById('monarch-active-title');
        if (titleEl && this.data.title) {
            titleEl.textContent = this.data.title;
        }
    },

    updateUI() {
        // 1. تحديث المستويات المتطابقة مع HTML
        if(document.getElementById('player-level')) document.getElementById('player-level').textContent = this.data.level;
        if(document.getElementById('currentLevel')) document.getElementById('currentLevel').textContent = this.data.level;
        
        // 2. تحديث السمات البدنية والروحية
        if(document.getElementById('stat-sen-val')) document.getElementById('stat-sen-val').textContent = this.data.stats.sen;
        if(document.getElementById('stat-str')) document.getElementById('stat-str').textContent = this.data.stats.str;
        if(document.getElementById('stat-vit')) document.getElementById('stat-vit').textContent = this.data.stats.vit;
        if(document.getElementById('stat-agi')) document.getElementById('stat-agi').textContent = this.data.stats.agi;
        if(document.getElementById('stat-int')) document.getElementById('stat-int').textContent = this.data.stats.int;
        if(document.getElementById('stat-sen')) document.getElementById('stat-sen').textContent = this.data.stats.sen;

        // 3. تحديث العملات التكتيكية، الفتك، والذهب الإضافي المتطابق مع شاشة المراقبة
        if(document.getElementById('playerGold')) document.getElementById('playerGold').textContent = this.data.gold;
        if(document.getElementById('availablePoints')) document.getElementById('availablePoints').textContent = this.data.authority || 0;
        if(document.getElementById('stat-authority')) document.getElementById('stat-authority').textContent = this.data.authority || 0;
        if(document.getElementById('stat-lethality')) document.getElementById('stat-lethality').textContent = (this.data.lethality || 0) + '%';
        
        // 4. دمج وتصحيح نظام نقاط الخبرة (XP) ومطابقتها بصرياً مع عناصر النيون في الواجهة
        const xpNeeded = this.data.level * 100;
        
        // تحديث النص الرقمي الداخلي لشريط الهالة (مثال: 45 / 100)
        if(document.getElementById('xpText')) {
            document.getElementById('xpText').textContent = `${this.data.xp} / ${xpNeeded}`;
        }
        
        // حساب النسبة المئوية الدقيقة وعكسها حركياً على شريط الحالة الزمردي
        if(document.getElementById('xpBar')) {
            const percentage = Math.min((this.data.xp / xpNeeded) * 100, 100);
            document.getElementById('xpBar').style.width = `${percentage}%`;
        }
    }
};

// ==========================================
// QUEST SYSTEM
// ==========================================
const QuestSystem = {
    tasks: [],
    filter: 'all',
    init() {
        const saved = localStorage.getItem('SL_QUESTS');
        this.tasks = saved ? JSON.parse(saved) : [];
        this.render();
    },
    setFilter(mode) {
        this.filter = mode;
        this.render();
    },
    addTask() {
        if(window.SoundEffects) SoundEffects.playSystemClick();
        const inp = document.getElementById('taskInput');
        const prio = document.getElementById('prioritySelect').value;
        const statSelect = document.getElementById('statSelect').value;
        if(!inp || !inp.value.trim()) return;
        const task = { id: Date.now(), text: inp.value.trim(), priority: prio, completed: false, stat: statSelect, createdAt: new Date().toISOString() };
        this.tasks.unshift(task);
        inp.value = '';
        this.save();
        this.render();
        Toast.show('Quest deployed to system window', 'success');
    },
    toggleTask(id) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) return;
        const task = this.tasks[taskIndex];
        let xpReward = task.priority === 'high' ? 100 : task.priority === 'medium' ? 50 : 20;
        let goldReward = task.priority === 'high' ? 30 : task.priority === 'medium' ? 15 : 5;
        let authorityReward = task.priority === 'high' ? 10 : task.priority === 'medium' ? 5 : 2;

        if (!task.completed) {
            task.completed = true;
            if(window.PlayerState) {
                PlayerState.data.authority = (PlayerState.data.authority || 0) + authorityReward;
                PlayerState.addXP(xpReward);
                PlayerState.addGold(goldReward);
                PlayerState.addStat(task.stat || 'int', 1);
            }
            Toast.show(`Quest Cleared! +${xpReward} EXP`, 'success');
            if(window.SoundEffects) SoundEffects.playSuccess();
            if(typeof confetti === 'function') confetti({particleCount: 80, spread: 60, origin: {y: 0.7}, colors: ['#00f0ff','#9d4edd']});
        } else {
            task.completed = false;
            if(window.PlayerState) {
                PlayerState.data.authority = Math.max(0, (PlayerState.data.authority || 0) - authorityReward);
                PlayerState.addXP(-xpReward);
                PlayerState.addGold(-goldReward);
                if (PlayerState.data.gold < 0) PlayerState.data.gold = 0;
                PlayerState.addStat(task.stat || 'int', -1);
            }
            Toast.show(`Quest Reversed! Rewards Deducted.`, 'error');
            if(window.SoundEffects) SoundEffects.playSystemClick();
        }
        this.save();
        this.render();
    },
    deleteTask(id) {
        if(window.SoundEffects) SoundEffects.playSystemClick();
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
    },
    render() {
        const container = document.getElementById('taskContainer');
        const titleEl = document.getElementById('taskListTitle');
        const backBtn = document.getElementById('backToAllBtn');
        if(!container) return;
        container.innerHTML = '';

        if (titleEl) {
            titleEl.textContent = this.filter === 'active' ? '⚔️ ACTIVE ENGAGEMENTS (Incomplete)' : '⚔️ Active Directives Log';
            titleEl.className = this.filter === 'active' 
                ? 'font-black text-sm text-amber-400 tracking-wide uppercase sys-font' 
                : 'font-black text-sm text-[var(--sys-cyan)] tracking-wide uppercase sys-font';
        }
        if (backBtn) {
            backBtn.classList.toggle('hidden', this.filter !== 'active');
        }

        let activeCount = 0; let completedCount = 0;

        const displayTasks = this.filter === 'active' 
            ? this.tasks.filter(t => !t.completed) 
            : this.tasks;

        if (displayTasks.length === 0) {
            const emptyMsg = this.filter === 'active' 
                ? '<p>[NO INCOMPLETE ENGAGEMENTS DETECTED]</p><p class="text-[10px] mt-2">All directives have been cleared.</p>'
                : '<p>[NO ACTIVE QUESTS DETECTED]</p>';
            container.innerHTML = `<div class="text-center py-10 opacity-30 sys-font">${emptyMsg}</div>`;
            this.updateStatsUI(0, 0, 0);
            return;
        }
        const statColors = { 'int': 'text-[var(--sys-cyan)]', 'str': 'text-rose-500', 'vit': 'text-emerald-500', 'agi': 'text-sky-400', 'sen': 'text-[var(--sys-purple)]' };
        displayTasks.forEach(task => {
            task.completed ? completedCount++ : activeCount++;
            const escapedText = task.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const div = document.createElement('div');
            div.className = `task-card flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-sm border-y border-y-slate-800 transition-all ${task.completed ? 'completed opacity-50' : ''}`;
            div.innerHTML = `
                <div class="flex items-center gap-4">
                    <button onclick="QuestSystem.toggleTask(${task.id})" class="w-6 h-6 rounded border-2 border-[var(--sys-cyan)] flex items-center justify-center hover:bg-[var(--sys-cyan)] hover:bg-opacity-20 transition-colors ${task.completed ? 'bg-[var(--sys-cyan)]' : ''}">
                        ${task.completed ? '<span class="text-black text-xs font-black">✓</span>' : ''}
                    </button>
                    <div>
                        <div class="font-bold text-white text-sm ${task.completed ? 'line-through text-slate-500' : ''}">${escapedText}</div>
                        <div class="flex gap-2 mt-1">
                            <span class="sys-font text-[10px] px-2 py-0.5 border border-slate-700 bg-black/50 ${statColors[task.stat || 'int']} uppercase tracking-widest">+1 ${(task.stat || 'int').toUpperCase()}</span>
                            <span class="sys-font text-[10px] px-2 py-0.5 border border-slate-700 bg-black/50 text-amber-400 uppercase tracking-widest">RANK: ${(task.priority || 'medium').toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <button onclick="QuestSystem.deleteTask(${task.id})" class="text-slate-600 hover:text-rose-500 transition-colors p-2">🗑️</button>
            `;
            container.appendChild(div);
        });
        const lethalityRate = Math.round((completedCount / this.tasks.length) * 100);
        if(window.PlayerState) {
            PlayerState.data.lethality = lethalityRate;
            PlayerState.save();
        }
        this.updateStatsUI(activeCount, this.tasks.length, lethalityRate);
    },
    updateStatsUI(active, all, lethality) {
        if(document.getElementById('cnt-active-val')) document.getElementById('cnt-active-val').textContent = active;
        if(document.getElementById('stat-lethality')) document.getElementById('stat-lethality').textContent = `${lethality}%`;
    },
    save() { localStorage.setItem('SL_QUESTS', JSON.stringify(this.tasks)); }
};

// ==========================================
// POMODORO TIMER
// ==========================================
const Pomodoro = {
    defaultTime: parseInt(localStorage.getItem('SL_SYS_TIMER')) || (5 * 3600),
    timeLeft: 0, timer: null, isRunning: false,
    init() { this.timeLeft = this.defaultTime; this.updateUI(); },
    saveSettings() {
        const h = parseInt(document.getElementById('inputHours').value) || 0;
        const m = parseInt(document.getElementById('inputMinutes').value) || 0;
        const tot = (h * 3600) + (m * 60);
        if (tot > 0) {
            this.defaultTime = tot;
            localStorage.setItem('SL_SYS_TIMER', this.defaultTime.toString());
            document.getElementById('timerModal').classList.add('hidden');
            clearInterval(this.timer); this.timeLeft = this.defaultTime; this.isRunning = false;
            this.toggle();
        }
    },
    toggle() {
        if(typeof SoundEffects !== 'undefined') SoundEffects.playSystemClick();
        const btn = document.getElementById('timerBtn');
        const st = document.getElementById('timerStatus');
        if (this.isRunning) {
            clearInterval(this.timer);
            btn.textContent = 'START'; btn.classList.remove('bg-rose-600/30');
            st.textContent = 'PAUSED'; st.className = 'sys-font text-[9px] px-2 py-0.5 bg-amber-900 border border-amber-600 text-amber-300 uppercase';
        } else {
            if (this.timeLeft <= 0) this.timeLeft = this.defaultTime;
            this.timer = setInterval(() => { if (this.timeLeft > 0) { this.timeLeft--; this.updateUI(); } else { this.finish(); } }, 1000);
            btn.textContent = '⏸️'; btn.classList.add('bg-rose-600/30');
            st.textContent = 'IN COMBAT'; st.className = 'sys-font text-[9px] px-2 py-0.5 bg-rose-900 border border-rose-600 text-rose-300 uppercase animate-pulse';
        }
        this.isRunning = !this.isRunning;
    },
    reset() {
        if(typeof SoundEffects !== 'undefined') SoundEffects.playSystemClick();
        clearInterval(this.timer);
        this.timeLeft = this.defaultTime; this.isRunning = false;
        const btn = document.getElementById('timerBtn'); btn.textContent = 'START'; btn.classList.remove('bg-rose-600/30');
        const st = document.getElementById('timerStatus');
        st.textContent = 'IDLE'; st.className = 'sys-font text-[9px] px-2 py-0.5 bg-slate-800 border border-slate-600 text-slate-300 uppercase';
        this.updateUI();
    },
    finish() {
        clearInterval(this.timer);
        if(typeof SoundEffects !== 'undefined') SoundEffects.playSuccess();
        if (typeof confetti !== 'undefined') confetti({ particleCount: 100, colors: ['#00f0ff'] });
        this.reset();
    },
    updateUI() {
        const h = Math.floor(this.timeLeft / 3600).toString().padStart(2, '0');
        const m = Math.floor((this.timeLeft % 3600) / 60).toString().padStart(2, '0');
        const s = (this.timeLeft % 60).toString().padStart(2, '0');
        if(document.getElementById('timerDisplay')) document.getElementById('timerDisplay').textContent = `${h}:${m}:${s}`;
    }
};

const Milestone = {
    show(newLevel) {
        const modal = document.getElementById('milestoneModal');
        if (!modal) return;
        document.getElementById('milestoneOldLevel').textContent = newLevel - 1;
        document.getElementById('milestoneLevelText').textContent = newLevel;
        modal.classList.remove('hidden');
        if(window.SoundEffects) SoundEffects.playLevelUp();
        if(typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00f0ff', '#9d4edd', '#ffffff'] });
        }
    },
    hide() {
        document.getElementById('milestoneModal').classList.add('hidden');
        if(typeof SoundEffects !== 'undefined') SoundEffects.playSystemClick();
    }
};

const Utils = {
    formatDecimalTime(dec) {
        const h = Math.floor(dec);
        const m = Math.floor((dec - h) * 60);
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    },
    getCurrentDecimalTime() {
        const now = new Date();
        return now.getHours() + now.getMinutes() / 60;
    },
    getDayName(idx) {
        const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
        return days[idx];
    }
};

// ==========================================
// PROGRAM DATA
// ==========================================
const PROGRAM_DATA = {
week1: {
    id: 'week1',
    title: 'Integrated Operations Charter / ميثاق العمليات المتكاملة',
    version: 'v9.0',
    range: 'LVL 1 → 450 / المستوى 1 → 450',
    desc: 'المرحلة التأسيسية الشاملة: بناء القاعدة البرمجية والبدنية والروحية، التأسيس للمسار السيادي الكامل.',
    schedule: [
      { start: 5.0,  end: 6.0,  title: 'Spiritual Exchange Session / جلسة التبادل الروحي قراءة الأذكار الصباحية وتدبر حزبين كاملين سواءا مع الحفظ أو التكرار وتمارين الإطالة والتمدد', desc: 'Quran Recitation (Individual: Meditative / Pairs: New) + Fajr Prayer, Adhkar, and Stretching Exercises / تلاوة القرآن (فردي: تدبر / ثنائي: جديد) + صلاة الفجر، الأذكار، وتمارين الإطالة' },
      { start: 6.0,  end: 8.5,  title: 'Advanced Programming / برمجة متقدمة HTML5 و CSS3 و JavaScript',       desc: 'Project (Python/JavaScript) - Architecture and Development / مشروع  (بايثون/جافا سكريبت) - الهيكلة والتطوير' },
      { start: 8.5,  end: 10.5, title: 'Academic Courses in Artificial Intelligence /  دورات أكاديمية في الذكاء الاصطناعي و نقل مهاراتك في إكسيل إلى بايثون وفهم لغة الأرقام',        desc: 'Machine Learning, LLM Studies, and Algorithm Applications / تعلم الآلة، دراسات النماذج اللغوية الكبيرة، وتطبيقات الخوارزميات' },
      { start: 10.5, end: 12.0, title: 'Mastering English / " إتقان الإنجليزية وهي "الإنغماس الصوتي" و "حفظ المفردات والجمل " و "الكتابة',   desc: 'Technical In-Depth + Vocabulary Building + Practical Application Training / تعمق تقني + بناء المفردات + تدريب على التطبيق العملي' },
      { start: 12.0, end: 13.0, title: ' Applied Technical Lab / مختبر تقني تطبيقي و نقل مهاراتك في إكسيل إلى بايثون وفهم لغة الأرقام',                  desc: 'Rest & Recovery / System Architecture Monitoring & Updates / راحة وتعافي / مراقبة وتحديثات هيكل النظام' },
      { start: 13.0, end: 15.0, title: 'Long Break / استراحة طويلة + Applied Technical Lab / مختبر تقني تطبيقي و نقل مهاراتك في إكسيل إلى بايثون وفهم لغة الأرقام', desc: 'Rest & Recovery / System Architecture Monitoring & Updates / راحة وتعافي / مراقبة وتحديثات هيكل النظام + Dhuhr Prayer + Protein-Rich Lunch / صلاة الظهر + غداء غني بالبروتين + قيلولة' },
      { start: 15.0, end: 16.5, title: 'Advanced Physical Development (PPL) / تطوير بدني متقدم', desc: 'Push/Pull/Leg Exercises  / تمارين الدفع/السحب/الأرجل' },
      { start: 16.5, end: 17.5, title: 'Sheikh Al-Raslan / الشيخ الرسلان',          desc: 'Sheikh Al-Raslan / الشيخ الرسلان' },
      { start: 17.5, end: 19.5, title: 'Experimental Sciences / العلوم التجريبية',      desc: 'Academic Focus: Mathematics (Sunday/Wednesday), Science (Monday/Friday), Physics (Tuesday/Saturday) / تركيز أكاديمي: رياضيات (الأحد/الأربعاء)، علوم (الإثنين/الجمعة)، فيزياء (الثلاثاء/السبت)' },
      { start: 19.5, end: 20.5, title: 'Mental and Physical Development / تطوير عقلي وبدني',      desc: 'Reading + Documentaries + Brain Games + Physical Rest / قراءة + أفلام وثائقية + ألعاب عقلية + راحة بدنية' },
      { start: 20.5, end: 22.0, title: 'System Setup / إعداد النظام',         desc: 'Creating Your Schedule + Evening Adhkar + Muscle and Mind Relaxation (Sleep) / إنشاء جدولك + أذكار المساء + استرخاء العضلات والعقل (النوم)' }
    ],
    days: {
      0: { sport: '🏀 Basketball / كرة السلة', ppl: 'Pull Exercises (Back & Biceps) / تمارين السحب (الظهر والبايسبس)', cognitive: 'Double Back Exercises + Digital Book (Session 1) / تمارين ظهر مزدوجة + كتاب رقمي (الجلسة 1)', academic: 'Mathematics / رياضيات' },
      1: { sport: '🥋 Brazilian Jiu-Jitsu / جيو-جيتسو البرازيل', ppl: 'chest press exercises (upper/lateral/regular/shoulders) / تمارين ضغط الصدر (علوي/جانبي/عادي/أكتاف)', cognitive: 'Chess + Documentary / شطرنج + فيلم وثائقي', academic: 'Natural Sciences / علوم طبيعية' },
      2: { sport: '🏀 Basketball / كرة السلة', ppl: 'Pull Exercises (Front &  Triceps) / تمارين السحب (الترايسبس) + تمارين الأرجل (الفخذ )', cognitive: 'Reading Books + Watching Nasser Al-Aqeel / قراءة كتب + مشاهدة ناصر العقيل', academic: 'Physics / فيزياء' },
      3: { sport: '⚽ Football Challenge / تحدي كرة القدم', ppl: 'Leg Exercises (Back & Calves) / تمارين الأرجل (سمانة) + تمارين الساعد', cognitive: 'Sudoku + Documentary / سودوكو + فيلم وثائقي', academic: 'Math Review / مراجعة رياضيات' },
      4: { sport: '🥋 Brazilian Jiu-Jitsu / جيو-جيتسو البرازيل', ppl: 'Abs and Biceps Exercises / تمارين بطن وبايسبس', cognitive: 'Chess + Watching Nasser Al-Aqeel / شطرنج + مشاهدة ناصر العقيل', academic: 'Islamic Studies/History/Geography / دراسات إسلامية/تاريخ/جغرافيا' },
      5: { sport: '🏃 Rest, Recovery, and 1-Hour Run / راحة، تعافي، وجري لمدة ساعة', ppl: 'راحة أيها العاهل الشاب ', cognitive: ' Book Review / مراجعة كتاب', academic: 'Science Review / مراجعة علوم' },
      6: { sport: '⚽ Football / كرة القدم', ppl: 'Abdominal Exercises (Six-Pack) and chest / تمارين بطن (سكس باك) وصدر(سفلي / داخلي)', cognitive: 'Sudoku +weekly assessment "Yassine Tia" / سودوكو + تقييم أسبوعي "ياسين تيا"', academic: 'Physics Review / مراجعة فيزياء' }
    },
    special: {
      1: {
        title: 'Fasting Protocol (Monday) / بروتوكول الصيام (الإثنين)',
        blocks: [
          { time: '02:45-05:00', title: 'Night Prayer and Suhoor / قيام الليل والسحور', desc: 'Night Prayer + Protein-Rich Suhoor + Remembrance of Allah + Quick Mental Review / قيام الليل + سحور غني بالبروتين + ذكر الله + مراجعة ذهنية سريعة' }
        ]
      },
      4: {
        title: 'Achievement Thursday (Fasting and Diligence) / خميس الإنجاز (صيام واجتهاد)',
        blocks: [
          { time: '02:45-05:00', title: 'Night Prayer and Suhoor / قيام الليل والسحور', desc: 'Night Prayer + Protein-Rich Suhoor + Remembrance of Allah + Quick Mental Review / قيام الليل + سحور غني بالبروتين + ذكر الله + مراجعة ذهنية سريعة' },
          { time: '05:00-06:30', title: 'Quran Session / جلسة القرآن', desc: 'Recitation and Memorization of the Holy Quran (1.5 Hours) / تلاوة وحفظ القرآن الكريم (1.5 ساعة)' },
          { time: '06:30-09:30', title: 'Religious Studies / دراسات دينية', desc: 'The Book of Tawhid + Tajweed Rules (3 Hours) / كتاب التوحيد + أحكام التجويد (3 ساعات)' },
          { time: '09:30-11:30', title: 'Study Marathon / ماراثون دراسي', desc: 'History, Geography, and French using Mind Maps / تاريخ، جغرافيا، ولغة فرنسية باستخدام الخرائط الذهنية' },
          { time: '11:30-13:30', title: 'Language Skills / مهارات لغوية', desc: 'Reviewing English Terminology and Treating Grammar as Systemic Software Logic / مراجعة المصطلحات الإنجليزية والتعامل مع القواعد كمنطق برمجي نظامي' },
          { time: '13:30-15:00', title: 'Website Development / تطوير المواقع', desc: 'Developing and Monetizing Websites / تطوير المواقع وتحقيق الربح' },
          { time: '15:00-16:30', title: 'Targeted Muscle Building / بناء عضلي موجه', desc: 'Leg Muscles (Thighs/Calves) + Abdominal Priority and Muscle Heads / عضلات الأرجل (أفخاذ/سمانة) + أولوية البطن ورؤوس العضلات' },
          { time: '16:30-18:30', title: 'Combat / قتال', desc: 'Jiu-Jitsu training / تدريب جيو-جيتسو' },
          { time: '18:30-19:30', title: 'Content Creation / صناعة المحتوى', desc: 'Creating and producing content for YouTube, Instagram, TikTok, and Facebook / إنشاء وصناعة المحتوى يوتيوب وإنستقرام وتيكتوك وفيسبوك' },
          { time: '19:30-20:30', title: 'Spiritual Balance / توازن روحي', desc: 'Listening to the Quran + Meditation and Improving Vocal Tone & Depth / استماع للقرآن + تأمل وتحسين نبرة وعمق الصوت' },
          { time: '20:30-22:00', title: ' Mindset / العقلية', desc: ' Watching Nasser Al-Aqeel + Chess / مشاهدة ناصر العقيل + شطرنج ' }
        ]
      },
      5: {
        title: 'Creativity Friday / جمعة الإبداع',
        blocks: [
          { time: '05:00-08:00', title: 'Spiritual Meditation / تأمل روحي', desc: 'Surah Al-Kahf + Morning Adhkar + Natural Sciences Review / سورة الكهف + أذكار الصباح + مراجعة علوم طبيعية' },
          { time: '08:00-10:00', title: 'Mind Reset / إعادة ضبط العقل', desc: 'Preparing for Video Editing (Montage) / التحضير لتحرير الفيديو (المونتاج)' },
          { time: '10:00-14:00', title: 'Ethical Hacking and Terminology / تهكير أخلاقي ومصطلحات', desc: 'Learning Ethical Hacking + Study Marathon for Arabic/English and Islamic Studies using Mind Maps / تعلم التهكير الأخلاقي + ماراثون دراسي للغة العربية/الإنجليزية والدراسات الإسلامية باستخدام الخرائط الذهنية' },
          { time: '14:00-15:00', title: 'Audio Meditation / تأمل صوتي', desc: 'Listening to the Holy Quran and Meditation (Includes Voice Tone Improvement) / استماع للقرآن الكريم والتأمل (يشمل تحسين نبرة الصوت)' },
          { time: '15:00-16:00', title: 'قيلولة / راحة أيها العاهل الشاب', desc: 'قيلولة راحة أيها العاهل الشاب' },
          { time: '16:00-17:00', title: 'Website Management / إدارة المواقع', desc: 'Following Up on Completed Website Development Projects / متابعة مشاريع تطوير المواقع المكتملة' },
          { time: '17:00-18:30', title: 'Energy Generation / توليد الطاقة', desc: 'One-hour run / جري لمدة ساعة' },
          { time: '18:30-19:30', title: 'Energy Generation / توليد الطاقة', desc: 'Football: Unleashing full physical energy on the pitch / كرة القدم: إطلاق كامل الطاقة البدنية في الملعب' },
          { time: '19:30-20:30', title: 'System Review, Tactical Planning / مراجعة النظام، تخطيط تكتيكي', desc: 'Self-Development and Weekly Evaluation / تطوير ذاتي وتقييم أسبوعي' }
        ]
      },
      6: {
        title: 'Mastery Saturday / سبت الإتقان',
        blocks: [
          { time: '05:00-10:00', title: 'Academic Focus / تركيز أكاديمي', desc: 'Physics Review + New Quran Memorization (5 Hours) / مراجعة فيزياء + حفظ قرآن جديد (5 ساعات)' },
          { time: '10:00-14:00', title: 'Technical Immersion / انغماس تقني', desc: 'Advanced Ethical Hacking + English Mastery (4 Hours) / تهكير أخلاقي متقدم + إتقان الإنجليزية (4 ساعات) + مادة فلسفة ' },
          { time: '14:00-15:00', title: 'Auditory Meditation / تأمل سمعي', desc: 'Listening to the Quran + Voice Modification & Improvement / استماع للقرآن + تعديل وتحسين الصوت' },
          { time: '15:00-16:30', title: 'Fitness & Physical Therapy / لياقة وعلاج طبيعي', desc: 'Physical Exercises: Abdominal Exercises (Six-pack) and chest / تمارين بدنية: تمارين البطن (سكس باك) و الصدر' },
          { time: '16:30-17:00', title: 'Therapy and Nutrition / علاج وتغذية', desc: 'Micronutrient Intake (Calcium / Magnesium / Zinc) / تناول المغذيات الدقيقة (كالسيوم / مغنيسيوم / زنك)' },
          { time: '17:00-18:30', title: 'Competitive Sports / رياضات تنافسية', desc: 'Football: Full Match (Maximum Physical Exertion) / كرة القدم: مباراة كاملة (أقصى مجهود بدني)' },
          { time: '18:30-19:30', title: 'Digital Architecture / هيكلة رقمية', desc: 'System Programming and Web Project Monitoring & Updates / برمجة النظام ومراقبة وتحديثات مشاريع الويب' },
          { time: '19:30-20:30', title: 'Calibration / معايرة', desc: 'Sudoku + System Calibration & Comprehensive Review... Weekly Evaluation "Yassine Tia" / سودوكو + معايرة النظام ومراجعة شاملة... تقييم أسبوعي "ياسين تيا"' },
          { time: '20:30-22:00', title: 'Maximum Stimulation / تحفيز أقصى', desc: 'Stretching & Lengthening Workouts + Sleep Preparation and Deep Rest / تمارين إطالة وتمدد + التحضير للنوم وراحة عميقة' }
        ]
      }
    }
},
 week2: {
    id: 'week2',
    title: 'System Update 8.0 — Infinity / تحديث النظام 8.0 — اللانهاية',
    version: '600',
    range: 'LVL 450 → 600 /  450 → 600  ',
        desc: 'مرحلة السيادة الكاملة: دمج منطق الشطرنج في AI Agents، الجري الانفجاري، والعمليات التكتيكية المستقلة.',

    schedule: [
      { start: 2.75, end: 5.0,  title: 'Night Prayer & Suhoor / صلاة العشاء والسحور',    desc: 'Qiyam + Protein Suhoor + Adhkar + Mental Review / قيام الليل + سحور غني بالبروتين + ذكر الله + مراجعة ذهنية سريعة' },
      { start: 5.0,  end: 6.0,  title: 'Spiritual Session / جلسة حوار روحي',        desc: 'Fajr + Adhkar + Recitation (Odd: Review / Even: New) / تلاوة القرآن (فردي: تأملي / ثنائي: جديد) + صلاة الفجر، الأذكار، وتمارين التمدد' },
      { start: 6.0,  end: 8.5,  title: 'Deep Programming / برمجة متقدمة',         desc: 'AiMoha (Python/JS) — Chess Logic into AI Agents / مشروع (بايثون/جافا سكريبت) - تعلم الهندسة المعمارية والتطوير (بناء العقل المدبر (Backend))' },
      { start: 8.5,  end: 10.5, title: 'AI Academy / دورات أكاديمية في الذكاء الاصطناعي',               desc: 'Advanced ML + LLMs + Algorithm App / تعلّم الآلة | Machine Learning' },
      { start: 10.5, end: 12.0, title: 'English Mastery / إتقان اللغة الإنجليزية',         desc: 'Lex Fridman Podcast + Tech Terms + Shadowing / شرح تقني معمق + مفردات التدريب على البناء والتطبيق العملي' },
      { start: 12.0, end: 13.0, title: ' Applied Laboratory / مختبر التطبيقات التقنية', desc: 'Grand Rest / استراحة طويلة + Applied Laboratory / مختبر التطبيقات التقنية. Real AI Projects + Systems Integration / راحة واستجمام' },
      { start: 13.0, end: 15.0, title: ' Grand Rest / استراحة طويلة+ Applied Laboratory / مختبر التطبيقات التقنية',       desc: 'Real AI Projects + Systems Integration / راحة واستجمام / دورات أكاديمية في الذكاء الاصطناعي التعلم العميق والشبكات العصبية (الأسبوع 7 - 10) + Dhuhr + Intense Protein Lunch / صلاة الظهر + غداء غني بالبروتين + قيلولة' },
      { start: 15.0, end: 16.5, title: 'PPL Preparation / برنامج التطوير البدني المتقدم (PPL)',          desc: 'Push(Handstand)/Pull(Explosive)/Legs(Jump) + Calisthenics / تمارين الدفع والسحب وتمارين الأرجل + الجمباز والكاليستينكس' },
      { start: 16.5, end: 17.5, title: 'Running Block / Relaxation جري خفيف أو راحة  ',            desc: '1 Hour Run (Wolfs Law Activation) جري خفيف إذا كنت تستطيع / Relaxation راحة نفسية وجسدية' },
      { start: 17.5, end: 19.5, title: 'Academic Focus / العلوم التجريبية',           desc: 'Math/Science/Physics + Al-Rasoulan + Light Dinner / المناهج الدراسية: الرياضيات (الأحد/الأربعاء)، العلوم (الاثنين/الجمعة)، الفيزياء (الثلاثاء/السبت)' },
      { start: 19.5, end: 20.5, title: 'Team Competitions / التنمية الذهنية والبدنية',        desc: 'Full Matches: Basketball/Football (High Intensity) / قراءة + أفلام وثائقية + ألعاب ذهنية + راحة بدنية' },
      { start: 20.5, end: 21.5, title: 'Mental Elevation / استكمال الألعاب والتنمية',         desc: 'Chess/Sudoku + Digital Books + Tech Docs / استكمال التنمية الذهنية + سودوكو وأفلام وثائقية' },
      { start: 21.5, end: 22.0, title: 'System Prep / إعداد النظام',              desc: 'Tomorrow Planning + Sleep Adhkar + Shutdown / إنشاء جدولك + أذكار المساء + استرخاء العضلات والعقل (نوم)' }
    ],
    days: {
      0: { sport: '🏀 Basketball (Match) / رياضة سباحة 🏊 أو كرة القدم ⚽ أو مواي تاي 🥊', ppl: 'Pull (Explosive) / تمارين السحب (الظهر والعضلة ذات الرأسين)', cognitive: 'Programming + AI (Chess Logic) / صنع كتاب رقمي (الجلسة 1)', academic: 'Mathematics / رياضيات' },
      1: { sport: '🥊 Muay Thai / رياضة سباحة 🏊 أو كرة القدم ⚽ أو مواي تاي 🥊', ppl: 'Legs (Jumps/Wolf) / تمارين الدفع الصدر (العلوي/الجانبي/العادي/الكتفين)', cognitive: 'Chess (AI Agent Analysis) / تعلم الحلاقة 🪒 وألعاب الخفة 🃏♣️ + فيلم وثائقي', academic: 'Natural Sciences / علوم طبيعية' },
      2: { sport: '🏀 Basketball (Match) / رياضة سباحة 🏊 أو كرة القدم ⚽ أو مواي تاي 🥊', ppl: 'Push (Handstand) / تمارين السحب (الظهر والعضلة ثلاثية الرؤوس)', cognitive: 'Programming + AI / قراءة كتب + مشاهدة تطوير الذات', academic: 'Physics / فيزياء' },
      3: { sport: '⚽ Football (Match) / رياضة سباحة 🏊 أو كرة القدم ⚽ أو مواي تاي 🥊', ppl: 'Pull & Abs/Triceps / تمارين للساقين (الأمامية والساقين)', cognitive: 'Hard Sudoku (Error Tracking) / Dual N-Back + فيلم وثائقي', academic: 'Math Review / مراجعة الرياضيات' },
      4: { sport: '🥋 Jiu-Jitsu / رياضة سباحة 🏊 أو كرة القدم ⚽ أو مواي تاي 🥊', ppl: 'Intense Legs (Jumps) / تمارين للبطن والعضلة ذات الرأسين', cognitive: 'Islamic Studies (Tawhid/Tajweed) / تعلم الحلاقة 🪒 وألعاب الخفة 🃏♣️ + مشاهدة تطوير الذات', academic: 'Islamic/History/Geo / دراسات إسلامية/تاريخ/جغرافيا' },
      5: { sport: '🚶 Calm Walk (Recovery) / 🏃 راحة واستشفاء وجري لمدة ساعة', ppl: 'Push (Handstand) / تمارين الدفع الصدر (الداخلية/الحوض/السفلي/البطن الست)', cognitive: 'Dual N-Back + Digital Book Check / تمارين الظهر المزدوجة + مراجعة كتاب', academic: 'Science Review / مراجعة العلوم' },
      6: { sport: '⚽ Football (Match) / رياضة سباحة 🏊 أو كرة القدم ⚽ أو مواي تاي 🥊', ppl: 'Abs (Six-pack) & Triceps / تمارين للبطن (عضلات البطن الست) والعضلة ثلاثية الرؤوس', cognitive: 'Ethical Hacking + Calibration / Dual N-Back + تقييم أسبوعي "ياسين تيا"', academic: 'Physics Review / مراجعة الفيزياء' }
    },
    special: { 
      4: {
        title: 'Achievement Thursday (Fasting and Diligence) / خميس الإنجاز (الصيام والاجتهاد)',
        blocks: [
          { time: '02:45-05:00', title: 'Night Prayer and Suhoor / صلاة العشاء والسحور', desc: 'Night Prayer + Protein-Rich Suhoor + Remembrance of Allah + Quick Mental Review / صلاة العشاء + سحور غني بالبروتين + ذكر الله + مراجعة ذهنية سريعة' },
          { time: '05:00-06:30', title: 'Quran Session / جلسة قرآنية', desc: 'Recitation and Memorization of the Holy Quran (1.5 Hours) / تلاوة وحفظ القرآن الكريم (ساعة ونصف)' },
          { time: '06:30-09:30', title: 'Religious Studies / دراسات دينية', desc: 'Riyadh as-Salihin + Al-Bidayah wa\'n-Nihayah + 40 Nawawi (3 Hours) / رياض الصالحين + البداية والنهاية + الأربعين نووية (٣ ساعات)' },
          { time: '09:30-11:30', title: 'Study Marathon / ماراثون دراسي', desc: 'History, Geography, and French using Mind Maps / التاريخ والجغرافيا والفرنسية باستخدام الخرائط الذهنية' },
          { time: '11:30-13:30', title: 'Language Skills / مهارات لغوية', desc: 'Reviewing English Terminology and Grammar as Software Logic / مراجعة المصطلحات الإنجليزية وفهم قواعد اللغة كجزء من منطق البرمجيات' },
          { time: '13:30-15:00', title: 'Website Development / تطوير مواقع الويب', desc: 'Developing and Monetizing Websites / تطوير مواقع الويب وتحقيق الربح منها' },
          { time: '15:00-16:30', title: 'Targeted Muscle Building / تمارين تقوية العضلات المستهدفة', desc: 'Leg Muscles (Thighs/Calves) + Abdominal & Muscle Heads / ((عضلات الساق (الفخذين/الساقين) مهمة جانبية)) + عضلات البطن ورؤوس العضلات' },
          { time: '16:30-18:30', title: 'Specific Outdoor Sport / الرياضة الخارجية المحددة', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊 / (رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي (تايلاندية) ..قم بتقسيمها على الاسبوع )' },
          { time: '18:30-19:30', title: 'Content Creation / إنشاء المحتوى', desc: ' إنشاء وصناعة المحتوى يوتيوب وإنستقرام وتيكتوك وفيسبوك /Creating and producing content for YouTube, Instagram, TikTok, and Facebook' },
          { time: '19:30-20:30', title: 'Spiritual Balance / التوازن الروحي', desc: 'Listening to the Quran + Meditation and Voice Tone / الاستماع إلى القرآن الكريم + التأمل وتحسين نبرة الصوت وعمقه' },
          { time: '20:30-22:00', title: 'Mindset and Crafts / العقلية والحرف اليدوية', desc: 'Self-Development + Barbering 🪒 & Magic Tricks 🃏♣️ / مشاهدة تطوير الذات + تعلم الحلاقة 🪒 وألعاب الخفة 🃏♣️' }
        ]
      },
      5: {
        title: 'Creativity Friday / جمعة الإبداع',
        blocks: [
          { time: '05:00-08:00', title: 'Spiritual Meditation / التأمل الروحي', desc: 'Surah Al-Kahf + Morning Adhkar + Natural Sciences Review / سورة الكهف + أذكار الصباح + مراجعة العلوم الطبيعية' },
          { time: '08:00-10:00', title: 'Mind Reset / إعادة ضبط الذهن', desc: 'Preparing for Video Editing (Montage) / التحضير لمونتاج الفيديو' },
          { time: '10:00-14:00', title: 'Ethical Hacking and Terminology / الاختراق الأخلاقي والمصطلحات', desc: 'Learning Ethical Hacking + Study Marathon for Arabic/English and Islamic Studies / تعلم الاختراق الأخلاقي + ماراثون دراسي للغة العربية/الإنجليزية والدراسات الإسلامية باستخدام الخرائط الذهنية' },
          { time: '14:00-15:00', title: 'Audio Meditation / صوت التأمل', desc: 'Listening to the Holy Quran and Meditation / الاستماع إلى القرآن الكريم والتأمل (يشمل تحسين نبرة الصوت)' },
          { time: '15:00-16:00', title: 'Physical Preparation / التحضير البدني', desc: 'Push-ups (Chest and Shoulders) / تمارين الضغط (للصدر والكتفين)' },
          { time: '16:00-17:00', title: 'Website Management / إدارة الموقع الإلكتروني', desc: 'Following Up on Completed Website Projects / متابعة مشاريع تطوير الموقع الإلكتروني المنجزة' },
          { time: '17:00-18:30', title: 'Energy Generation / توليد الطاقة', desc: 'One-hour run (Unless swimming later) / جري لمدة ساعة واحدة (لاتعمل إذا كانت لديك سباحة بعدها 🏊)' },
          { time: '18:30-19:30', title: 'Energy Generation / توليد الطاقة', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊 / (رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي (تايلاندية) ..قم بتقسيمها على الاسبوع )' },
          { time: '19:30-20:30', title: 'System Review, Tactical Planning / مراجعة النظام ، التخطيط التكتيكي + Viewing facts / مشاهدة حقائق', desc: 'Self-Development + Updating "Hard Tasks" List / التطوير الذاتي والتقييم الأسبوعي + تحديث قائمة "المهام الصعبة" للأسبوع القادم+ Viewing facts / مشاهدة حقائق (الدحيح أو ريهام عايدي )' }
        ]
      },
      6: {
        title: 'Mastery Saturday / سبت الإتقان',
        blocks: [
          { time: '05:00-10:00', title: 'Academic Focus / التركيز الأكاديمي', desc: 'Physics Review + New Quran Memorization (5 Hours) / مراجعة الفيزياء + حفظ القرآن الكريم (٥ الساعات)' },
          { time: '10:00-14:00', title: 'Technical Immersion / التعمق التقني', desc: 'Advanced Ethical Hacking + English Mastery (4 Hours) / الاختراق الأخلاقي المتقدم + إتقان اللغة الإنجليزية (٤ ساعات) + مادة فلسفة' },
          { time: '14:00-15:00', title: 'Crafts / الحرف اليدوية', desc: 'Barbering 🪒 & Magic Tricks 🃏♣️ / تعلم الحلاقة 🪒 وألعاب الخفة 🃏♣️' },
          { time: '15:00-16:30', title: 'Fitness & Physical Therapy / اللياقة البدنية والعلاج الطبيعي', desc: 'Physical Exercises: Abs (Six-pack) and Triceps / تمارين بدنية .. تمارين للبطن (عضلات البطن الست) والعضلة ثلاثية الرؤوس' },
          { time: '16:30-17:00', title: 'Therapy and Nutrition / العلاج والتغذية', desc: 'Micronutrient Intake (Calcium / Magnesium / Zinc) / تناول المغذيات الدقيقة (الكالسيوم / المغنيسيوم / الزنك)' },
          { time: '17:00-18:30', title: 'Competitive Sports / الرياضات التنافسية', desc: 'Swimming 🏊 or Football ⚽ or Muay Thai 🥊 / (رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي (تايلاندية) ..قم بتقسيمها على الاسبوع )' },
          { time: '18:30-19:30', title: 'Digital Arch & Energy Generation / الهندسة المعمارية الرقمية وتوليد الطاقة', desc: 'Football: Unleashing full physical energy on the pitch / كرة القدم: إطلاق كامل الطاقة البدنية في الملعب' },
          { time: '19:30-20:30', title: 'System Review, Tactical Planning / مراجعة النظام، تخطيط تكتيكي', desc: 'Self-Development and Weekly Evaluation / تطوير ذاتي وتقييم أسبوعي' }
        ]
      }
    }
},
week3: {
    id: 'week3',
    title: 'System Update 10.0 — Infinity / تحديث النظام 10.0 — اللانهاية',
    version: '800',
    range: 'LVL 600 → 800 /  600 → 800  ',
        desc: 'مرحلة التعمق التقني المتقدم: بناء المظهر الخارجي (Frontend) والعقل المدبر (Backend)، التعلم العميق والشبكات العصبية.',

    schedule: [
      { start: 5.0,  end: 6.0,  title: 'Spiritual Session / جلسة حوار روحي',        desc: 'تلاوة القرآن (فردي: تأملي / ثنائي: جديد) + صلاة الفجر، الأذكار، وتمارين التمدد' },
      { start: 6.0,  end: 8.5,  title: 'Advanced Programming / برمجة متقدمة',         desc: 'مشروع (بايثون/جافا سكريبت) - تعلم الهندسة المعمارية والتطوير..بناء المظهر الخارجي (Frontend) + (بناء العقل المدبر (Backend))' },
      { start: 8.5,  end: 10.5, title: 'AI Academy / دورات أكاديمية في الذكاء الاصطناعي', desc: 'التعلم العميق والشبكات العصبية (الأسبوع 7 - 10) تعلّم الآلة | Machine Learning' },
      { start: 10.5, end: 12.0, title: 'English Mastery / إتقان اللغة الإنجليزية',        desc: 'شرح تقني معمق + مفردات التدريب على البناء والتطبيق العملي' },
      { start: 12.0, end: 13.0, title: ' Rest & Useful Learning / راحة واستجمام وتعلم مفيد',              desc: 'دورات برنامج بلاندر البرتقالي للرسومات التعلم العميق' },
      { start: 13.0, end: 15.0, title: ' Grand Rest / استراحة طويلة + Rest & Useful Learning / راحة واستجمام وتعلم مفيد', desc: 'دورات برنامج بلاندر البرتقالي للرسومات التعلم العميق + صلاة الظهر + غداء غني بالبروتين + قيلولة' },
      { start: 15.0, end: 16.5, title: 'PPL & Calisthenics / برنامج التطوير البدني المتقدم', desc: 'تمارين الدفع والسحب وتمارين الأرجل + الجمباز والكاليستينكس التمارين الرياضية' },
      { start: 16.5, end: 17.5, title: 'Rest & Dinner / راحة من التعب ونشاط وعشاء',       desc: 'راحة من التعب' },
      { start: 17.5, end: 19.5, title: 'Academic Focus / العلوم التجريبية',          desc: 'المناهج الدراسية: الرياضيات (الأحد/الأربعاء)، العلوم (الاثنين/الجمعة)، الفيزياء (الثلاثاء/السبت)' },
      { start: 19.5, end: 20.5, title: 'Mental & Physical Dev / التنمية الذهنية والبدنية',  desc: 'قراءة + أفلام وثائقية + ألعاب ذهنية + راحة بدنية' },
      { start: 20.5, end: 22.0, title: 'System Prep / إعداد النظام',              desc: 'إنشاء جدولك + أذكار المساء + استرخاء العضلات والعقل' }
    ],
    days: {
      0: { sport: 'سباحة 🏊 / مواي تاي 🥊 / جيو-جيتسو 🥋', ppl: 'Pull (Back & Biceps) / تمارين السحب', cognitive: 'صنع كتاب رقمي (الجلسة 1)', academic: 'Mathematics / رياضيات' },
      1: { sport: 'سباحة 🏊 / مواي تاي 🥊 / جيو-جيتسو 🥋', ppl: 'Push (Chest upper/side/normal) / تمارين الدفع', cognitive: 'تعلم الموسيقى غيتارو بيانو 💎 + فيلم وثائقي', academic: 'Natural Sciences / علوم طبيعية' },
      2: { sport: 'سباحة 🏊 / مواي تاي 🥊 / جيو-جيتسو 🥋', ppl: 'Pull (Back & Triceps) / تمارين السحب', cognitive: 'قراءة كتب + مشاهدة تطوير الذات', academic: 'Physics / فيزياء' },
      3: { sport: 'كرة السلة 🏀 / كرة القدم ⚽ / 1-Hour Run 🏃', ppl: 'Legs (Front & Calves) / تمارين للساقين', cognitive: 'Dual N-Back + فيلم وثائقي', academic: 'Math Review / مراجعة الرياضيات' },
      4: { sport: 'كرة السلة 🏀 / كرة القدم ⚽ / 1-Hour Run 🏃', ppl: 'Abs & Biceps / تمارين للبطن والعضلة ذات الرأسين', cognitive: 'تعلم الموسيقى غيتارو بيانو 💎 + مشاهدة تطوير الذات', academic: 'Islamic/History/Geo / دراسات إسلامية/تاريخ/جغرافيا' },
      5: { sport: 'راحة واستشفاء وجري لمدة ساعة 🏃', ppl: 'Push (Chest inner/pelvis/lower) / تمارين الدفع', cognitive: 'Dual N-Back + مراجعة كتاب', academic: 'Science Review / مراجعة العلوم' },
      6: { sport: 'كرة السلة 🏀 / كرة القدم ⚽ / 1-Hour Run 🏃', ppl: 'Abs (Six-pack) & Triceps / تمارين للبطن والترايسبس', cognitive: 'Dual N-Back + تقييم أسبوعي "ياسين تيا" + fl studio', academic: 'Physics Review / مراجعة الفيزياء' }
    },
    special: { 
      4: {
        title: 'Achievement Thursday (Fasting and Diligence) / خميس الإنجاز (الصيام والاجتهاد)',
        blocks: [
          { time: '02:45-05:00', title: 'Night Prayer and Suhoor / صلاة العشاء والسحور', desc: 'صلاة العشاء + سحور غني بالبروتين + ذكر الله + مراجعة ذهنية سريعة' },
          { time: '05:00-06:30', title: 'Quran Session / جلسة قرآنية', desc: 'تلاوة وحفظ القرآن الكريم (ساعة ونصف)' },
          { time: '06:30-09:30', title: 'Religious Studies / دراسات دينية', desc: 'العقيدة + رياض الصالحين + البداية والنهاية + الأربعين نووية (٣ ساعات)' },
          { time: '09:30-11:30', title: 'Study Marathon / ماراثون دراسي', desc: 'التاريخ والجغرافيا والفرنسية باستخدام الخرائط الذهنية' },
          { time: '11:30-13:30', title: 'Language Skills / مهارات لغوية', desc: 'مراجعة المصطلحات الإنجليزية وفهم قواعد اللغة كجزء من منطق البرمجيات' },
          { time: '13:30-15:00', title: 'Website Development / تطوير مواقع الويب', desc: 'تطوير مواقع الويب وتحقيق الربح منها' },
          { time: '15:00-16:30', title: 'Targeted Muscle Building / تمارين تقوية العضلات المستهدفة', desc: 'عضلات الساق (الفخذين/الساقين) مهمة جانبية + عضلات البطن ورؤوس العضلات' },
          { time: '16:30-18:30', title: 'Specific Outdoor Sport / الرياضة الخارجية المحددة', desc: '(رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي) و (🏀 Basketball أو 🥋 BJJ أو 🏃 1-Hour Run)' },
          { time: '18:30-19:30', title: 'Content Creation / إنشاء وصناعة المحتوى', desc: 'يوتيوب وإنستقرام وتيكتوك وفيسبوك / Creating and producing content for YouTube, Instagram, TikTok, and Facebook' },
          { time: '19:30-20:30', title: 'Study Marathon / ماراثون دراسي', desc: 'التاريخ والجغرافيا والفرنسية باستخدام الخرائط الذهنية' },
          { time: '20:30-22:00', title: 'Crafts / الحرف اليدوية', desc: 'تعلم الموسيقى غيتارو بيانو فقط 💎' }
        ]
      },
      5: {
        title: 'Creativity Friday / جمعة الإبداع',
        blocks: [
          { time: '05:00-08:00', title: 'Spiritual Meditation / التأمل الروحي', desc: 'سورة الكهف + أذكار الصباح + مراجعة العلوم الطبيعية' },
          { time: '08:00-10:00', title: 'Mind Reset / إعادة ضبط الذهن', desc: 'التحضير لمونتاج الفيديو' },
          { time: '10:00-14:00', title: 'Ethical Hacking and Terminology / الاختراق الأخلاقي والمصطلحات', desc: 'تعلم الاختراق الأخلاقي + ماراثون دراسي للغة العربية/الإنجليزية والدراسات الإسلامية باستخدام الخرائط الذهنية' },
          { time: '14:00-15:00', title: 'Audio Meditation / صوت التأمل', desc: 'الاستماع إلى القرآن الكريم والتأمل (يشمل تحسين نبرة الصوت)' },
          { time: '15:00-16:00', title: 'Physical Preparation / التحضير البدني', desc: 'تمارين الضغط (للصدر والكتفين)' },
          { time: '16:00-17:00', title: 'Website Management / إدارة الموقع الإلكتروني', desc: 'متابعة مشاريع تطوير الموقع الإلكتروني المنجزة' },
          { time: '17:00-18:30', title: 'Energy Generation / توليد الطاقة', desc: 'جري لمدة ساعة واحدة (لاتعمل إذا كانت لديك سباحة بعدها 🏊)' },
          { time: '18:30-19:30', title: 'Energy Generation / توليد الطاقة', desc: '(رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي) و (🏀 Basketball أو 🥋 BJJ أو 🏃 1-Hour Run)' },
          { time: '19:30-20:30', title: 'System Review, Tactical Planning / مراجعة النظام ، التخطيط التكتيكي', desc: 'التطوير الذاتي والتقييم الأسبوعي + تحديث قائمة "المهام الصعبة" للأسبوع القادم' }
        ]
      },
      6: {
        title: 'Mastery Saturday / سبت الإتقان',
        blocks: [
          { time: '05:00-10:00', title: 'Academic Focus / التركيز الأكاديمي', desc: 'مراجعة الفيزياء + حفظ القرآن الكريم (٥ الساعات)' },
          { time: '10:00-14:00', title: 'Technical Immersion / التعمق التقني/ fl studio', desc: 'الاختراق الأخلاقي +  fl studio (الجلسة الأولى) + إتقان اللغة الإنجليزية (٤ ساعات) + مادة فلسفة' },
          { time: '14:00-15:00', title: 'Crafts / الحرف اليدوية/ fl studio ', desc: 'تعلم fl studio (الجلسة الثانية)' },
          { time: '15:00-16:30', title: 'Fitness & Physical Therapy / لياقة وعلاج طبيعي', desc: 'Physical Exercises: Abdominal Exercises (Six-pack) and Triceps / تمارين بدنية: تمارين البطن (سكس باك) والترايسبس' },
          { time: '16:30-17:00', title: 'Therapy and Nutrition / علاج وتغذية', desc: 'Micronutrient Intake (Calcium / Magnesium / Zinc) / تناول المغذيات الدقيقة (كالسيوم / مغنيسيوم / زنك)' },
          { time: '17:00-18:30', title: 'Competitive Sports / رياضات تنافسية', desc: '(رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي) و (🏀 Basketball أو 🥋 BJJ أو 🏃 1-Hour Run)' },
          { time: '18:30-19:30', title: 'Digital Architecture / هيكلة رقمية', desc: 'System Programming and Web Project Monitoring & Updates / برمجة النظام ومراقبة وتحديثات مشاريع الويب' },
          { time: '19:30-20:30', title: 'Calibration / معايرة', desc: 'Sudoku + System Calibration & Comprehensive Review... Weekly Evaluation "Yassine Tia" / سودوكو + معايرة النظام ومراجعة شاملة... تقييم أسبوعي "ياسين تيا"' },
          { time: '20:30-22:00', title: 'Maximum Stimulation / تحفيز أقصى', desc: 'Stretching & Lengthening Workouts + Sleep Preparation and Deep Rest / تمارين إطالة وتمدد + التحضير للنوم وراحة عميقة ومشاهدة مراوغات ومهارات في رياضة كرة السلة وكرة القدم (خلاصة لتسفيد من المشاهدة)' }
        ]
      }
    }
},
week4: {
    id: 'week4',
    title: 'System Update 11.0 — Infinity / تحديث النظام 11.0 — اللانهاية',
    version: '1000',
    range: 'LVL 800 → 1000 /  800 → 1000  ',
        desc: 'مرحلة الإتقان الروحي والتقني: التركيز على العقيدة والتوحيد، المختبر التقني التطبيقي، والإتقان الكامل للغات والمهارات.',

    schedule: [
      { start: 5.0,  end: 6.0,  title: 'Spiritual Session / جلسة حوار روحي',        desc: 'تلاوة القرآن (فردي: تأملي / ثنائي: جديد) + صلاة الفجر، الأذكار، وتمارين التمدد' },
      { start: 6.0,  end: 8.5,  title: 'Advanced Programming / برمجة متقدمة',         desc: 'كتاب التوحيد والعقيدة' },
      { start: 8.5,  end: 10.5, title: 'AI Academy / أكاديمية في الذكاء الاصطناعي..مختبر تقني تطبيقي', desc: 'مختبر تقني تطبيقي' },
      { start: 10.5, end: 12.0, title: 'English Mastery / إتقان اللغة الإنجليزية',        desc: 'شرح تقني معمق + مفردات التدريب على البناء والتطبيق العملي ( إذا أتقنت الإنجليزية إنتقل إلى لغة أخرى مفيدة )' },
      { start: 12.0, end: 13.0, title: 'Rest & Useful Learning / راحة واستجمام وتعلم مفيد',              desc: 'دورات برنامج بلاندر البرتقالي للرسومات التعلم العميق' },
      { start: 13.0, end: 15.0, title: ' Grand Rest / استراحة طويلة+ Rest & Useful Learning / راحة واستجمام وتعلم مفيد', desc: 'دورات برنامج بلاندر البرتقالي للرسومات التعلم العميق + صلاة الظهر + غداء غني بالبروتين + قيلولة' },
      { start: 15.0, end: 16.5, title: 'PPL & Calisthenics / برنامج التطوير البدني المتقدم', desc: 'تمارين الدفع والسحب وتمارين الأرجل + الجمباز والكاليستينكس التمارين الرياضية' },
      { start: 16.5, end: 17.5, title: 'Rest & Dinner / راحة من التعب ونشاط وعشاء',       desc: 'راحة من التعب' },
      { start: 17.5, end: 19.5, title: 'Academic Focus / العلوم التجريبية',          desc: 'المناهج الدراسية: الرياضيات (الأحد/الأربعاء)، العلوم (الاثنين/الجمعة)، الفيزياء (الثلاثاء/السبت)' },
      { start: 19.5, end: 20.5, title: 'Mental & Physical Dev / التنمية الذهنية والبدنية',  desc: 'قراءة + أفلام وثائقية + ألعاب ذهنية + راحة بدنية' },
      { start: 20.5, end: 22.0, title: 'System Prep / إعداد النظام + Opening the pelvis / فتح الحوض',              desc: 'إنشاء جدولك + أذكار المساء + استرخاء العضلات والعقل + Opening the pelvis / فتح الحوض' }
    ],
    days: {
      0: { sport: 'سباحة 🏊 / مواي تاي 🥊 / جيو-جيتسو 🥋', ppl: 'Pull (Back & Biceps)  ', cognitive: 'صنع كتاب رقمي (الجلسة 1) / fl studio للقران الكريم ', academic: 'Mathematics / رياضيات' },
      1: { sport: 'سباحة 🏊 / مواي تاي 🥊 / جيو-جيتسو 🥋', ppl: 'Push (Chest upper/side/normal) / تمارين الدفع', cognitive: 'فيلم وثائقي / fl studio للقران الكريم ', academic: 'Natural Sciences / علوم طبيعية' },
      2: { sport: 'سباحة 🏊 / مواي تاي 🥊 / جيو-جيتسو 🥋', ppl: 'Pull (Back & Triceps) / تمارين السحب', cognitive: 'قراءة كتب + مشاهدة تطوير الذات', academic: 'Physics / فيزياء' },
      3: { sport: 'كرة السلة 🏀 / كرة القدم ⚽ / 1-Hour Run 🏃', ppl: 'Legs (Front & Calves) / تمارين للساقين', cognitive: 'فيلم وثائقي', academic: 'Math Review / مراجعة الرياضيات' },
      4: { sport: 'كرة السلة 🏀 / كرة القدم ⚽ / 1-Hour Run 🏃', ppl: 'Abs & Biceps / تمارين للبطن والعضلة ذات الرأسين', cognitive: 'مشاهدة تطوير الذات + fl studio للقران الكريم ', academic: 'Islamic/History/Geo / دراسات إسلامية/تاريخ/جغرافيا' },
      5: { sport: 'راحة واستشفاء وجري لمدة ساعة 🏃', ppl: 'Push (Chest inner/pelvis/lower) / تمارين الدفع', cognitive: 'Dual N-Back + مراجعة كتاب', academic: 'Science Review / مراجعة العلوم' },
      6: { sport: 'كرة السلة 🏀 / كرة القدم ⚽ / 1-Hour Run 🏃', ppl: 'Abs (Six-pack) & Triceps / تمارين للبطن والترايسبس', cognitive: 'Dual N-Back + تقييم أسبوعي "ياسين تيا" + fl studio للقران الكريم', academic: 'Physics Review / مراجعة الفيزياء' }
    },
    special: { 
      4: {
        title: 'Achievement Thursday (Fasting and Diligence) / خميس الإنجاز (الصيام والاجتهاد)',
        blocks: [
          { time: '02:45-05:00', title: 'Night Prayer and Suhoor / صلاة العشاء والسحور', desc: 'صلاة العشاء + سحور غني بالبروتين + ذكر الله + مراجعة ذهنية سريعة' },
          { time: '05:00-06:30', title: 'Quran Session / جلسة قرآنية', desc: 'تلاوة وحفظ القرآن الكريم (ساعة ونصف)' },
          { time: '06:30-09:30', title: 'Religious Studies / دراسات دينية', desc: 'رياض الصالحين + البداية والنهاية + الأربعين نووية (٣ ساعات)' },
          { time: '09:30-11:30', title: 'Study Marathon / ماراثون دراسي', desc: 'التاريخ والجغرافيا والفرنسية باستخدام الخرائط الذهنية الجلسة الاولى' },
          { time: '11:30-13:30', title: 'Language Skills / مهارات لغوية', desc: 'مراجعة المصطلحات الإنجليزية وفهم قواعد اللغة كجزء من منطق البرمجيات' },
          { time: '13:30-15:00', title: 'Website Development / تطوير مواقع الويب', desc: 'تطوير مواقع الويب وتحقيق الربح منها' },
          { time: '15:00-16:30', title: 'Targeted Muscle Building / تمارين تقوية العضلات المستهدفة', desc: 'عضلات الساق (الفخذين/الساقين) مهمة جانبية + عضلات البطن ورؤوس العضلات' },
          { time: '16:30-18:30', title: 'Specific Outdoor Sport / الرياضة الخارجية المحددة', desc: '(رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي) و (🏀 Basketball أو 🥋 BJJ أو 🏃 1-Hour Run)' },
          { time: '18:30-19:30', title: 'Content Creation / إنشاء وصناعة المحتوى', desc: 'يوتيوب وإنستقرام وتيكتوك وفيسبوك / Creating and producing content for YouTube, Instagram, TikTok, and Facebook' },
          { time: '19:30-20:30', title: 'Study Marathon / ماراثون دراسي', desc: 'التاريخ والجغرافيا والفرنسية باستخدام الخرائط الذهنية الجلسة الثانية' },
          { time: '20:30-22:00', title: 'Crafts / الحرف اليدوية / fl studio للقران الكريم + Opening the pelvis / فتح الحوض ', desc: 'fl studio للقران الكريم + Opening the pelvis / فتح الحوض' }
        ]
      },
      5: {
        title: 'Creativity Friday / جمعة الإبداع',
        blocks: [
          { time: '05:00-08:00', title: 'Spiritual Meditation / التأمل الروحي', desc: 'سورة الكهف + أذكار الصباح + مراجعة العلوم الطبيعية' },
          { time: '08:00-10:00', title: 'Mind Reset / إعادة ضبط الذهن', desc: 'التحضير لمونتاج الفيديو' },
          { time: '10:00-14:00', title: 'Ethical Hacking and Terminology / الاختراق الأخلاقي والمصطلحات', desc: 'تعلم الاختراق الأخلاقي + ماراثون دراسي للغة العربية/الإنجليزية والدراسات الإسلامية باستخدام الخرائط الذهنية' },
          { time: '14:00-15:00', title: 'Audio Meditation / صوت التأمل', desc: 'الاستماع إلى القرآن الكريم والتأمل (يشمل تحسين نبرة الصوت)' },
          { time: '15:00-16:00', title: 'Physical Preparation / التحضير البدني', desc: 'تمارين الضغط (للصدر والكتفين)' },
          { time: '16:00-17:00', title: 'Website Management / إدارة الموقع الإلكتروني', desc: 'متابعة مشاريع تطوير الموقع الإلكتروني المنجزة' },
          { time: '17:00-18:30', title: 'Energy Generation / توليد الطاقة', desc: 'جري لمدة ساعة واحدة (لاتعمل إذا كانت لديك سباحة بعدها 🏊)' },
          { time: '18:30-19:30', title: 'Energy Generation / توليد الطاقة', desc: '(رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي) و (🏀 Basketball أو 🥋 BJJ أو 🏃 1-Hour Run)' },
          { time: '19:30-20:30', title: 'System Review, Tactical Planning / مراجعة النظام ، التخطيط التكتيكي + Opening the pelvis / فتح الحوض', desc: 'التطوير الذاتي والتقييم الأسبوعي + تحديث قائمة "المهام الصعبة" للأسبوع القادم + مشاهدة مباريات ومراوغات للتعلم وأخذ الفائدة+ Opening the pelvis / فتح الحوض' }
        ]
      },
      6: {
        title: 'Mastery Saturday / سبت الإتقان',
        blocks: [
          { time: '05:00-10:00', title: 'Academic Focus / التركيز الأكاديمي', desc: 'مراجعة الفيزياء + حفظ القرآن الكريم (٥ الساعات)' },
          { time: '10:00-14:00', title: 'Technical Immersion / التعمق التقني/ fl studio', desc: 'الاختراق الأخلاقي + fl studio (الجلسة الأولى) + إتقان اللغة الإنجليزية (٤ ساعات) + مادة فلسفة' },
          { time: '14:00-15:00', title: 'Crafts / الحرف اليدوية/ fl studio للقران الكريم ', desc: 'تعلم fl studio (الجلسة الثانية)' },
          { time: '15:00-16:30', title: 'Fitness & Physical Therapy / لياقة وعلاج طبيعي', desc: 'Physical Exercises: Abdominal Exercises (Six-pack) and Triceps / تمارين بدنية: تمارين البطن (سكس باك) والترايسبس' },
          { time: '16:30-17:00', title: 'Therapy and Nutrition / علاج وتغذية', desc: 'Micronutrient Intake (Calcium / Magnesium / Zinc) / تناول المغذيات الدقيقة (كالسيوم / مغنيسيوم / زنك)' },
          { time: '17:00-18:30', title: 'Competitive Sports / رياضات تنافسية', desc: '(رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي) و (🏀 Basketball أو 🥋 BJJ أو 🏃 1-Hour Run)' },
          { time: '18:30-19:30', title: 'Digital Architecture / هيكلة رقمية', desc: 'System Programming and Web Project Monitoring & Updates / برمجة النظام ومراقبة وتحديثات مشاريع الويب' },
          { time: '19:30-20:30', title: 'Calibration / معايرة', desc: 'Sudoku + System Calibration & Comprehensive Review... Weekly Evaluation "Yassine Tia" / سودوكو + معايرة النظام ومراجعة شاملة... تقييم أسبوعي "ياسين تيا"' },
          { time: '20:30-22:00', title: 'Maximum Stimulation / تحفيز أقصى + Opening the pelvis / فتح الحوض', desc: 'Stretching & Lengthening Workouts + Sleep Preparation and Deep Rest / تمارين إطالة وتمدد + التحضير للنوم وراحة عميقة ومشاهدة مراوغات ومهارات في رياضة كرة السلة وكرة القدم (خلاصة لتسفيد من المشاهدة) + Opening the pelvis / فتح الحوض' }
        ]
      }
    }
},
week5: {
    id: 'week5',
    title: 'System Update 1000.0 — Infinity / تحديث النظام 1000.0 — اللانهاية',
    version: '∞',
    range: 'LVL 1000 → ∞ /  1000 → ∞  ',
        desc: 'مرحلة السيادة المطلقة والحرية الكاملة: أنت الآن تتحكم في النظام، تختار برامجك بنفسك، وتدبر أمورك باستقلالية تامة.',

    schedule: [
      { start: 5.0,  end: 6.0,  title: 'Spiritual Session / جلسة حوار روحي',        desc: 'تلاوة القرآن (فردي: تأملي / ثنائي: جديد) + صلاة الفجر، الأذكار، وتمارين التمدد' },
      { start: 6.0,  end: 8.5,  title: '؟؟؟',                                        desc: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)' },
      { start: 8.5,  end: 10.5, title: '؟؟؟',                                        desc: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)' },
      { start: 10.5, end: 12.0, title: 'English Mastery / إتقان اللغة الإنجليزية',        desc: 'شرح تقني معمق + مفردات التدريب على البناء والتطبيق العملي ( إذا أتقنت الإنجليزية إنتقل إلى لغة أخرى مفيدة )' },
      { start: 12.0, end: 13.0, title: ' ؟؟؟ ',              desc: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)' },
      { start: 13.0, end: 15.0, title: '؟؟؟ + Grand Rest / استراحة طويلة ',                                        desc: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)' },
      { start: 15.0, end: 16.5, title: 'PPL & Calisthenics / برنامج التطوير البدني المتقدم', desc: 'تمارين الدفع والسحب وتمارين الأرجل + الجمباز والكاليستينكس التمارين الرياضية' },
      { start: 16.5, end: 17.5, title: 'Rest & Dinner / راحة من التعب ونشاط وعشاء',       desc: 'راحة من التعب' },
      { start: 17.5, end: 19.5, title: 'Academic Focus / العلوم التجريبية',          desc: 'المناهج الدراسية: الرياضيات (الأحد/الأربعاء)، العلوم (الاثنين/الجمعة)، الفيزياء (الثلاثاء/السبت)' },
      { start: 19.5, end: 20.5, title: '؟؟؟',                                        desc: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)' },
      { start: 20.5, end: 22.0, title: 'System Prep / إعداد النظام + Opening the pelvis / فتح الحوض',              desc: 'إنشاء جدولك + أذكار المساء + استرخاء العضلات والعقل + Opening the pelvis / فتح الحوض' }
    ],
    days: {
      0: { sport: 'سباحة 🏊 / مواي تاي 🥊 / جيو-جيتسو 🥋', ppl: 'Pull (Back & Biceps) / تمارين السحب', cognitive: 'صنع كتاب رقمي (الجلسة 1) / مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)', academic: 'Mathematics / رياضيات' },
      1: { sport: 'سباحة 🏊 / مواي تاي 🥊 / جيو-جيتسو 🥋', ppl: 'Push (Chest upper/side/normal) / تمارين الدفع', cognitive: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)', academic: 'Natural Sciences / علوم طبيعية' },
      2: { sport: 'سباحة 🏊 / مواي تاي 🥊 / جيو-جيتسو 🥋', ppl: 'Pull (Back & Triceps) / تمارين السحب', cognitive: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)', academic: 'Physics / فيزياء' },
      3: { sport: 'كرة السلة 🏀 / كرة القدم ⚽ / 1-Cycling ​🚴​', ppl: 'Legs (Front & Calves) / تمارين للساقين', cognitive: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)', academic: 'Math Review / مراجعة الرياضيات' },
      4: { sport: 'كرة السلة 🏀 / كرة القدم ⚽ / 1-Duel or horseback riding ​🤺 ​🏇​', ppl: 'Abs & Biceps / تمارين للبطن والعضلة ذات الرأسين', cognitive: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)', academic: 'Islamic/History/Geo / دراسات إسلامية/تاريخ/جغرافيا' },
      5: { sport: 'راحة واستشفاء وجري لمدة ساعة 🏃', ppl: 'Push (Chest inner/pelvis/lower) / تمارين الدفع', cognitive: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)', academic: 'Science Review / مراجعة العلوم' },
      6: { sport: 'كرة السلة 🏀 / كرة القدم ⚽ / 1- Karate 🐉​👘​​', ppl: 'Abs (Six-pack) & Triceps / تمارين للبطن والترايسبس', cognitive: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)', academic: 'Physics Review / مراجعة الفيزياء' }
    },
    special: { 
      4: {
        title: 'Achievement Thursday (Fasting and Diligence) / خميس الإنجاز (الصيام والاجتهاد)',
        blocks: [
          { time: '02:45-05:00', title: 'Night Prayer and Suhoor / صلاة العشاء والسحور', desc: 'صلاة العشاء + سحور غني بالبروتين + ذكر الله + مراجعة ذهنية سريعة' },
          { time: '05:00-06:30', title: 'Quran Session / جلسة قرآنية', desc: 'تلاوة وحفظ القرآن الكريم (ساعة ونصف)' },
          { time: '06:30-09:30', title: '؟؟؟', desc: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)' },
          { time: '09:30-11:30', title: 'Study Marathon / ماراثون دراسي', desc: 'التاريخ والجغرافيا والفرنسية باستخدام الخرائط الذهنية الجلسة الاولى' },
          { time: '11:30-13:30', title: 'Language Skills / مهارات لغوية', desc: 'مراجعة المصطلحات الإنجليزية وفهم قواعد اللغة كجزء من منطق البرمجيات' },
          { time: '13:30-15:00', title: 'Website Development / تطوير مواقع الويب', desc: 'تطوير مواقع الويب وتحقيق الربح منها' },
          { time: '15:00-16:30', title: 'Targeted Muscle Building / تمارين تقوية العضلات المستهدفة', desc: 'عضلات الساق (الفخذين/الساقين) مهمة جانبية + عضلات البطن ورؤوس العضلات' },
          { time: '16:30-18:30', title: 'Specific Outdoor Sport / الرياضة الخارجية المحددة', desc: '(رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي) و (🏀 Basketball أو 🥋 BJJ أو 🏃 1-Hour Run) مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)' },
          { time: '18:30-19:30', title: 'Content Creation / إنشاء وصناعة المحتوى', desc: 'يوتيوب وإنستقرام وتيكتوك وفيسبوك / Creating and producing content for YouTube, Instagram, TikTok, and Facebook' },
          { time: '19:30-20:30', title: 'Study Marathon / ماراثون دراسي', desc: 'التاريخ والجغرافيا والفرنسية باستخدام الخرائط الذهنية الجلسة الثانية' },
          { time: '20:30-22:00', title: '؟؟؟ + Opening the pelvis / فتح الحوض', desc: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب) يفضل مراجعة مادة علمية + Opening the pelvis / فتح الحوض' }
        ]
      },
      5: {
        title: 'Creativity Friday / جمعة الإبداع',
        blocks: [
          { time: '05:00-08:00', title: 'Spiritual Meditation / التأمل الروحي', desc: 'سورة الكهف + أذكار الصباح + مراجعة العلوم الطبيعية' },
          { time: '08:00-10:00', title: 'Mind Reset / إعادة ضبط الذهن', desc: 'التحضير لمونتاج الفيديو' },
          { time: '10:00-14:00', title: 'Ethical Hacking and Terminology / الاختراق الأخلاقي والمصطلحات', desc: 'تعلم الاختراق الأخلاقي + ماراثون دراسي للغة العربية/الإنجليزية والدراسات الإسلامية باستخدام الخرائط الذهنية' },
          { time: '14:00-15:00', title: 'Audio Meditation / صوت التأمل', desc: 'الاستماع إلى القرآن الكريم والتأمل (يشمل تحسين نبرة الصوت)' },
          { time: '15:00-16:00', title: 'Physical Preparation / التحضير البدني', desc: 'تمارين الضغط (للصدر والكتفين)' },
          { time: '16:00-17:00', title: 'Website Management / إدارة الموقع الإلكتروني', desc: 'متابعة مشاريع تطوير الموقع الإلكتروني المنجزة' },
          { time: '17:00-18:30', title: 'تمارين مادة علمية مهمة', desc: '' },
          { time: '18:30-19:30', title: 'Energy Generation / توليد الطاقة', desc: '(رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي) و (🏀 Basketball أو 🥋 BJJ أو 🏃 1-Hour Run) مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)' },
          { time: '19:30-20:30', title: '؟؟؟ + Opening the pelvis / فتح الحوض', desc: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب) + Opening the pelvis / فتح الحوض' }
        ]
      },
      6: {
        title: 'Mastery Saturday / سبت الإتقان',
        blocks: [
          { time: '05:00-10:00', title: 'Academic Focus / التركيز الأكاديمي', desc: 'مراجعة الفيزياء + حفظ القرآن الكريم (٥ الساعات)' },
          { time: '10:00-14:00', title: 'Technical Immersion / التعمق التقني/ fl studio', desc: 'الاختراق الأخلاقي + تمارين مادة علمية مهمة + إتقان اللغة الإنجليزية (٤ ساعات) + مادة فلسفة' },
          { time: '14:00-15:00', title: 'Crafts / الحرف اليدوية/ fl studio للقران الكريم', desc: 'تمارين مادة علمية مهمة (الجلسة الثانية)' },
          { time: '15:00-16:30', title: 'Fitness & Physical Therapy / لياقة وعلاج طبيعي', desc: 'Physical Exercises: Abdominal Exercises (Six-pack) and Triceps / تمارين بدنية: تمارين البطن (سكس باك) والترايسبس' },
          { time: '16:30-17:00', title: 'Therapy and Nutrition / علاج وتغذية', desc: 'Micronutrient Intake (Calcium / Magnesium / Zinc) / تناول المغذيات الدقيقة (كالسيوم / مغنيسيوم / زنك)' },
          { time: '17:00-18:30', title: 'Competitive Sports / رياضات تنافسية', desc: '(رياضة سباحة 🏊 أو كرة القدم ⚽ أو 🥊 مواي تاي) و (🏀 Basketball أو 🥋 BJJ أو 🏃 1-Hour Run) مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)' },
          { time: '18:30-19:30', title: 'Digital Architecture / هيكلة رقمية', desc: 'System Programming and Web Project Monitoring & Updates / برمجة النظام ومراقبة وتحديثات مشاريع الويب' },
          { time: '19:30-20:30', title: '؟؟؟', desc: 'مخير من البرامج السابقة (لديك حرية الإختيار أيها العاهل الشاب)' },
          { time: '20:30-22:00', title: 'Maximum Stimulation / تحفيز أقصى + Opening the pelvis / فتح الحوض', desc: 'Stretching & Lengthening Workouts + Sleep Preparation and Deep Rest / تمارين إطالة وتمدد + التحضير للنوم وراحة عميقة ومشاهدة مراوغات ومهارات في رياضة كرة السلة وكرة القدم (خلاصة لتسفيد من المشاهدة) + Opening the pelvis / فتح الحوض' }
        ]
      }
    }
}
};

// ==========================================
// SOVEREIGN SCHEDULES MATRIX
// ==========================================
const SovereignSchedules = {
    getTier(level) {
        if (level >= 1 && level <= 70) return "tier_1_70";
        if (level > 70 && level <= 130) return "tier_70_130";
        if (level > 130 && level <= 180) return "tier_130_180";
        if (level > 180 && level <= 250) return "tier_180_250";
        if (level > 250 && level <= 320) return "tier_250_320";
        if (level > 320 && level <= 400) return "tier_320_400";
        if (level > 400 && level <= 450) return "tier_400_450";
        if (level > 450) return "tier_infinity";
        return "tier_1_70";
    },
    xpRules: { coding_ai: 30, sports: 20, languages_books: 10, dungeons: 10 }
};

// ==========================================
// SOVEREIGN ENGINE
// ==========================================
const SovereignEngine = {
    state: {
        get playerLevel() { return PlayerState.data.level || 1; },
        get playerXP() { return PlayerState.data.xp || 0; },
        get playerGold() { return PlayerState.data.gold || 0; },
        activeTitle: localStorage.getItem('sovereign_title') || "[???]",
        activeQuest: JSON.parse(localStorage.getItem('sovereign_active_quest')) || null
    },
    config: { 
        weights: { coding_ai: 30, sports: 20, languages_books: 10, dungeons: 10 }, 
        penaltyXP: 5, 
        xpPerLevelBase: 100 
    },
    
    init() {
        if (!window.Utils) {
            window.Utils = {
                formatDecimalTime(dec) {
                    const h = Math.floor(dec);
                    const m = Math.floor((dec - h) * 60);
                    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                },
                getCurrentDecimalTime() {
                    const now = new Date();
                    return now.getHours() + now.getMinutes() / 60;
                }
            };
        }

        if (!localStorage.getItem('sovereign_program_data') && typeof PROGRAM_DATA !== 'undefined') {
            localStorage.setItem('sovereign_program_data', JSON.stringify(PROGRAM_DATA));
        }

        this.checkActiveQuestOnLoad();
        this.runTimeScheduleEngine();
        setInterval(() => this.runTimeScheduleEngine(), 60000);
    },
    
    parseTimeToDecimal(timeStr) {
        if (!timeStr || !timeStr.includes(':')) return 0;
        const parts = timeStr.trim().split(':');
        return (parseInt(parts[0], 10) || 0) + ((parseInt(parts[1], 10) || 0) / 60);
    },

    runTimeScheduleEngine() {
        const now = new Date();
        const day = now.getDay();
        const currentTimeDecimal = Utils.getCurrentDecimalTime();
        
        const activeProgramId = localStorage.getItem('sovereign_active_program') || 'week1';
        let allPrograms = null;
        
        try {
            allPrograms = JSON.parse(localStorage.getItem('sovereign_program_data'));
        } catch(e) {}
        
        if (!allPrograms && typeof PROGRAM_DATA !== 'undefined') {
            allPrograms = PROGRAM_DATA;
        }
        
        if (!allPrograms || !allPrograms[activeProgramId]) return;
        const prog = allPrograms[activeProgramId];
        
        let currentBlock = null;
        let blocks = [];
        
        if (prog.special && prog.special[day] && prog.special[day].blocks) {
            blocks = prog.special[day].blocks.map(b => {
                const timeParts = b.time.split('-');
                return {
                    start: this.parseTimeToDecimal(timeParts[0]),
                    end: this.parseTimeToDecimal(timeParts[1]),
                    title: b.title,
                    desc: b.desc,
                    timeStr: b.time
                };
            });
        } else if (prog.schedule) {
            blocks = prog.schedule.map(s => ({
                start: s.start,
                end: s.end,
                title: s.title,
                desc: s.desc,
                timeStr: `${Utils.formatDecimalTime(s.start)} - ${Utils.formatDecimalTime(s.end)}`
            }));
        }
        
        for (let block of blocks) {
            if (currentTimeDecimal >= block.start && currentTimeDecimal < block.end) {
                currentBlock = block;
                break;
            }
        }
        
        if (currentBlock) {
            const savedActive = localStorage.getItem('sovereign_active_quest');
            if (!savedActive) {
                this.triggerQuestPopup({
                    title: currentBlock.title,
                    details: currentBlock.desc,
                    type: this.inferQuestType(currentBlock.title),
                    timeLimit: currentBlock.timeStr
                });
            }
        }
    },

    inferQuestType(title) {
        if (!title) return 'dungeons';
        const t = title.toLowerCase();
        if (t.match(/برمج|code|هندس|ai|تطوير|مختبر/)) return 'coding_ai';
        if (t.match(/رياض|بدني|ppl|جري|تدريب|قتال|جيو/)) return 'sports';
        if (t.match(/لغة|إنجليز|كتاب|قرآن|روح|علم|قراءة/)) return 'languages_books';
        return 'dungeons';
    },

    triggerQuestPopup(questData) {
        this.state.activeQuest = questData;
        localStorage.setItem('sovereign_active_quest', JSON.stringify(questData));
        
        const rewardXP = this.config.weights[questData.type] || 20;
        
        if (window.QuestSystem && typeof QuestSystem.logAction === 'function') {
            QuestSystem.logAction('quest', `تم استدعاء بروتوكول تلقائي: [${questData.title}]`);
        }
        
        if (window.AnimePopup && typeof AnimePopup.show === 'function') {
            AnimePopup.show(questData.title, questData.details, questData.timeLimit, rewardXP);
        }
    },

    checkActiveQuestOnLoad() {
        try {
            const saved = localStorage.getItem('sovereign_active_quest');
            if (saved) {
                this.state.activeQuest = JSON.parse(saved);
                const activeBar = document.getElementById('activeDirectiveBar');
                const activeText = document.getElementById('activeDirectiveText');
                if (activeBar && activeText) {
                    activeText.textContent = this.state.activeQuest.title;
                    activeBar.classList.remove('hidden');
                    if (window.DirectiveTimer) DirectiveTimer.start(this.state.activeQuest.acceptedAt || Date.now());
                }
            }
        } catch (e) {}
    }
};

// ==========================================
// WEATHER & METRICS
// ==========================================
const SovereignMetrics = {
    init() {
        this.runClock();
        this.syncWeatherAndLocation();
        setInterval(() => this.syncWeatherAndLocation(), 900000);
    },
    runClock() {
        const clockElement = document.getElementById('sysClock');
        if (!clockElement) return;
        setInterval(() => {
            const now = new Date();
            clockElement.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        }, 1000);
    },
    async syncWeatherAndLocation() {
        const locEl = document.getElementById('sysLocation');
        const tempEl = document.getElementById('sysTemp');
        const humEl = document.getElementById('sysHumidity');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    try {
                        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&relative_humidity_2m=true`);
                        if (!response.ok) throw new Error();
                        const data = await response.json();
                        if(locEl) locEl.textContent = `📍 SYSTEM ONLINE [${lat.toFixed(2)}, ${lon.toFixed(2)}]`;
                        if(tempEl) tempEl.textContent = `${Math.round(data.current_weather.temperature)}°C`;
                        if(humEl) humEl.textContent = `${data.current_weather.relative_humidity_2m || 50}% Hum`;
                    } catch (error) { this.activateFallbackMode(); }
                },
                (error) => { this.activateFallbackMode(); }
            );
        } else { this.activateFallbackMode(); }
    },
    activateFallbackMode() {
        if(document.getElementById('sysLocation')) document.getElementById('sysLocation').textContent = `📍 SOVEREIGN ZONE`;
        if(document.getElementById('sysTemp')) document.getElementById('sysTemp').textContent = `24°C`;
        if(document.getElementById('sysHumidity')) document.getElementById('sysHumidity').textContent = `45% Hum`;
    }
};

// ==========================================
// ROUTER SYSTEM
// ==========================================
const Router = {
    currentView: 'all',
    navigate(view) {
        this.currentView = view;

        document.querySelectorAll('#nav-active').forEach(btn => {
            if (view === 'active') {
                btn.classList.add('border-amber-500');
                btn.querySelector('span:first-child')?.classList.add('text-amber-400');
            } else {
                btn.classList.remove('border-amber-500');
                btn.querySelector('span:first-child')?.classList.remove('text-amber-400');
            }
        });

        if (view === 'active') {
            if (window.SoundEffects) SoundEffects.playSystemClick();
            if (window.QuestSystem) QuestSystem.setFilter('active');
            if (window.Toast) Toast.show('عرض المهام النشطة فقط', 'info');
        } else {
            if (window.SoundEffects) SoundEffects.playSystemClick();
            if (window.QuestSystem) QuestSystem.setFilter('all');
        }
    }
};

// ==========================================
// SYSTEM INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    SoundEffects.init();
    PlayerState.init();
    QuestSystem.init();
    Pomodoro.init();
    SovereignMetrics.init();
    SovereignEngine.init();

    const taskInput = document.getElementById('taskInput');
    if(taskInput) taskInput.addEventListener('keypress', e => { if(e.key === 'Enter') QuestSystem.addTask(); });
});

// ==========================================
// SOVEREIGN TITLES DATA
// ==========================================
const SOVEREIGN_TITLES_INDEX = JSON.parse(localStorage.getItem('sovereign_titles_index') || '[]');

function buildTitlesIndex() {
    const storedIndex = localStorage.getItem('sovereign_titles_index');
    if (storedIndex) {
        try {
            return JSON.parse(storedIndex);
        } catch(e) {
            return [];
        }
    }
    return [];
}

function updateTitlesIndex(titlesData) {
    if (!titlesData || !Array.isArray(titlesData)) return;
    const minimalIndex = titlesData.map(t => ({
        id: t.id,
        nameAr: t.nameAr,
        nameEn: t.nameEn,
        reqLevel: t.reqLevel
    }));
    localStorage.setItem('sovereign_titles_index', JSON.stringify(minimalIndex));
}

// ==========================================
// SOVEREIGN TITLE SYSTEM 
// ==========================================
function loadMonarchTitle() {
    const titleElement = document.getElementById('monarch-active-title');
    if (!titleElement) return;

    try {
        // ⚠️ إصلاح حرج: كانت هذه الدالة تعرض اللقب فقط إذا تم تفعيله من المتجر،
        // متجاهلة اللقب السيادي الذي اختاره اللاعب بنفسه عند التسجيل في index.html.
        // الآن تُستخدم SovereignCore.getActiveTitleText() كمصدر حقيقة واحد: تُحلّ
        // اللقب عبر equippedTitle أولاً، ثم تتراجع تلقائياً إلى لقب التسجيل الأصلي.
        let actualTitle = '';
        let actualTitleEn = '';
        const systemData = JSON.parse(localStorage.getItem('monarch_system_data') || '{}');
        const equippedId = systemData.equippedTitle;

        if (window.SovereignCore) {
            actualTitle = SovereignCore.getActiveTitleText();
            if (equippedId) {
                const titlesIndex = buildTitlesIndex();
                const fromIndex = titlesIndex.find(item => item.id === equippedId);
                if (fromIndex) actualTitleEn = fromIndex.nameEn || '';
            }
        } else {
            // احتياط في حال لم يُحمَّل محرك SovereignCore بعد
            if (equippedId) {
                const titlesIndex = buildTitlesIndex();
                const titleFromIndex = titlesIndex.find(item => item.id === equippedId);
                if (titleFromIndex) {
                    actualTitle = titleFromIndex.nameAr;
                    actualTitleEn = titleFromIndex.nameEn;
                } else if (typeof SOVEREIGN_TITLES_DATA !== 'undefined') {
                    const titleData = SOVEREIGN_TITLES_DATA.find(item => item.id === equippedId);
                    if (titleData) { actualTitle = titleData.nameAr; actualTitleEn = titleData.nameEn; }
                } else {
                    const cachedTitle = localStorage.getItem(`title_cache_${equippedId}`);
                    if (cachedTitle) {
                        try {
                            const parsed = JSON.parse(cachedTitle);
                            actualTitle = parsed.nameAr || '';
                            actualTitleEn = parsed.nameEn || '';
                        } catch(e) {}
                    }
                }
            }
            // الاحتياط الأخير: اللقب الذي اختاره اللاعب عند التسجيل
            if (!actualTitle) actualTitle = systemData.title || '';
        }

        if (actualTitle !== "") {
            titleElement.textContent = `[ ${actualTitle} ]`;
            titleElement.classList.add('active');
            titleElement.setAttribute('title', actualTitleEn || actualTitle);

            if (equippedId) {
                localStorage.setItem(`title_cache_${equippedId}`, JSON.stringify({
                    nameAr: actualTitle,
                    nameEn: actualTitleEn
                }));
            }
        } else {
            titleElement.classList.remove('active');
            titleElement.textContent = ""; 
            titleElement.removeAttribute('title');
        }
    } catch(e) {
        console.error("[Sovereign Title System] خطأ في تحميل اللقب:", e);
        if (titleElement) {
            titleElement.classList.remove('active');
            titleElement.textContent = "";
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadMonarchTitle();
});

// GLOBAL EXPORTS
window.loadMonarchTitle = loadMonarchTitle;
window.updateTitlesIndex = updateTitlesIndex;
window.UI = UI;
window.Toast = Toast;
window.SoundEffects = SoundEffects;
window.PlayerState = PlayerState;
window.QuestSystem = QuestSystem;
window.Pomodoro = Pomodoro;
window.Milestone = Milestone;
window.AnimePopup = AnimePopup;
window.SovereignEngine = SovereignEngine;
window.SovereignSchedules = SovereignSchedules;
window.SovereignMetrics = SovereignMetrics;
window.DirectiveTimer = DirectiveTimer;
window.Router = Router;

// ==========================================
// SOVEREIGN AURA
// ==========================================
const savedAura = localStorage.getItem('sovereign_aura_color');
if(savedAura) {
    document.documentElement.style.setProperty('--sys-cyan', savedAura);
    document.documentElement.style.setProperty('--sys-cyan-glow', savedAura + '99');
}

function applyAura() {
    const savedAura = localStorage.getItem('sovereign_aura_color');
    if(savedAura) {
        document.documentElement.style.setProperty('--sys-cyan', savedAura);
        document.documentElement.style.setProperty('--sys-cyan-glow', `${savedAura}66`); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyAura();
});

// ==========================================
// SHADOW COMPANION
// ==========================================
const SHADOW_ASSETS_MAP = {
    "shadow-Tank": "01010202.png",
    "shadow-Iron": "0101.png",
    "shadow-Igris": "0404.png",
    "shadow-Beru": "47.png"
};

function updateSovereignCompanion() {
    const container = document.getElementById('live-shadow-container');
    const imgElement = document.getElementById('live-shadow-img');
    if (!container || !imgElement) return;

    const equippedShadowId = localStorage.getItem('equipped_shadow_companion');

    if (equippedShadowId && SHADOW_ASSETS_MAP[equippedShadowId]) {
        imgElement.src = SHADOW_ASSETS_MAP[equippedShadowId];
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

window.addEventListener('DOMContentLoaded', updateSovereignCompanion);

// ==========================================
// خط الأنابيب الموحّد الوحيد للمزامنة عبر الألسنة (يستبدل كل المستمعات المتفرقة السابقة)
// ==========================================
// 1) مفاتيح خاصة بهذه الصفحة لا يديرها المحرك المركزي SovereignCore
window.addEventListener('storage', (e) => {
    if (e.key === 'equipped_avatar_border') {
        applyEquippedAvatarBorder();
    } else if (e.key === 'equipped_shadow_companion') {
        updateSovereignCompanion();
    } else if (e.key === 'sovereign_aura_color') {
        applyAura();
        if (typeof Toast !== 'undefined') {
            Toast.show('⚡ استشعار طاقة خارجية: تم تحديث الهالة السيادية للنظام!', 'info');
        }
    }
});

// 2) بيانات اللاعب واللقب: عبر اشتراك واحد في SovereignCore، يغطي التخزين العابر
//    للألسنة + BroadcastChannel + الحفظ المحلي الفوري — مسار واحد بدل ثلاثة
if (window.SovereignCore) {
    SovereignCore.onChange(() => {
        if (typeof loadMonarchTitle === 'function') loadMonarchTitle();
        if (typeof PlayerState !== 'undefined') PlayerState.init();
    });
}
