#!/usr/bin/env python3
"""سرهم‌کردن src/ در دو خروجی:
- index.html  : نسخهٔ مستقل برای اجرای لوکال یا GitHub Pages
- artifact.html : بدنهٔ صفحه برای انتشار به‌عنوان Artifact در Claude
"""
from pathlib import Path

root = Path(__file__).parent
page = (root / "src/page.html").read_text(encoding="utf-8")
js = (root / "src/data.js").read_text(encoding="utf-8") + "\n" + (root / "src/app.js").read_text(encoding="utf-8")
body = f"{page}\n<script>\n{js}\n</script>\n"

(root / "artifact.html").write_text(body, encoding="utf-8")
(root / "index.html").write_text(
    '<!doctype html>\n<html lang="fa" dir="rtl">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    "</head>\n<body>\n" + body + "</body>\n</html>\n",
    encoding="utf-8",
)
print("built index.html and artifact.html")
