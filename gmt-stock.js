/* ═══════════════════════════════════════════════════════════════════════════
   gmt-stock.js — حركةُ المخزون: مسارٌ واحد لا يفشل صامتاً
   أُنشئ: 2026-10-03 · طلباتك ن٨ و ن٩ (ومعهما البلاغ ٣٦)

   ── ن٨: «الأشياء يلي تعذّر نقلها لازم نلاقيلها حل» ──────────────────────────
   شاشتُك تقول: «الفاتورة TRF-00009# حُفظت «ناقصة». تعذّر خصم ٣١ صنف».
   والسبب المُثبَت (وشاشتُك الثانية تقوله حرفياً): الدالّتان الذرّيتان
   `deduct_branch_stock` و`add_branch_stock` **غير موجودتين في قاعدتك** لأنّ
   ملفّ SQL لم يُشغَّل بعد.

   وحتى الآن كان كلُّ ما نملكه هو **إخبارُك بالسبب**. وهذا ليس حلاً: الفاتورة
   تبقى عالقة، والبضاعة لا تتحرّك، وأنت تنتظر SQL.

   الحلّ هنا — مسارٌ احتياطيٌّ يعمل **بلا أيّ SQL**:
     ① نُجرّب الدالّة الذرّية أوّلاً (الطريق الصحيح، آمنٌ عند تزامن عدّة كاشيرات).
     ② فإن كانت غير موجودة ⇒ نقرأ الكميّة، نكتب الجديدة، **ثمّ نقرأ ثانيةً
        للتأكّد** أنّها كُتبت فعلاً. وإن لم تتطابق القراءةُ الثانية نُعلن فشلاً
        صريحاً ولا ندّعي نجاحاً.
     ③ ونُسجّل أيَّ مسارٍ استُعمل، فتعرف أنّ هذه الحركة تمّت بالاحتياطي.

   ⚠️ وأقولها بصراحة: المسار الاحتياطي **ليس ذرّياً**. لو ضغط كاشيران على
      نفس المنتج في نفس اللحظة قد تضيع إحدى الحركتين. ولذلك هو **احتياطيٌّ
      لا بديل**، ويبقى التنبيه ظاهراً حتى تُشغّل SQL. لكن «يعمل مع خطرٍ نادر»
      أفضل من «لا يعمل أبداً» — وأنت اليوم في الثانية.

   ── ن٩: تجاوز مخزون المصدر بموافقتك ─────────────────────────────────────────
   نصُّك: «وقت حطّ في فاتورة النقل عدد أعلى من مخزون الفرع الأساسي فيعطيني
   رسالة، إذا وافقت عليها فيعلّي مخزون الفرع الأساسي. يعني مثلاً هي قطع فيها
   ٢١، أنا نقلت ٢٢، فيسألني «هاي فيها ٢١»، إذا وافقت فيصير بالمصدر ٢٢».

   فالمنطق المنفَّذ: المطلوب > الموجود ⇒ نسأل بنافذة النظام ⇒ إن وافقت
   يُرفَع المصدر إلى **المطلوب** أوّلاً (ويُسجَّل سببُ الرفع باسمك)، ثمّ تتمّ
   الحركة كاملةً. وإن رفضت لا يُلمَس شيء.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  if (global.GMTStock) return;

  var usedFallback = false;      /* هل استُعمل الاحتياطي في هذه الجلسة؟ */
  var rpcMissing   = null;       /* null = لم نفحص · true/false */

  function creds() {
    if (global.GMTCreds) return global.GMTCreds();
    var g = global;
    return {
      url: g.SB || g.SUPABASE_URL || (g.GMT_DB && g.GMT_DB.MAIN && g.GMT_DB.MAIN.url) || '',
      key: g.KEY || g.SUPABASE_ANON_KEY || (g.GMT_DB && g.GMT_DB.MAIN && g.GMT_DB.MAIN.key) || ''
    };
  }

  function headers(extra) {
    var c = creds();
    return Object.assign({
      apikey: c.key, Authorization: 'Bearer ' + c.key, 'Content-Type': 'application/json'
    }, extra || {});
  }

  var MISSING_RE = /PGRST202|Could not find the function|does not exist|42883/i;

  /* ── نداءُ الدالّة الذرّية ──────────────────────────────────────────────── */
  async function rpc(name, body) {
    var c = creds();
    if (!c.url) return { ok: false, missing: false, error: 'لا مفاتيح قاعدة' };
    var r;
    try {
      r = await fetch(c.url + '/rest/v1/rpc/' + name, {
        method: 'POST', headers: headers(), body: JSON.stringify(body)
      });
    } catch (e) {
      return { ok: false, missing: false, error: (e && e.message) || 'تعذّر الاتصال' };
    }
    /* ⚠️ `res.ok` قبل قراءة الجسم — قاعدةٌ مسجّلة عندنا */
    if (r.ok) return { ok: true, missing: false };
    var t = await r.text().catch(function () { return ''; });
    return { ok: false, missing: MISSING_RE.test(t) || r.status === 404, error: 'HTTP ' + r.status + ' ' + t.slice(0, 160) };
  }

  /* ── قراءةُ كميّة فرعٍ لمنتج ────────────────────────────────────────────── */
  async function readQty(productId, branchKey) {
    var c = creds();
    var url = c.url + '/rest/v1/products?id=eq.' + encodeURIComponent(productId) +
              '&select=' + encodeURIComponent('id,' + branchKey) + '&limit=1';
    var r = await fetch(url, { headers: headers() });
    if (!r.ok) {
      var t = await r.text().catch(function () { return ''; });
      throw new Error('قراءة المخزون: HTTP ' + r.status + ' ' + t.slice(0, 120));
    }
    var rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) throw new Error('المنتج غير موجود');
    var v = Number(rows[0][branchKey]);
    return isFinite(v) ? v : 0;
  }

  /* ── كتابةُ كميّةٍ مع **قراءةٍ تحقّقية** بعدها ─────────────────────────── */
  async function writeQty(productId, branchKey, newQty) {
    var c = creds();
    var patch = {};
    patch[branchKey] = newQty;
    var r = await fetch(c.url + '/rest/v1/products?id=eq.' + encodeURIComponent(productId), {
      method: 'PATCH', headers: headers({ Prefer: 'return=minimal' }), body: JSON.stringify(patch)
    });
    if (!r.ok && r.status !== 204) {
      var t = await r.text().catch(function () { return ''; });
      throw new Error('كتابة المخزون: HTTP ' + r.status + ' ' + t.slice(0, 120));
    }
    /* القراءةُ الثانية — بلاها لا نعرف إن كُتبت فعلاً (RLS قد تبتلع الكتابة) */
    var back = await readQty(productId, branchKey);
    if (Number(back) !== Number(newQty)) {
      throw new Error('الكتابةُ لم تُثبَّت: المطلوب ' + newQty + ' والموجود بعدها ' + back +
                      ' — الأرجح صلاحيات RLS على جدول المنتجات.');
    }
    return back;
  }

  /* ── الحركةُ الواحدة: خصمٌ أو إضافة ───────────────────────────────────── */
  async function move(kind, productId, branchKey, qty) {
    qty = Number(qty) || 0;
    if (!productId || !branchKey || qty <= 0) return { ok: false, error: 'مُدخَلٌ ناقص' };

    var fn = (kind === 'deduct') ? 'deduct_branch_stock' : 'add_branch_stock';
    var res = await rpc(fn, { p_product_id: productId, p_branch_key: branchKey, p_qty: qty });
    if (res.ok) { rpcMissing = false; return { ok: true, path: 'rpc' }; }
    if (!res.missing) return { ok: false, error: res.error, path: 'rpc' };

    /* الدالّةُ غير موجودة ⇒ المسارُ الاحتياطي (ن٨) */
    rpcMissing = true;
    try {
      var cur = await readQty(productId, branchKey);
      var next = (kind === 'deduct') ? (cur - qty) : (cur + qty);
      if (next < 0) next = 0;                       /* لا كميّةَ سالبة في الجرد */
      await writeQty(productId, branchKey, next);
      usedFallback = true;
      return { ok: true, path: 'fallback', before: cur, after: next };
    } catch (e) {
      return { ok: false, error: (e && e.message) || 'فشل الاحتياطي', path: 'fallback' };
    }
  }

  /* ── ن٩: نقلٌ مع سؤالٍ عند تجاوز مخزون المصدر ─────────────────────────── */
  async function transfer(opts) {
    opts = opts || {};
    var productId = opts.productId, from = opts.fromBranch, to = opts.toBranch;
    var qty = Number(opts.qty) || 0;
    var name = opts.productName || 'المنتج';
    if (!productId || !from || !to || qty <= 0) return { ok: false, error: 'مُدخَلٌ ناقص' };

    var available = null;
    try { available = await readQty(productId, from); } catch (e) { available = null; }

    var raised = 0;
    if (available !== null && qty > available) {
      /* ن٩ — نسأل بنافذة النظام لا بنافذة المتصفّح */
      var msg = '«' + name + '»\n' +
                'الموجود في المصدر: ' + available + '\n' +
                'المطلوب نقله: ' + qty + '\n\n' +
                'هل أرفع مخزون المصدر إلى ' + qty + ' ثمّ أُتمّ النقل؟';
      var yes;
      if (opts.force === true) yes = true;
      else if (global.GMTAsk) {
        yes = await global.GMTAsk.confirm(msg, {
          title: 'الكمية أكبر من مخزون المصدر',
          okText: 'ارفع المصدر وأتمّ', cancelText: 'لا — أوقف',
          icon: 'ask'
        });
      } else {
        yes = global.confirm(msg);
      }
      if (!yes) return { ok: false, cancelled: true, available: available, error: 'أوقفه المستخدم' };

      var up = await move('add', productId, from, qty - available);
      if (!up.ok) return { ok: false, error: 'تعذّر رفع مخزون المصدر: ' + up.error };
      raised = qty - available;

      /* سجلٌّ للمراجعة — رفعُ مخزونٍ يدويّ لا يمرّ بلا أثر */
      try {
        if (global.GMTAudit) await global.GMTAudit.log({
          action: 'branch_stock_raised',
          entity: 'products', entityId: productId, entityName: name,
          reason: 'ن٩ · رفعُ مخزون المصدر (' + from + ') من ' + available + ' إلى ' + qty +
                  ' بموافقة المستخدم قبل النقل'
        });
      } catch (_) {}
    }

    var d = await move('deduct', productId, from, qty);
    if (!d.ok) return { ok: false, error: d.error, stage: 'deduct', raised: raised };

    var a = await move('add', productId, to, qty);
    if (!a.ok) {
      /* تراجعٌ كي لا تضيع القطع بين فرعين */
      await move('add', productId, from, qty);
      return { ok: false, error: a.error, stage: 'add', rolledBack: true, raised: raised };
    }
    return { ok: true, path: d.path, raised: raised, available: available };
  }

  global.GMTStock = {
    move: move,
    transfer: transfer,
    readQty: readQty,
    /* هل تعمل الدالّةُ الذرّية؟ null = لم نعرف بعد */
    rpcMissing: function () { return rpcMissing; },
    usedFallback: function () { return usedFallback; },
    /* فحصٌ غيرُ ضارّ: كميّةٌ صفر ومعرّفٌ لا وجود له */
    probe: async function () {
      var r = await rpc('deduct_branch_stock', {
        p_product_id: '00000000-0000-0000-0000-000000000000',
        p_branch_key: '__probe__', p_qty: 0
      });
      rpcMissing = !!r.missing;
      return { missing: !!r.missing, error: r.error || '' };
    }
  };
})(window);
