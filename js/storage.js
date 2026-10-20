// localStorage 래퍼. 저장이 막혀도(시크릿 모드 등) 메모리 값으로 계속 동작한다.
const Store = (() => {
  const KEY = 'pd:v1';
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
    if (!data || typeof data !== 'object') data = fresh();
    data = Object.assign(fresh(), data);
    return data;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(get())); } catch (e) { /* 기록만 안 남음 */ }
  }

  return { get, save };
})();
