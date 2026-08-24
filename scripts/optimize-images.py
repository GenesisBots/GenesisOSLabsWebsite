"""One-shot production image optimization. Does not touch archive/."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "img"
IMAGES = ROOT / "images"
FAV = ROOT / "assets" / "favicon"
GJ_POSTER_DIR = ROOT / "assets" / "images" / "gjobsos"


def fit_width(im: Image.Image, max_w: int) -> Image.Image:
    if im.width <= max_w:
        return im
    h = round(im.height * (max_w / im.width))
    return im.resize((max_w, h), Image.Resampling.LANCZOS)


def to_rgb(im: Image.Image, bg=(0, 0, 0)) -> Image.Image:
    if im.mode in ("RGB", "L"):
        return im.convert("RGB")
    rgba = im.convert("RGBA")
    base = Image.new("RGB", rgba.size, bg)
    base.paste(rgba, mask=rgba.split()[-1])
    return base


def export_responsive(src: Path, dest_stem: str, widths: list[int], quality: int = 78) -> None:
    im = to_rgb(Image.open(src))
    for w in widths:
        out = fit_width(im, w)
        webp = IMG / f"{dest_stem}-{w}.webp"
        jpg = IMG / f"{dest_stem}-{w}.jpg"
        out.save(webp, "WEBP", quality=quality, method=6)
        out.save(jpg, "JPEG", quality=quality, optimize=True, progressive=True)
        print(f"  {webp.name} {webp.stat().st_size // 1024}KB  {out.size}")
        print(f"  {jpg.name} {jpg.stat().st_size // 1024}KB")


def make_placeholder_svg() -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" width="720" height="540" viewBox="0 0 720 540" role="img" aria-label="GenesisOS Labs">
  <rect width="720" height="540" fill="#000000"/>
  <rect x="1" y="1" width="718" height="538" fill="none" stroke="#0953b5" stroke-width="2"/>
  <text x="360" y="280" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#ffffff">GenesisOS Labs</text>
</svg>
"""
    path = IMG / "site-placeholder.svg"
    path.write_text(svg, encoding="utf-8")
    print(f"placeholder {path}")


def make_og_and_favicon(logo_path: Path) -> None:
    FAV.mkdir(parents=True, exist_ok=True)
    IMAGES.mkdir(parents=True, exist_ok=True)
    logo = Image.open(logo_path).convert("RGBA")

    og = Image.new("RGB", (1200, 630), (0, 0, 0))
    draw = ImageDraw.Draw(og)
    draw.rectangle((0, 0, 1200, 12), fill=(9, 83, 181))
    draw.rectangle((0, 618, 1200, 630), fill=(9, 83, 181))
    mark = logo.copy()
    mark.thumbnail((220, 220), Image.Resampling.LANCZOS)
    og.paste(mark, ((1200 - mark.width) // 2, 170), mark)
    try:
        font = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 48)
        small = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 22)
    except OSError:
        font = ImageFont.load_default()
        small = font
    draw.text((600, 420), "GenesisOS Labs", font=font, fill=(255, 255, 255), anchor="mm")
    draw.text((600, 478), "Agents, Automations, and Tokenization", font=small, fill=(90, 160, 255), anchor="mm")
    og_jpg = IMAGES / "og-default.jpg"
    og.save(og_jpg, "JPEG", quality=85, optimize=True, progressive=True)
    print(f"og {og_jpg} {og_jpg.stat().st_size // 1024}KB")

    # Favicon sizes on black
    for size, name in ((32, "favicon-32.png"), (16, "favicon-16.png"), (180, "apple-touch-icon.png")):
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 255))
        m = logo.copy()
        pad = max(1, size // 8)
        m.thumbnail((size - pad * 2, size - pad * 2), Image.Resampling.LANCZOS)
        canvas.paste(m, ((size - m.width) // 2, (size - m.height) // 2), m)
        out = FAV / name
        canvas.save(out, "PNG", optimize=True)
        print(f"favicon {out.name}")

    ico_32 = Image.open(FAV / "favicon-32.png").convert("RGBA")
    ico_16 = Image.open(FAV / "favicon-16.png").convert("RGBA")
    ico_path = ROOT / "favicon.ico"
    ico_32.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32)])
    # PIL ICO from multiple
    ico_32.save(ico_path, format="ICO", append_images=[ico_16], sizes=[(32, 32), (16, 16)])
    print(f"favicon.ico {ico_path.stat().st_size}B")

    # Copy 32px into assets/favicon/favicon.ico as well
    ico_32.save(FAV / "favicon.ico", format="ICO", sizes=[(32, 32), (16, 16)])


def make_gjobsos_poster(logo_path: Path) -> None:
    GJ_POSTER_DIR.mkdir(parents=True, exist_ok=True)
    poster = Image.new("RGB", (1280, 720), (0, 0, 0))
    draw = ImageDraw.Draw(poster)
    draw.rectangle((0, 0, 1280, 8), fill=(9, 83, 181))
    logo = Image.open(logo_path).convert("RGBA")
    logo.thumbnail((160, 160), Image.Resampling.LANCZOS)
    poster.paste(logo, ((1280 - logo.width) // 2, 220), logo)
    try:
        font = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 56)
        sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 24)
    except OSError:
        font = ImageFont.load_default()
        sub = font
    draw.text((640, 430), "GJobsOS", font=font, fill=(255, 255, 255), anchor="mm")
    draw.text((640, 500), "Demo walkthrough", font=sub, fill=(90, 160, 255), anchor="mm")
    out = GJ_POSTER_DIR / "demo-poster.jpg"
    poster.save(out, "JPEG", quality=82, optimize=True)
    print(f"poster {out} {out.stat().st_size // 1024}KB")


def copy_logo(src: Path) -> None:
    dest = IMG / "logo.png"
    im = Image.open(src).convert("RGBA")
    im.save(dest, "PNG", optimize=True)
    print(f"logo {dest} {dest.stat().st_size}B {im.size}")


def main() -> None:
    logo = IMG / "GenesisOSLabs G Logo v1 05132026.png"
    jobs = [
        ("GenesisOSLabs PC Image v1 05182026.png", "hero-pc", [720, 1440]),
        ("Aerys Image v1 06282026.jpg", "hero-aerys", [720, 1440]),
        ("EducationHero v1 08172026 BB.png", "hero-education", [720, 1440]),
        ("Team Audit v1 08242026.jpg", "hero-team-audit", [720, 1440]),
        ("Audit Computers v1 08242026.jpg", "form-audit-computers", [900, 1600]),
        ("Gbot and Swarm v1 05182026.PNG", "art-gbot-swarm", [720, 1200]),
        ("GenesisCoin v1 05182026.PNG", "art-gcoin", [720, 1200]),
        ("Back to School Image.png", "art-back-to-school", [720, 1200]),
    ]
    for name, stem, widths in jobs:
        src = IMG / name
        print(f"\n{name} ({src.stat().st_size // 1024}KB)")
        export_responsive(src, stem, widths)

    copy_logo(logo)
    make_placeholder_svg()
    make_og_and_favicon(logo)
    make_gjobsos_poster(logo)
    print("\nDone.")


if __name__ == "__main__":
    main()
