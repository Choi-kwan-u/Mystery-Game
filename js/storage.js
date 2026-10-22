// localStorage 래퍼. 저장이 막혀도(시크릿 모드 등) 메모리 값으로 계속 동작한다.
const Store = (() => {
  const KEY = 'pd:v4';
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
      // v1~v3 → v4: 문항 개편(2026-10-20, 2026-10-22)으로 예전 답 번호가 안 맞아 사건 기록은 버리고, 연속 기록·등급 수는 살린다
      for (const old of ['pd:v3', 'pd:v2', 'pd:v1']) {
        try {
          const prev = JSON.parse(localStorage.getItem(old));
          if (prev && typeof prev === 'object') { prev.cases = {}; prev.partial = {}; data = prev; break; }
        } catch (e) { /* 다음 후보 */ }
      }
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
