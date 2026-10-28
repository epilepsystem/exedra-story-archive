
(() => {
    const content = document.querySelector("#article-content");
    const toc = document.querySelector("#auto-toc");

    if (!content || !toc) return;

    // 목차가 다른 li 안에 중첩되어 있다면
    // 그 li의 상위 ul에 항목을 추가합니다.
    let targetList = toc;

    const parentItem = toc.parentElement;

    if (
        parentItem?.matches("li") &&
        parentItem.parentElement?.matches("ul")
    ) {
        targetList = parentItem.parentElement;
        toc.remove();
    }

    const headings = content.querySelectorAll("h3");

    // 문서에서 이미 사용 중인 id를 수집합니다.
    const usedIds = new Set(
        [...document.querySelectorAll("[id]")]
            .map(element => element.id)
            .filter(Boolean)
    );

    headings.forEach((heading, index) => {
        // 제목에 id가 없으면 자동으로 생성합니다.
        if (!heading.id) {
            const base = heading.textContent
                .trim()
                .toLowerCase()
                .replace(/[^\p{L}\p{N}]+/gu, "-")
                .replace(/^-|-$/g, "") || `section-${index + 1}`;

            let id = base;
            let suffix = 2;

            while (usedIds.has(id)) {
                id = `${base}-${suffix++}`;
            }

            heading.id = id;
            usedIds.add(id);
        }

        // h3마다 li와 링크를 생성합니다.
        const li = document.createElement("li");
        const link = document.createElement("a");

        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.trim();

        li.appendChild(link);
        targetList.appendChild(li);
    });
})();
