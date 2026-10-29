(() => {
    const content = document.querySelector("#article-content");
    const toc = document.querySelector("#auto-toc");

    if (!content || !toc) return;

    let targetList = toc;
    const parentItem = toc.parentElement;

    if (
        parentItem?.matches("li") &&
        parentItem.parentElement?.matches("ul")
    ) {
        targetList = parentItem.parentElement;
        toc.remove();
    }

    const usedIds = new Set(
        [...document.querySelectorAll("[id]")]
            .map(element => element.id)
            .filter(Boolean)
    );

    const buildToc = () => {
        // 이전 TOC 내용 제거 (갱신 대응)
        targetList.textContent = "";

        const stack = [];

        content.querySelectorAll("h1, h2, h3, h4, h5, h6")
            .forEach((heading, index) => {
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

                const level = Number(heading.tagName.substring(1));
                const li = document.createElement("li");
                const link = document.createElement("a");

                link.href = `#${heading.id}`;
                link.textContent = heading.textContent.trim();

                li.appendChild(link);

                while (
                    stack.length > 0 &&
                    stack[stack.length - 1].level >= level
                ) {
                    stack.pop();
                }

                if (stack.length === 0) {
                    targetList.appendChild(li);
                } else {
                    const parentLi = stack[stack.length - 1].li;
                    let childList = parentLi.querySelector(":scope > ul");

                    if (!childList) {
                        childList = document.createElement("ul");
                        parentLi.appendChild(childList);
                    }

                    childList.appendChild(li);
                }

                stack.push({ level, li });
            });
    };

    buildToc();

    // 검색 결과 등 JS가 나중에 만든 헤딩 반영용
    // toc:refresh 이벤트를 document에 발생시키면 TOC를 다시 만든다
    document.addEventListener("toc:refresh", buildToc);
})();
