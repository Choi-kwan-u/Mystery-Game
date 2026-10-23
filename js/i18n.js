// UI 문구 사전. 화면에 보이는 문구는 전부 여기서 나온다.
const I18N = {
  ko: {
    'site.name': '오늘의 사진 추리',
    'nav.today': '오늘의 사건',
    'nav.archive': '지난 사건',
    'nav.how': '플레이 방법',
    'nav.about': '소개',
    'nav.privacy': '개인정보',
    'footer.text': '사진 속 인물은 모두 AI로 생성한 가상 인물입니다.',

    'game.loading': '사건 파일을 여는 중…',
    'game.caseNo': '사건 #{n} · {date}',
    'game.notReleased': '아직 공개되지 않은 사건입니다.',
    'game.notFound': '존재하지 않는 사건입니다.',
    'game.noCase': '아직 공개된 사건이 없습니다.',
    'game.loadError': '사건을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
    'game.backToday': '오늘의 사건으로',
    'game.photoAlt': '사건 사진: {title}',
    'game.statement': '진술',

    'viewer.hint': '휠·핀치로 확대, 끌어서 이동 · 사진을 탭하면 전체 화면',
    'viewer.zoomIn': '확대',
    'viewer.zoomOut': '축소',
    'viewer.reset': '원래 크기',
    'viewer.full': '전체 화면 전환',

    'q.heading': '추리',
    'q.lockNote': '답을 고르면 바로 잠겨요. 맞았는지는 다섯 문제를 다 푼 뒤에 한꺼번에 알려 드려요.',

    'result.heading': '결과',
    'result.right': '✔ 정답',
    'result.wrong': '✘ 오답 · 정답: {a}',
    'result.score': '정답 {s} / {m}',
    'result.tapHint': '🔍 사진 위 동그라미를 누르면 각 단서를 자세히 볼 수 있어요.',
    'result.detective': '탐정의 추리',

    'grade.sherlock': '셜록',
    'grade.detective': '명탐정',
    'grade.inspector': '형사',
    'grade.rookie': '견습생',

    'share.button': '결과 공유하기',
    'share.copied': '클립보드에 복사했어요!',
    'share.failed': '복사하지 못했어요. 직접 선택해 복사해 주세요.',
    'share.head': '🔎 오늘의 사진 추리 #{n}',
    'share.streak': '연속 {n}일',

    'next.label': '다음 사건까지',
    'next.ready': '새 사건이 공개됐어요 — 열어 보기',
    'next.button': '다음 사건 풀기 →',
    'next.more': '기다리기 아깝다면 지난 사건 풀어 보기 →',
    'donate.button': '☕ 후원하기',

    'replay.button': '다시 풀기',
    'replay.note': '다시 풀기 결과는 기록에 남지 않습니다.',

    'archive.title': '지난 사건',
    'archive.intro': '공개된 사건을 다시 풀어볼 수 있습니다. 다시 푼 결과는 연속 기록에 반영되지 않습니다.',
    'archive.empty': '아직 공개된 사건이 없습니다.',
    'archive.unsolved': '미해결',
    'archive.today': '오늘',

    'how.title': '플레이 방법',
    'how.body': '<ol><li><b>관찰</b> — 휠이나 두 손가락으로 사진을 확대하고, 끌어서 구석구석 살펴보세요. 사진을 탭하면 전체 화면으로 볼 수 있습니다.</li><li><b>추리</b> — 질문은 다섯 개, 한 번에 하나씩 열립니다. 답을 고르면 바로 잠기고 다음 질문이 나옵니다. 맞았는지는 다섯 문제를 다 푼 뒤에 한꺼번에 알려 줍니다. 무엇을 묻는지는 사건마다 다릅니다. 그 사람의 직업일 수도, 방금 일어난 일일 수도, 진술 속 거짓말일 수도 있습니다. 정답은 모두 사진 속 어딘가에 근거가 있습니다.</li><li><b>결과</b> — 다섯 문제를 다 풀면 문제별 정답과 점수, 등급이 나오고, 사진 위에 단서가 표시되며, 탐정의 추리가 나옵니다.</li></ol><h2>점수와 등급</h2><p>다섯 문제 중 맞힌 개수가 점수입니다.</p><ul><li>5개 — <b>셜록</b></li><li>4개 — <b>명탐정</b></li><li>2~3개 — <b>형사</b></li><li>0~1개 — <b>견습생</b></li></ul><p>새 사건은 매일 자정(내 기기 시간 기준)에 공개됩니다. 매일 풀면 연속 기록이 쌓입니다.</p>',
    'stats.title': '내 기록',
    'stats.played': '푼 사건',
    'stats.streak': '현재 연속',
    'stats.best': '최고 연속',
    'stats.dist': '등급 분포',

    'about.title': '소개',
    'about.body': '<p><b>오늘의 사진 추리</b>는 하루에 사진 한 장으로 즐기는 추리 게임입니다. 사진 속 인물이 누구인지, 무엇을 하다 왔고 어디로 가는지 — 사진 구석구석에 숨은 단서로 추리해 보세요.</p><p>전 세계 모든 플레이어가 같은 날 같은 사건을 풉니다. 결과는 정답이 드러나지 않는 이모지 카드로 친구와 공유할 수 있습니다.</p><p>사진 속 인물은 모두 AI로 생성한 가상의 인물이며, 실제 인물이나 유명인과는 관계가 없습니다.</p><h2 id="donate">후원</h2><p>이 게임은 혼자 만들고 있습니다. 재밌게 하셨다면 커피 한 잔으로 응원해 주세요 — 후원 창구는 준비 중이에요.</p>',

    'privacy.title': '개인정보 처리방침',
    'privacy.body': '<p>이 사이트는 서버에 어떤 개인정보도 보내거나 저장하지 않습니다. 회원가입, 쿠키, 방문 분석 도구를 사용하지 않습니다.</p><h2>기기에 저장되는 정보</h2><p>푼 사건의 선택, 핀 위치, 점수, 연속 기록, 선택한 언어는 브라우저의 localStorage에만 저장됩니다. 이 정보는 내 기기 밖으로 나가지 않으며, 브라우저의 사이트 데이터를 지우면 함께 삭제됩니다.</p><h2>외부 서비스</h2><p>글꼴은 Google Fonts에서 불러옵니다. 이 과정에서 Google이 접속 IP 등 일반적인 요청 정보를 받을 수 있습니다. 사이트는 GitHub Pages에서 제공됩니다.</p>'
  },

  en: {
    'site.name': 'Daily Photo Deduction',
    'nav.today': "Today's Case",
    'nav.archive': 'Archive',
    'nav.how': 'How to Play',
    'nav.about': 'About',
    'nav.privacy': 'Privacy',
    'footer.text': 'Everyone pictured is a fictional, AI-generated person.',

    'game.loading': 'Opening the case file…',
    'game.caseNo': 'Case #{n} · {date}',
    'game.notReleased': "This case hasn't been released yet.",
    'game.notFound': "That case doesn't exist.",
    'game.noCase': 'No cases have been released yet.',
    'game.loadError': "Couldn't load the case. Please try again in a moment.",
    'game.backToday': "Go to today's case",
    'game.photoAlt': 'Case photo: {title}',
    'game.statement': 'The statement',

    'viewer.hint': 'Scroll or pinch to zoom, drag to pan · tap the photo for full screen',
    'viewer.zoomIn': 'Zoom in',
    'viewer.zoomOut': 'Zoom out',
    'viewer.reset': 'Reset zoom',
    'viewer.full': 'Toggle full screen',

    'q.heading': 'Your deduction',
    'q.lockNote': 'Each answer locks in the moment you pick it. You\'ll find out which ones you got right after the fifth question.',

    'result.heading': 'Verdict',
    'result.right': '✔ Correct',
    'result.wrong': '✘ Wrong · Answer: {a}',
    'result.score': '{s} / {m} correct',
    'result.tapHint': '🔍 Tap any circle on the photo to see each clue up close.',
    'result.detective': "The Detective's Reasoning",

    'grade.sherlock': 'Sherlock',
    'grade.detective': 'Detective',
    'grade.inspector': 'Inspector',
    'grade.rookie': 'Rookie',

    'share.button': 'Share result',
    'share.copied': 'Copied to clipboard!',
    'share.failed': "Couldn't copy. Please select and copy it manually.",
    'share.head': '🔎 Daily Photo Deduction #{n}',
    'share.streak': '{n}-day streak',

    'next.label': 'Next case in',
    'next.ready': 'A new case is out — open it',
    'next.button': 'Next case →',
    'next.more': 'Can\'t wait? Try a past case →',
    'donate.button': '☕ Support',

    'replay.button': 'Play again',
    'replay.note': "Replays aren't saved to your stats.",

    'archive.title': 'Archive',
    'archive.intro': "Replay any released case. Replays don't count toward your streak.",
    'archive.empty': 'No cases have been released yet.',
    'archive.unsolved': 'Unsolved',
    'archive.today': 'Today',

    'how.title': 'How to Play',
    'how.body': '<ol><li><b>Observe</b> — Zoom in with your scroll wheel or two fingers and drag to inspect every corner. Tap the photo to see it full screen.</li><li><b>Deduce</b> — There are five questions, and they open one at a time. Each answer locks in as soon as you pick it, and you won\'t find out whether it was right until all five are done. Each case asks something different — who someone is, what just happened, or which statement is a lie. Every answer is backed by something in the photo.</li><li><b>Verdict</b> — After the fifth answer you see the right answers, your score and rank, the clues light up on the photo, and you get the detective\'s reasoning.</li></ol><h2>Scoring and ranks</h2><p>Your score is how many of the five questions you got right.</p><ul><li>5 — <b>Sherlock</b></li><li>4 — <b>Detective</b></li><li>2–3 — <b>Inspector</b></li><li>0–1 — <b>Rookie</b></li></ul><p>A new case unlocks every day at midnight, your local time. Solve one every day to build a streak.</p>',
    'stats.title': 'My Stats',
    'stats.played': 'Solved',
    'stats.streak': 'Current streak',
    'stats.best': 'Best streak',
    'stats.dist': 'Ranks',

    'about.title': 'About',
    'about.body': '<p><b>Daily Photo Deduction</b> is a one-photo-a-day mystery game. Work out who the person in the picture is, where they\'ve been and where they\'re going — from the clues hidden all over the photo.</p><p>Everyone in the world gets the same case on the same day. Share your result as a spoiler-free emoji card.</p><p>Everyone pictured is a fictional person generated by AI and has no connection to any real person or celebrity.</p><h2 id="donate">Support</h2><p>This game is made by one person. If you enjoyed it, buy the developer a coffee — the donation link is coming soon.</p>',

    'privacy.title': 'Privacy Policy',
    'privacy.body': '<p>This site does not send or store any personal information on a server. There are no accounts, cookies, or analytics.</p><h2>What stays on your device</h2><p>Your answers, pin positions, scores, streaks, and language choice are saved only in your browser\'s localStorage. They never leave your device and are deleted when you clear the site\'s data.</p><h2>Third-party services</h2><p>Fonts are loaded from Google Fonts, so Google may receive standard request information such as your IP address. The site is hosted on GitHub Pages.</p>'
  }
};

const LANG = document.documentElement.lang === 'ko' ? 'ko' : 'en';

// 현재 언어 → en → ko 순으로 대체
function pick(obj) {
  if (obj == null || typeof obj !== 'object') return obj == null ? '' : String(obj);
  return obj[LANG] ?? obj.en ?? obj.ko ?? '';
}

function t(key, vars) {
  let s = I18N[LANG][key] ?? I18N.en[key] ?? I18N.ko[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}

function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach(n => { n.innerHTML = t(n.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-aria]').forEach(n => {
    n.setAttribute('aria-label', t(n.dataset.i18nAria));
    n.title = t(n.dataset.i18nAria);
  });
}
