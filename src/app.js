/* ===== وضعیت ===== */
const LS_KEY = 'bmc-pro-draft-v1';
/* داخل Claude (Artifact) یا لوکال/وب معمولی */
const IN_CLAUDE = !!(window.claude && window.claude.use);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BY_ID = Object.fromEntries(BLOCKS.map(b => [b.id, b]));
const faNum = (n, d = 0) => (n == null || !isFinite(n)) ? '—' : Number(n).toLocaleString('fa-IR', { maximumFractionDigits: d });
const todayFa = () => { try { return new Date().toLocaleDateString('fa-IR'); } catch (e) { return ''; } };
function parseNum(v) {
  if (v == null) return NaN;
  const s = String(v).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[٬,\s]/g, '').replace('٫', '.').replace('/', '.');
  if (s === '') return NaN;
  return Number(s);
}

const blankBlock = () => ({ answers: {}, flags: {}, notes: {}, chips: [], summary: '', score: 0, evidence: '' });
function blankState() {
  return {
    v: 1, sample: false,
    meta: { name: '', founder: '', industry: '', analyst: 'سید یاسین پیام', date: todayFa(), stage: 'idea', source: '' },
    raw: '', mode: 'key', current: 'cs', step: 'intake',
    blocks: Object.fromEntries(BLOCKS.map(b => [b.id, blankBlock()])),
    econ: {}, ai: null,
    fu: { includeEmpty: false, aiPicked: {}, custom: [] }
  };
}
function normalize(s) {
  const base = blankState();
  const out = Object.assign(base, s || {});
  out.meta = Object.assign(blankState().meta, (s && s.meta) || {});
  out.fu = Object.assign(blankState().fu, (s && s.fu) || {});
  out.econ = Object.assign({}, (s && s.econ) || {});
  for (const b of BLOCKS) out.blocks[b.id] = Object.assign(blankBlock(), (s && s.blocks && s.blocks[b.id]) || {});
  if (!BY_ID[out.current]) out.current = 'cs';
  return out;
}

function sampleState() {
  const s = blankState();
  s.sample = true;
  s.meta = { name: 'سبزینه‌باکس', founder: 'آقای رضایی (نمونه)', industry: 'کشاورزی و خرده‌فروشی آنلاین', analyst: 'سید یاسین پیام', date: todayFa(), stage: 'mvp', source: 'جلسهٔ حضوری و پیام بله' };
  s.raw = 'جلسهٔ اول: ارسال هفتگی جعبهٔ سبزی و صیفی تازه از ۳ کشاورز اطراف قم به خانه. ۴۰ مشترک آزمایشی از کانال بله محله و اینستاگرام. هر جعبه ۴۸۰ هزار تومان، حاشیه حدود ۲۲٪. ارسال پنجشنبه‌ها با پیک اجاره‌ای. ۲۸ نفر ماه دوم تمدید کردند. هزینهٔ ثابت حدود ۴۵ میلیون در ماه، ۱۵۰ میلیون نقدینگی دارند. بسته‌بندی را یک کارگاه محلی انجام می‌دهد.';
  const B = s.blocks;
  Object.assign(B.cs, { chips: ['B2C (مصرف‌کننده)', 'بازار خاص (Niche)'], score: 3, evidence: 'early', summary: 'خانواده‌های شاغل قم که وقت خرید از تره‌بار ندارند',
    answers: { cs1: 'خانواده‌های ۳ تا ۵ نفره در پردیسان و صفاییهٔ قم که هر دو والد شاغل‌اند.', cs2: 'خرید هفتگی از تره‌بار یا سوپرمارکت محله؛ حدود ۲ ساعت وقت در هفته و کیفیت متغیر.', cs7: '۱۲ مصاحبهٔ حضوری؛ بیشترین شکایت: تازه نبودن سبزی سوپرمارکت.', cs_s_mvp: 'حدود ۷۰٪ مشترکان آزمایشی خانوادهٔ شاغل‌اند؛ بقیه سالمندند.' },
    flags: { cs5: true }, notes: { cs5: 'تعداد خانوار هدف در دو محله را از کجا برآورد کرده‌اید؟' } });
  Object.assign(B.vp, { chips: ['عملکرد یا کیفیت بهتر', 'راحتی و سهولت'], score: 4, evidence: 'early', summary: 'سبزی برداشت همان روز، درِ خانه، هر هفته',
    answers: { vp1: 'برای خانواده‌های شاغل قم که وقت خرید تره‌بار ندارند، جعبهٔ هفتگی سبزی برداشت همان روز را درِ خانه تحویل می‌دهیم؛ برخلاف سوپرمارکت، محصول کمتر از ۲۴ ساعت از مزرعه فاصله دارد.', vp3: 'کمبود وقت و کیفیت پایین سبزی سوپرمارکت؛ هر هفته تکرار می‌شود.', vp5: 'کمتر از ۲۴ ساعت از برداشت؛ قیمت حدود ۱۰٪ بالاتر از تره‌بار.' } });
  Object.assign(B.ch, { chips: ['پیام‌رسان (بله، ایتا، تلگرام)', 'اینستاگرام', 'ارجاع و دهان‌به‌دهان', 'کانال مستقیم خودمان'], score: 3, evidence: 'early', summary: 'کانال بله محله و معرفی دوستان؛ ارسال پنجشنبه',
    answers: { ch2: 'معرفی دوستان و کانال بلهٔ محله.', ch5: 'پیک اجاره‌ای، پنجشنبه‌ها؛ هر ارسال ۶۰ هزار تومان.' } });
  Object.assign(B.cr, { chips: ['خدمات شخصی', 'جامعهٔ کاربری'], score: 3, evidence: 'data', summary: 'گروه بلهٔ مشترکان و پیگیری تلفنی',
    answers: { cr4: '۲۸ نفر از ۴۰ مشترک ماه دوم تمدید کردند (۷۰٪). دلیل اصلی ترک: سفر و تنوع کم.' } });
  Object.assign(B.rs, { chips: ['اشتراک', 'قیمت ثابت'], score: 3, evidence: 'early', summary: 'اشتراک ماهانهٔ چهار جعبه',
    answers: { rs2: 'اشتراک هفتگی با پرداخت ماهانه.', rs4: 'هر جعبه ۴۸۰ هزار تومان؛ ۴ جعبه در ماه.' },
    flags: { rs7: true }, notes: { rs7: 'حاشیهٔ ۲۲٪ قبل از هزینهٔ ارسال است یا بعد از آن؟' } });
  Object.assign(B.kr, { chips: ['فیزیکی', 'شبکهٔ ارتباطی'], score: 2, evidence: 'assume',
    answers: { kr1: 'رابطه با ۳ کشاورز، سردخانهٔ کوچک اجاره‌ای، فهرست مشترکان.', kr7: 'بسته‌بندی را به یک کارگاه محلی سپرده‌ایم.' } });
  Object.assign(B.ka, { chips: ['تأمین و لجستیک', 'بازاریابی و فروش'], score: 3, evidence: 'early',
    answers: { ka1: 'هماهنگی برداشت، بسته‌بندی، توزیع پنجشنبه.' } });
  Object.assign(B.co, { chips: ['هزینه‌محور'], score: 2, evidence: 'early',
    answers: { co1: 'خرید محصول از کشاورز (۵۵٪)، ارسال (۱۵٪)، بسته‌بندی (۸٪).' } });
  Object.assign(B.cp, { score: 2, answers: { cp1: 'تره‌بار آنلاین شهرداری، اسنپ‌مارکت، سوپرمارکت محله.' } });
  s.econ = { aov: '480000', margin: '22', opm: '4', life: '3.3', cac: '450000', fixed: '45000000', revenue: '76800000', cash: '150000000' };
  s.step = 'canvas';
  return s;
}

let S;
function loadInitial() {
  try { const raw = localStorage.getItem(LS_KEY); if (raw) { S = normalize(JSON.parse(raw)); return; } } catch (e) { }
  S = sampleState();
}
let saveTimer;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { } }, 500);
}
function touched() { if (S.sample) { S.sample = false; renderBanner(); } persist(); }

/* ===== محاسبات ===== */
const stageOf = () => STAGES.find(s => s.id === S.meta.stage) || STAGES[0];
function visibleQs(b, mode = S.mode) {
  const list = b.q.map(([id, text, hint, key]) => ({ id, text, hint, key: !!key }));
  const st = b.st && b.st[S.meta.stage];
  if (st) list.push({ id: `${b.id}_s_${S.meta.stage}`, text: st, hint: '', key: true, stage: true });
  return mode === 'key' ? list.filter(q => q.key) : list;
}
function qText(bid, qid) {
  const b = BY_ID[bid];
  const q = b.q.find(x => x[0] === qid);
  if (q) return q[1];
  const m = qid.match(/_s_(\w+)$/);
  if (m && b.st[m[1]]) return b.st[m[1]];
  return qid;
}
const filled = v => typeof v === 'string' && v.trim() !== '';
function blockStats(id) {
  const b = BY_ID[id], st = S.blocks[id];
  const vis = visibleQs(b);
  const answered = vis.filter(q => filled(st.answers[q.id])).length;
  const flags = Object.keys(st.flags).filter(k => st.flags[k]).length;
  const any = Object.values(st.answers).some(filled) || st.chips.length > 0 || filled(st.summary);
  return { total: vis.length, answered, flags, any };
}
function econ() {
  const n = {}; for (const f of ECON_FIELDS) n[f.id] = parseNum(S.econ[f.id]);
  const gpOrder = n.aov * n.margin / 100;
  const gpMonth = gpOrder * n.opm;
  const ltv = gpMonth * n.life;
  const ratio = ltv / n.cac;
  const payback = n.cac / gpMonth;
  const beOrders = n.fixed / gpOrder;
  const beCust = n.fixed / gpMonth;
  const gpNow = n.revenue * n.margin / 100;
  const burn = n.fixed - gpNow;
  const runway = isFinite(burn) ? (burn > 0 ? n.cash / burn : Infinity) : NaN;
  return { n, gpOrder, gpMonth, ltv, ratio, payback, beOrders, beCust, gpNow, burn, runway };
}
function health() {
  let sw = 0, s = 0, scored = 0;
  for (const id of CORE) { const b = BY_ID[id], sc = S.blocks[id].score; if (sc > 0) { sw += b.weight; s += b.weight * sc; scored++; } }
  const avg = sw ? s / sw : 0;
  const pct = sw ? Math.round(avg / 5 * 100) : null;
  let label = '—';
  if (pct != null) label = pct >= 75 ? 'قوی' : pct >= 55 ? 'قابل‌قبول' : pct >= 40 ? 'نیازمند کار' : 'شکننده';
  return { avg, pct, label, scored, coverage: scored / CORE.length };
}
const has = (id, chip) => S.blocks[id].chips.includes(chip);
const hasAny = (id, list) => list.some(c => has(id, c));
function warnings() {
  const W = [], st = S.meta.stage, early = st === 'idea' || st === 'mvp';
  const add = (sev, blocks, title, detail) => W.push({ sev, blocks, title, detail });
  const B = S.blocks;
  for (const id of CORE) if (!blockStats(id).any) add('info', [id], `«${BY_ID[id].title}» خالی است`, 'هنوز هیچ پاسخ یا انتخابی برای این بلوک ثبت نشده.');
  for (const b of BLOCKS) if (B[b.id].score >= 4 && B[b.id].evidence === 'assume') add('warn', [b.id], `نمرهٔ بالای «${b.title}» بر پایهٔ فرض`, 'نمرهٔ ۴ یا ۵ با سطح شواهد «فرض» سازگار نیست. یا شواهد بخواهید یا نمره را پایین بیاورید.');
  if (B.vp.score && B.cs.score && B.vp.score - B.cs.score >= 2) add('warn', ['vp', 'cs'], 'راه‌حل جلوتر از شناخت مشتری', 'ارزش پیشنهادی نمرهٔ بسیار بالاتری از شناخت مشتری گرفته. ارزشی که برای مشتری مبهم طراحی شده، معمولاً فرضی است.');
  if (hasAny('cs', ['B2B (کسب‌وکار)', 'B2G (دولتی)']) && !hasAny('ch', ['تیم فروش حضوری', 'نماینده/عامل فروش', 'رویداد و نمایشگاه', 'تماس تلفنی'])) add('warn', ['cs', 'ch'], 'مشتری سازمانی بدون کانال فروش مستقیم', 'فروش به کسب‌وکار یا دولت معمولاً به فروش حضوری، تماس یا نماینده نیاز دارد؛ در کانال‌ها هیچ‌کدام انتخاب نشده.');
  const segTypes = BLOCKS[0].chips[0].options.filter(o => has('cs', o));
  if (early && segTypes.length >= 2) add('warn', ['cs'], 'تمرکز ناکافی روی یک بخش مشتری', `در مرحلهٔ «${stageOf().label}»، هدف گرفتن هم‌زمان ${faNum(segTypes.length)} نوع مشتری (${segTypes.join('، ')}) منابع را پخش می‌کند.`);
  const chList = BY_ID.ch.chips[0].options.filter(o => has('ch', o));
  if (chList.length === 1 && ['اینستاگرام', 'پیام‌رسان (بله، ایتا، تلگرام)', 'مارکت‌پلیس (دیجی‌کالا، باسلام، دیوار)'].includes(chList[0])) add('warn', ['ch'], 'وابستگی به یک پلتفرم بیرونی', `تنها کانال «${chList[0]}» است. تغییر قوانین، الگوریتم یا فیلترینگ می‌تواند فروش را یک‌شبه متوقف کند.`);
  if (has('ch', 'کانال شریک') && !has('ch', 'کانال مستقیم خودمان')) add('info', ['ch', 'kp'], 'همهٔ کانال‌ها در اختیار شرکاست', 'رابطه با مشتری و داده‌اش دست شریک است. شرط‌های قرارداد و جایگزین را بررسی کنید.');
  if (early && has('rs', 'تبلیغات')) add('warn', ['rs'], 'مدل درآمد تبلیغاتی در مرحلهٔ اولیه', 'درآمد تبلیغاتی به حجم بسیار بالای کاربر نیاز دارد. برای این مرحله، درآمد مستقیم از مشتری شواهد بهتری می‌سازد.');
  if (has('vp', 'قیمت پایین‌تر') && has('co', 'ارزش‌محور')) add('warn', ['vp', 'co'], 'ناسازگاری ارزش «قیمت پایین‌تر» با ساختار هزینهٔ ارزش‌محور', 'ارزش پیشنهادی مبتنی بر قیمت پایین، ساختار هزینهٔ هزینه‌محور و بهینه می‌خواهد.');
  if (hasAny('vp', ['برند و پرستیژ', 'شخصی‌سازی']) && has('co', 'هزینه‌محور') && !has('vp', 'قیمت پایین‌تر')) add('info', ['vp', 'co'], 'ارزش ممتاز با منطق هزینه‌محور', 'ارزش مبتنی بر برند یا شخصی‌سازی معمولاً هزینهٔ بیشتری می‌طلبد. مطمئن شوید صرفه‌جویی به ارزش آسیب نمی‌زند.');
  if (has('co', 'وابسته به نرخ ارز') && has('rs', 'قیمت ثابت')) add('warn', ['co', 'rs'], 'هزینهٔ ارزی با قیمت ثابت', 'با جهش ارز، حاشیهٔ سود فرسوده می‌شود. سازوکار به‌روزرسانی قیمت لازم است.');
  const outsourced = filled(B.kr.answers.kr7) || filled(B.ka.answers.ka7);
  if (outsourced && !blockStats('kp').any) add('warn', ['kp', 'kr', 'ka'], 'برون‌سپاری بدون شریک تعریف‌شده', 'در منابع یا فعالیت‌ها از برون‌سپاری گفته شده، اما بلوک شرکای کلیدی خالی است.');
  if ((st === 'traction' || st === 'growth') && B.rs.score > 0 && B.rs.score <= 2) add('crit', ['rs'], 'مرحلهٔ اعلام‌شده با درآمد سازگار نیست', `در مرحلهٔ «${stageOf().label}» انتظار درآمد تکرارشونده می‌رود، اما جریان درآمد نمرهٔ ${faNum(B.rs.score)} گرفته.`);
  if ((st === 'traction' || st === 'growth') && B.cs.score > 0 && B.cs.score <= 2) add('warn', ['cs'], 'شناخت مشتری برای این مرحله ضعیف است', 'کسب‌وکاری که به کشش بازار رسیده باید مشتری سودآورش را دقیق بشناسد.');
  const e = econ();
  if (isFinite(e.ratio)) {
    if (e.ratio < 1) add('crit', ['rs', 'co'], 'هر مشتری زیان می‌دهد', `ارزش طول عمر مشتری (${faNum(e.ltv)} تومان) کمتر از هزینهٔ جذب اوست. نسبت LTV به CAC: ${faNum(e.ratio, 1)}.`);
    else if (e.ratio < 3) add('warn', ['rs', 'co'], 'نسبت LTV به CAC پایین است', `نسبت ${faNum(e.ratio, 1)} است؛ معیار رایج برای مدل سالم حدود ۳ یا بیشتر است.`);
  }
  if (isFinite(e.payback) && e.payback > 12) add('warn', ['co'], 'بازگشت هزینهٔ جذب طولانی است', `${faNum(e.payback, 1)} ماه طول می‌کشد تا هزینهٔ جذب هر مشتری برگردد.`);
  if (isFinite(e.n.margin) && e.n.margin < 20) add('warn', ['rs', 'co'], 'حاشیهٔ سود ناخالص پایین', `حاشیهٔ ${faNum(e.n.margin)}٪ جای کمی برای بازاریابی، خطا و تورم باقی می‌گذارد.`);
  if (isFinite(e.runway) && e.runway !== Infinity) {
    if (e.runway < 6) add('crit', ['co'], 'نقدینگی کمتر از ۶ ماه', `با مصرف خالص ماهانهٔ ${faNum(e.burn)} تومان، نقدینگی حدود ${faNum(e.runway, 1)} ماه دوام می‌آورد.`);
    else if (e.runway < 12) add('warn', ['co'], 'نقدینگی کمتر از یک سال', `حدود ${faNum(e.runway, 1)} ماه تا اتمام نقدینگی. برنامهٔ تأمین مالی یا سودآوری لازم است.`);
  }
  if (has('rs', 'اشتراک') && isFinite(e.n.opm) && e.n.opm < 1 && isFinite(e.n.life) && e.n.life < 3) add('warn', ['rs', 'cr'], 'مدل اشتراکی با ماندگاری کم', 'تکرار خرید و عمر مشتری برای مدل اشتراکی پایین است.');
  if (!early && ECON_FIELDS.every(f => !isFinite(parseNum(S.econ[f.id])))) add('info', ['co', 'rs'], 'اقتصاد واحد وارد نشده', 'برای این مرحله اعداد پایه (قیمت، حاشیه، CAC، هزینهٔ ثابت) باید موجود باشد.');
  if (!blockStats('cp').any) add('info', ['cp'], 'رقبا بررسی نشده', 'هیچ رقیب یا جایگزینی ثبت نشده. «رقیب نداریم» معمولاً یعنی بازار یا مسئله درست شناخته نشده.');
  const fl = BLOCKS.reduce((a, b) => a + blockStats(b.id).flags, 0);
  if (fl) add('info', [], `${faNum(fl)} ابهام باز`, 'این موارد در مرحلهٔ «پیگیری» برای ارسال به بنیان‌گذار جمع شده‌اند.');
  const order = { crit: 0, warn: 1, info: 2 };
  return W.sort((a, b) => order[a.sev] - order[b.sev]);
}

/* ===== رابط: عمومی ===== */
const STEPS = [
  { id: 'intake', label: 'دریافت اطلاعات' },
  { id: 'canvas', label: 'تکمیل بوم' },
  { id: 'econ', label: 'اقتصاد واحد' },
  { id: 'followup', label: 'پیگیری ابهام‌ها' },
  { id: 'dash', label: 'داشبورد و تحلیل' }
];
function toast(msg, kind = '') {
  const t = $('#toast'); t.textContent = msg; t.className = 'toast show ' + kind;
  clearTimeout(t._h); t._h = setTimeout(() => t.className = 'toast', 3200);
}
function autosize(el) { el.style.height = 'auto'; el.style.height = (el.scrollHeight + 2) + 'px'; }
async function copyText(text, btn) {
  try { await navigator.clipboard.writeText(text); toast('کپی شد'); }
  catch (e) {
    const ta = btn && btn.closest('.card') && $('textarea', btn.closest('.card'));
    if (ta) { ta.focus(); ta.select(); }
    toast('کپی خودکار ممکن نشد؛ متن انتخاب شد، با Ctrl+C کپی کنید', 'warn');
  }
}
function renderStepper() {
  $('#stepper').innerHTML = STEPS.map((s, i) => `<button class="step ${S.step === s.id ? 'on' : ''}" data-step="${s.id}" id="step-${s.id}"><span class="sn">${faNum(i + 1)}</span><span class="sl">${s.label}</span></button>`).join('');
  for (const s of STEPS) $('#pane-' + s.id).hidden = S.step !== s.id;
}
function goStep(id) {
  S.step = id; renderStepper(); persist();
  if (id === 'canvas') { renderNav(); renderEditor(); }
  if (id === 'econ') renderEcon();
  if (id === 'followup') renderFollowups();
  if (id === 'dash') renderDash();
  if (id === 'intake') renderIntake();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderBanner() {
  $('#sampleBanner').hidden = !S.sample;
  $('#caseName').textContent = S.meta.name ? S.meta.name : 'پروندهٔ بی‌نام';
  $('#caseStage').textContent = stageOf().label;
}

/* ===== مرحله ۱ ===== */
function renderIntake() {
  for (const el of $$('[data-meta]')) { if (document.activeElement !== el) el.value = S.meta[el.dataset.meta] || ''; }
  $('#raw').value = S.raw || ''; autosize($('#raw'));
  $('#stageSeg').innerHTML = STAGES.map(s => `<button class="seg ${S.meta.stage === s.id ? 'on' : ''}" data-stage="${s.id}"><b>${s.label}</b><small>${s.desc}</small></button>`).join('');
  $('#requestMsg').value = requestMessage(); autosize($('#requestMsg'));
}
function requestMessage() {
  const m = S.meta;
  const lines = [];
  lines.push(`سلام${m.founder ? ' ' + m.founder : ''}،`);
  lines.push(`برای تحلیل مدل کسب‌وکار${m.name ? ' «' + m.name + '»' : ''}، لطفاً پیش از جلسه هر کدام از این موارد را که در دسترس است بفرستید:`);
  lines.push('');
  lines.push('مدارک:');
  ['معرفی‌نامه یا پیچ‌دک', 'آمار فروش و تعداد مشتری ماه‌به‌ماه (حتی تقریبی)', 'فهرست هزینه‌های ثابت ماهانه و هزینهٔ تمام‌شدهٔ هر واحد', 'قیمت‌ها و نحوهٔ دریافت پول از مشتری', 'فهرست رقبا از نگاه خودتان', 'ترکیب تیم و نقش هر نفر'].forEach(x => lines.push('• ' + x));
  lines.push('');
  lines.push('سؤالات کلیدی:');
  let i = 1;
  for (const b of BLOCKS) {
    const qs = visibleQs(b, 'key').slice(0, 2);
    if (b.st[S.meta.stage]) { const sq = visibleQs(b, 'key').find(q => q.stage); if (sq && !qs.includes(sq)) qs.push(sq); }
    lines.push(`\n${b.title}:`);
    qs.forEach(q => lines.push(`${faNum(i++)}. ${q.text}`));
  }
  lines.push('\nاگر برای سؤالی عدد دقیق ندارید، برآورد تقریبی هم کمک می‌کند. ممنونم.');
  return lines.join('\n');
}

/* ===== مرحله ۲: بوم ===== */
function tileHTML(b, clickable = true) {
  const s = blockStats(b.id), st = S.blocks[b.id];
  return `<button class="tile r-${b.region} ${S.current === b.id && clickable ? 'on' : ''}" data-block="${b.id}" style="grid-area:${b.id}">
    <span class="tno">${faNum(b.no)}</span>
    <span class="ttl">${b.title}</span>
    <span class="tmeta">
      <span class="prog" title="پاسخ‌داده"><i style="width:${s.total ? Math.round(s.answered / s.total * 100) : 0}%"></i></span>
      <span class="frac">${faNum(s.answered)}/${faNum(s.total)}</span>
      ${s.flags ? `<span class="fdot" title="ابهام باز">${faNum(s.flags)} ابهام</span>` : ''}
      <span class="sc ${st.score ? 's' + st.score : ''}">${st.score ? faNum(st.score) : '—'}</span>
    </span></button>`;
}
function renderNav() {
  const core = BLOCKS.filter(b => !b.supp), supp = BLOCKS.filter(b => b.supp);
  $('#nav').innerHTML = `<div class="bmc">${core.map(b => tileHTML(b)).join('')}</div><div class="supp">${supp.map(b => tileHTML(b)).join('')}</div>`;
  $('#modeSeg').innerHTML = [['key', 'سؤالات کلیدی'], ['all', 'همهٔ سؤالات']].map(([id, l]) => `<button class="mini ${S.mode === id ? 'on' : ''}" data-mode="${id}">${l}</button>`).join('');
  $('#stageMini').innerHTML = STAGES.map(s => `<option value="${s.id}" ${S.meta.stage === s.id ? 'selected' : ''}>${s.label}</option>`).join('');
}
function refreshTile(id) {
  const old = $(`#nav [data-block="${id}"]`); if (!old) return;
  const tmp = document.createElement('div'); tmp.innerHTML = tileHTML(BY_ID[id]); old.replaceWith(tmp.firstElementChild);
}
function renderEditor() {
  const b = BY_ID[S.current], st = S.blocks[b.id];
  const qs = visibleQs(b);
  const idx = BLOCKS.indexOf(b);
  const prev = BLOCKS[idx - 1], next = BLOCKS[idx + 1];
  $('#editor').innerHTML = `
  <div class="ed-head r-${b.region}">
    <div class="ed-tag">${REGION[b.region]} · بلوک ${faNum(b.no)}${b.supp ? ' (مکمل)' : ''}</div>
    <h2>${b.title}</h2>
    <p class="why">${b.why}</p>
  </div>
  ${b.chips.map((g, gi) => `<div class="chipgroup"><div class="lbl">${g.label}</div><div class="chips">${g.options.map(o => `<button class="chip ${st.chips.includes(o) ? 'on' : ''}" data-chip="${esc(o)}" aria-pressed="${st.chips.includes(o)}">${esc(o)}</button>`).join('')}</div></div>`).join('')}
  <div class="qs">
  ${qs.map((q, i) => `
    <div class="q ${st.flags[q.id] ? 'flagged' : ''} ${q.stage ? 'stageq' : ''}" data-q="${q.id}">
      <label for="a-${q.id}" class="qt">${q.stage ? `<span class="stbadge">مرحلهٔ ${stageOf().label}</span>` : ''}${esc(q.text)}</label>
      ${q.hint ? `<div class="hint">${esc(q.hint)}</div>` : ''}
      <textarea id="a-${q.id}" data-ans="${q.id}" rows="1" placeholder="پاسخ…">${esc(st.answers[q.id] || '')}</textarea>
      <div class="qfoot">
        <button class="flagbtn" data-flag="${q.id}" aria-pressed="${!!st.flags[q.id]}">${st.flags[q.id] ? 'ابهام علامت خورده' : 'علامت ابهام'}</button>
        <input class="note" id="n-${q.id}" data-note="${q.id}" placeholder="سؤال دقیق برای بنیان‌گذار…" value="${esc(st.notes[q.id] || '')}" ${st.flags[q.id] ? '' : 'hidden'}>
      </div>
    </div>`).join('')}
  </div>
  <div class="sumbox">
    <label for="sum-${b.id}" class="lbl">خلاصه برای نمای بوم <small>یک یا دو خط</small></label>
    <textarea id="sum-${b.id}" data-sum rows="1" placeholder="مثلاً: خانواده‌های شاغل شهری که وقت خرید ندارند">${esc(st.summary)}</textarea>
  </div>
  <div class="scorebox">
    <div class="lbl">ارزیابی تحلیل‌گر</div>
    <div class="scores">${[1, 2, 3, 4, 5].map(n => `<button class="sbtn s${n} ${st.score === n ? 'on' : ''}" data-score="${n}" aria-pressed="${st.score === n}">${faNum(n)}</button>`).join('')}</div>
    <div class="rubric">${[1, 3, 5].map(n => `<div><b>${faNum(n)}</b> ${b.rubric[n]}</div>`).join('')}</div>
    <div class="lbl" style="margin-top:14px">سطح شواهد</div>
    <div class="evs">${EVIDENCE.map(e => `<button class="ev ${st.evidence === e.id ? 'on' : ''}" data-ev="${e.id}"><b>${e.label}</b><small>${e.desc}</small></button>`).join('')}</div>
    ${!b.supp ? `<div class="expect">انتظار برای مرحلهٔ «${stageOf().label}»: حدود ${faNum(stageOf().exp, 1)} از ۵</div>` : ''}
  </div>
  <div class="ednav">
    ${prev ? `<button class="btn ghost" data-block="${prev.id}">→ ${prev.title}</button>` : '<span></span>'}
    ${next ? `<button class="btn" data-block="${next.id}">${next.title} ←</button>` : `<button class="btn" data-step="econ">ادامه: اقتصاد واحد ←</button>`}
  </div>`;
  $$('#editor textarea').forEach(autosize);
}

/* ===== مرحله ۳: اقتصاد واحد ===== */
function renderEcon() {
  $('#econInputs').innerHTML = ECON_FIELDS.map(f => `<label class="field"><span>${f.label} <small>${f.unit}</small></span><input id="e-${f.id}" data-econ="${f.id}" inputmode="decimal" value="${esc(fmtInput(S.econ[f.id]))}" placeholder="—"></label>`).join('');
  renderEconOut();
}
function fmtInput(v) { const n = parseNum(v); return isFinite(n) ? n.toLocaleString('fa-IR', { maximumFractionDigits: 2 }) : (v || ''); }
function renderEconOut() {
  const e = econ();
  const card = (label, val, unit, note, state = '') => `<div class="kpi ${state}"><div class="kl">${label}</div><div class="kv">${val}<small>${unit}</small></div><div class="kn">${note}</div></div>`;
  const ratioState = !isFinite(e.ratio) ? '' : e.ratio < 1 ? 'crit' : e.ratio < 3 ? 'warn' : 'ok';
  const payState = !isFinite(e.payback) ? '' : e.payback > 12 ? 'warn' : 'ok';
  const runState = !isFinite(e.runway) ? '' : e.runway === Infinity ? 'ok' : e.runway < 6 ? 'crit' : e.runway < 12 ? 'warn' : 'ok';
  $('#econOut').innerHTML =
    card('ارزش طول عمر مشتری (LTV)', faNum(e.ltv), 'تومان', 'سود ناخالص هر خرید × خرید ماهانه × عمر مشتری') +
    card('نسبت LTV به CAC', faNum(e.ratio, 1), 'برابر', 'سالم: ۳ یا بیشتر', ratioState) +
    card('بازگشت هزینهٔ جذب', faNum(e.payback, 1), 'ماه', 'خوب: کمتر از ۱۲ ماه', payState) +
    card('نقطهٔ سربه‌سر', faNum(e.beCust), 'مشتری فعال', `معادل ${faNum(e.beOrders)} خرید در ماه`) +
    card('مصرف خالص نقدینگی', isFinite(e.burn) ? (e.burn <= 0 ? 'سودده' : faNum(e.burn)) : '—', isFinite(e.burn) && e.burn > 0 ? 'تومان در ماه' : '', 'هزینهٔ ثابت منهای سود ناخالص ماه جاری') +
    card('دوام نقدینگی (Runway)', e.runway === Infinity ? '∞' : faNum(e.runway, 1), 'ماه', 'خطر: کمتر از ۶ ماه', runState);
}

/* ===== مرحله ۴: پیگیری ===== */
function followItems() {
  const groups = [];
  for (const b of BLOCKS) {
    const st = S.blocks[b.id], items = [];
    for (const qid of Object.keys(st.flags)) if (st.flags[qid]) items.push({ kind: 'flag', text: filled(st.notes[qid]) ? st.notes[qid] : qText(b.id, qid), q: qText(b.id, qid) });
    if (S.fu.includeEmpty) for (const q of visibleQs(b, 'key')) if (!filled(st.answers[q.id]) && !st.flags[q.id]) items.push({ kind: 'empty', text: q.text });
    if (items.length) groups.push({ title: b.title, items });
  }
  const ai = (S.ai && Array.isArray(S.ai.questions) ? S.ai.questions : []).filter((q, i) => S.fu.aiPicked[i] !== false);
  const custom = S.fu.custom.filter(filled);
  if (ai.length || custom.length) groups.push({ title: 'سؤالات تکمیلی', items: [...ai.map(t => ({ kind: 'ai', text: t })), ...custom.map(t => ({ kind: 'custom', text: t }))] });
  return groups;
}
function followMessage() {
  const g = followItems(), m = S.meta;
  if (!g.length) return '';
  const L = [`سلام${m.founder ? ' ' + m.founder : ''}،`, `ممنون از اطلاعاتی که${m.name ? ' دربارهٔ «' + m.name + '»' : ''} فرستادید. برای تکمیل تحلیل، به پاسخ این سؤال‌ها نیاز دارم:`];
  let i = 1;
  for (const grp of g) { L.push(`\n${grp.title}:`); grp.items.forEach(it => L.push(`${faNum(i++)}. ${it.text}`)); }
  L.push('\nاگر برای سؤالی عدد دقیق ندارید، برآورد تقریبی هم کمک می‌کند. ممنونم.');
  return L.join('\n');
}
function renderFollowups() {
  const flagged = [];
  for (const b of BLOCKS) { const st = S.blocks[b.id]; for (const q of Object.keys(st.flags)) if (st.flags[q]) flagged.push({ b, q, note: st.notes[q] || '' }); }
  $('#fuFlags').innerHTML = flagged.length ? flagged.map(f => `<div class="fu-item"><span class="btag r-${f.b.region}">${f.b.title}</span><div><div class="fq">${esc(qText(f.b.id, f.q))}</div>${f.note ? `<div class="fn">سؤال برای بنیان‌گذار: ${esc(f.note)}</div>` : '<div class="fn muted">یادداشتی ثبت نشده؛ خود سؤال ارسال می‌شود.</div>'}</div><button class="link" data-goto="${f.b.id}">ویرایش</button></div>`).join('')
    : `<div class="empty">هنوز ابهامی علامت نخورده. در مرحلهٔ «تکمیل بوم»، کنار هر سؤال مبهم دکمهٔ «علامت ابهام» را بزنید.</div>`;
  $('#fuEmpty').checked = !!S.fu.includeEmpty;
  const aiq = S.ai && Array.isArray(S.ai.questions) ? S.ai.questions : [];
  $('#fuAI').innerHTML = aiq.length ? aiq.map((q, i) => `<label class="check"><input type="checkbox" data-aiq="${i}" ${S.fu.aiPicked[i] !== false ? 'checked' : ''}><span>${esc(q)}</span></label>`).join('')
    : `<div class="empty">بعد از اجرای «تحلیل هوش مصنوعی» در داشبورد، سؤالات پیشنهادی اینجا می‌آیند.</div>`;
  $('#fuCustom').innerHTML = S.fu.custom.map((c, i) => `<div class="custom-row"><input data-custom="${i}" id="cu-${i}" value="${esc(c)}" placeholder="سؤال دلخواه…"><button class="link danger" data-delcustom="${i}">حذف</button></div>`).join('');
  $('#fuMsg').value = followMessage() || 'هنوز سؤالی برای ارسال نیست.'; autosize($('#fuMsg'));
}

/* ===== مرحله ۵: داشبورد ===== */
function renderDash() {
  const h = health(), W = warnings(), stg = stageOf();
  const cnt = s => W.filter(w => w.sev === s).length;
  const ringPct = h.pct ?? 0;
  $('#dashTop').innerHTML = `
    <div class="gauge"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" class="g-bg"/><circle cx="60" cy="60" r="50" class="g-fg ${h.pct == null ? '' : h.pct >= 75 ? 'ok' : h.pct >= 55 ? 'mid' : h.pct >= 40 ? 'warn' : 'crit'}" stroke-dasharray="${(ringPct / 100 * 314.16).toFixed(1)} 314.16" transform="rotate(-90 60 60)"/></svg>
      <div class="gv"><b>${h.pct == null ? '—' : faNum(h.pct)}</b><span>از ۱۰۰</span></div></div>
    <div class="dstats">
      <div class="dlabel">سلامت مدل کسب‌وکار</div>
      <div class="dbig">${h.label}</div>
      <div class="drow">
        <span>پوشش نمره‌دهی: <b>${faNum(h.scored)} از ${faNum(CORE.length)}</b> بلوک</span>
        <span>مرحله: <b>${stg.label}</b> · انتظار ${faNum(stg.exp, 1)} از ۵</span>
        <span>میانگین وزنی: <b>${h.avg ? faNum(h.avg, 1) : '—'}</b></span>
      </div>
      <div class="pills"><span class="pill crit">${faNum(cnt('crit'))} بحرانی</span><span class="pill warn">${faNum(cnt('warn'))} هشدار</span><span class="pill info">${faNum(cnt('info'))} یادآوری</span></div>
    </div>`;
  const aiScores = S.ai && S.ai.scores || {};
  $('#bars').innerHTML = `<div class="bars-axis"><span></span><div class="axis">${[0, 1, 2, 3, 4, 5].map(n => `<span style="right:${n * 20}%">${faNum(n)}</span>`).join('')}</div><span></span></div>` + BLOCKS.map(b => {
    const sc = S.blocks[b.id].score, ai = aiScores[b.id] && Number(aiScores[b.id].score) || 0;
    const ev = EVIDENCE.find(e => e.id === S.blocks[b.id].evidence);
    return `<div class="bar-row"><span class="bl">${b.title}</span>
      <div class="track">${[1, 2, 3, 4].map(n => `<i class="grid" style="right:${n * 20}%"></i>`).join('')}
        <div class="fill r-${b.region}" style="width:${sc * 20}%"></div>
        ${!b.supp ? `<i class="exp" style="right:${stg.exp * 20}%" title="انتظار مرحله"></i>` : ''}
        ${ai ? `<i class="aimark" style="right:calc(${ai * 20}% - 5px)" title="نمرهٔ پیشنهادی هوش مصنوعی: ${ai}"></i>` : ''}
      </div>
      <span class="bv">${sc ? faNum(sc) : '—'}${ev ? `<small>${ev.label}</small>` : ''}</span></div>`;
  }).join('') + `<div class="legend"><span><i class="lg exp"></i>انتظار مرحله</span>${Object.keys(aiScores).length ? '<span><i class="lg aimark"></i>نمرهٔ پیشنهادی هوش مصنوعی</span>' : ''}<span><i class="lg r-d"></i>سمت مشتری</span><span><i class="lg r-f"></i>زیرساخت</span><span><i class="lg r-v"></i>مالی</span><span><i class="lg r-s"></i>مکمل</span></div>`;
  $('#canvasView').innerHTML = `<div class="bmc view">${BLOCKS.filter(b => !b.supp).map(b => cellHTML(b)).join('')}</div><div class="supp view">${BLOCKS.filter(b => b.supp).map(b => cellHTML(b)).join('')}</div>`;
  $('#warnList').innerHTML = W.length ? W.map(w => `<div class="warn-item ${w.sev}"><span class="sev">${{ crit: 'بحرانی', warn: 'هشدار', info: 'یادآوری' }[w.sev]}</span><div><b>${esc(w.title)}</b><p>${esc(w.detail)}</p>${w.blocks.length ? `<div class="wb">${w.blocks.map(id => `<button class="link" data-goto="${id}">${BY_ID[id].title}</button>`).join('')}</div>` : ''}</div></div>`).join('') : '<div class="empty">هشداری پیدا نشد.</div>';
  renderAI();
}
function cellHTML(b) {
  const st = S.blocks[b.id];
  const pts = filled(st.summary) ? [st.summary] : visibleQs(b, 'all').map(q => st.answers[q.id]).filter(filled).slice(0, 2);
  return `<div class="cell r-${b.region}" style="grid-area:${b.id}">
    <div class="ch"><span>${b.title}</span><span class="sc ${st.score ? 's' + st.score : ''}">${st.score ? faNum(st.score) : '—'}</span></div>
    ${pts.length ? pts.map(p => `<p>${esc(p.length > 160 ? p.slice(0, 160) + '…' : p)}</p>`).join('') : '<p class="muted">خالی</p>'}
    ${st.chips.length ? `<div class="cchips">${st.chips.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : ''}
  </div>`;
}

/* ===== هوش مصنوعی ===== */
let sampleFn = null, aiCtl = null;
async function initCaps() {
  if (!IN_CLAUDE) { setAIAvail(false); setDlAvail(true); return; }
  try { sampleFn = await window.claude.use('sample'); } catch (e) { sampleFn = null; }
  setAIAvail(!!sampleFn);
  try { downloads = await window.claude.use('downloads'); } catch (e) { downloads = null; }
  setDlAvail(!!downloads);
}
function setAIAvail(ok) {
  $$('.ai-only').forEach(el => el.hidden = !ok);
  $$('.ai-off').forEach(el => el.hidden = ok);
}
function aiErrorText(e) {
  const c = e && e.code;
  if (c === 'cancelled') return 'متوقف شد.';
  if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(c)) { setAIAvail(false); return 'دسترسی به هوش مصنوعی در این نما فعال نیست.'; }
  if (c === 'rate_limited') return 'درخواست‌ها زیاد شده یا سقف استفاده پر است. کمی بعد دوباره امتحان کنید.';
  if (c === 'session_expired') return 'نشست منقضی شده؛ دوباره وارد حساب شوید.';
  if (c === 'prompt_too_large') return 'متن ورودی خیلی طولانی است؛ یادداشت‌ها را کوتاه‌تر کنید.';
  if (c === 'invalid_json') return 'پاسخ قابل‌خواندن نبود. دوباره امتحان کنید.';
  if (c === 'refused') return 'این درخواست پاسخ داده نشد. متن ورودی را بازبینی کنید.';
  return 'ارتباط قطع شد. دوباره امتحان کنید.';
}
function catalogText(withStage = true) {
  return BLOCKS.map(b => {
    const qs = b.q.map(q => `  ${q[0]}: ${q[1]}`);
    if (withStage && b.st[S.meta.stage]) qs.push(`  ${b.id}_s_${S.meta.stage}: ${b.st[S.meta.stage]}`);
    return `[${b.id}] ${b.title}\n${qs.join('\n')}\n  گزینه‌های چیپ: ${b.chips.flatMap(g => g.options).join(' | ')}`;
  }).join('\n');
}
async function aiDraft() {
  const raw = S.raw.trim();
  if (raw.length < 40) { toast('اول یادداشت‌های خام بنیان‌گذار را وارد کنید', 'warn'); return; }
  const btn = $('#draftBtn'), status = $('#draftStatus');
  aiCtl = new AbortController();
  btn.disabled = true; $('#draftStop').hidden = false; status.textContent = 'در حال خواندن یادداشت‌ها…'; status.className = 'status busy';
  try {
    const r = await sampleFn.json(draftPrompt(), { signal: aiCtl.signal, modelTier: 'default', onText: ({ text }) => { status.textContent = `در حال نوشتن پیش‌نویس… (${faNum(text.length)} نویسه)`; } });
    applyDraft(r, status);
  } catch (e) {
    status.className = e && e.code === 'cancelled' ? 'status' : 'status err';
    status.textContent = aiErrorText(e);
  } finally { btn.disabled = false; $('#draftStop').hidden = true; aiCtl = null; }
}
function applyDraft(r, status) {
  const n = mergeDraft(r || {});
  status.className = 'status ok';
  status.textContent = `پیش‌نویس اعمال شد: ${faNum(n.answers)} پاسخ، ${faNum(n.chips)} انتخاب، ${faNum(n.flags)} ابهام. فقط فیلدهای خالی پر شدند.${n.stageHint ? ` پیشنهاد مرحله: «${n.stageHint}».` : ''}`;
  touched(); renderIntake(); renderBanner();
}
function draftPrompt() {
  const raw = S.raw.trim();
  return `تو یک تحلیل‌گر کسب‌وکار هستی. از روی یادداشت‌های خام زیر که از بنیان‌گذار یک کسب‌وکار گرفته شده، پیش‌نویس بوم کسب‌وکار را بنویس.
قوانین:
- فقط از اطلاعاتی استفاده کن که در یادداشت‌ها آمده یا مستقیماً از آن نتیجه می‌شود. چیزی از خودت نساز. اگر پاسخ سؤالی در یادداشت‌ها نیست، آن سؤال را در answers نیاور.
- پاسخ‌ها فارسی، کوتاه و مشخص باشند (حداکثر دو جمله) و اعداد یادداشت‌ها را حفظ کنند.
- چیپ‌ها را فقط از گزینه‌های همان بلوک و دقیقاً با همان نوشتار انتخاب کن.
- summary یک خط کوتاه برای نمای بوم است؛ فقط برای بلوک‌هایی که اطلاعات دارند.
- هر جا یادداشت‌ها مبهم، ناقص یا متناقض است، در ambiguities بیاور: شناسهٔ سؤال مرتبط و یک سؤال دقیق و مؤدبانه برای پرسیدن از بنیان‌گذار. حداکثر ۸ مورد.
- econ را فقط برای اعدادی که در یادداشت‌ها آمده پر کن، به صورت عدد خالص. واحد پول تومان است. کلیدها: aov (میانگین مبلغ هر خرید)، margin (درصد حاشیهٔ سود ناخالص)، opm (تعداد خرید هر مشتری در ماه)، life (عمر مشتری به ماه)، cac (هزینهٔ جذب هر مشتری)، fixed (هزینهٔ ثابت ماهانه)، revenue (درآمد ماهانه)، cash (نقدینگی موجود).
- stage حدسِ مرحلهٔ کسب‌وکار است: idea یا mvp یا traction یا growth.
فقط یک JSON با این ساختار برگردان:
{"meta":{"name":"","industry":"","founder":"","stage":"mvp"},"blocks":{"cs":{"answers":{"cs1":"..."},"chips":["..."],"summary":"..."}},"econ":{"aov":0},"ambiguities":[{"q":"cs5","ask":"..."}]}

سؤالات و گزینه‌ها:
${catalogText()}

یادداشت‌های بنیان‌گذار:
"""
${raw.slice(0, 30000)}
"""`;
}
function mergeDraft(r) {
  const out = { answers: 0, chips: 0, flags: 0, stageHint: '' };
  if (r.meta) {
    for (const k of ['name', 'industry', 'founder']) if (filled(r.meta[k]) && !filled(S.meta[k])) S.meta[k] = String(r.meta[k]);
    const sg = STAGES.find(s => s.id === r.meta.stage);
    if (sg && sg.id !== S.meta.stage) out.stageHint = sg.label;
  }
  const valid = new Set();
  for (const b of BLOCKS) { b.q.forEach(q => valid.add(q[0])); Object.keys(b.st).forEach(s => valid.add(`${b.id}_s_${s}`)); }
  const blocks = r.blocks || {};
  for (const b of BLOCKS) {
    const src = blocks[b.id]; if (!src) continue;
    const st = S.blocks[b.id];
    for (const [qid, v] of Object.entries(src.answers || {})) {
      if (!valid.has(qid) || !qid.startsWith(b.id) || !filled(v) || filled(st.answers[qid])) continue;
      st.answers[qid] = String(v); out.answers++;
    }
    const opts = new Set(b.chips.flatMap(g => g.options));
    for (const c of (src.chips || [])) if (opts.has(c) && !st.chips.includes(c)) { st.chips.push(c); out.chips++; }
    if (filled(src.summary) && !filled(st.summary)) st.summary = String(src.summary);
  }
  for (const [k, v] of Object.entries(r.econ || {})) {
    if (!ECON_FIELDS.some(f => f.id === k)) continue;
    const n = parseNum(v); if (isFinite(n) && n !== 0 && !isFinite(parseNum(S.econ[k]))) S.econ[k] = String(n);
  }
  for (const a of (r.ambiguities || [])) {
    if (!a || !valid.has(a.q)) continue;
    const b = BLOCKS.find(x => a.q.startsWith(x.id)); if (!b) continue;
    const st = S.blocks[b.id];
    if (!st.flags[a.q]) { st.flags[a.q] = true; out.flags++; }
    if (filled(a.ask) && !filled(st.notes[a.q])) st.notes[a.q] = String(a.ask);
  }
  return out;
}
function caseContext() {
  const m = S.meta, stg = stageOf(), L = [];
  L.push(`نام: ${m.name || '—'} | صنعت: ${m.industry || '—'} | مرحله: ${stg.label} (انتظار نمره حدود ${stg.exp} از ۵)`);
  for (const b of BLOCKS) {
    const st = S.blocks[b.id];
    const ev = EVIDENCE.find(e => e.id === st.evidence);
    L.push(`\n[${b.id}] ${b.title}${b.supp ? ' (مکمل)' : ''} | نمرهٔ تحلیل‌گر: ${st.score || 'ثبت نشده'} | شواهد: ${ev ? ev.label : 'ثبت نشده'}`);
    if (st.chips.length) L.push(`انتخاب‌ها: ${st.chips.join('، ')}`);
    if (filled(st.summary)) L.push(`خلاصه: ${st.summary}`);
    for (const [qid, v] of Object.entries(st.answers)) if (filled(v)) L.push(`- ${qText(b.id, qid)} ← ${v.trim()}`);
    for (const qid of Object.keys(st.flags)) if (st.flags[qid]) L.push(`* ابهام باز: ${qText(b.id, qid)}${filled(st.notes[qid]) ? ' (' + st.notes[qid] + ')' : ''}`);
  }
  const e = econ();
  const ef = ECON_FIELDS.filter(f => isFinite(e.n[f.id])).map(f => `${f.label}: ${e.n[f.id]} ${f.unit}`);
  if (ef.length) {
    L.push('\nاقتصاد واحد: ' + ef.join(' | '));
    L.push(`محاسبه‌شده: LTV=${isFinite(e.ltv) ? Math.round(e.ltv) : '—'} | LTV/CAC=${isFinite(e.ratio) ? e.ratio.toFixed(1) : '—'} | بازگشت CAC=${isFinite(e.payback) ? e.payback.toFixed(1) + ' ماه' : '—'} | سربه‌سر=${isFinite(e.beCust) ? Math.round(e.beCust) + ' مشتری' : '—'} | Runway=${e.runway === Infinity ? 'سودده' : isFinite(e.runway) ? e.runway.toFixed(1) + ' ماه' : '—'}`);
  }
  const W = warnings().filter(w => w.sev !== 'info');
  if (W.length) L.push('\nهشدارهای قاعده‌محور: ' + W.map(w => w.title).join(' | '));
  if (filled(S.raw)) L.push(`\nیادداشت‌های خام بنیان‌گذار:\n${S.raw.slice(0, 6000)}`);
  return L.join('\n');
}
async function aiAnalyze() {
  const any = BLOCKS.some(b => blockStats(b.id).any);
  if (!any) { toast('بوم هنوز خالی است', 'warn'); return; }
  const btn = $('#aiBtn'), status = $('#aiStatus');
  aiCtl = new AbortController();
  btn.disabled = true; $('#aiStop').hidden = false; status.className = 'status busy'; status.textContent = 'در حال تحلیل… این کار معمولاً یک تا دو دقیقه طول می‌کشد.';
  try {
    const r = await sampleFn.json(analysisPrompt(), { signal: aiCtl.signal, modelTier: 'complex', onText: ({ text }) => { status.textContent = `در حال نوشتن تحلیل… (${faNum(text.length)} نویسه)`; } });
    applyAnalysis(r, status);
  } catch (e) {
    status.className = e && e.code === 'cancelled' ? 'status' : 'status err';
    status.textContent = aiErrorText(e);
  } finally { btn.disabled = false; $('#aiStop').hidden = true; aiCtl = null; }
}
function applyAnalysis(r, status) {
  if (!r || typeof r !== 'object' || Array.isArray(r)) throw { code: 'invalid_json' };
  S.ai = Object.assign(r, { at: new Date().toLocaleString('fa-IR') });
  S.fu.aiPicked = {};
  status.className = 'status ok'; status.textContent = 'تحلیل آماده شد. سؤالات پیشنهادی به مرحلهٔ «پیگیری» اضافه شدند.';
  touched(); renderDash();
}
function analysisPrompt() {
  return `تو مشاور ارشد استارتاپ و تحلیل‌گر مدل کسب‌وکار در بازار ایران هستی. داده‌های زیر بوم کسب‌وکاری است که یک تحلیل‌گر پر کرده. یک تحلیل صریح، مشخص و بی‌تعارف بنویس.
- انتظار از مرحلهٔ اعلام‌شده را در نظر بگیر.
- کلی‌گویی نکن؛ هر نکته باید به داده‌های همین پرونده ارجاع بدهد.
- ناسازگاری بین بلوک‌ها را دقیق پیدا کن (مثلاً مشتری با کانال، ارزش با قیمت، هزینه با درآمد).
- واقعیت‌های بازار ایران (تورم، نرخ ارز، وابستگی به پلتفرم‌ها، نقدینگی) را جایی که مرتبط است لحاظ کن.
- اگر داده برای قضاوت دربارهٔ بلوکی کافی نیست، score را 0 بگذار و در reason بگو چه داده‌ای کم است.
- همه‌چیز به فارسی.
فقط یک JSON با این ساختار برگردان:
{"verdict":"جمع‌بندی ۳ تا ۴ جمله","health":"قوی|قابل‌قبول|نیازمند کار|شکننده","strengths":[{"title":"","detail":""}],"weaknesses":[{"title":"","detail":""}],"inconsistencies":[{"blocks":["cs","ch"],"detail":""}],"risks":[{"title":"","severity":"high|medium|low","detail":""}],"scores":{"cs":{"score":3,"reason":"یک جمله"}},"actions":[{"title":"","why":"","horizon":"۳۰ روز|۹۰ روز|۶ ماه"}],"questions":["سؤال مشخص برای بنیان‌گذار"]}
حداکثر ۴ نقطهٔ قوت، ۴ نقطهٔ ضعف، ۵ ریسک، ۳ تا ۵ اقدام اولویت‌دار و ۴ تا ۸ سؤال. scores برای همهٔ این شناسه‌ها: ${BLOCKS.map(b => b.id + '=' + b.title).join('، ')}.

دادهٔ پرونده:
${caseContext()}`;
}

/* حالت دستی هوش مصنوعی (نسخهٔ لوکال): کپی پرامپت ← پاسخ Claude را بچسبانید ← اعمال */
function parseLooseJSON(text) {
  const t = String(text || '').trim();
  try { return JSON.parse(t); } catch (e) { }
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) { try { return JSON.parse(fence[1]); } catch (e) { } }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { } }
  return null;
}
const MANUAL_SUFFIX = '\n\nپاسخ را فقط به صورت یک بلوک JSON بنویس، بدون هیچ توضیح اضافه.';
function manualCopy(kind, btn) {
  if (kind === 'draft' && S.raw.trim().length < 40) { toast('اول یادداشت‌های خام بنیان‌گذار را وارد کنید', 'warn'); return; }
  if (kind === 'analysis' && !BLOCKS.some(b => blockStats(b.id).any)) { toast('بوم هنوز خالی است', 'warn'); return; }
  const p = (kind === 'draft' ? draftPrompt() : analysisPrompt()) + MANUAL_SUFFIX;
  navigator.clipboard.writeText(p).then(() => toast('پرامپت کپی شد؛ در Claude بچسبانید'), () => {
    const box = $(kind === 'draft' ? '#mDraftIn' : '#mAiIn'); box.value = p; box.focus(); box.select(); autosize(box);
    toast('کپی خودکار ممکن نشد؛ پرامپت در کادر پاسخ قرار گرفت، کپی کنید و کادر را خالی کنید', 'warn');
  });
}
function manualApply(kind) {
  const box = $(kind === 'draft' ? '#mDraftIn' : '#mAiIn');
  const status = $(kind === 'draft' ? '#mDraftStatus' : '#mAiStatus');
  const r = parseLooseJSON(box.value);
  if (!r || typeof r !== 'object') { status.className = 'status err'; status.textContent = 'در متن چسبانده‌شده JSON معتبری پیدا نشد. کل پاسخ Claude را بچسبانید.'; return; }
  try { kind === 'draft' ? applyDraft(r, status) : applyAnalysis(r, status); box.value = ''; autosize(box); }
  catch (e) { status.className = 'status err'; status.textContent = 'ساختار پاسخ با انتظار برنامه نمی‌خواند. دوباره امتحان کنید.'; }
}
const arr = v => Array.isArray(v) ? v : [];
function renderAI() {
  const a = S.ai, box = $('#aiReport');
  if (!a) { box.innerHTML = `<div class="empty">هنوز تحلیلی اجرا نشده. تحلیل هوش مصنوعی همهٔ پاسخ‌ها، نمره‌ها، اقتصاد واحد و هشدارها را می‌خواند و جمع‌بندی، ناسازگاری‌ها، ریسک‌ها و اقدامات اولویت‌دار را برمی‌گرداند.</div>`; return; }
  const sevL = { high: 'زیاد', medium: 'متوسط', low: 'کم' };
  const sc = a.scores || {};
  box.innerHTML = `
    <div class="ai-verdict"><span class="pill ${a.health === 'قوی' ? 'ok' : a.health === 'قابل‌قبول' ? 'info' : a.health === 'نیازمند کار' ? 'warn' : 'crit'}">${esc(a.health || '')}</span><p>${esc(a.verdict || '')}</p><small class="muted">زمان تحلیل: ${esc(a.at || '')}</small></div>
    <div class="two">
      <div><h4>نقاط قوت</h4>${arr(a.strengths).map(x => `<div class="pt ok"><b>${esc(x.title)}</b><p>${esc(x.detail)}</p></div>`).join('') || '<p class="muted">—</p>'}</div>
      <div><h4>نقاط ضعف</h4>${arr(a.weaknesses).map(x => `<div class="pt crit"><b>${esc(x.title)}</b><p>${esc(x.detail)}</p></div>`).join('') || '<p class="muted">—</p>'}</div>
    </div>
    ${arr(a.inconsistencies).length ? `<h4>ناسازگاری‌ها</h4>${arr(a.inconsistencies).map(x => `<div class="pt warn"><div class="wb">${arr(x.blocks).filter(id => BY_ID[id]).map(id => `<span class="btag r-${BY_ID[id].region}">${BY_ID[id].title}</span>`).join('')}</div><p>${esc(x.detail)}</p></div>`).join('')}` : ''}
    ${arr(a.risks).length ? `<h4>ریسک‌ها</h4><div class="risks">${arr(a.risks).map(x => `<div class="risk ${x.severity}"><span class="sev">${sevL[x.severity] || ''}</span><div><b>${esc(x.title)}</b><p>${esc(x.detail)}</p></div></div>`).join('')}</div>` : ''}
    ${arr(a.actions).length ? `<h4>اقدامات اولویت‌دار</h4><ol class="actions">${arr(a.actions).map(x => `<li><div><b>${esc(x.title)}</b><span class="hz">${esc(x.horizon || '')}</span></div><p>${esc(x.why)}</p></li>`).join('')}</ol>` : ''}
    <h4>مقایسهٔ نمره‌ها</h4>
    <div class="tablewrap"><table class="cmp"><thead><tr><th>بلوک</th><th>تحلیل‌گر</th><th>هوش مصنوعی</th><th>دلیل</th></tr></thead><tbody>
      ${BLOCKS.map(b => { const s = sc[b.id] || {}; const mine = S.blocks[b.id].score; const ai = Number(s.score) || 0; const gap = mine && ai && Math.abs(mine - ai) >= 2; return `<tr class="${gap ? 'gap' : ''}"><td>${b.title}</td><td class="num">${mine ? faNum(mine) : '—'}</td><td class="num">${ai ? faNum(ai) : '—'}</td><td>${esc(s.reason || '')}</td></tr>`; }).join('')}
    </tbody></table></div>`;
}

/* ===== فایل‌ها و خروجی ===== */
let downloads = null;
function setDlAvail(ok) { $$('.dl-only').forEach(el => el.disabled = !ok); $('#dlNote').hidden = ok; }
const fileBase = () => (S.meta.name || 'بوم-کسب-و-کار').replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '-');
function browserDownload(filename, data) {
  const ext = filename.split('.').pop();
  // بعضی مرورگرها نام فایل فارسی را در دانلود محلی نادیده می‌گیرند؛ نام لاتین امن می‌سازیم
  if (/[^\x20-\x7E]/.test(filename)) {
    const kind = /گزارش/.test(filename) ? 'report' : ext === 'json' ? 'case' : 'canvas';
    filename = `bmc-${kind}-${new Date().toISOString().slice(0, 10)}.${ext}`;
  }
  const mime = { json: 'application/json', html: 'text/html;charset=utf-8', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }[ext] || 'application/octet-stream';
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  toast('فایل دانلود شد');
}
async function saveFile(filename, data) {
  if (!IN_CLAUDE) { browserDownload(filename, data); return; }
  if (!downloads) { toast('ذخیرهٔ فایل در این نما در دسترس نیست', 'warn'); return; }
  try { await downloads.save({ filename, data }); toast('فایل آماده شد'); }
  catch (e) { if (e && e.code === 'declined') return; if (e && e.code === 'rate_limited') toast('یک پنجرهٔ ذخیره باز است', 'warn'); else toast('ذخیرهٔ فایل ممکن نشد', 'warn'); }
}
function exportJSON() { saveFile(fileBase() + '.json', JSON.stringify(Object.assign({}, S, { app: 'bmc-pro' }), null, 1)); }
function importJSON(file) {
  const fr = new FileReader();
  fr.onload = () => {
    try { const d = JSON.parse(fr.result); if (!d || !d.blocks || !d.meta) throw 0; S = normalize(d); S.sample = false; persist(); renderAll(); toast('پرونده باز شد'); }
    catch (e) { toast('این فایل پروندهٔ بوم نیست', 'warn'); }
  };
  fr.readAsText(file);
}
function loadXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload = () => res(window.XLSX); s.onerror = rej; document.head.appendChild(s); });
}
async function exportXLSX() {
  let X; try { X = await loadXLSX(); } catch (e) { toast('کتابخانهٔ اکسل بارگذاری نشد', 'warn'); return; }
  const wb = X.utils.book_new(); wb.Workbook = { Views: [{ RTL: true }] };
  const sheet = (rows, widths, name) => { const ws = X.utils.aoa_to_sheet(rows); ws['!cols'] = widths.map(w => ({ wch: w })); X.utils.book_append_sheet(wb, ws, name); };
  const m = S.meta, h = health(), stg = stageOf(), e = econ();
  sheet([
    ['بوم کسب‌وکار', m.name], ['بنیان‌گذار', m.founder], ['صنعت', m.industry], ['تحلیل‌گر', m.analyst], ['تاریخ', m.date], ['مرحله', stg.label], ['منبع اطلاعات', m.source],
    ['سلامت مدل (از ۱۰۰)', h.pct ?? ''], ['وضعیت', h.label], [],
    ['بلوک', 'ناحیه', 'نمره', 'شواهد', 'انتظار مرحله', 'انتخاب‌ها', 'خلاصه', 'نمرهٔ هوش مصنوعی'],
    ...BLOCKS.map(b => { const st = S.blocks[b.id]; return [b.title, REGION[b.region], st.score || '', (EVIDENCE.find(x => x.id === st.evidence) || {}).label || '', b.supp ? '' : stg.exp, st.chips.join('، '), st.summary, (S.ai && S.ai.scores && S.ai.scores[b.id] && S.ai.scores[b.id].score) || '']; })
  ], [22, 14, 8, 12, 12, 40, 50, 14], 'خلاصه');
  const rows = [['بلوک', 'سؤال', 'پاسخ', 'ابهام', 'سؤال برای بنیان‌گذار']];
  for (const b of BLOCKS) {
    const st = S.blocks[b.id];
    const ids = [...visibleQs(b, 'all').map(q => q.id), ...Object.keys(st.answers).filter(k => filled(st.answers[k]))];
    [...new Set(ids)].forEach(id => rows.push([b.title, qText(b.id, id), st.answers[id] || '', st.flags[id] ? 'بله' : '', st.notes[id] || '']));
  }
  sheet(rows, [20, 60, 70, 8, 50], 'پاسخ‌ها');
  sheet([['شاخص', 'مقدار', 'واحد'], ...ECON_FIELDS.map(f => [f.label, isFinite(e.n[f.id]) ? e.n[f.id] : '', f.unit]), [],
    ['LTV', isFinite(e.ltv) ? Math.round(e.ltv) : '', 'تومان'], ['نسبت LTV به CAC', isFinite(e.ratio) ? +e.ratio.toFixed(2) : '', 'برابر'], ['بازگشت هزینهٔ جذب', isFinite(e.payback) ? +e.payback.toFixed(1) : '', 'ماه'],
    ['نقطهٔ سربه‌سر', isFinite(e.beCust) ? Math.round(e.beCust) : '', 'مشتری فعال'], ['مصرف خالص ماهانه', isFinite(e.burn) ? Math.round(e.burn) : '', 'تومان'], ['دوام نقدینگی', e.runway === Infinity ? 'سودده' : isFinite(e.runway) ? +e.runway.toFixed(1) : '', 'ماه']], [32, 18, 14], 'اقتصاد واحد');
  sheet([['سطح', 'عنوان', 'توضیح', 'بلوک‌ها'], ...warnings().map(w => [{ crit: 'بحرانی', warn: 'هشدار', info: 'یادآوری' }[w.sev], w.title, w.detail, w.blocks.map(id => BY_ID[id].title).join('، ')])], [10, 40, 80, 30], 'هشدارها');
  const fm = followMessage(); if (fm) sheet(fm.split('\n').map(l => [l]), [110], 'سؤالات پیگیری');
  if (S.ai) {
    const a = S.ai, r = [['جمع‌بندی', a.verdict || ''], ['وضعیت', a.health || ''], []];
    arr(a.strengths).forEach(x => r.push(['قوت', x.title, x.detail]));
    arr(a.weaknesses).forEach(x => r.push(['ضعف', x.title, x.detail]));
    arr(a.inconsistencies).forEach(x => r.push(['ناسازگاری', arr(x.blocks).map(id => BY_ID[id] ? BY_ID[id].title : id).join('، '), x.detail]));
    arr(a.risks).forEach(x => r.push(['ریسک (' + ({ high: 'زیاد', medium: 'متوسط', low: 'کم' }[x.severity] || '') + ')', x.title, x.detail]));
    arr(a.actions).forEach(x => r.push(['اقدام (' + (x.horizon || '') + ')', x.title, x.why]));
    sheet(r, [18, 40, 90], 'تحلیل هوش مصنوعی');
  }
  const out = X.write(wb, { type: 'array', bookType: 'xlsx' });
  saveFile(fileBase() + '.xlsx', out);
}
function exportReport() {
  const m = S.meta, h = health(), stg = stageOf(), W = warnings(), e = econ(), a = S.ai;
  const cells = BLOCKS.filter(b => !b.supp).map(b => cellHTML(b)).join('');
  const supp = BLOCKS.filter(b => b.supp).map(b => cellHTML(b)).join('');
  const fu = followItems();
  const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>گزارش بوم کسب‌وکار ${esc(m.name)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;800&display=swap">
<style>
body{font-family:Vazirmatn,Tahoma,sans-serif;color:#18252A;margin:0;padding:28px;background:#fff;line-height:1.75;font-size:13px}
h1{margin:0;font-size:24px}h2{font-size:16px;margin:26px 0 10px;border-bottom:2px solid #18252A;padding-bottom:4px}
.meta{color:#4A5A60;margin:4px 0 18px}.score{display:inline-block;background:#18252A;color:#fff;border-radius:6px;padding:4px 12px;font-weight:800}
.bmc{display:grid;grid-template-columns:repeat(10,1fr);grid-template-areas:"cs cs cr cr vp vp ka ka kp kp" "cs cs ch ch vp vp kr kr kp kp" "rs rs rs rs rs co co co co co";gap:6px}
.supp{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}
.cell{border:1px solid #c9d1ce;border-top:4px solid #888;border-radius:6px;padding:8px 10px;min-height:90px;break-inside:avoid}
.cell.r-d{border-top-color:#1F6F78}.cell.r-f{border-top-color:#3D4E8C}.cell.r-v{border-top-color:#A8610B}.cell.r-s{border-top-color:#6B5B7B}
.ch{display:flex;justify-content:space-between;font-weight:800;margin-bottom:4px}.cell p{margin:2px 0}.muted{color:#8a979b}
.cchips span{display:inline-block;border:1px solid #c9d1ce;border-radius:20px;padding:0 7px;margin:2px;font-size:11px}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #d3dad7;padding:5px 8px;text-align:right;vertical-align:top}th{background:#eef1f0}
.w{padding:6px 10px;border-right:4px solid #999;margin:6px 0;background:#f6f7f7}.w.crit{border-color:#B23A3A}.w.warn{border-color:#B7791F}.w.info{border-color:#3D4E8C}
@media print{body{padding:0}h2{break-after:avoid}}
</style></head><body>
<h1>بوم کسب‌وکار: ${esc(m.name || 'بی‌نام')}</h1>
<div class="meta">بنیان‌گذار: ${esc(m.founder || '—')} · صنعت: ${esc(m.industry || '—')} · مرحله: ${stg.label} · تحلیل‌گر: ${esc(m.analyst || '—')} · تاریخ: ${esc(m.date || '')}</div>
<div><span class="score">سلامت مدل: ${h.pct == null ? '—' : faNum(h.pct) + ' از ۱۰۰'} · ${h.label}</span></div>
<h2>بوم</h2><div class="bmc">${cells}</div><div class="supp">${supp}</div>
<h2>نمره‌ها</h2><table><tr><th>بلوک</th><th>نمره</th><th>شواهد</th><th>انتظار مرحله</th>${a ? '<th>هوش مصنوعی</th>' : ''}</tr>
${BLOCKS.map(b => { const st = S.blocks[b.id]; return `<tr><td>${b.title}</td><td>${st.score ? faNum(st.score) : '—'}</td><td>${(EVIDENCE.find(x => x.id === st.evidence) || {}).label || '—'}</td><td>${b.supp ? '' : faNum(stg.exp, 1)}</td>${a ? `<td>${a.scores && a.scores[b.id] && a.scores[b.id].score ? faNum(a.scores[b.id].score) + ' — ' + esc(a.scores[b.id].reason || '') : '—'}</td>` : ''}</tr>`; }).join('')}</table>
<h2>اقتصاد واحد</h2><table>${ECON_FIELDS.map(f => `<tr><td>${f.label}</td><td>${faNum(e.n[f.id], 2)} ${f.unit}</td></tr>`).join('')}
<tr><th>LTV</th><th>${faNum(e.ltv)} تومان</th></tr><tr><th>LTV به CAC</th><th>${faNum(e.ratio, 1)}</th></tr><tr><th>بازگشت هزینهٔ جذب</th><th>${faNum(e.payback, 1)} ماه</th></tr><tr><th>نقطهٔ سربه‌سر</th><th>${faNum(e.beCust)} مشتری فعال</th></tr><tr><th>دوام نقدینگی</th><th>${e.runway === Infinity ? 'سودده' : faNum(e.runway, 1) + ' ماه'}</th></tr></table>
<h2>هشدارها و ناسازگاری‌ها</h2>${W.map(w => `<div class="w ${w.sev}"><b>${esc(w.title)}</b><br>${esc(w.detail)}</div>`).join('') || '<p>—</p>'}
${a ? `<h2>تحلیل هوش مصنوعی</h2><p><b>${esc(a.health || '')}:</b> ${esc(a.verdict || '')}</p>
<table><tr><th>نوع</th><th>عنوان</th><th>توضیح</th></tr>
${arr(a.strengths).map(x => `<tr><td>قوت</td><td>${esc(x.title)}</td><td>${esc(x.detail)}</td></tr>`).join('')}
${arr(a.weaknesses).map(x => `<tr><td>ضعف</td><td>${esc(x.title)}</td><td>${esc(x.detail)}</td></tr>`).join('')}
${arr(a.inconsistencies).map(x => `<tr><td>ناسازگاری</td><td>${arr(x.blocks).map(id => BY_ID[id] ? BY_ID[id].title : esc(id)).join('، ')}</td><td>${esc(x.detail)}</td></tr>`).join('')}
${arr(a.risks).map(x => `<tr><td>ریسک</td><td>${esc(x.title)}</td><td>${esc(x.detail)}</td></tr>`).join('')}
${arr(a.actions).map(x => `<tr><td>اقدام · ${esc(x.horizon || '')}</td><td>${esc(x.title)}</td><td>${esc(x.why)}</td></tr>`).join('')}</table>` : ''}
${fu.length ? `<h2>سؤالات پیگیری</h2>${fu.map(g => `<p><b>${esc(g.title)}</b></p><ul>${g.items.map(i => `<li>${esc(i.text)}</li>`).join('')}</ul>`).join('')}` : ''}
<h2>پاسخ‌های کامل</h2>${BLOCKS.map(b => { const st = S.blocks[b.id]; const ids = Object.keys(st.answers).filter(k => filled(st.answers[k])); return ids.length ? `<p><b>${b.title}</b></p><table>${ids.map(id => `<tr><td style="width:40%">${esc(qText(b.id, id))}</td><td>${esc(st.answers[id])}</td></tr>`).join('')}</table>` : ''; }).join('')}
</body></html>`;
  saveFile(fileBase() + '-گزارش.html', html);
}

/* ===== رویدادها ===== */
function renderAll() { renderBanner(); renderStepper(); renderIntake(); renderNav(); renderEditor(); renderEcon(); renderFollowups(); if (S.step === 'dash') renderDash(); }
let confirmNew = false;
document.addEventListener('click', ev => {
  const t = ev.target.closest('button, [data-goto]'); if (!t) return;
  const d = t.dataset;
  if (d.step) { goStep(d.step); return; }
  if (d.block) { S.current = d.block; if (S.step !== 'canvas') goStep('canvas'); else { renderNav(); renderEditor(); $('#editor').scrollIntoView({ behavior: 'smooth', block: 'start' }); } persist(); return; }
  if (d.goto) { S.current = d.goto; goStep('canvas'); return; }
  if (d.stage) { S.meta.stage = d.stage; touched(); renderIntake(); renderBanner(); return; }
  if (d.mode) { S.mode = d.mode; persist(); renderNav(); renderEditor(); return; }
  const b = S.blocks[S.current];
  if (d.chip != null) { const i = b.chips.indexOf(d.chip); if (i >= 0) b.chips.splice(i, 1); else b.chips.push(d.chip); t.classList.toggle('on'); t.setAttribute('aria-pressed', i < 0); touched(); refreshTile(S.current); return; }
  if (d.flag) { b.flags[d.flag] = !b.flags[d.flag]; const q = t.closest('.q'); q.classList.toggle('flagged', b.flags[d.flag]); t.textContent = b.flags[d.flag] ? 'ابهام علامت خورده' : 'علامت ابهام'; t.setAttribute('aria-pressed', b.flags[d.flag]); const n = $('.note', q); n.hidden = !b.flags[d.flag]; if (b.flags[d.flag]) n.focus(); touched(); refreshTile(S.current); return; }
  if (d.score) { const n = +d.score; b.score = b.score === n ? 0 : n; $$('#editor .sbtn').forEach(x => { x.classList.toggle('on', +x.dataset.score === b.score); x.setAttribute('aria-pressed', +x.dataset.score === b.score); }); touched(); refreshTile(S.current); return; }
  if (d.ev) { b.evidence = b.evidence === d.ev ? '' : d.ev; $$('#editor .ev').forEach(x => x.classList.toggle('on', x.dataset.ev === b.evidence)); touched(); return; }
  if (d.delcustom != null) { S.fu.custom.splice(+d.delcustom, 1); touched(); renderFollowups(); return; }
  switch (t.id) {
    case 'draftBtn': aiDraft(); break;
    case 'mDraftCopy': manualCopy('draft', t); break;
    case 'mDraftApply': manualApply('draft'); break;
    case 'mAiCopy': manualCopy('analysis', t); break;
    case 'mAiApply': manualApply('analysis'); break;
    case 'draftStop': case 'aiStop': aiCtl && aiCtl.abort(); break;
    case 'aiBtn': aiAnalyze(); break;
    case 'copyReq': copyText($('#requestMsg').value, t); break;
    case 'copyFu': copyText($('#fuMsg').value, t); break;
    case 'addCustom': S.fu.custom.push(''); renderFollowups(); setTimeout(() => { const el = $(`#cu-${S.fu.custom.length - 1}`); el && el.focus(); }); break;
    case 'saveJson': case 'saveJson2': exportJSON(); break;
    case 'openJson': $('#fileIn').click(); break;
    case 'xlsxBtn': exportXLSX(); break;
    case 'reportBtn': exportReport(); break;
    case 'newCase':
      if (!confirmNew) { confirmNew = true; t.textContent = 'همه‌چیز پاک شود؟ تأیید'; t.classList.add('danger'); setTimeout(() => { confirmNew = false; t.textContent = 'پروندهٔ جدید'; t.classList.remove('danger'); }, 4000); }
      else { confirmNew = false; t.textContent = 'پروندهٔ جدید'; t.classList.remove('danger'); S = blankState(); persist(); renderAll(); toast('پروندهٔ جدید آماده است'); }
      break;
    case 'loadSample': S = sampleState(); persist(); renderAll(); break;
  }
});
document.addEventListener('input', ev => {
  const t = ev.target, d = t.dataset;
  if (t.tagName === 'TEXTAREA') autosize(t);
  if (d.meta) { S.meta[d.meta] = t.value; touched(); if (d.meta === 'name') renderBanner(); return; }
  if (t.id === 'raw') { S.raw = t.value; touched(); return; }
  if (d.econ) { S.econ[d.econ] = t.value; touched(); renderEconOut(); return; }
  if (d.custom != null) { S.fu.custom[+d.custom] = t.value; touched(); $('#fuMsg').value = followMessage(); autosize($('#fuMsg')); return; }
  const b = S.blocks[S.current];
  if (d.ans) { b.answers[d.ans] = t.value; touched(); clearTimeout(t._r); t._r = setTimeout(() => refreshTile(S.current), 400); return; }
  if (d.note) { b.notes[d.note] = t.value; touched(); return; }
  if (d.sum != null) { b.summary = t.value; touched(); return; }
});
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.id === 'stageMini') { S.meta.stage = t.value; touched(); renderBanner(); renderNav(); renderEditor(); return; }
  if (t.id === 'fuEmpty') { S.fu.includeEmpty = t.checked; persist(); renderFollowups(); return; }
  if (t.dataset.aiq != null) { S.fu.aiPicked[+t.dataset.aiq] = t.checked; persist(); $('#fuMsg').value = followMessage(); autosize($('#fuMsg')); return; }
  if (t.id === 'fileIn' && t.files[0]) { importJSON(t.files[0]); t.value = ''; return; }
});
document.addEventListener('focusout', ev => { const t = ev.target; if (t.dataset && t.dataset.econ) t.value = fmtInput(t.value); });
document.addEventListener('focusin', ev => { const t = ev.target; if (t.dataset && t.dataset.econ) { const n = parseNum(t.value); if (isFinite(n)) t.value = String(n); } });

loadInitial();
renderAll();
initCaps();
