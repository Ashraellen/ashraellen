from pathlib import Path
from bs4 import BeautifulSoup
import json
import subprocess

LANGS = ["en", "pl", "be", "uk", "de", "fr", "es", "pt"]
TITLES = {
    "en": ("Radiance", "Sampo", "Song"),
    "pl": ("Blask", "Sampo", "Pieśń"),
    "be": ("Ззянне", "САМПО", "Песня"),
    "uk": ("Сяйво", "САМПО", "Пісня"),
    "de": ("Glanz", "Sampo", "Lied"),
    "fr": ("Éclat", "Sampo", "Chant"),
    "es": ("Resplandor", "Sampo", "Canto"),
    "pt": ("Esplendor", "Sampo", "Canto"),
}
ROUTES = [("radiance", 0), ("radiance/sampo", 569), ("radiance/song", 351)]

total = 0
for lang in LANGS:
    for route, expected_paragraphs in ROUTES:
        path = Path(f"{lang}/books/{route}/index.html")
        text = path.read_text(encoding="utf-8")
        soup = BeautifulSoup(text, "html.parser")
        page = "radiance" if route == "radiance" else route.rsplit("/", 1)[1]
        title = {
            "radiance": TITLES[lang][0],
            "sampo": TITLES[lang][1],
            "song": TITLES[lang][2],
        }[page]
        assert soup.html.get("lang") == lang, path
        assert soup.h1 and soup.h1.get_text(" ", strip=True) == title, path
        assert soup.title and title in soup.title.get_text(" ", strip=True), path
        canonical = f"https://www.ashraellen.com/{lang}/books/{route}/"
        assert soup.find("link", rel="canonical").get("href") == canonical, path
        assert not any(token in text for token in ("window.__BASE__", "innerHTML", "textContent", "fetch(")), path
        if expected_paragraphs:
            details = soup.find("details")
            paragraphs = details.find_all("p") if details else []
            assert len(paragraphs) == expected_paragraphs, (path, len(paragraphs), expected_paragraphs)
            assert [p.get("data-p") for p in paragraphs] == [str(i) for i in range(1, expected_paragraphs + 1)], path
            total += expected_paragraphs
        scripts = soup.find_all("script", attrs={"type": "application/ld+json"})
        assert len(scripts) == 1, path
        types = {item.get("@type") for item in json.loads(scripts[0].string or "{}").get("@graph", [])}
        required = {"Person", "WebSite", "CollectionPage", "BreadcrumbList", "ImageObject", "BookSeries" if page == "radiance" else "Book"}
        assert required.issubset(types), (path, types)
        visible = soup.body.get_text(" ", strip=True)
        assert TITLES[lang][1] in visible, path
        if lang in ("be", "uk"):
            assert "Sampo" not in visible, path

assert total == 7360, total
sources = {
    "ru/books/radiance/index.html": "8d871ad4f8e5f19bba9f0be3bac20a86dd5184e1",
    "ru/books/radiance/sampo/index.html": "009ca28cfb6d45ee766035c3f0bb1bc418d8b1dc",
    "ru/books/radiance/song/index.html": "63ec0d3aedc8b716ecbd284bffe9b6cc6ebbc8fc",
}
for source, expected_sha in sources.items():
    actual = subprocess.check_output(["git", "hash-object", source], text=True).strip()
    assert actual == expected_sha, (source, actual)

print(json.dumps({"status": "PASS", "pages": 24, "protected_paragraphs": total}, ensure_ascii=False))
