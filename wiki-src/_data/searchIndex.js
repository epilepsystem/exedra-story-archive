// 빌드 시점에 page.json + 페이지 본문을 읽어 검색 인덱스를 만든다.
// url은 사이트 루트-relative (search.html이 루트에 있으므로 상대경로가 배포 prefix와도 호환됨)

const fs = require("fs");
const path = require("path");

const PAGE_DIR = path.join(__dirname, "..", "page");

function findPageFile(id) {
  const candidates = [
    path.join(PAGE_DIR, "stories", id + ".html"),
    path.join(PAGE_DIR, id + ".html"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = (() => {
  const pageData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "page.json"), "utf8")
  );

  const entries = [];

  for (const [id, meta] of Object.entries(pageData)) {
    const file = findPageFile(id);

    let url = null;
    if (file) {
      const isStory = path.dirname(file) === path.join(PAGE_DIR, "stories");
      url = (isStory ? "main-story/" : "page/") + id + ".html";
    }

    entries.push({
      id,
      url,
      title: meta.title || id,
      characters: Array.isArray(meta.characters)
        ? meta.characters
        : Array.isArray(meta.character)
          ? meta.character
          : [],
      categories: Array.isArray(meta.categories)
        ? meta.categories
        : meta.categories
          ? [meta.categories]
          : [],
      text: file ? stripTags(fs.readFileSync(file, "utf8")) : "",
    });
  }

  return { entries };
})();
