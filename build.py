#!/usr/bin/env python3
"""سرهم‌کردن src/ در دو خروجی:
- index.html  : نسخهٔ مستقل برای اجرای لوکال یا GitHub Pages
- artifact.html : بدنهٔ صفحه برای انتشار به‌عنوان Artifact در Claude

با آرگومان اختیاری مسیر یک فایل پرونده (.json)، نسخهٔ Artifact با همان پرونده
از پیش بارگذاری می‌شود و در مسیر دوم (یا case-artifact.html) ذخیره می‌شود:
    python3 build.py case.json out.html
"""
import sys
from pathlib import Path

root = Path(__file__).parent
page = (root / "src/page.html").read_text(encoding="utf-8")
js = (root / "src/data.js").read_text(encoding="utf-8") + "\n" + (root / "src/app.js").read_text(encoding="utf-8")

if len(sys.argv) > 1:
    seed = Path(sys.argv[1]).read_text(encoding="utf-8").replace("</", "<\\/")
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else root / "case-artifact.html"
    out.write_text(f"{page}\n<script>\nwindow.BMC_SEED = {seed};\n{js}\n</script>\n", encoding="utf-8")
    print(f"built seeded artifact: {out}")
    sys.exit(0)

body = f"{page}\n<script>\n{js}\n</script>\n"

(root / "artifact.html").write_text(body, encoding="utf-8")
(root / "index.html").write_text(
    '<!doctype html>\n<html lang="fa" dir="rtl">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    "</head>\n<body>\n" + body + "</body>\n</html>\n",
    encoding="utf-8",
)
print("built index.html and artifact.html")
