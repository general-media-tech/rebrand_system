/* ═══════════════════════════════════════════════════════════════════════════
   gmt-refresh.js — زرّ التحديث الثابت في كل شاشة  ·  2026-10-03
   ─────────────────────────────────────────────────────────────────────────
   قرار المالك ت٥: «زرّ ثابت في شريط الصفحة — لا فقاعة».

   وهو حلٌّ لتضاربٍ بين طلبين من المالك نفسه:
     ① «بعد ما ثبّتنا التطبيق، إذا علّق النظام صعب السيطرة عليه — لازم يكون في
        زرّ ريفريش بكل الشاشات مثل ما كان موجود في متصفّح كروم».
     ② «أزل كل الأزرار العائمة واستبدلها بأزرار ثابتة في الخيارات».

   والسبب الحقيقيّ للطلب ①: التطبيق مثبَّتٌ كـPWA ⇒ **لا شريط متصفّح ولا زرّ
   إعادة تحميل**. فإن تجمّدت شاشةٌ أو بقي مؤشّر تحميلٍ دائراً فلا مخرج إلّا
   إغلاق التطبيق كلّه.

   ولماذا لا «داخل الخيارات»؟ لأنّ المالك قال «إذا علّق النظام» — وقائمة
   الخيارات نفسها قد لا تُفتح وقتها. الزرّ الذي يُنقِذ من التعليق لا يصحّ أن
   يكون خلف نافذةٍ تحتاج النظام سليماً لتُفتح.

   كيف يُوفَّق بين الطلبين عملياً:
     · إن وُجد شريطٌ علويٌّ للصفحة ⇒ يُزرَع **داخله** (زرٌّ في الشريط، لا فقاعة).
     · إن لم يوجد ⇒ شريطٌ علويٌّ نحيف يُسجَّل في `GMTTopBars` الذي **يدفع محتوى
       الصفحة لأسفل** فلا يُغطّي شيئاً — وهذا ما يفرّقه عن الفقاعة: الفقاعة تطفو
       فوق المحتوى، وهذا يأخذ مكانه في التصميم.

   ضغطةٌ واحدة  = إعادة تحميل.
   ضغطةٌ طويلة  = إعادة تحميل قاسية (تُمسح أكواشُ الصفحات) — لحالة «علّق ولا يفكّ».
   ومعها علمٌ على `data-keep-fab` كي لا يحذفه `gmt-nofab.js`.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var doc = global.document;
  if (!doc) return;
  if (global.GMTRefresh) return;                 // لا تكرار

  var BTN_ID = 'gmt-refresh-btn';
  var BAR_ID = 'gmt-refresh-bar';

  /* صفحات الزبون لا تحتاجه — ولا نضع واجهةً داخلية على صفحةٍ عامّة.
     (قاعدة المالك: «الأزرار… ما تطلع لصفحات الزبون أبداً»)

     ونستعمل اتّفاقيّة المشروع نفسها لا قائمةَ أسماءٍ أخرى: الصفحة الداخلية
     تُعلِن `window.GMT_INTERNAL = 1` في رأسها، و**الغياب يعني عامّة** — فالنسيان
     يَمنع ولا يُسرّب. (وهو نصُّ التعليق المكتوب في رؤوس تلك الصفحات.)

     وحالةٌ خاصّة: `guarantee.html` داخليّةٌ عند الإصدار، وتصير **شهادةَ زبون**
     حين تُفتَح بـ`?w=<رقم>`. فلا زرَّ تحديثٍ في عرض الشهادة. */
  function isPublicPage() {
    if (global.GMT_PUBLIC) return true;
    if (!global.GMT_INTERNAL) return true;
    try {
      if (new URLSearchParams(location.search).get('w')) return true;   // شهادة زبون
    } catch (_) {}
    return false;
  }

  /* ⚠️ (2026-10-03) جرّبتُ أوّلاً زرعَ الزرّ **داخل ترويسة كل صفحة** وفشل قياساً:
     الترويسات الأربعون مختلفةٌ تماماً، ولأُجبرها على استيعاب الزرّ كنتُ أضبط
     عليها `display:flex` و`flex-wrap:wrap`. فنزل الزرّ سطراً جديداً أسفل
     الترويسة — قاس الفحص موضعَه فوجده عند **501px** في الأوردرات و**465px**
     في المشتريات، أي خارج الشاشة الأولى في الهاتف. وهو زرُّ طوارئٍ لا يصحّ
     أن يُطلب منه تمرير.

     والأخطر أنّ العلاج نفسه كان مخالفة: تعديلُ `flex-wrap` على ترويسةٍ لم
     أكتبها يُحرّك عناصرَها الأخرى — وقاعدة المالك: «مابصير نضيف ميزة بتأثّر
     ع غير شي وانت ما تعرف».

     فالقرار: شريطٌ واحدٌ نحيفٌ خاصٌّ به في كل الصفحات. ومكاسبُه:
       · **مكانٌ واحدٌ ثابت** في الأربعين شاشة — يحفظه بيده وقت التعليق.
       · في أعلى الشاشة دائماً، بلا تمرير.
       · يُسجَّل في `GMTTopBars` الذي **يدفع جسم الصفحة لأسفل** بمقدار ارتفاعه
         ⇒ لا يُغطّي محتوى، وهذا هو الفرق الجوهريّ عن الفقاعة.
       · وصفرُ لمسٍ لترويسات المالك.
     وهو أوّل الأشرطة في الترتيب كي لا يتزحزح مكانُه كلّما ظهر تنبيهٌ أو اختفى. */

  function styles() {
    if (doc.getElementById('gmt-refresh-css')) return;
    var s = doc.createElement('style');
    s.id = 'gmt-refresh-css';
    s.textContent = [
      /* ══ 🎨 إعادة تصميم الشريط العلوي (2026-10-03) ══
         لقطةُ الواجهات أظهرت ثلاثَ رقاقاتٍ متلاصقةً في زاوية كل شاشة،
         وكلمةُ «تحديث» **مقصوصةً** إلى «تحدي». السبب: `justify-content:
         flex-end` في صفحةٍ عربية يكدّس كل شيءٍ في الزاوية، ولا مساحةَ
         تتنفّس فيها الأزرار.

         الشريطُ الآن **كروم لا محتوى**: يتنحّى بصرياً (رمادٌ خفيف، حدٌّ
         واحد، لا ظلّ)، ويُوزَّع طرفاه — إشعاراتٌ يميناً وتحديثٌ يساراً —
         فلا تلتصق ولا تُقصّ. والأيقونةُ وحدها تكفي على الشاشات الضيّقة،
         والكلمةُ تظهر حين تتّسع. */
      '#' + BTN_ID + '{display:inline-flex;align-items:center;gap:6px;cursor:pointer;',
      'border:1px solid rgba(15,23,42,.10);background:#fff;color:#334155;border-radius:9px;',
      'padding:6px 10px;font-family:inherit;font-size:12px;font-weight:700;line-height:1;',
      'flex:0 0 auto;white-space:nowrap;-webkit-tap-highlight-color:transparent;',
      'transition:background .14s,border-color .14s}',
      '#' + BTN_ID + ':hover{background:#f8fafc;border-color:rgba(15,23,42,.18)}',
      '#' + BTN_ID + ':active{transform:scale(.96)}',
      '#' + BTN_ID + '[data-busy="1"] .gr-ico{animation:gr-spin .7s linear infinite}',
      '#' + BTN_ID + '.gr-hard{border-color:#D5001C;color:#D5001C;background:#fff5f5}',
      '@keyframes gr-spin{to{transform:rotate(360deg)}}',
      /* الكلمة تُخفى تحت 360px فقط — لا تُقصّ أبداً */
      '@media (max-width:359px){#' + BTN_ID + ' .gr-txt{display:none}}',
      '#' + BAR_ID + '{position:fixed;inset-inline:0;top:0;z-index:8800;display:flex;',
      'align-items:center;justify-content:space-between;gap:8px;padding:6px 12px;',
      'background:rgba(255,255,255,.94);backdrop-filter:saturate(1.4) blur(8px);',
      'border-bottom:1px solid rgba(15,23,42,.07);min-height:40px;box-sizing:border-box}',
      /* كلُّ ما يُحقن في الشريط يأخذ نفس الارتفاع فلا يقفز السطر */
      '#' + BAR_ID + ' > *{flex:0 0 auto}',
      '@media print{#' + BTN_ID + ',#' + BAR_ID + '{display:none!important}}'
    ].join('');
    (doc.head || doc.documentElement).appendChild(s);
  }

  function label() {
    return '<span class="gr-ico" aria-hidden="true">🔄</span><span class="gr-txt">تحديث</span>';
  }

  var pressT = null, didHard = false;

  function softReload() {
    var b = doc.getElementById(BTN_ID);
    if (b) b.setAttribute('data-busy', '1');
    try { location.reload(); } catch (_) { location.href = location.href; }
  }

  /* إعادة تحميل قاسية: نُفرِغ أكواش الصفحات ثمّ نُحمّل.
     ⚠️ لا نُلغي تسجيل عامل الخدمة ولا نمسح IndexedDB — فيها صور المنتجات
     المخزَّنة لتوفير egress، ومسحُها يُعيد سحب غيغاباتٍ على المالك. */
  async function hardReload() {
    var b = doc.getElementById(BTN_ID);
    if (b) { b.setAttribute('data-busy', '1'); b.classList.add('gr-hard'); }
    try {
      if (global.caches && caches.keys) {
        var keys = await caches.keys();
        await Promise.all(keys.filter(function (k) {
          return /gmt-pages|gmt-v/.test(k);          // أكواش الصفحات فقط
        }).map(function (k) { return caches.delete(k); }));
      }
    } catch (_) {}
    try { location.reload(); } catch (_) { location.href = location.href; }
  }

  function wire(btn) {
    btn.setAttribute('data-keep-fab', '1');        // لا يحذفه gmt-nofab
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'تحديث الصفحة');
    btn.title = 'تحديث الصفحة · اضغط مطوَّلاً لإعادة تحميلٍ قاسية إن تعلّق النظام';
    btn.innerHTML = label();

    function down() {
      didHard = false;
      clearTimeout(pressT);
      pressT = setTimeout(function () { didHard = true; hardReload(); }, 1400);
    }
    function up() { clearTimeout(pressT); }

    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (didHard) { didHard = false; return; }    // الضغطة الطويلة نفّذت فعلها
      softReload();
    });
    /* لمس الهواتف: نمنع قائمة السياق عند الضغط المطوَّل */
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  function place() {
    if (isPublicPage()) return;
    if (doc.getElementById(BTN_ID)) return;
    if (!doc.body) return;
    styles();

    var btn = doc.createElement('button');
    btn.id = BTN_ID;
    wire(btn);

    var bar = doc.getElementById(BAR_ID);
    if (!bar) {
      bar = doc.createElement('div');
      bar.id = BAR_ID;
      bar.setAttribute('data-keep-fab', '1');
      doc.body.appendChild(bar);
    }
    bar.appendChild(btn);
    /* مُرتِّب الأشرطة يَرُصّ ويدفع المحتوى — بلا ذلك يُغطّي ويصير فقاعة */
    try { if (global.GMTTopBars && GMTTopBars.apply) GMTTopBars.apply(); } catch (_) {}
  }

  function init() {
    place();
    /* الأشرطة تُبنى أحياناً بعد التحميل (نقطة البيع ترسم رأسها بالـJS) */
    [300, 900, 2000, 4000].forEach(function (ms) { setTimeout(place, ms); });
    try {
      new MutationObserver(function () {
        if (!doc.getElementById(BTN_ID)) place();
      }).observe(doc.documentElement, { childList: true, subtree: true });
    } catch (_) {}
  }

  global.GMTRefresh = { place: place, soft: softReload, hard: hardReload };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
