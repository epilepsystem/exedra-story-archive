// 검색 결과 페이지 렌더러
// search.njk가 window.SEARCH_INDEX 로 빌드 시점 인덱스를 인라인 임베드한다.
// 그룹 순서: 등장인물 → 카테고리 → 포함(내용)
(() => {
  try {
    const INDEX = window.SEARCH_INDEX;
    const data = INDEX && Array.isArray(INDEX.entries) ? INDEX.entries : [];

    const container = document.querySelector("#search-results");
    if (!container) {
      document.body.insertAdjacentHTML("beforeend", "<div id='search-results'></div>");
    }
    const c = document.querySelector("#search-results");

    const debug = document.createElement("div");
    debug.id = "search-debug";
    debug.style = "font-size:12px;color:#666;margin:8px 0;border:1px solid #ccc;padding:4px;background:#f9f9f9";
    c.parentNode.insertBefore(debug, c);

    const query = (new URLSearchParams(window.location.search).get("q") || "")
      .trim();

    // 하이라이트: 텍스트 노드로 조립하므로 이스케이프 문제가 없다
    const highlightedText = (text, q) => {
      const fragment = document.createDocumentFragment();
      if (!q) {
        fragment.appendChild(document.createTextNode(text));
        return fragment;
      }

      const lower = text.toLowerCase();
      const needle = q.toLowerCase();
      let cursor = 0;

      while (true) {
        const at = lower.indexOf(needle, cursor);
        if (at === -1) break;

        if (at > cursor) {
          fragment.appendChild(document.createTextNode(text.slice(cursor, at)));
        }

        const mark = document.createElement("strong");
        mark.className = "search-hit";
        mark.textContent = text.slice(at, at + needle.length);
        fragment.appendChild(mark);

        cursor = at + needle.length;
      }

      if (cursor < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(cursor)));
      }

      return fragment;
    };

    const matches = (value, q) => value.toLowerCase().includes(q.toLowerCase());

    // 링크 가능 항목 / 링크 없는 항목(page.json에 파일이 없는 ID)
    const itemLabel = (entry) =>
      (entry.title || entry.id) + (entry.subtitle ? ` — ${entry.subtitle}` : "");

    const storyLink = (entry, q) => {
      const li = document.createElement("li");

      if (entry.url) {
        const link = document.createElement("a");
        link.href = entry.url;
        link.appendChild(highlightedText(itemLabel(entry), q));
        li.appendChild(link);
      } else {
        li.classList.add("no-page");
        li.appendChild(highlightedText(itemLabel(entry) + " (준비 중)", q));
      }

      return li;
    };

    // 본문 스니펫 (매칭 위치 앞뒤 약 60자)
    const snippet = (entry, q) => {
      const text = entry.text || "";
      const at = text.toLowerCase().indexOf(q.toLowerCase());
      if (at === -1) return null;

      const start = Math.max(0, at - 60);
      const end = Math.min(text.length, at + q.length + 60);
      const piece =
        (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");

      const span = document.createElement("span");
      span.className = "search-snippet";
      span.appendChild(highlightedText(piece, q));
      return span;
    };

    const renderGroup = (heading, blocks) => {
      const section = document.createElement("section");
      section.className = "search-group";

      const h3 = document.createElement("h3");
      h3.appendChild(highlightedText(heading, query));
      section.appendChild(h3);

      for (const block of blocks) {
        section.appendChild(block);
      }

      return section;
    };

    const characterBlocks = (characters, q) => {
      const blocks = [];

      for (const entry of data) {
        const hit = entry.characters.filter((name) => matches(name, q));
        if (!hit.length) continue;

        const nameLine = document.createElement("div");
        nameLine.className = "search-character";
        nameLine.appendChild(highlightedText(hit.join(", "), q));
        blocks.push(nameLine);

        const list = document.createElement("ul");
        list.className = "search-list";
        list.appendChild(storyLink(entry, q));
        blocks.push(list);
      }

      return blocks;
    };

    const categoryBlocks = (categories, q) => {
      const blocks = [];

      for (const entry of data) {
        const hit = entry.categories.filter((name) => matches(name, q));
        if (!hit.length) continue;

        const nameLine = document.createElement("div");
        nameLine.className = "search-category";
        nameLine.appendChild(highlightedText(hit.join(", "), q));
        blocks.push(nameLine);

        const list = document.createElement("ul");
        list.className = "search-list";
        list.appendChild(storyLink(entry, q));
        blocks.push(list);
      }

      return blocks;
    };

    const textBlocks = (q) => {
      const blocks = [];
      const list = document.createElement("ul");
      list.className = "search-list";
      let count = 0;

      for (const entry of data) {
        const inTitle = matches(itemLabel(entry), q);
        const inText = (entry.text || "").toLowerCase().includes(q.toLowerCase());
        if (!inTitle && !inText) continue;

        const li = storyLink(entry, q);
        const piece = snippet(entry, q);
        if (piece) li.appendChild(piece);
        list.appendChild(li);
        count += 1;
      }

      if (count) blocks.push(list);
      return { blocks, count };
    };

    const render = () => {
      c.textContent = "";

      debug.textContent = `debug: INDEX=${!!INDEX}, entries=${data ? data.length : 0}, query="${query}", url=${location.href}`;

      if (!query) {
        c.textContent = "검색어를 입력하세요.";
        return;
      }

      const characters = characterBlocks(data, query);
      const categories = categoryBlocks(data, query);
      const { blocks: texts, count: textCount } = textBlocks(query);

      debug.textContent += ` | chars=${characters.length}, cats=${categories.length}, texts=${textCount}`;

      if (!characters.length && !categories.length && !textCount) {
        c.textContent = `'${query}' 에 대한 검색 결과가 없습니다.`;
        return;
      }

      c.appendChild(renderGroup("등장인물", characters));
      c.appendChild(renderGroup("카테고리", categories));
      c.appendChild(renderGroup("포함된 내용", texts));

      document.dispatchEvent(new Event("toc:refresh"));
    };

    // 검색 폼에 현재 검색어 유지
    const input = document.querySelector(".search-form input[name='q']");
    if (input && query) input.value = query;

    render();
  } catch (e) {
    const c = document.querySelector("#search-results") || document.body;
    if (c) c.textContent = "검색 중 치명적 오류: " + e.message;
    const d = document.createElement("div");
    d.style = "color:red;background:#ffe6e6;border:2px solid red;padding:8px";
    d.textContent = "FATAL: " + e.message + "\n" + (e.stack || "");
    document.body.appendChild(d);
    console.error("search-results.js fatal error:", e);
  }
})();
