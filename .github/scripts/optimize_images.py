# Стискає фото в готовому сайті (_site/images) перед публікацією.
# Оригінали в репозиторії не змінюються — стискається лише копія для сайту.
# Великі фото з телефона зменшуються до 1600 px по довшій стороні,
# повертаються правильно (якщо телефон зберіг їх «боком»),
# а службові дані фото (зокрема GPS-координати) прибираються.

import io
import os
import sys

from PIL import Image, ImageOps

ROOT = sys.argv[1] if len(sys.argv) > 1 else "_site/images"
MAX_SIDE = 1600
QUALITY = 80

before_total = after_total = changed = 0

for folder, _, files in os.walk(ROOT):
    for name in files:
        ext = name.lower().rsplit(".", 1)[-1]
        if ext not in ("jpg", "jpeg", "png", "webp"):
            continue
        path = os.path.join(folder, name)
        original = open(path, "rb").read()
        try:
            img = Image.open(io.BytesIO(original))
            img = ImageOps.exif_transpose(img)
            img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
            out = io.BytesIO()
            if ext in ("jpg", "jpeg"):
                if img.mode not in ("RGB", "L"):
                    img = img.convert("RGB")
                img.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            elif ext == "webp":
                img.save(out, "WEBP", quality=QUALITY)
            else:
                img.save(out, "PNG", optimize=True)
            data = out.getvalue()
        except Exception as e:  # пошкоджене фото — лишаємо як є
            print(f"Пропущено {path}: {e}")
            continue
        before_total += len(original)
        if len(data) < len(original):
            open(path, "wb").write(data)
            after_total += len(data)
            changed += 1
        else:
            after_total += len(original)

print(f"Стиснуто фото: {changed}. Було {before_total // 1024} КБ, стало {after_total // 1024} КБ")
