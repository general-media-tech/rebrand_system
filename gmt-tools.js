/* ═══════════════════════════════════════════════════════════════════════════
   gmt-tools.js — سجلُّ الأدوات الواحد + قشرةُ التطبيق (الشاشة الرئيسية)
   أُنشئ: 2026-10-04 · الهوية البصرية ٢٫٠

   لماذا ملفٌّ واحد؟
   كانت الأدواتُ مكتوبةً يدوياً في index.html (٢٢ أداة فقط من ٤٠+ صفحة)،
   وللوصول السريع قائمةٌ ثانيةٌ في gmt-home.js. فكلُّ صفحةٍ جديدة كانت
   تُنسى في إحداهما. الآن: **مصدرٌ واحد** — أضِف سطراً هنا فتظهر في
   القائمة الجانبية وشبكة الأدوات وورقة «المزيد» والبحث معاً.

   قواعد المالك المُحترمة هنا:
   • لا أزرار عائمة: الشريطُ السفليّ شريطٌ بعرض الشاشة لا زرٌّ يطفو.
   • مداخلُ الأدوات التي يُخفيها حارسُ gmt-nofab (عقل النظام · الفاحص ·
     ما الجديد · الإشعارات) لها مدخلٌ هنا في «المزيد».
   • لا اختراع: كلُّ أيقونةٍ من طقم gmt-icons.js، ولا نصٌّ لم يكن في النظام.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  if (global.GMTTools) return;

  /* aud: emp موظف · adm إدارة · cus زبون · own مالك */
  var GROUPS = [
    { id: 'daily',  t: 'العمل اليومي',          ic: 'users' },
    { id: 'stock',  t: 'المخزون والشراء',        ic: 'box' },
    { id: 'money',  t: 'المبيعات والمال',        ic: 'chart' },
    { id: 'admin',  t: 'الإدارة والأمان',        ic: 'shield' },
    { id: 'cust',   t: 'صفحات الزبون',          ic: 'home' },
    { id: 'smart',  t: 'الفحص والعقل والحماية',  ic: 'search' },
    { id: 'docs',   t: 'التوثيق والمعرفة',       ic: 'doc' }
  ];

  var TOOLS = [
    /* العمل اليومي */
    { g: 'daily', href: 'pos.html',            ic: 'receipt',  t: 'نقطة البيع',        d: 'البيع والفواتير',            aud: 'emp', k: 'فاتورة بيع كاشير' },
    { g: 'daily', href: 'orders.html',         ic: 'doc',      t: 'الأوردرات',         d: 'الطلبات والشحن',             aud: 'emp', k: 'طلبات شحن توصيل' },
    { g: 'daily', href: 'guarantee.html',      ic: 'check',    t: 'إنشاء الكفالة',     d: 'تسجيل كفالة للزبون',          aud: 'emp', k: 'ضمان كفالة' },
    { g: 'daily', href: 'deal.html',           ic: 'edit',     t: 'العقود',            d: 'عقود ونماذج',                aud: 'emp', k: 'عقد نموذج' },
    { g: 'daily', href: 'labels.html',         ic: 'tag',      t: 'طابعة الملصقات',    d: 'ملصقات المنتجات',            aud: 'emp', k: 'ملصق باركود طباعة' },
    /* المخزون والشراء */
    { g: 'stock', href: 'inventory.html',      ic: 'box',      t: 'الجرد',             d: 'المخزون والمنتجات',          aud: 'adm', k: 'مخزون منتجات جرد' },
    { g: 'stock', href: 'purchase.html',       ic: 'factory',  t: 'المشتريات',         d: 'الشراء والشحنات',            aud: 'adm', k: 'استيراد فواتير شراء' },
    { g: 'stock', href: 'bridge.html',         ic: 'share',    t: 'الجسر',             d: 'ربط الجرد بالمتجر',          aud: 'adm', k: 'ربط متجر' },
    { g: 'stock', href: 'أماكن_الوصول.html',    ic: 'truck',    t: 'أماكن الوصول',      d: 'مكاتب شركات الشحن',          aud: 'adm', k: 'شحن مكاتب' },
    { g: 'stock', href: 'دليل_التوافقيات_والمواصفات.html', ic: 'info', t: 'التوافقيات والمواصفات', d: 'الهودات والأغطية والبطاريات', aud: 'adm', k: 'توافق مواصفات' },
    /* المبيعات والمال */
    { g: 'money', href: 'sales_log.html',      ic: 'trend',    t: 'سجل المبيعات',      d: 'المبيعات والأرباح',          aud: 'adm', k: 'ارباح مبيعات' },
    { g: 'money', href: 'weekly_report.html',  ic: 'chart',    t: 'التقرير الأسبوعي',  d: 'ملخّص الأسبوع',              aud: 'adm', k: 'تقرير اسبوع' },
    { g: 'money', href: 'المراجعة_المالية_الشاملة.html', ic: 'wallet', t: 'المراجعة المالية', d: 'مراجعة شاملة للأرقام', aud: 'adm', k: 'محاسبة مالية' },
    { g: 'money', href: 'admin_pos.html',      ic: 'boxes',    t: 'أدمن نقاط البيع',   d: 'النقاط والعمولات',           aud: 'adm', k: 'عمولات صندوق' },
    /* الإدارة والأمان */
    { g: 'admin', href: 'guarantee_admin.html', ic: 'shield',  t: 'أدمن الكفالة',      d: 'إدارة الكفالات',             aud: 'adm', k: 'كفالات' },
    { g: 'admin', href: 'admin_store.html',    ic: 'store',    t: 'أدمن المتجر',       d: 'إدارة المتجر',               aud: 'adm', k: 'متجر' },
    { g: 'admin', href: 'admin_site.html',     ic: 'home',     t: 'أدمن الموقع',       d: 'إدارة الموقع',               aud: 'adm', k: 'موقع' },
    { g: 'admin', href: 'admin_sovereign.html', ic: 'settings', t: 'الأدمن الكلي',     d: 'التحكّم الشامل',             aud: 'own', k: 'سيادي' },
    { g: 'admin', href: 'الأمان_والمستخدمون.html', ic: 'user', t: 'الأمان والمستخدمون', d: 'الحسابات والصلاحيات',        aud: 'own', k: 'مستخدمين صلاحيات' },
    { g: 'admin', href: 'passwords.html',      ic: 'shield',   t: 'كلمات السر',        d: 'إدارة كلمات السر',           aud: 'own', k: 'باسورد' },
    { g: 'admin', href: 'backup.html',         ic: 'refresh',  t: 'النسخ الاحتياطي',   d: 'حفظ واسترجاع',               aud: 'own', k: 'باك اب' },
    /* الزبون */
    { g: 'cust',  href: 'search.html',         ic: 'search',   t: 'بحث الكفالة',       d: 'التحقّق من كفالة',           aud: 'cus', k: 'كفالة' },
    { g: 'cust',  href: 'track_order.html',    ic: 'truck',    t: 'تتبّع الشحنة',      d: 'حالة الطلب',                 aud: 'cus', k: 'تتبع' },
    { g: 'cust',  href: 'store.html',          ic: 'cart',     t: 'المتجر',            d: 'التسوّق',                    aud: 'cus', k: 'تسوق' },
    { g: 'cust',  href: 'site.html',           ic: 'home',     t: 'الموقع الإلكتروني', d: 'الواجهة العامة',             aud: 'cus', k: 'موقع' },
    { g: 'cust',  href: 'hiring.html',         ic: 'users',    t: 'بوابة التوظيف',     d: 'طلبات التوظيف',              aud: 'cus', k: 'توظيف' },
    /* الفحص والعقل والحماية */
    { g: 'smart', href: 'تفعيل_عقل_النظام.html', ic: 'info',   t: 'تفعيل عقل النظام',  d: 'المساعد الذكي',              aud: 'own', k: 'ذكاء مساعد' },
    { g: 'smart', href: 'guard_bots.html',     ic: 'shield',   t: 'بوتات الحماية',     d: 'حراسة النظام',               aud: 'own', k: 'بوت' },
    { g: 'smart', href: 'central_inspector.html', ic: 'search', t: 'مركز الفحص الشامل', d: 'فحص كل الأقسام',            aud: 'own', k: 'مفتش' },
    { g: 'smart', href: 'checks.html',         ic: 'settings', t: 'الفحوصات',          d: 'فحوصات النظام',              aud: 'own', k: 'فحص' },
    { g: 'smart', href: 'check.html',          ic: 'search',   t: 'تشخيص',             d: 'تشخيص الأعطال',              aud: 'own', k: 'عطل' },
    { g: 'smart', href: 'test_board.html',     ic: 'settings', t: 'لوحة التجريب',      d: 'ساندبوكس آمن',               aud: 'own', k: 'تجربة' },
    { g: 'smart', href: 'plan.html',           ic: 'trend',    t: 'خطة النشر',         d: 'خطوات النشر',                aud: 'own', k: 'نشر' },
    { g: 'smart', href: 'deploy_plan.html',    ic: 'trend',    t: 'خطة النشر الشاملة', d: 'النسخة الكاملة',             aud: 'own', k: 'نشر' },
    /* التوثيق والمعرفة */
    { g: 'docs',  href: 'center.html',         ic: 'doc',      t: 'مركز المعرفة',      d: 'التوثيق والسجلات',           aud: 'own', k: 'توثيق' },
    { g: 'docs',  href: 'full_docs.html',      ic: 'doc',      t: 'التوثيق الشامل',    d: 'شرح النظام كاملاً',          aud: 'own', k: 'توثيق' },
    { g: 'docs',  href: 'user_guide.html',     ic: 'info',     t: 'دليل المستخدم',     d: 'زرّاً بزرّ',                  aud: 'emp', k: 'شرح دليل' },
    { g: 'docs',  href: 'شو_الجديد.html',       ic: 'info',     t: 'شو الجديد',         d: 'كل التحديثات',               aud: 'own', k: 'تحديثات' },
    { g: 'docs',  href: 'شو_صار.html',          ic: 'clock',    t: 'شو صار',            d: 'دفعة ٣ تشرين الأول',         aud: 'own', k: 'سجل' },
    { g: 'docs',  href: 'خريطة_الطريق.html',    ic: 'trend',    t: 'خريطة الطريق',      d: 'ما لم يكتمل وما نقترحه',     aud: 'own', k: 'خطة' },
    { g: 'docs',  href: 'قراراتك.html',         ic: 'check',    t: 'قراراتك',           d: 'ما يحتاج كلمتك',             aud: 'own', k: 'قرارات' },
    { g: 'docs',  href: 'دراسة_كيبورد_المبيعات.html', ic: 'edit', t: 'كيبورد المبيعات', d: 'دراسة معمارية',              aud: 'own', k: 'كيبورد' },
    { g: 'docs',  href: 'الهوية_البصرية_2.html', ic: 'image',   t: 'الهوية البصرية ٢٫٠', d: 'التقرير التصميمي',          aud: 'own', k: 'تصميم' },
    { g: 'docs',  href: 'معاينة_النظام_الجديد.html', ic: 'camera', t: 'معاينة النظام الجديد', d: 'كل الشاشات بلا خادم', aud: 'own', k: 'معاينة' },
    { g: 'docs',  href: 'home.html',           ic: 'home',     t: 'الرئيسية السابقة',  d: 'الصفحة الرئيسية القديمة',    aud: 'own', k: 'قديم' }
  ];

  /* الشريطُ السفليّ في الهاتف: أربعةُ أشياءَ يومية + «المزيد». */
  var TABS = [
    { href: 'index.html',     ic: 'home',    t: 'الرئيسية', home: 1 },
    { href: 'pos.html',       ic: 'receipt', t: 'البيع' },
    { href: 'orders.html',    ic: 'doc',     t: 'الأوردرات' },
    { href: 'inventory.html', ic: 'box',     t: 'الجرد' }
  ];

  /* مداخلُ ما يُخفيه حارسُ gmt-nofab — تُنادى بأمان إن غابت الوحدة. */
  var HELPERS = [
    { ic: 'info',   t: 'عقل النظام',   d: 'اسأل عن أي خطأ أو خطوة', mod: 'GMTBrain',    fn: 'open' },
    { ic: 'bell',   t: 'الإشعارات',    d: 'ما يحتاج تدخّلاً',        mod: 'GMTNotify',   fn: 'open' },
    { ic: 'trend',  t: 'شو الجديد',    d: 'آخر التحديثات',           mod: 'GMTWhatsNew', fn: 'open' },
    { ic: 'search', t: 'الفاحص',       d: 'فحص الصفحة الحالية',      mod: 'GMTInspect',  fn: 'open' }
  ];

  var AUD = { emp: 'موظف', adm: 'إدارة', cus: 'زبون', own: 'مالك' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ic(name, size) {
    try { if (global.GMTIcon && GMTIcon.has(name)) return GMTIcon.svg(name, size || 19); } catch (_) {}
    return '';
  }
  function norm(s) {
    return String(s || '').replace(/[\u064B-\u065F\u0640]/g, '').replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
  }
  function here() {
    var p = (location.pathname.split('/').pop() || 'index.html');
    try { p = decodeURIComponent(p); } catch (_) {}
    return p || 'index.html';
  }

  function tile(t) {
    return '<a class="card gx-tool" href="' + esc(t.href) + '" title="' + esc(t.t + ' — ' + t.d) + '" data-q="' + esc(norm(t.t + ' ' + t.d + ' ' + (t.k || ''))) + '">'
      + '<span class="gx-ic">' + ic(t.ic) + '</span>'
      + '<span class="gx-tx"><span class="gx-t">' + esc(t.t) + '</span><span class="gx-d">' + esc(t.d) + '</span></span>'
      + '<span class="gx-aud">' + AUD[t.aud] + '</span><span class="gx-chev" aria-hidden="true"></span></a>';
  }
  function section(g, prefix) {
    var list = TOOLS.filter(function (t) { return t.g === g.id; });
    return '<section class="gx-sec" id="' + prefix + g.id + '" data-g="' + g.id + '">'
      + '<h2 class="gx-h"><span class="gx-hi">' + ic(g.ic, 15) + '</span>' + esc(g.t)
      + '<span class="gx-n">' + list.length + '</span></h2>'
      + '<div class="gx-grid">' + list.map(tile).join('') + '</div></section>';
  }
  function emptyMsg() {
    return '<div class="gx-empty" hidden>لا أداةَ بهذا الاسم — جرّب كلمةً أقصر.</div>';
  }
  function searchBox(id) {
    return '<label class="gx-search"><span class="gx-si">' + ic('search', 17) + '</span>'
      + '<input id="' + id + '" type="search" placeholder="ابحث في ' + TOOLS.length + ' أداة…" autocomplete="off" enterkeyhint="search"></label>';
  }

  /* الفلترة: تُخفي البطاقاتِ ثمّ الأقسامَ الفارغة، وتُظهر رسالةً إن لم يبقَ شيء. */
  function bindSearch(input, root) {
    input.addEventListener('input', function () {
      var q = norm(input.value.trim()), any = false;
      root.querySelectorAll('.gx-tool').forEach(function (a) {
        var ok = !q || a.getAttribute('data-q').indexOf(q) !== -1;
        a.hidden = !ok; if (ok) any = true;
      });
      root.querySelectorAll('.gx-sec').forEach(function (s) {
        s.hidden = !s.querySelector('.gx-tool:not([hidden])');
      });
      var e = root.querySelector('.gx-empty'); if (e) e.hidden = any;
    });
  }

  function helperRow(h, i) {
    return '<button type="button" class="gx-help" data-h="' + i + '"><span class="gx-ic">' + ic(h.ic) + '</span>'
      + '<span class="gx-tx"><span class="gx-t">' + esc(h.t) + '</span><span class="gx-d">' + esc(h.d) + '</span></span>'
      + '<span class="gx-chev" aria-hidden="true"></span></button>';
  }
  function runHelper(i) {
    var h = HELPERS[i], m = global[h.mod];
    closeSheet();
    try { if (m && typeof m[h.fn] === 'function') { m[h.fn](); return; } } catch (_) {}
    try { if (global.GMTToast) GMTToast('هذه الأداة غير محمّلة في هذه الصفحة'); } catch (_) {}
  }

  /* ── الورقة (المزيد) ─────────────────────────────────────────────── */
  var sheet, lastFocus;
  function openSheet() {
    if (!sheet) return;
    lastFocus = document.activeElement;
    sheet.hidden = false; document.body.classList.add('gx-lock');
    requestAnimationFrame(function () { sheet.classList.add('is-open'); });
    var i = sheet.querySelector('input'); if (i && global.matchMedia('(min-width:700px)').matches) i.focus();
  }
  function closeSheet() {
    if (!sheet || sheet.hidden) return;
    sheet.classList.remove('is-open'); document.body.classList.remove('gx-lock');
    setTimeout(function () { sheet.hidden = true; }, 180);
    try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch (_) {}
  }

  function mount() {
    var cur = here();
    var side = document.getElementById('gx-side');
    var host = document.getElementById('gx-tools');
    var tabs = document.getElementById('gx-tabs');
    sheet = document.getElementById('gx-sheet');
    if (!host) return;

    host.innerHTML = searchBox('gx-q') + GROUPS.map(function (g) { return section(g, 'g-'); }).join('') + emptyMsg();
    bindSearch(document.getElementById('gx-q'), host);

    if (side) {
      side.querySelector('.gx-nav').innerHTML = GROUPS.map(function (g) {
        var n = TOOLS.filter(function (t) { return t.g === g.id; }).length;
        return '<a class="gx-nav__a" href="#g-' + g.id + '" data-g="' + g.id + '"><span class="gx-nav__i">' + ic(g.ic, 17) + '</span>'
          + '<span class="gx-nav__t">' + esc(g.t) + '</span><span class="gx-n">' + n + '</span></a>';
      }).join('');
      var first = side.querySelector('.gx-nav__a'); if (first) first.classList.add('is-on');
      /* الحالةُ النشِطة بإشارتين: لونٌ + شريطٌ على الحافّة (مرجع Pinterest) */
      if ('IntersectionObserver' in global) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            side.querySelectorAll('.gx-nav__a').forEach(function (a) {
              a.classList.toggle('is-on', a.getAttribute('data-g') === e.target.getAttribute('data-g'));
            });
          });
        }, { rootMargin: '-20% 0px -70% 0px' });
        host.querySelectorAll('.gx-sec').forEach(function (s) { io.observe(s); });
      }
    }

    if (tabs) {
      tabs.innerHTML = TABS.map(function (t) {
        var on = (t.href === cur) || (t.home && (cur === 'index.html' || cur === ''));
        return '<a class="gx-tab' + (on ? ' is-on' : '') + '" href="' + esc(t.href) + '"' + (on ? ' aria-current="page"' : '') + '>'
          + '<span class="gx-tab__i">' + ic(t.ic, 21) + '</span><span class="gx-tab__t">' + esc(t.t) + '</span></a>';
      }).join('')
        + '<button type="button" class="gx-tab" id="gx-more" aria-haspopup="dialog"><span class="gx-tab__i">' + ic('boxes', 21)
        + '</span><span class="gx-tab__t">المزيد</span></button>';
      document.getElementById('gx-more').addEventListener('click', openSheet);
    }

    if (sheet) {
      sheet.innerHTML = '<div class="gx-sheet__bg" data-close="1"></div>'
        + '<div class="gx-sheet__p" role="dialog" aria-modal="true" aria-label="كل الأدوات"><div class="gx-sheet__grab"></div>'
        + '<div class="gx-sheet__top"><b>كل الأدوات</b><button type="button" class="gx-x" data-close="1" aria-label="إغلاق">×</button></div>'
        + searchBox('gx-q2')
        + '<div class="gx-sheet__body"><section class="gx-sec" data-g="help"><h2 class="gx-h"><span class="gx-hi">' + ic('settings', 15)
        + '</span>مساعدة وأدوات النظام</h2><div class="gx-grid">' + HELPERS.map(helperRow).join('') + '</div></section>'
        + GROUPS.map(function (g) { return section(g, 's-'); }).join('') + emptyMsg() + '</div></div>';
      bindSearch(document.getElementById('gx-q2'), sheet.querySelector('.gx-sheet__body'));
      sheet.addEventListener('click', function (ev) {
        if (ev.target.closest('[data-close]')) { closeSheet(); return; }
        var h = ev.target.closest('.gx-help'); if (h) runHelper(+h.getAttribute('data-h'));
      });
      document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeSheet(); });
      /* زرُّ الخلف في الهاتف يُغلق الورقة بدل مغادرة الصفحة */
      global.addEventListener('popstate', closeSheet);
    }

    /* مداخلُ المساعدة في الشريط الجانبيّ (سطحُ المكتب) */
    var hs = document.getElementById('gx-side-help');
    if (hs) {
      hs.innerHTML = HELPERS.map(helperRow).join('');
      hs.addEventListener('click', function (ev) {
        var h = ev.target.closest('.gx-help'); if (h) runHelper(+h.getAttribute('data-h'));
      });
    }
    var sb = document.getElementById('gx-open-search');
    if (sb) sb.addEventListener('click', openSheet);
  }

  /* للوصول السريع في gmt-home.js: الأدواتُ اليومية أوّلاً */
  function quick() {
    /* الترتيبُ الافتراضيّ كما كان في gmt-home.js؛ ثمّ يُعيد الاستعمالُ الفعليّ ترتيبَها */
    var order = ['pos.html', 'orders.html', 'inventory.html', 'purchase.html', 'guarantee.html', 'admin_pos.html'];
    return order.map(function (h) {
      var t = TOOLS.filter(function (x) { return x.href === h; })[0];
      return { href: t.href, ic: t.ic, t: t.t };
    });
  }

  global.GMTTools = { all: TOOLS, groups: GROUPS, quick: quick, mount: mount, openSheet: openSheet, closeSheet: closeSheet };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})(window);
