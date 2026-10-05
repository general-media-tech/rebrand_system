/* ═══════════════════════════════════════════════════════════════════════════
   gmt-intro.js — انترو النظام · وهو نفسه شاشة التحميل  ·  2026-10-03
   ─────────────────────────────────────────────────────────────────────────
   قرار المالك ت٢، بنصّه:

     «انترو أوّل تشغيل على الجهاز **او التحديث او التثبيت** بلا تخطٍّ، لأنّه
      أساساً رح **يغطّي على تحميل الصور والبيانات** وخلّيه متل تحميل اللعبة.
      Gta مثلاً هو انترو وهو إنّه عم تحمّل، كل شاشة بوقتٍ كافٍ. أمّا شرح النظام
      الذي يُفتح لاحقاً من الخيارات: فيه تخطٍّ».

   وهذه ليست زينة. فكرتُه أنّ الزمن الضائع في التحميل **موجودٌ أصلاً**، فبدل
   أن يراه المستخدم شاشةً بيضاء أو مؤشّراً يدور، يراه تعريفاً بالنظام. ولذلك:
     · لا تخطٍّ — الشاشات تُعرَض كاملةً (طلبُه الصريح).
     · ولا ينتهي قبل أن **تجهز الصفحة فعلاً** — فلا يرى شاشةً نصفَ مرسومة.

   ثلاث لحظاتٍ يُعرَض فيها، وكلُّها «النظام تغيّر تحته»:
     ① أوّل تشغيلٍ على هذا الجهاز   ② بعد تحديث (تغيّر رقم النسخة)
     ③ بعد التثبيت كتطبيق (PWA)

   ⚠️ **وأخطر ما في هذه الميزة أنّها قد تصير قفلاً.** انترو ينتظر «جهوز الصفحة»
   يصير شاشةً لا تُغادَر إن تعطّلت القاعدة أو انقطعت الشبكة — وهذا بالضبط نمط
   العطل الذي أصلحتُه للمالك مراراً. فثلاثة حُرّاس:
     · سقفٌ زمنيٌّ صارم (HARD_CAP): بعده يُغلَق مهما كان حال التحميل.
     · لا يُعرَض إطلاقاً على صفحات الزبون.
     · أيّ خطأٍ داخله يُغلقه بدل أن يُجمّد الشاشة (try/catch حول الإقلاع).

   وشرحُ النظام المفتوح من «الخيارات» شيءٌ آخر تماماً — ذاك `gmt-guide`
   وفيه زرّ «تخطّي» كما طلب، ولا نمسّه.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var doc = global.document;
  if (!doc || global.GMTIntro) return;

  var LS_SEEN   = 'gmt_intro_seen_build';     // آخر نسخةٍ عُرض فيها
  /* ══════════════════════════════════════════════════════════════════════════
     ⏱️ الزمن — قرارُ تصميمٍ أشرحه لأنّه يمسّ وقت موظّفك كل يوم

     شاشاتُ المجموعة (ت٦) رفعت العدد من ٤ إلى ٨. وبـ٢٢٠٠ms لكلٍّ يصير
     الانترو **١٧٫٦ ثانية** — أي أنّ الكاشير ينتظر ١٨ ثانيةً بعد كل تحديثٍ
     قبل أن يبيع. وهذا نقيضُ غاية الميزة.

     فالتصميم: الشاشاتُ ليست كلُّها بنفس المناسبة.
       • شاشاتُ **المجموعة** (تابعٌ للمجموعة · الإشراف · ألمانيا · الصين)
         تعريفٌ بالهوية ⇒ تُعرَض في **أوّل تشغيلٍ على الجهاز وعند التثبيت**
         فقط. لا معنى لإخبار الموظّف كل أسبوعٍ أنّ الشركة تملك نظامها.
       • شاشاتُ **النظام** (ما يفعله · كل كميّةٍ لها فاتورة · بلا إنترنت)
         تُعرَض دائماً — لأنّها تذكيرٌ بقواعد العمل.

     والزمن يتكيّف: عرضٌ كاملٌ أبطأ قليلاً لكلِّ شاشة لأنّه يحدث مرّةً،
     وعرضٌ قصيرٌ أسرع لأنّه يتكرّر.
     ══════════════════════════════════════════════════════════════════════════ */
  /* الزمنُ لكلِّ شاشة بقدر ما فيها من قراءة — لا رقمٌ واحد للجميع:
       شاشةُ هويّةٍ فيها سطرٌ وعَلَم  ⇒ ١٣٠٠ms تكفي
       شاشةُ قاعدةِ عملٍ تُقرأ وتُفهَم ⇒ ١٩٠٠ms
     المجموع في أوّل تشغيل ≈ ١٢٫٨ث، وفي العرض المتكرّر ≈ ٧٫٦ث. */
  var MS_BRAND  = 1300;
  var MS_SYSTEM = 1900;
  var HARD_CAP_SHORT = 12000;
  var HARD_CAP_FULL  = 17000;
  var MIN_SLIDE = MS_SYSTEM;                   // احتياطيٌّ لمن لا يحمل زمناً
  var HARD_CAP  = HARD_CAP_SHORT;
  var TAIL      = 450;                         // تلاشٍ أخير

  /* ── مَن لا يراه ───────────────────────────────────────────────────────── */
  function isPublicPage() {
    if (global.GMT_PUBLIC) return true;
    if (!global.GMT_INTERNAL) return true;
    try { if (new URLSearchParams(location.search).get('w')) return true; } catch (_) {}
    return false;
  }

  /* ── رقم النسخة: أيُّ تغيّرٍ فيه = «تحديث» ─────────────────────────────── */
  function buildId() {
    try {
      var m = (doc.currentScript && doc.currentScript.src || '').match(/[?&]v=([\w.-]+)/);
      if (m) return m[1];
    } catch (_) {}
    try {
      var any = doc.querySelector('script[src*="gmt-core.js?v="]');
      if (any) { var m2 = any.src.match(/[?&]v=([\w.-]+)/); if (m2) return m2[1]; }
    } catch (_) {}
    return 'v0';
  }

  function installedAsApp() {
    try {
      if (global.matchMedia && matchMedia('(display-mode: standalone)').matches) return true;
      if (global.navigator && navigator.standalone) return true;
    } catch (_) {}
    return false;
  }

  /* يُعرَض؟ ويُعيد السبب — السبب يُسجَّل في الكونسول كي لا يكون الظهور لغزاً */
  function reason() {
    try { if (new URLSearchParams(location.search).get('intro') === '1') return 'طلبٌ صريح بالرابط'; } catch (_) {}
    var seen = null;
    try { seen = localStorage.getItem(LS_SEEN); } catch (_) { return null; }  // لا تخزين ⇒ لا نُلحّ
    var now = buildId();
    if (!seen) return 'أوّل تشغيلٍ على هذا الجهاز';
    if (seen !== now) return 'تحديثٌ جديد (' + seen + ' ⇐ ' + now + ')';
    try {
      if (installedAsApp() && localStorage.getItem('gmt_intro_seen_app') !== '1') return 'أوّل فتحٍ بعد التثبيت';
    } catch (_) {}
    return null;
  }

  function markSeen() {
    try {
      localStorage.setItem(LS_SEEN, buildId());
      if (installedAsApp()) localStorage.setItem('gmt_intro_seen_app', '1');
    } catch (_) {}
  }

  /* ── الشاشات — لا نَعِد بما ليس في النظام، ولا نخترع أصلاً ────────────── */
  /* ══════════════════════════════════════════════════════════════════════════
     🔴 (2026-10-03 · طلبك ١٥١ «شعار الشركة بدل حرف G»)

     العطلُ لم يكن في غياب الشعار — الشعارُ موجودٌ في المشروع. العطلُ أنّ
     هذا الملفّ كان يقرأ `GMTBrand.logo` و`GMTBrand.nameAr`، **وليستا
     خاصّيتين على `GMTBrand`**: واجهتُها الحقيقية `GMTBrand.get('logo')`.
     فأُرجِعت `undefined` بصمت، فسقط الانترو إلى حرف «G» — وهو بالضبط ما
     رأيتَه وطلبتَ إزالته.

     هذا نفسُ نمط P1 لكن على مستوى **الأسماء**: اسمٌ لا يُطابق فلا خطأ ولا
     نتيجة — سقوطٌ صامتٌ إلى البديل القبيح. ولذلك نجرّب هنا كل الأسماء
     الممكنة بالترتيب، وننتهي بملفّ الشعار الموجود فعلاً في المشروع.
     ══════════════════════════════════════════════════════════════════════════ */
  function brandName() {
    try {
      if (global.GMTBrand) {
        if (typeof GMTBrand.get === 'function') {
          var nm = GMTBrand.get('nameAr') || GMTBrand.get('name');
          if (nm && /[\u0600-\u06FF]/.test(nm)) return nm;   /* عربيٌّ فقط — لا نعرض الاسم اللاتيني هنا */
        }
        if (GMTBrand.nameAr) return GMTBrand.nameAr;
      }
    } catch (_) {}
    return 'مجموعة ميديا تيك التجارية';
  }
  function brandLogo() {
    try {
      if (global.GMTBrand && typeof GMTBrand.get === 'function') {
        var l = GMTBrand.get('logo');
        /* `favicon.ico` شعارُ التبويب لا شعارُ الشركة — لا يصلح لشاشةٍ بـ١٢٤px */
        if (l && !/favicon/i.test(l)) return l;
      }
      if (global.GMTBrand && GMTBrand.logo) return GMTBrand.logo;
    } catch (_) {}
    return 'logo.png?v=20261003';     /* شعارُ الشركة الموجود في المشروع */
  }

  var SLIDES = [
    { t: brandName, ms: MS_BRAND,
      s: function () { try { return (global.GMTBrand && GMTBrand.tagline) || 'Canon Authorized Dealer'; }
                       catch (_) { return 'Canon Authorized Dealer'; } },
      logo: true },
    { t: function () { return 'نظامٌ واحد لكل شيء'; }, ms: MS_SYSTEM,
      s: function () { return 'الجرد · نقاط البيع · الأوردرات · المشتريات · المتجر · الكفالات والعقود'; } },
    { t: function () { return 'كل كميّةٍ لها فاتورة'; }, ms: MS_SYSTEM,
      s: function () { return 'لا زيادةَ بلا فاتورة، ولا نقصَ بلا بيعٍ أو نقل — وكلُّ حركةٍ مسجَّلة.'; } },
    { t: function () { return 'يعمل بلا إنترنت'; }, ms: MS_SYSTEM,
      s: function () { return 'الصفحات محفوظةٌ على جهازك — يفتح التطبيق وتُكمل عملك حتى لو انقطع الاتصال.'; } },

    /* ══════════════════════════════════════════════════════════════════════
       🌍 شاشاتُ المجموعة — طلبك ١٥٢ · القرار ت٦ (2026-10-03)

       نصُّك: «شاشات: تابعٌ للمجموعة · إشراف أ.محمد خير زيتوني · ألمانيا ·
       المهندس والصين» ثمّ «حطّ عنواناً محدداً في ألمانيا… نسخة تجريبية قيد
       التطوير، تم الإنشاء بواسطة المهندس».

       كنتُ متوقّفاً عندها لأنّي **لا أخترع عناوين شركتك**. وأعطيتَني اليوم:
           ألمانيا : Erfurt 99084, Altstadt
           الصين   : شنزن وايمن — Shenzhen, China
       فدخلت التنفيذ حرفاً بحرف كما كتبتَها — لم أُضف مدينةً ولا رمزاً ولا
       شارعاً من عندي، ولم أترجم.

       ⚠️ وما زلتُ **لم أخترع** اسماً صينياً كما اقترحتَ في وثيقتك: الاسمُ
       اسمُ شخصٍ أو مكتبٍ حقيقيّ عندك، واختراعُه يضع على شاشةٍ يراها موظّفوك
       اسماً لا وجود له. أعطني إيّاه ويُضاف في سطرٍ واحد.
       ══════════════════════════════════════════════════════════════════════ */
    { t: function () { return 'تابعٌ لمجموعة ميديا تيك التجارية'; }, ms: MS_BRAND,
      s: function () { return 'نظامٌ داخليٌّ مملوكٌ للمجموعة — لا يُستعمل ولا يُنسَخ خارجها.'; },
      kind: 'group' },

    { t: function () { return 'بإشراف أ. محمد خير زيتوني'; }, ms: MS_BRAND,
      s: function () { return 'كلُّ قرارٍ في هذا النظام مرجعُه صاحبُ العمل — والنظامُ ينفّذ ولا يقرّر.'; },
      kind: 'sup' },

    { t: function () { return 'ألمانيا'; }, ms: MS_BRAND,
      s: function () { return 'مقرُّ التطوير والإشراف التقني'; },
      kind: 'place',
      place: { flag: '🇩🇪', addr: 'Erfurt 99084, Altstadt',
               note: 'نسخةٌ تجريبية قيد التطوير' } },

    /* اسمُ المكتب الصينيّ وصل منك في 2026-10-04: «شنزن وايمن · الصين».
       كنتُ رفضتُ أن أخترعه حين قلتَ «حطّ اسماً من عندك» — اسمُ مكتبٍ
       لشركتك ليس تفصيلاً تصميميّاً أملؤه بذوقي.
       ❓ الصيغةُ اللاتينيّة «Shenzhen Waiman» اجتهادٌ منّي في النقل الصوتيّ
          فقط — إن كانت تُكتب غيرَ ذلك فأخبرني ويُصحَّح في سطر. */
    { t: function () { return 'الصين'; }, ms: MS_BRAND,
      s: function () { return 'مكتبُ التوريد ومتابعة الشحن'; },
      kind: 'place',
      place: { flag: '🇨🇳', name: 'شنزن وايمن',
               addr: 'Shenzhen Waiman — Shenzhen, China',
               note: 'تم الإنشاء بواسطة المهندس' } }
  ];

  /* ── مَهامُّ التحميل: الصفحات تُسجّل ما تنتظره ───────────────────────── */
  var tasks = [];               // وعودٌ تُنتظَر
  var closed = false, startedAt = 0, host = null;

  function styles() {
    if (doc.getElementById('gmt-intro-css')) return;
    var reduce = false;
    try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) {}
    var css = [
      '#gmt-intro{position:fixed;inset:0;z-index:2147483600;display:flex;flex-direction:column;',
      'align-items:center;justify-content:center;gap:22px;padding:28px;text-align:center;',
      'font-family:"Cairo",system-ui,sans-serif;color:#fff;direction:rtl;',
      'background:linear-gradient(140deg,#0a0c12,#1a0309 55%,#3a0008)}',
      '#gmt-intro *{box-sizing:border-box}',
      '#gmt-intro .gi-logo{width:124px;height:124px;border-radius:30px;object-fit:cover;',
      'box-shadow:0 20px 60px rgba(192,0,18,.45)}',
      '#gmt-intro .gi-mark{width:124px;height:124px;border-radius:30px;display:flex;',
      'align-items:center;justify-content:center;font-size:48px;font-weight:900;',
      'background:linear-gradient(135deg,#D5001C,#7a000c);box-shadow:0 20px 60px rgba(192,0,18,.45)}',
      '#gmt-intro .gi-t{font-size:23px;font-weight:900;line-height:1.5;max-width:560px}',
      '#gmt-intro .gi-s{font-size:14.5px;font-weight:600;opacity:.84;line-height:1.95;max-width:520px}',
      '#gmt-intro .gi-slide{display:flex;flex-direction:column;align-items:center;gap:16px;',
      reduce ? '}' : 'animation:gi-in .5s ease both}',
      '#gmt-intro .gi-bar{position:absolute;inset-inline:0;bottom:0;height:4px;background:rgba(255,255,255,.12)}',
      '#gmt-intro .gi-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#D5001C,#ff5a6a);',
      reduce ? '}' : 'transition:width .35s linear}',
      /* ── شاشاتُ المجموعة (ت٦) ── */
      '#gmt-intro .gi-place{margin-top:4px;display:flex;flex-direction:column;align-items:center;gap:7px;',
      'padding:16px 22px;border-radius:18px;background:rgba(255,255,255,.055);',
      'border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(6px);min-width:252px}',
      '#gmt-intro .gi-flag{font-size:34px;line-height:1}',
      '#gmt-intro .gi-oname{font-size:15px;font-weight:900;color:#fff;letter-spacing:-.2px;margin-bottom:3px}',
      '#gmt-intro .gi-addr{font-size:15px;font-weight:800;letter-spacing:.4px;',
      'direction:ltr;unicode-bidi:isolate;color:#fff}',
      '#gmt-intro .gi-note{font-size:11.5px;font-weight:700;opacity:.62;letter-spacing:.2px}',
      '#gmt-intro .gi-seal{margin-top:2px;padding:7px 20px;border-radius:999px;font-size:12.5px;',
      'font-weight:900;letter-spacing:1px;border:1.5px solid rgba(255,255,255,.26);',
      'background:rgba(213,0,28,.16);color:#fff}',
      '#gmt-intro .gi-rule{width:62px;height:3px;border-radius:99px;margin-top:2px;',
      'background:linear-gradient(90deg,#D5001C,#ff5a6a)}',
      '#gmt-intro .gi-dots{display:flex;gap:7px}',
      '#gmt-intro .gi-dots b{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.28)}',
      '#gmt-intro .gi-dots b.on{background:#fff;width:20px;border-radius:99px}',
      '#gmt-intro .gi-load{position:absolute;bottom:22px;font-size:11.5px;font-weight:700;opacity:.6}',
      '@keyframes gi-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
      '#gmt-intro.gi-out{opacity:0;transition:opacity ' + TAIL + 'ms ease}',
      '@media (max-width:420px){#gmt-intro .gi-t{font-size:19px}#gmt-intro .gi-logo,#gmt-intro .gi-mark{width:98px;height:98px}}'
    ].join('');
    var st = doc.createElement('style');
    st.id = 'gmt-intro-css';
    st.textContent = css;
    (doc.head || doc.documentElement).appendChild(st);
  }

  function build() {
    host = doc.createElement('div');
    host.id = 'gmt-intro';
    host.setAttribute('data-keep-fab', '1');
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    var logo = brandLogo();
    host.innerHTML =
      '<div class="gi-slide" id="gi-slide"></div>' +
      '<div class="gi-dots" id="gi-dots">' +
        ACTIVE.map(function () { return '<b></b>'; }).join('') + '</div>' +
      '<div class="gi-load" id="gi-load">جارٍ التجهيز…</div>' +
      '<div class="gi-bar"><i id="gi-fill"></i></div>';
    (doc.body || doc.documentElement).appendChild(host);
    host._logo = logo;
  }

  function paint(i) {
    var sl = ACTIVE[i];
    if (!sl || !host) return;
    var el = doc.getElementById('gi-slide');
    /* 🔧 (2026-10-04) حارسٌ وُلد من انهيارٍ حقيقيّ رأيتُه في الفحص:
       إن أُزيلت طبقةُ الانترو من الصفحة أثناء دورانه — تَخَطٍّ، أو انتقالُ
       صفحةٍ، أو سكربتٌ آخرُ ينظّف — بقي المؤقّتُ يعمل ويكتب في عنصرٍ لم
       يعد موجوداً ⇒ `Cannot set properties of null` ⇒ **خطأٌ غيرُ ملتقَطٍ
       يقطع بقيّةَ إقلاع الصفحة**. الحلقةُ لا تنظر إلى هذا، فنوقفُ أنفسنا
       من هنا: إن ذهب العنصرُ فقد انتهى الانترو. */
    if (!el) { closed = true; return; }
    /* ══ الصوت (2026-10-04 · طلبك) ══
       «صوت فقاعة مع انبثاق اللوجو» على الشاشة الأولى، ثمّ العلامةُ الصوتيّة
       معها، و«نفَسُ» انتقالٍ خافتٌ بين الشاشات. والصوتُ لا يُشغَّل قبل أوّل
       لمسةٍ من المستخدم (قيدُ المتصفّحات) — الوحدةُ تُؤجّله ولا تُخطئ. */
    try {
      if (global.GMTSound) {
        if (i === 0) { GMTSound.play('brand'); setTimeout(function () { GMTSound.play('pop'); }, 240); }
        else GMTSound.play('nav');
      }
    } catch (_) {}
    var head = sl.logo
      ? (host._logo
          ? '<img class="gi-logo" src="' + host._logo + '" alt="">'
          : '<div class="gi-mark">G</div>')
      : '';
    /* بطاقةُ المكان — عَلَمٌ وعنوانٌ لاتينيٌّ معزولٌ عن اتّجاه الصفحة */
    var extra = '';
    if (sl.kind === 'place' && sl.place) {
      extra =
        '<div class="gi-place">' +
          '<div class="gi-flag">' + sl.place.flag + '</div>' +
          (sl.place.name ? '<div class="gi-oname">' + sl.place.name + '</div>' : '') +
          '<div class="gi-addr">' + sl.place.addr + '</div>' +
          (sl.place.note ? '<div class="gi-note">' + sl.place.note + '</div>' : '') +
        '</div>';
    } else if (sl.kind === 'group') {
      extra = '<div class="gi-seal">ميديا تيك</div>';
    } else if (sl.kind === 'sup') {
      extra = '<div class="gi-rule"></div>';
    }
    el.innerHTML = head +
      '<div class="gi-t">' + sl.t() + '</div>' +
      '<div class="gi-s">' + sl.s() + '</div>' + extra;
    /* إعادة تشغيل حركة الدخول */
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    var dots = doc.getElementById('gi-dots');
    if (dots) Array.prototype.forEach.call(dots.children, function (b, k) {
      b.className = (k === i) ? 'on' : '';
    });
  }

  function progress(p) {
    var f = doc.getElementById('gi-fill');
    if (f) f.style.width = Math.max(0, Math.min(100, p)) + '%';
  }

  function say(txt) {
    var l = doc.getElementById('gi-load');
    if (l) l.textContent = txt;
  }

  function close() {
    if (closed) return;
    closed = true;
    markSeen();
    if (!host) return;
    host.classList.add('gi-out');
    setTimeout(function () {
      try { if (host && host.parentNode) host.parentNode.removeChild(host); } catch (_) {}
      try { doc.documentElement.style.overflow = ''; } catch (_) {}
      host = null;
    }, TAIL + 40);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     جهوزُ الصفحة = التحميل الكامل + ما سجّلته الصفحة من مهام.

     🔴 (2026-10-03 · كشفَه الفحص لا عينايَ) أوّل بناءٍ لهذه الدالّة كان يلتقط
     `tasks` **مرّةً واحدة لحظة البدء**:
         if (tasks.length) waits.push(Promise.all(tasks...))
     والانترو يُقلع عند `DOMContentLoaded` — **قبل** أن تُشغّل الصفحة شيفرتَها
     وتُسجّل ما تنتظره. فالمصفوفة فارغةٌ دائماً وقت القراءة، وكلُّ مهمّةٍ
     تُسجَّل بعدها **تُهمَل بصمت**.

     والأثر أنّ الانترو كان يَعِد بما لا يفعل: ينصرف بعد شاشاته بلا انتظار
     البيانات، فيرى المالك الشاشة نصفَ مرسومة — وهو **نقيضُ** غاية الميزة
     («يغطّي على تحميل الصور والبيانات»).

     الآن: ننتظر **دورةً بعد دورة** حتى لا تبقى مهمّةٌ جديدة. والسقف الصارم في
     `run()` يبقى الحارس الأخير — فمهمّةٌ لا تنتهي لا تُحوّل الشاشة إلى قفل.
     ═══════════════════════════════════════════════════════════════════════ */
  function readiness() {
    return (async function () {
      if (doc.readyState !== 'complete') {
        await new Promise(function (r) { global.addEventListener('load', r, { once: true }); });
      }
      /* ⚠️ سباقٌ زمنيّ دقيق كشفه الفحص: الصفحة تُسجّل مهمّتها بعد `load` بأجزاء
         من الثانية (سكربتُها يُقلع ثمّ يطلب بياناته). فلو فحصنا القائمة **مرّةً**
         بعد `load` لوجدناها فارغةً وانصرفنا — وتُهمَل المهمّة.
         فلا نكتفي بتفريغ القائمة: ننتظر **مهلة استقرار** بعد كل دفعة، فإن ظهرت
         مهمّةٌ جديدة فيها عُدنا. والسقف الصارم في `run()` يحدّ هذا كلّه. */
      var SETTLE = 500, seen = 0, rounds = 0;
      while (rounds < 12) {
        rounds++;
        if (tasks.length > seen) {
          var batch = tasks.slice(seen);
          seen = tasks.length;
          await Promise.all(batch.map(function (t) {
            /* فشلُ مهمّةٍ لا يحبس الشاشة — الانترو ساترُ زمنٍ لا حارسُ بيانات */
            return Promise.resolve(t).catch(function () {});
          }));
          continue;                         // دفعةٌ اكتملت ⇒ ابحث عن جديدٍ فوراً
        }
        await new Promise(function (r) { setTimeout(r, SETTLE); });
        if (tasks.length === seen) break;    // استقرّت ⇒ جاهز
      }
    })();
  }

  /* الشاشاتُ المعروضة الآن — حسب المناسبة (انظر شرح الزمن أعلاه) */
  var ACTIVE = SLIDES;
  function pickSlides(why) {
    var full = !why || /أوّل تشغيل|التثبيت|طلبٌ صريح/.test(why);
    if (full) {
      ACTIVE = SLIDES.slice();
      HARD_CAP = HARD_CAP_FULL;
    } else {
      ACTIVE = SLIDES.filter(function (x) { return !x.kind; });   /* شاشاتُ النظام وحدها */
      HARD_CAP = HARD_CAP_SHORT;
    }
    return ACTIVE;
  }

  async function run() {
    styles();
    build();
    try { doc.documentElement.style.overflow = 'hidden'; } catch (_) {}
    startedAt = Date.now();

    /* الحارس الصارم — يُغلق مهما حدث */
    var cap = setTimeout(function () {
      say('اكتمل التجهيز');
      close();
    }, HARD_CAP);

    var ready = false;
    readiness().then(function () { ready = true; });

    for (var i = 0; i < ACTIVE.length; i++) {
      if (closed) break;
      paint(i);
      progress(((i + 1) / ACTIVE.length) * 100);
      await new Promise(function (r) { setTimeout(r, ACTIVE[i].ms || MIN_SLIDE); });
    }

    /* الشاشات انتهت — ننتظر الجهوز ضمن السقف، ونقول إنّنا ننتظر */
    if (!closed && !ready) {
      say('جارٍ تحميل البيانات…');
      var waited = 0;
      while (!ready && !closed && (Date.now() - startedAt) < HARD_CAP - 600) {
        await new Promise(function (r) { setTimeout(r, 160); });
        waited += 160;
      }
    }
    clearTimeout(cap);
    if (!closed) { say('جاهز'); progress(100); close(); }
  }

  global.GMTIntro = {
    /* الصفحات تُسجّل ما تنتظره: GMTIntro.task(fetchProducts()) */
    task: function (p) { try { if (p && p.then) tasks.push(p); } catch (_) {} },
    show: function () { if (!host && !closed) run(); },
    close: close,
    /* لإعادة عرضه عمداً (اختبار أو عرضٌ للموظّف الجديد) */
    reset: function () {
      try { localStorage.removeItem(LS_SEEN); localStorage.removeItem('gmt_intro_seen_app'); } catch (_) {}
    },
    why: reason
  };

  /* ── الإقلاع ─────────────────────────────────────────────────────────── */
  function boot() {
    try {
      if (isPublicPage()) return;
      /* لا نتزاحم مع الوضع التدريبي ولا مع شاشات أخرى مفتوحة */
      if (doc.querySelector('.gg4')) return;
      var why = reason();
      if (!why) return;
      pickSlides(why);                       /* الشاشاتُ والزمن حسب المناسبة */
      console.info('[GMT] انترو النظام: ' + why + ' · شاشات: ' + ACTIVE.length);
      run();
    } catch (e) {
      /* لا يُجمَّد النظام من أجل انترو */
      console.warn('[GMT] تعذّر عرض الانترو:', e && e.message);
      try { doc.documentElement.style.overflow = ''; } catch (_) {}
    }
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
