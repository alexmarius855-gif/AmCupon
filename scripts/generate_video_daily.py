#!/usr/bin/env python3
"""
generate_video_daily.py — Fluxul video AI zilnic pentru AmCupon.ro.

Transforma Radarul zilnic (digest-today.json) intr-un clip vertical gata de
postat pe TikTok / Instagram Reels / YouTube Shorts — 100% gratuit, fara niciun
API key platit.

Lant:
  digest-today.json
    -> script vocal scurt (~45s, romana vorbita, optimizat pentru voce)
    -> edge-tts: voce neural romaneasca MP3 + subtitrari .srt sincronizate (GRATIS, fara cont)
    -> ffmpeg: MP4 vertical 1080x1920 (fundal brand + subtitrari arse + voce)
    -> caption-uri + hashtag-uri per platforma

Degradare in straturi (fiecare e optional, nu blocheaza restul):
  1. Script + caption-uri      — mereu (doar Python standard)
  2. Voce MP3 + subtitrari SRT — daca `edge-tts` e instalat (pip install edge-tts)
  3. Video MP4 final           — daca `ffmpeg` e in PATH

Output in data/video-today/:
  script.txt          — scriptul vocal (ce se citeste)
  captions.txt        — descrieri + hashtag-uri pentru cele 3 platforme
  voiceover.mp3       — vocea generata (daca edge-tts)
  subtitles.srt       — subtitrari sincronizate (daca edge-tts)
  video-today.mp4     — clipul final vertical (daca ffmpeg)

Voce: ro-RO-EmilNeural (barbat) implicit. Schimba cu --voice ro-RO-AlinaNeural.
Rulare: python generate_video_daily.py [--voice ...] [--no-video]
"""

import argparse
import io
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = Path(__file__).parent.parent
PUBLIC = ROOT / "frontend" / "public"
DATA = ROOT / "data"
OUT_DIR = DATA / "video-today"

DIGEST_JSON = PUBLIC / "digest-today.json"
BG_STORY = PUBLIC / "banner-story.png"   # 1080x1920, brand

VOICE_DEFAULT = "ro-RO-AlinaNeural"  # voce feminina RO (schimba cu --voice ro-RO-EmilNeural)

# Cate oferte intra in clip (scurt = mai bine retinut)
N_DEALS = 3


# ─── 1. Script vocal din digest ──────────────────────────────────────────────
def _scurteaza(text: str, max_len: int = 90) -> str:
    """Pastreaza doar prima propozitie utila, fara prefixe de urgenta lungi."""
    text = (text or "").strip()
    # taie prefixul de tip "Grabeste-te: expira in 1 zi. " — il mutam in voce separat
    text = re.sub(r"^Grabe[sș]te-te:[^.]*\.\s*", "", text)
    # prima propozitie
    parts = re.split(r"(?<=[.!?])\s+", text)
    frag = parts[0] if parts else text
    if len(frag) > max_len:
        frag = frag[:max_len].rsplit(" ", 1)[0] + "..."
    return frag.strip()


def construieste_script(digest: dict) -> dict:
    """Returneaza {'text': str pentru voce, 'lines': [...] pentru afisare}."""
    data_af = digest.get("data_afisata", "")
    picks = digest.get("picks", [])[:N_DEALS]

    spoken = []   # propozitii pentru voce (curgere naturala)
    onscreen = [] # bullet-uri pentru script.txt (lizibil)

    # HOOK
    spoken.append(f"Salut! Astea sunt cele mai bune oferte verificate din Romania, azi.")
    onscreen.append(f"🎬 HOOK: Cele mai bune oferte din Romania — {data_af}")

    # DEALS
    for i, p in enumerate(picks, 1):
        nume = p.get("nume_afisat", "").strip()
        take = _scurteaza(p.get("take", ""))
        cod = (p.get("cod") or "").strip()
        zile = p.get("zile_ramase", 0) or 0

        fraza = f"La {nume}, {take[0].lower() + take[1:] if take else 'oferta verificata'}"
        if not fraza.endswith((".", "!", "?")):
            fraza += "."
        if 0 < zile <= 3:
            unit = "zi" if zile == 1 else "zile"
            fraza += f" Atentie, expira in {zile} {unit}."
        if cod:
            fraza += f" Codul, pe AmCupon."
        spoken.append(fraza)

        cod_txt = f"  [cod: {cod}]" if cod else ""
        urg = f"  ⏳ expira in {zile} zile" if 0 < zile <= 3 else ""
        onscreen.append(f"{i}. {nume}{cod_txt}{urg} — {take}")

    # CTA
    spoken.append("Toate codurile, verificate, pe AmCupon punct ro. Link in bio, si revino maine la Radar!")
    onscreen.append("📣 CTA: Toate codurile pe AmCupon.ro — link in bio")

    return {
        "text": " ".join(spoken),
        "lines": onscreen,
        "data_afisata": data_af,
        "picks": picks,
    }


# ─── 2. Voce + subtitrari (edge-tts) ─────────────────────────────────────────
def genereaza_voce(text: str, voice: str, mp3_path: Path, srt_path: Path) -> bool:
    try:
        import edge_tts
    except ImportError:
        print("  (edge-tts neinstalat — skip voce. Instaleaza: pip install edge-tts)")
        return False
    try:
        communicate = edge_tts.Communicate(text, voice)
        boundaries = []  # (start_ms, end_ms, text)
        with open(mp3_path, "wb") as f:
            for chunk in communicate.stream_sync():
                t = chunk["type"]
                if t == "audio":
                    f.write(chunk["data"])
                elif t in ("WordBoundary", "SentenceBoundary"):
                    # offset/duration sunt in unitati de 100ns -> ms = /10000
                    start = chunk["offset"] / 10000.0
                    end = (chunk["offset"] + chunk["duration"]) / 10000.0
                    boundaries.append((start, end, chunk["text"]))
        cues = _cues_from_boundaries(boundaries, max_chars=28)
        with io.open(srt_path, "w", encoding="utf-8") as f:
            f.write(_srt_from_cues(cues))
        # .ass cu rezolutie exacta 1080x1920 (pozitionare precisa la ardere)
        with io.open(srt_path.with_suffix(".ass"), "w", encoding="utf-8") as f:
            f.write(_ass_from_cues(cues))
        print(f"  ✓ voce: {mp3_path.name}  +  subtitrari: {srt_path.name} ({len(cues)} linii)")
        return True
    except Exception as e:
        print(f"  (voce esuata: {e})")
        return False


def _ms_to_ts(ms: float) -> str:
    ms = int(round(ms))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _ms_to_ass(ms: float) -> str:
    cs = int(round(ms / 10))  # centisecunde
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"


def _cues_from_boundaries(boundaries, max_chars: int = 28):
    """
    Din boundary-uri edge-tts (word- sau sentence-level) -> cue-uri lizibile.
    Spargem fiecare boundary in cuvinte cu timing proportional pe lungime, apoi
    grupam cuvintele in linii de pana la `max_chars`.
    """
    words = []  # (start_ms, end_ms, word)
    for start, end, txt in boundaries:
        toks = txt.split()
        if not toks:
            continue
        total = sum(len(w) for w in toks) or 1
        span = max(end - start, 1)
        acc = start
        for w in toks:
            w_dur = span * (len(w) / total)
            words.append((acc, acc + w_dur, w))
            acc += w_dur

    cues, cur, cur_start, cur_end = [], [], None, None
    for start, end, w in words:
        if cur_start is None:
            cur_start = start
        candidate = (" ".join(cur + [w])).strip()
        if cur and len(candidate) > max_chars:
            cues.append((cur_start, cur_end, " ".join(cur)))
            cur, cur_start = [w], start
        else:
            cur.append(w)
        cur_end = end
    if cur:
        cues.append((cur_start, cur_end, " ".join(cur)))
    return cues


def _srt_from_cues(cues) -> str:
    out = []
    for i, (a, b, txt) in enumerate(cues, 1):
        out += [str(i), f"{_ms_to_ts(a)} --> {_ms_to_ts(b)}", txt, ""]
    return "\n".join(out)


def _ass_from_cues(cues, fontsize: int = 62, marginv: int = 880) -> str:
    """
    .ass cu PlayRes 1080x1920 => pozitionare exacta. Alignment=2 (jos-centru) +
    MarginV mare => subtitrari in zona centrala libera. Alb cu contur negru gros.
    """
    header = (
        "[Script Info]\n"
        "ScriptType: v4.00+\n"
        "PlayResX: 1080\n"
        "PlayResY: 1920\n"
        "WrapStyle: 2\n"
        "ScaledBorderAndShadow: yes\n\n"
        "[V4+ Styles]\n"
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, "
        "OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, "
        "ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, "
        "MarginL, MarginR, MarginV, Encoding\n"
        f"Style: Radar,Arial,{fontsize},&H00FFFFFF,&H000000FF,&H00000000,"
        f"&H64000000,-1,0,0,0,100,100,0,0,1,5,2,2,90,90,{marginv},1\n\n"
        "[Events]\n"
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
    )
    lines = [header]
    for a, b, txt in cues:
        txt = txt.replace("\n", " ").strip()
        lines.append(
            f"Dialogue: 0,{_ms_to_ass(a)},{_ms_to_ass(b)},Radar,,0,0,0,,{txt}"
        )
    return "\n".join(lines) + "\n"


# ─── 3a. Fundal video curat, pe brand (PIL) ──────────────────────────────────
def _load_font(size: int, bold: bool = False):
    from PIL import ImageFont
    candidates = (
        ["arialbd.ttf", "Arial Bold.ttf", "segoeuib.ttf"] if bold
        else ["arial.ttf", "segoeui.ttf", "DejaVuSans.ttf"]
    )
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


def make_video_bg(data_af: str, out_path: Path) -> bool:
    """
    Genereaza un fundal vertical 1080x1920 dark indigo/cyan, ZERO portocaliu,
    cu zona centrala libera pentru subtitrari. Pe brand, lejer si curat.
    """
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        return False
    try:
        W, H = 1080, 1920
        img = Image.new("RGB", (W, H), (10, 14, 26))  # slate-950
        d = ImageDraw.Draw(img)

        # gradient vertical subtil (slate-950 -> slate-900 albastrui)
        top, bot = (12, 16, 32), (8, 11, 22)
        for y in range(H):
            t = y / H
            r = int(top[0] + (bot[0] - top[0]) * t)
            g = int(top[1] + (bot[1] - top[1]) * t)
            b = int(top[2] + (bot[2] - top[2]) * t)
            d.line([(0, y), (W, y)], fill=(r, g, b))

        # grid fin indigo (textura discreta)
        grid = (30, 38, 66)
        for x in range(0, W, 90):
            d.line([(x, 0), (x, H)], fill=grid, width=1)
        for y in range(0, H, 90):
            d.line([(0, y), (W, y)], fill=grid, width=1)

        # halou indigo/cyan sus (glow brand) — desenat ca cercuri concentrice slabe
        cx, cy = W // 2, 360
        for rad, col in [(420, (24, 32, 70)), (320, (30, 42, 92)), (220, (36, 52, 110))]:
            d.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=col)

        # wordmark "AmCupon.ro" — indigo + cyan, fara portocaliu
        f_brand = _load_font(96, bold=True)
        t1, t2 = "Am", "Cupon"
        t3 = ".ro"
        w1 = d.textlength(t1, font=f_brand)
        w2 = d.textlength(t2, font=f_brand)
        w3 = d.textlength(t3, font=f_brand)
        total = w1 + w2 + w3
        x0 = (W - total) / 2
        y0 = 300
        d.text((x0, y0), t1, font=f_brand, fill=(129, 140, 248))      # indigo-400
        d.text((x0 + w1, y0), t2, font=f_brand, fill=(255, 255, 255)) # alb
        d.text((x0 + w1 + w2, y0), t3, font=f_brand, fill=(34, 211, 238))  # cyan-400

        # linie accent cyan sub wordmark
        d.rounded_rectangle([cx - 120, y0 + 130, cx + 120, y0 + 138], radius=4,
                            fill=(34, 211, 238))

        # tagline
        f_tag = _load_font(40, bold=False)
        tag = f"Radarul ofertelor • {data_af}"
        wt = d.textlength(tag, font=f_tag)
        d.text(((W - wt) / 2, y0 + 175), tag, font=f_tag, fill=(148, 163, 184))  # slate-400

        # CTA jos
        f_cta = _load_font(46, bold=True)
        cta = "amcupon.ro"
        wc = d.textlength(cta, font=f_cta)
        d.text(((W - wc) / 2, H - 220), cta, font=f_cta, fill=(34, 211, 238))
        f_sub = _load_font(34, bold=False)
        sub = "Link in bio • coduri verificate zilnic"
        ws = d.textlength(sub, font=f_sub)
        d.text(((W - ws) / 2, H - 160), sub, font=f_sub, fill=(100, 116, 139))

        img.save(out_path)
        return True
    except Exception as e:
        print(f"  (fundal PIL esuat: {e} — folosesc banner-story)")
        return False


# ─── 3. Video MP4 (ffmpeg) ───────────────────────────────────────────────────
def genereaza_video(mp3_path: Path, srt_path: Path, bg_path: Path, mp4_path: Path) -> bool:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        print("  (ffmpeg negasit in PATH — skip video. Vezi https://ffmpeg.org)")
        return False
    if not mp3_path.exists():
        print("  (fara voce MP3 — skip video)")
        return False
    if not bg_path.exists():
        print(f"  (fundal lipsa: {bg_path.name} — skip video)")
        return False

    # Folosim .ass (PlayRes 1080x1920) => pozitionare exacta, fara force_style.
    # Rulam din OUT_DIR cu nume relative => evitam cosmarul de escaping pe Windows.
    ass_name = srt_path.with_suffix(".ass").name
    if not (OUT_DIR / ass_name).exists():
        print("  (lipsa fisier .ass — skip video)")
        return False
    bg_rel = "_bg.png"
    shutil.copyfile(bg_path, OUT_DIR / bg_rel)

    cmd = [
        ffmpeg, "-y",
        "-loop", "1", "-i", bg_rel,
        "-i", mp3_path.name,
        "-vf", f"scale=1080:1920,ass={ass_name}",
        "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest", "-r", "25",
        mp4_path.name,
    ]
    try:
        res = subprocess.run(cmd, cwd=str(OUT_DIR), capture_output=True, text=True, timeout=300)
        (OUT_DIR / bg_rel).unlink(missing_ok=True)
        if res.returncode != 0:
            print(f"  (ffmpeg a esuat: {res.stderr[-400:]})")
            return False
        print(f"  ✓ video: {mp4_path.name}")
        return True
    except Exception as e:
        print(f"  (video esuat: {e})")
        return False


# ─── 4. Caption-uri per platforma ────────────────────────────────────────────
def construieste_captions(script: dict) -> str:
    picks = script["picks"]
    data_af = script["data_afisata"]
    coduri = [f"{p['nume_afisat']}: {p['cod']}" for p in picks if (p.get("cod") or "").strip()]
    coduri_txt = "\n".join(f"🎟️ {c}" for c in coduri) if coduri else "🔗 Coduri pe site"

    base_tags = "#reduceri #coduri #oferte #romania #amcupon #economii #cupoane #shopping"
    tiktok = (
        f"Cele mai bune oferte din Romania azi 🇷🇴 ({data_af})\n\n"
        f"{coduri_txt}\n\n"
        f"👉 Toate codurile verificate pe AmCupon.ro (link in bio)\n\n"
        f"{base_tags} #fyp #foryou #tiktokromania"
    )
    reels = (
        f"Oferte verificate, alese azi de redactia AmCupon 🛒\n\n"
        f"{coduri_txt}\n\n"
        f"Link in bio → amcupon.ro\n\n"
        f"{base_tags} #reels #instagramromania"
    )
    shorts = (
        f"Top oferte Romania — {data_af} | AmCupon.ro\n\n"
        f"{coduri_txt}\n\n"
        f"Coduri verificate zilnic pe amcupon.ro\n\n"
        f"{base_tags} #shorts #youtubeshorts"
    )
    return (
        "=" * 50 + "\n  CAPTION-URI VIDEO — gata de copiat\n" + "=" * 50 +
        f"\n\n[ TIKTOK ]\n{tiktok}\n\n" +
        f"{'-'*50}\n[ INSTAGRAM REELS ]\n{reels}\n\n" +
        f"{'-'*50}\n[ YOUTUBE SHORTS ]\n{shorts}\n"
    )


# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default=VOICE_DEFAULT, help="ro-RO-EmilNeural / ro-RO-AlinaNeural")
    ap.add_argument("--no-video", action="store_true", help="sari peste pasul ffmpeg")
    args = ap.parse_args()

    if not DIGEST_JSON.exists():
        print(f"Lipsa {DIGEST_JSON} — ruleaza intai generate_daily_digest.py")
        return 1
    with io.open(DIGEST_JSON, encoding="utf-8") as f:
        digest = json.load(f)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    script = construieste_script(digest)

    # 1. Script text (mereu)
    script_path = OUT_DIR / "script.txt"
    with io.open(script_path, "w", encoding="utf-8") as f:
        f.write(f"SCRIPT VIDEO — Radarul AmCupon — {script['data_afisata']}\n")
        f.write("=" * 50 + "\n\n")
        f.write("[ CE SE CITESTE / VOCE ]\n")
        f.write(script["text"] + "\n\n")
        f.write("[ STRUCTURA PE ECRAN ]\n")
        f.write("\n".join(script["lines"]) + "\n")
    print(f"✓ script: {script_path}")

    # 4. Captions (mereu)
    cap_path = OUT_DIR / "captions.txt"
    with io.open(cap_path, "w", encoding="utf-8") as f:
        f.write(construieste_captions(script))
    print(f"✓ captions: {cap_path}")

    # 2. Voce + subtitrari (optional)
    mp3_path = OUT_DIR / "voiceover.mp3"
    srt_path = OUT_DIR / "subtitles.srt"
    are_voce = genereaza_voce(script["text"], args.voice, mp3_path, srt_path)

    # 3. Video (optional)
    if are_voce and not args.no_video:
        mp4_path = OUT_DIR / "video-today.mp4"
        # fundal curat pe brand (zero portocaliu); fallback la banner-story
        bg_clean = OUT_DIR / "_bg_brand.png"
        bg = bg_clean if make_video_bg(script["data_afisata"], bg_clean) else BG_STORY
        genereaza_video(mp3_path, srt_path, bg, mp4_path)
        bg_clean.unlink(missing_ok=True)

    print("\n📦 Pachet video gata in: " + str(OUT_DIR))
    return 0


if __name__ == "__main__":
    sys.exit(main())
