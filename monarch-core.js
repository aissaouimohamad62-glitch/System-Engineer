/* ============================================================================
   SOVEREIGN CORE — المحرك المركزي الموحّد للنظام السيادي
   ----------------------------------------------------------------------------
   مصدر حقيقة واحد لبيانات اللاعب (monarch_system_data) + خط أنابيب واحد
   للتزامن الفوري بين الألسنة (Tabs) عبر window.storage + BroadcastChannel.
   لا حلقات setInterval، لا قراءات متكررة لـ localStorage — كل صفحة تشترك
   في نفس النسخة المخزّنة بالذاكرة وتُخطر فور تغيّرها.

   يُحمَّل هذا الملف قبل أي سكربت خاص بالصفحة:
   <script src="monarch-core.js"></script>
   ============================================================================ */
(function (window) {
    'use strict';

    const STORAGE_KEY = 'monarch_system_data';
    const TITLES_KEY  = 'sovereign_titles_index';
    const AURA_KEY     = 'sovereign_aura_color';
    const SYNC_CHANNEL = 'sovereign_sync';

    // الحالة الافتراضية — أي حقل مفقود في السجل المخزَّن يُستكمل منها
    const DEFAULT_STATE = {
        name: '',                  // الاسم الحقيقي — ثابت، لا يُمس إلا من بوابة التسجيل
        title: '[مبتدئ الكتل]',     // نص احتياطي قبل ربط اللقب بفهرس المتجر
        equippedTitle: '',         // معرّف اللقب المُفعّل — الحقل الوحيد القابل للتغيير عبر المتجر
        level: 1,
        xp: 0,
        gold: 0,
        authority: 0,
        lethality: 0,
        stats: { str: 10, vit: 10, agi: 10, int: 10, sen: 10 },
        avatar: '',
        inventory: []
    };

    // بوابات المستويات الصارمة للبرامج التشغيلية الخمسة
    // كل برنامج نشط حصراً ضمن مداه؛ يُقفل تلقائياً أسفل الحد الأدنى وفوق الحد الأقصى
    const PROGRAM_GATES = [
        { id: 'week1', order: 1, label: 'البرنامج الأول',  labelEn: 'PROGRAM I',     min: 1,  max: 25 },
        { id: 'week2', order: 2, label: 'البرنامج الثاني', labelEn: 'PROGRAM II',    min: 25, max: 35 },
        { id: 'week3', order: 3, label: 'البرنامج الثالث', labelEn: 'PROGRAM III',   min: 35, max: 45 },
        { id: 'week4', order: 4, label: 'البرنامج الرابع', labelEn: 'PROGRAM IV',    min: 45, max: 50 },
        { id: 'week5', order: 5, label: 'البرنامج الأخير', labelEn: 'FINAL PROGRAM', min: 50, max: Infinity }
    ];

    let cache = null;
    const subscribers = [];

    function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

    function mergeDefaults(parsed) {
        const safe = parsed && typeof parsed === 'object' ? parsed : {};
        return {
            ...clone(DEFAULT_STATE),
            ...safe,
            stats: { ...DEFAULT_STATE.stats, ...(safe.stats || {}) },
            inventory: Array.isArray(safe.inventory) ? safe.inventory : []
        };
    }

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            cache = raw ? mergeDefaults(JSON.parse(raw)) : clone(DEFAULT_STATE);
        } catch (e) {
            console.error('[Sovereign Core] فشل قراءة سجل الحالة المركزي:', e);
            cache = clone(DEFAULT_STATE);
        }
        return cache;
    }

    function persist() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
            broadcast({ type: 'SYSTEM_DATA_UPDATED' });
        } catch (e) {
            console.error('[Sovereign Core] فشل حفظ سجل الحالة المركزي:', e);
        }
    }

    function notify(origin) {
        subscribers.forEach(fn => {
            try { fn(cache, origin); } catch (e) { console.error('[Sovereign Core] خطأ في مشترك تحديث:', e); }
        });
    }

    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
        try { bc = new BroadcastChannel(SYNC_CHANNEL); } catch (e) { bc = null; }
    }
    function broadcast(payload) {
        if (bc) { try { bc.postMessage(payload); } catch (e) {} }
    }

    const SovereignCore = {
        STORAGE_KEY, TITLES_KEY, AURA_KEY, PROGRAM_GATES,

        get data() { return cache || load(); },

        load,

        /** يدمج partial مع الحالة الحالية ويحفظها ويُخطر كل المشتركين فوراً (غير حاجز) */
        save(partial) {
            if (!cache) load();
            const next = { ...cache, ...(partial || {}) };
            if (partial && partial.stats) next.stats = { ...cache.stats, ...partial.stats };
            if (partial && partial.inventory) next.inventory = partial.inventory;
            cache = next;
            persist();
            notify('local');
            return cache;
        },

        /** يسجّل مستمعاً يُستدعى عند أي تحديث (محلي أو من لسان آخر)، ويُعيد دالة لإلغاء الاشتراك */
        onChange(fn) {
            if (typeof fn !== 'function') return () => {};
            subscribers.push(fn);
            return () => {
                const i = subscribers.indexOf(fn);
                if (i > -1) subscribers.splice(i, 1);
            };
        },

        // ───────────────────────── الهوية: اسم ثابت + لقب متحوّل ─────────────────────────
        /** الاسم الحقيقي — للقراءة فقط، لا توجد دالة تعديل له خارج بوابة التسجيل index.html */
        getRealName() {
            return (this.data.name || '').trim();
        },

        getTitlesIndex() {
            try {
                const raw = localStorage.getItem(TITLES_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) { return []; }
        },

        /** يحل نص اللقب النشط من equippedTitle عبر فهرس المتجر، مع احتياط مُخبّأ */
        getActiveTitleText() {
            const d = this.data;
            if (d.equippedTitle) {
                const found = this.getTitlesIndex().find(t => t.id === d.equippedTitle);
                if (found) return found.nameAr || found.nameEn || '';
                try {
                    const cached = localStorage.getItem(`title_cache_${d.equippedTitle}`);
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        if (parsed.nameAr) return parsed.nameAr;
                    }
                } catch (e) {}
            }
            return d.title || '';
        },

        /** الدالة الوحيدة المخوّلة لتغيير اللقب — تُستدعى من sovereign-shop.html فقط، لا تمس name إطلاقاً */
        equipTitle(titleId) {
            this.save({ equippedTitle: titleId });
            broadcast({ type: 'TITLE_EQUIPPED', titleId });
            this.renderIdentityStrip();
        },

        // ───────────────────────── بوابة المستويات الصارمة (Shadow Lock) ─────────────────────────
        getProgramGate(id) {
            return PROGRAM_GATES.find(p => p.id === id) || null;
        },

        /** يحدد إن كان برنامج تشغيلي مقفلاً عند مستوى اللاعب الحالي، وسبب القفل والمستوى المطلوب */
        getProgramStatus(id) {
            const gate = this.getProgramGate(id);
            const level = this.data.level || 1;
            if (!gate) return { locked: false, level, gate: null };
            if (level < gate.min) {
                return { locked: true, reason: 'below', requiredLevel: gate.min, gate, level };
            }
            if (level >= gate.max) {
                return { locked: true, reason: 'surpassed', requiredLevel: gate.max, gate, level };
            }
            return { locked: false, gate, level };
        },

        getCurrentProgramId() {
            const level = this.data.level || 1;
            const match = PROGRAM_GATES.find(p => level >= p.min && level < p.max);
            return match ? match.id : PROGRAM_GATES[PROGRAM_GATES.length - 1].id;
        },

        /** يبني عقدة DOM لطبقة "القفل الظلي" — جاهزة للحقن داخل أي حاوية برنامج */
        buildShadowLockOverlay(status) {
            const overlay = document.createElement('div');
            overlay.className = 'shadow-lock-overlay';
            const icon = status.reason === 'surpassed' ? '✓' : '🔒';
            const reqText = status.reason === 'surpassed'
                ? 'تم تجاوز هذه البوابة — البرنامج التالي نشط الآن'
                : `يتطلب اختراق هذه البوابة الوصول إلى <span>المستوى ${status.requiredLevel}</span>`;
            overlay.innerHTML = `
                <div class="shadow-lock-icon">${icon}</div>
                <div class="shadow-lock-title">SHADOW LOCK PROTOCOL / بروتوكول القفل الظلي</div>
                <div class="shadow-lock-req">${reqText}</div>
                <div class="shadow-lock-sub">مستواك الحالي: ${status.level}</div>
            `;
            return overlay;
        },

        /** يطبّق القفل/الإظهار على عنصر حاوية برنامج بحسب معرّفه — آمنة عند غياب العنصر */
        applyProgramGateToElement(programId, containerEl) {
            if (!containerEl) return;
            const status = this.getProgramStatus(programId);
            containerEl.querySelectorAll(':scope > .shadow-lock-overlay').forEach(n => n.remove());
            containerEl.classList.toggle('sov-locked-content', status.locked);
            if (status.locked) {
                containerEl.style.position = containerEl.style.position || 'relative';
                containerEl.appendChild(this.buildShadowLockOverlay(status));
            }
            return status;
        },

        // ───────────────────────── الهالة اللونية ─────────────────────────
        applyAura() {
            const aura = localStorage.getItem(AURA_KEY);
            if (aura) {
                document.documentElement.style.setProperty('--sys-cyan', aura);
                document.documentElement.style.setProperty('--sys-cyan-glow', aura + '99');
            }
        },

        // ───────────────────────── شبكة التنقل: تمييز الرابط النشط تلقائياً ─────────────────────────
        highlightActiveNav() {
            const here = (location.pathname.split('/').pop() || 'index11.html').toLowerCase();
            document.querySelectorAll('#sovereign-nav a.nav-item').forEach(a => {
                const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
                const active = href === here;
                a.classList.toggle('nav-item-active', active);
                if (active) a.setAttribute('aria-current', 'page');
                else a.removeAttribute('aria-current');
            });
        },

        // ───────────────────────── حقن شارة الهوية (اسم ثابت + لقب متحوّل) ─────────────────────────
        renderIdentityStrip() {
            const realName = this.getRealName();
            const activeTitle = this.getActiveTitleText();
            const level = this.data.level || 1;

            document.querySelectorAll('[data-sov-name]').forEach(el => {
                if (realName) el.textContent = realName;
            });
            document.querySelectorAll('[data-sov-title]').forEach(el => {
                if (activeTitle) {
                    el.textContent = `[ ${activeTitle} ]`;
                    el.classList.add('active');
                } else {
                    el.textContent = '';
                    el.classList.remove('active');
                }
            });
            document.querySelectorAll('[data-sov-level]').forEach(el => { el.textContent = level; });
        },

        init() {
            load();
            this.applyAura();
            this.renderIdentityStrip();
            this.highlightActiveNav();
            notify('init');
        }
    };

    // ───────────────────────── خط أنابيب التزامن الموحّد الوحيد ─────────────────────────
    // مستمع storage واحد فقط لكامل النظام — يستبدل كل المستمعات المتفرقة القديمة
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            load();
            SovereignCore.renderIdentityStrip();
            notify('cross-tab');
        } else if (e.key === AURA_KEY) {
            SovereignCore.applyAura();
        } else if (e.key === TITLES_KEY) {
            SovereignCore.renderIdentityStrip();
            notify('titles-index');
        }
    });

    if (bc) {
        bc.onmessage = (event) => {
            const type = event.data && event.data.type;
            if (type === 'SYSTEM_DATA_UPDATED' || type === 'TITLE_EQUIPPED') {
                load();
                SovereignCore.renderIdentityStrip();
                notify('broadcast');
            }
        };
    }

    document.addEventListener('DOMContentLoaded', () => SovereignCore.init());

    window.SovereignCore = SovereignCore;
})(window);
