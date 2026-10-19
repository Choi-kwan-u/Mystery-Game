// 번역 키 누락·언어 섞임·사건 데이터 검사. 실행: node scripts/check-i18n.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const HANGUL = /[가-힣]/;
const errors = [];

const ctx = { document: { documentElement: { lang: 'ko' } } };
vm.runInNewContext(read('js/i18n.js') + '\nthis.I18N = I18N;', ctx);
const { ko, en } = ctx.I18N;

for (const k of Object.keys(ko)) if (!(k in en)) errors.push(`en 누락: ${k}`);
for (const k of Object.keys(en)) if (!(k in ko)) errors.push(`ko 누락: ${k}`);
for (const [k, v] of Object.entries(ko)) {
  if (!v.trim()) errors.push(`ko 빈 값: ${k}`);
  else if (!HANGUL.test(v)) errors.push(`ko 값에 한글 없음(번역 안 됨?): ${k}`);
}
for (const [k, v] of Object.entries(en)) {
  if (!v.trim()) errors.push(`en 빈 값: ${k}`);
  else if (HANGUL.test(v)) errors.push(`en 값에 한글 섞임: ${k}`);
}

// HTML에서 쓰는 키
for (const lang of ['ko', 'en']) {
  for (const f of fs.readdirSync(path.join(root, lang)).filter(f => f.endsWith('.html'))) {
    const html = read(`${lang}/${f}`);
    if (!html.includes(`<html lang="${lang}">`)) errors.push(`${lang}/${f}: html lang 불일치`);
    for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) {
      if (!(m[1] in ko)) errors.push(`${lang}/${f}: 없는 키 ${m[1]}`);
    }
    // 언어 전환 링크 외에 본문에 하드코딩된 한글이 있으면 경고
    const body = html.split('<body')[1].replace(/<span class="lang">.*?<\/span>/s, '');
    if (HANGUL.test(body)) errors.push(`${lang}/${f}: body에 하드코딩 한글`);
  }
}

// app.js에서 쓰는 키 (동적 키 grade.* 포함)
const app = read('js/app.js');
const used = [...app.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
used.push(...['sherlock', 'detective', 'inspector', 'rookie'].map(g => 'grade.' + g));
for (const k of used) if (!(k in ko)) errors.push(`app.js: 없는 키 ${k}`);
const stripped = app.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
if (HANGUL.test(stripped)) errors.push('app.js: 주석 밖에 하드코딩 한글');

// 사건 데이터
function texts(o, where, out = []) {
  if (o && typeof o === 'object') {
    if ('ko' in o || 'en' in o) out.push([o, where]);
    else for (const [k, v] of Object.entries(o)) texts(v, `${where}.${k}`, out);
  }
  return out;
}
const list = JSON.parse(read('cases/cases.json'));
for (const e of list) {
  const c = JSON.parse(read(e.file));
  const tag = e.file;
  if (c.id !== e.id || c.date !== e.date) errors.push(`${tag}: cases.json과 id/date 불일치`);
  if (!fs.existsSync(path.join(root, c.image))) errors.push(`${tag}: 이미지 없음 ${c.image}`);
  for (const [o, where] of texts(c, tag)) {
    if (!o.ko || !o.ko.trim()) errors.push(`${where}: ko 없음`);
    if (!o.en || !o.en.trim()) errors.push(`${where}: en 없음`);
    else if (HANGUL.test(o.en)) errors.push(`${where}: en에 한글 섞임`);
  }
  if (c.questions.length !== 3) errors.push(`${tag}: 질문은 3개여야 함`);
  if (c.questions[0].key !== 'job') errors.push(`${tag}: 첫 질문은 job`);
  if (c.clues.length < 4 || c.clues.length > 6) errors.push(`${tag}: 단서는 4~6개`);
  const ids = new Set(c.clues.map(k => k.id));
  for (const q of c.questions) {
    if (!(q.answer >= 0 && q.answer < q.options.length)) errors.push(`${tag}/${q.key}: answer 범위 밖`);
    if (!q.evidence.length || q.evidence.length > 3) errors.push(`${tag}/${q.key}: evidence는 1~3개`);
    for (const id of q.evidence) if (!ids.has(id)) errors.push(`${tag}/${q.key}: 없는 단서 ${id}`);
  }
  for (const k of c.clues) {
    if (![k.x, k.y, k.r].every(v => typeof v === 'number' && v >= 0 && v <= 100)) errors.push(`${tag}/${k.id}: 좌표는 0~100 %`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n✘ ${errors.length}개 문제`);
  process.exit(1);
}
console.log(`✔ 키 ${Object.keys(ko).length}개, HTML ${2 * 5}개, 사건 ${list.length}개 — 문제 없음`);
