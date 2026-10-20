// localStorage 래퍼. 저장이 막혀도(시크릿 모드 등) 메모리 값으로 계속 동작한다.
const Store = (() => {
  const KEY = 'pd:v2';
  let data = null;

  function fresh() {
    return {
      cases: {},     // id -> { sel, correct, score, max, grade, at }
      partial: {},   // id -> 제출 전까지 고른 답 (한 문제씩 잠김)
      streak: 0,
      best: 0,
      last: null,    // 마지막으로 '오늘의 사건'을 푼 현지 날짜 YYYY-MM-DD
      grades: { sherlock: 0, detective: 0, inspector: 0, rookie: 0 },
      lang: null
    };
  }

  function get() {
    if (data) return data;
    try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) { data = null; }
    if (!data) {
      // v1 → v2: 7번 이후 사건 번호가 바뀌어 그 기록은 버리고, 1~6번 기록·연속 기록은 살린다
      try {
        const v1 = JSON.parse(localStorage.getItem('pd:v1'));
        if (v1 && v1.cases) {
          Object.keys(v1.cases).forEach(id => { if (+id >= 7) delete v1.cases[id]; });
          v1.partial = {};
          data = v1;
        }
      } catch (e) { data = null; }
    }
    if (!data || typeof data !== 'object') data = fresh();
    data = Object.assign(fresh(), data);
    return data;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(get())); } catch (e) { /* 기록만 안 남음 */ }
  }

  return { get, save };
})();
