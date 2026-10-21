#!/usr/bin/env python3
"""把第 2–16 页打成可离线单开的 HTML。

开发源码仍是「页面 + common/」。本脚本只做导出：
内联 common/*.js 与 common/cw.css，并把本专题用到的字形从
common/fonts/ 子集出来，以 data URL 写进每一页。

用法（仓库根目录）：
  pip install -r tools/requirements-pack.txt
  python3 tools/pack.py
  python3 tools/pack.py --smoke          # 再抽查第 2、9、16 页
  python3 tools/pack.py --smoke all

输出目录默认 dist/standalone/（构建产物，不入库）。
"""
import argparse, base64, io, os, re, shutil, signal, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONTS_CSS = ROOT / "common" / "fonts" / "fonts.css"
FONTS_DIR = ROOT / "common" / "fonts"
OFL_PATH = FONTS_DIR / "OFL.txt"
CW_CSS = ROOT / "common" / "cw.css"
COMMON = ROOT / "common"
REPO = "https://github.com/Akizuki-Kanna-Official/physics-visualized"
# Source Serif 4 的 OFL 保留字体名是 Source。子集是修改版，打包产物改用这个族名。
LATIN_FAMILY = "CW Latin"

# 动态拼出来的数字、单位和符号。页面源码里大多已经出现；这里再兜一层。
EXTRA = set(range(0x20, 0x7F))
EXTRA.update(ord(ch) for ch in (
    "−≈×÷·•√≤≥≠∞°²³¹⁰⁴⁵⁶⁷⁸⁹"
    "←→↑↓▶◀⏸⏵↺↻‹›‐–—―‘’“”"
    "₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹"
    "ΔθλμπρσωΩ"
))

LINK_RE = re.compile(r"<link\b[^>]*>", re.I)
SCRIPT_RE = re.compile(r"<script\b([^>]*)\bsrc=\"([^\"]+)\"([^>]*)>\s*</script>", re.I)
FACE_RE = re.compile(r"@font-face\s*\{(.*?)\}", re.S)
RANGE_RE = re.compile(r"U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?")


def die(msg):
    print("pack: " + msg, file=sys.stderr)
    sys.exit(1)


def load_fonttools():
    try:
        from fontTools.ttLib import TTFont
        from fontTools.subset import Options, Subsetter
        import brotli  # noqa: F401  woff2 写出需要
    except ImportError:
        die("需要 fonttools 与 brotli。请先执行：pip install -r tools/requirements-pack.txt")
    return TTFont, Options, Subsetter


def current_pages():
    pages = []
    base = ROOT / "动量专题"
    for n in range(2, 17):
        d = base / f"page{n}"
        if not d.is_dir():
            die(f"缺少目录 {d.relative_to(ROOT)}")
        found = sorted(p for p in d.glob("page*.html") if p.is_file())
        if len(found) != 1:
            names = ", ".join(p.name for p in found) or "（无）"
            die(f"{d.relative_to(ROOT)} 应有且仅有一个当前页 html，实际：{names}")
        pages.append(found[0])
    return pages


def parse_ranges(text):
    ranges = []
    for a, b in RANGE_RE.findall(text):
        start = int(a, 16)
        end = int(b, 16) if b else start
        ranges.append((start, end))
    return ranges


def covers(ranges, cp):
    return any(a <= cp <= b for a, b in ranges)


def parse_faces(css):
    faces = []
    for block in FACE_RE.findall(css):
        fam = re.search(r"font-family:\s*'([^']+)'", block)
        style = re.search(r"font-style:\s*(\w+)", block)
        weight = re.search(r"font-weight:\s*(\d+)", block)
        src = re.search(r"url\(([^)]+)\)", block)
        ur = re.search(r"unicode-range:\s*([^;]+);", block)
        if not (fam and style and weight and src and ur):
            die("fonts.css 里有无法解析的 @font-face")
        faces.append({
            "family": fam.group(1),
            "style": style.group(1),
            "weight": int(weight.group(1)),
            "src": src.group(1).strip().strip("'\""),
            "ranges": parse_ranges(ur.group(1)),
        })
    if not faces:
        die("fonts.css 里没有 @font-face")
    return faces


def codepoints_of(*texts):
    cps = set(EXTRA)
    for text in texts:
        cps.update(ord(ch) for ch in text if ord(ch) >= 0x20)
    return cps


def fmt_ranges(cps):
    cps = sorted(set(cps))
    if not cps:
        return ""
    parts = []
    start = prev = cps[0]
    for cp in cps[1:]:
        if cp == prev + 1:
            prev = cp
            continue
        parts.append(f"U+{start:04X}" if start == prev else f"U+{start:04X}-{prev:04X}")
        start = prev = cp
    parts.append(f"U+{start:04X}" if start == prev else f"U+{start:04X}-{prev:04X}")
    return ", ".join(parts)


def rename_latin(font):
    """子集是修改版。保留版权记录，族名不再使用保留名 Source。"""
    for rec in font["name"].names:
        if rec.nameID in (0, 7, 13):
            continue
        try:
            val = rec.toUnicode()
        except Exception:
            continue
        if "Source" not in val and "source" not in val:
            continue
        val = val.replace("Source Serif 4", LATIN_FAMILY)
        val = val.replace("SourceSerif4", "CWLatin")
        val = val.replace("Source", "CW")
        rec.string = val


def group_faces(faces):
    """同一可变字体文件被 CSS 按字重重复引用。每个文件只子集一次。"""
    groups = {}
    for face in faces:
        if face["family"] not in ("Noto Serif SC", "Source Serif 4"):
            continue
        key = (face["family"], face["style"], face["src"])
        g = groups.get(key)
        if g is None:
            groups[key] = {
                "family": face["family"],
                "style": face["style"],
                "src": face["src"],
                "ranges": face["ranges"],
                "weights": {face["weight"]},
            }
            continue
        if g["ranges"] != face["ranges"]:
            die(f"{face['src']} 在不同字重下的 unicode-range 不一致")
        g["weights"].add(face["weight"])
    return list(groups.values())


def subset_woff2(TTFont, Options, Subsetter, path, unicodes, rename):
    font = TTFont(path)
    cmap = font.getBestCmap() or {}
    have = [cp for cp in unicodes if cp in cmap]
    if not have:
        return None
    opts = Options()
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.name_legacy = True
    opts.name_languages = ["*"]
    opts.recommended_glyphs = True
    opts.notdef_outline = True
    opts.glyph_names = True
    opts.legacy_kern = True
    opts.symbol_cmap = True
    opts.layout_closure = True
    opts.desubroutinize = False
    sub = Subsetter(options=opts)
    sub.populate(unicodes=have)
    sub.subset(font)
    if "fvar" not in font:
        die(f"子集后丢失可变字体轴：{path.name}。页面字重会错，已中止。")
    if rename:
        rename_latin(font)
        for rec in font["name"].names:
            if rec.nameID not in (1, 4, 6, 16):
                continue
            try:
                val = rec.toUnicode()
            except Exception:
                continue
            if "Source" in val:
                die(f"保留字体名仍在 {path.name} nameID {rec.nameID}：{val}")
    wmin = wmax = 400
    for axis in font["fvar"].axes:
        if axis.axisTag == "wght":
            wmin, wmax = int(round(axis.minValue)), int(round(axis.maxValue))
    buf = io.BytesIO()
    font.flavor = "woff2"
    font.save(buf)
    data = buf.getvalue()
    cmap2 = TTFont(io.BytesIO(data)).getBestCmap() or {}
    covered = sorted(cp for cp in have if cp in cmap2)
    dropped = len(have) - len(covered)
    if dropped > max(3, len(have) // 20):
        die(f"{path.name} 子集后丢了 {dropped}/{len(have)} 个请求的码位")
    return data, covered, wmin, wmax


def build_font_css(TTFont, Options, Subsetter, cps):
    groups = group_faces(parse_faces(FONTS_CSS.read_text(encoding="utf-8")))
    # 同一份子集字节（常见于重叠的 unicode-range 切片）合并成一条 @font-face。
    emitted = []
    total = 0
    for g in groups:
        want = {cp for cp in cps if covers(g["ranges"], cp)}
        if not want:
            continue
        path = (FONTS_DIR / g["src"]).resolve()
        if not path.is_file():
            die(f"缺少字体文件 {g['src']}")
        rename = g["family"] == "Source Serif 4"
        packed = subset_woff2(TTFont, Options, Subsetter, path, want, rename)
        if not packed:
            continue
        data, covered, wmin, wmax = packed
        if not covered:
            continue
        family = LATIN_FAMILY if rename else g["family"]
        weight = str(wmin) if wmin == wmax else f"{wmin} {wmax}"
        prev = next((item for item in emitted if item["data"] == data and item["family"] == family and item["style"] == g["style"] and item["weight"] == weight), None)
        if prev:
            prev["covered"].update(covered)
            continue
        emitted.append({
            "family": family,
            "style": g["style"],
            "weight": weight,
            "data": data,
            "covered": set(covered),
        })
        total += len(data)
    if len(emitted) < 4:
        die(f"嵌入的字体文件只有 {len(emitted)} 个，可能漏了西文或中文切片")
    rules = []
    for item in emitted:
        b64 = base64.b64encode(item["data"]).decode("ascii")
        rules.append(
            "@font-face{"
            f"font-family:'{item['family']}';"
            f"font-style:{item['style']};"
            f"font-weight:{item['weight']};"
            "font-display:swap;"
            f"src:url(data:font/woff2;base64,{b64}) format('woff2');"
            f"unicode-range:{fmt_ranges(item['covered'])};"
            "}"
        )
    nfiles = len(emitted)
    css = (
        "/* 打包嵌入的字体子集（SIL OFL 1.1）。"
        f"西文 @font-face 族名为 {LATIN_FAMILY}，对应开发源码里的西文衬线。*/\n"
        + "\n".join(rules)
    )
    return css, total, nfiles


def rename_family(text):
    return text.replace("Source Serif 4", LATIN_FAMILY)


def inline_assets(html, html_path, font_css, cache):
    def link_repl(m):
        tag = m.group(0)
        if not re.search(r'rel="stylesheet"', tag, re.I):
            die(f"{html_path.name} 有未预期的 link：{tag}")
        href_m = re.search(r'href="([^"]+)"', tag)
        if not href_m:
            die(f"{html_path.name} 的 link 没有 href")
        href = href_m.group(1)
        target = (html_path.parent / href).resolve()
        if target == FONTS_CSS.resolve():
            return "<style id=\"cw-fonts\">\n" + font_css + "\n</style>"
        if target == CW_CSS.resolve():
            css = rename_family(CW_CSS.read_text(encoding="utf-8"))
            if "</style" in css.lower():
                die("cw.css 含有 </style，无法内联")
            return "<style id=\"cw-css\">\n" + css + "\n</style>"
        die(f"{html_path.name} 引用了未处理的样式：{href}")

    def script_repl(m):
        src = m.group(2)
        target = (html_path.parent / src).resolve()
        try:
            target.relative_to(COMMON.resolve())
        except ValueError:
            die(f"{html_path.name} 引用了 common/ 以外的脚本：{src}")
        if not target.is_file():
            die(f"缺少脚本 {src}")
        key = str(target)
        if key not in cache:
            js = rename_family(target.read_text(encoding="utf-8"))
            if re.search(r"</script", js, re.I):
                js = re.sub(r"</script", r"<\\/script", js, flags=re.I)
            cache[key] = js
        return "<script>\n" + cache[key] + "\n</script>"

    html = LINK_RE.sub(link_repl, html)
    html = SCRIPT_RE.sub(script_repl, html)
    html = rename_family(html)
    if re.search(r"<script\b[^>]*\bsrc=", html, re.I):
        die(f"{html_path.name} 仍有外部脚本")
    if re.search(r"<link\b", html, re.I):
        die(f"{html_path.name} 仍有外部样式")
    if re.search(r"url\(\s*(?!data:)", html):
        die(f"{html_path.name} 仍有非 data URL 的 url()")
    return html


def license_block():
    ofl = OFL_PATH.read_text(encoding="utf-8")
    note = (
        "本文件由 tools/pack.py 生成，可单独离线打开，不必携带仓库里的 common/。\n"
        "代码（脚本与样式）MIT；题目讲解与页面文字 CC BY 4.0。\n"
        "嵌入字体是按本专题用字裁过的 woff2，许可为 SIL Open Font License 1.1：\n"
        "- Noto Serif SC（版权见下文，可变字重）。\n"
        f"- Source Serif 4（Adobe，Reserved Font Name “Source”）的子集在本文件中改名为 {LATIN_FAMILY}，\n"
        "  开发源码仍使用原字体名。\n"
        f"源码仓库：{REPO}\n"
        "\n"
        + ofl
    )
    esc = note.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return '<pre id="font-license" style="display:none">\n' + esc + "\n</pre>"


def banner():
    return (
        "<!-- standalone page generated by tools/pack.py. "
        "Scripts, styles and subset fonts are embedded. "
        f"Repository: {REPO} -->\n"
    )


def node_check(path):
    html = path.read_text(encoding="utf-8")
    parts = re.findall(r"<script>([\s\S]*?)</script>", html)
    if len(parts) < 3:
        die(f"{path.name} 内联脚本过少（{len(parts)}）")
    tmp = path.with_suffix(".syntax.js")
    tmp.write_text("\n".join(parts), encoding="utf-8")
    try:
        proc = subprocess.run(["node", "--check", str(tmp)], capture_output=True, text=True)
    finally:
        tmp.unlink(missing_ok=True)
    if proc.returncode != 0:
        die(f"语法检查失败 {path.name}\n{proc.stderr}")


def title_of(html):
    m = re.search(r"<title>(.*?)</title>", html)
    return m.group(1).strip() if m else "未命名"


def write_index(out, entries):
    rows = "\n".join(
        f'<li><a href="{name}">{title}</a></li>' for name, title in entries
    )
    html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>动量守恒四大模型 · 单文件页面</title>
<style>
body{{margin:0;background:#F5F4EE;color:#1F1E1D;font:18px/1.6 "Songti SC","Noto Serif SC",serif}}
main{{max-width:720px;margin:0 auto;padding:48px 24px 80px}}
h1{{font-weight:600;font-size:28px;margin:0 0 8px}}
p{{color:#3D3929}} a{{color:#C96442}}
</style></head><body><main>
<h1>动量守恒四大模型 动起来讲</h1>
<p>下面每一页都是单文件。把某个 html 单独复制出去，离线双击也能打开。</p>
<p>源码与更新见 <a href="{REPO}">{REPO}</a>。</p>
<ol>
{rows}
</ol>
</main></body></html>
"""
    (out / "index.html").write_text(html, encoding="utf-8")


def write_readme(out):
    text = f"""动量守恒四大模型 · 单文件页面
================================

这个文件夹里的 page*.html 各自独立：脚本、样式和字体都在文件内部。
用 Chrome、Edge、Firefox 或 Safari 双击其中一个即可离线播放，不需要
仓库里的 common/ 目录，也不需要把整个压缩包解开后保持目录结构。

index.html 是目录页，链到同目录的各个页面。单独把 index.html 拷走没有页面可点。

字体
----
Noto Serif SC 与 Source Serif 4 已按本专题实际用字做成 woff2 子集，
以 data URL 嵌入每一页。Source Serif 4 的保留字体名是 Source，
子集在页面里改名为 {LATIN_FAMILY}（只影响打包结果，开发源码不变）。
许可全文在每个 html 源码里的 font-license 一段，SIL OFL 1.1。

许可
----
代码 MIT。题目讲解与页面文字 CC BY 4.0。

源码
----
{REPO}
想改页面或看 common/ 模块，请克隆仓库，不要改这个文件夹里的生成文件。
生成命令：python3 tools/pack.py
"""
    (out / "README.txt").write_text(text, encoding="utf-8")


def pack(out):
    TTFont, Options, Subsetter = load_fonttools()
    pages = current_pages()
    common_js = []
    for path in sorted(COMMON.glob("*.js")):
        common_js.append(path.read_text(encoding="utf-8"))
    shared = "\n".join(common_js) + "\n" + CW_CSS.read_text(encoding="utf-8")
    page_html = [(p, p.read_text(encoding="utf-8")) for p in pages]
    cps = codepoints_of(shared, *(html for _, html in page_html))
    print(f"用字 {len(cps)} 个码位，开始子集字体…")
    font_css, font_bytes, nfiles = build_font_css(TTFont, Options, Subsetter, cps)
    print(f"嵌入 {nfiles} 个 woff2，合计 {font_bytes/1024:.0f} KB（base64 前）")
    if out.exists():
        for old in out.iterdir():
            if old.is_file() and old.suffix in {".html", ".txt"}:
                old.unlink()
    else:
        out.mkdir(parents=True)
    cache = {}
    entries = []
    license_html = license_block()
    head = banner()
    for src, html in page_html:
        packed = inline_assets(html, src, font_css, cache)
        packed = re.sub(r"<!DOCTYPE html>\s*", "<!DOCTYPE html>\n" + head, packed, count=1, flags=re.I)
        packed = packed.replace("</body>", license_html + "\n</body>", 1)
        dest = out / src.name
        dest.write_text(packed, encoding="utf-8")
        entries.append((dest.name, title_of(html)))
        print(f"  {dest.name:48} {dest.stat().st_size/1024:8.0f} KB")
    write_index(out, entries)
    write_readme(out)
    return [out / name for name, _ in entries]


SMOKE_JS_HEAD = """<script>
try{localStorage.clear()}catch(e){}
window.__e=[];
window.onerror=function(m,u,l){__e.push(String(m)+' @'+l)};
window.requestAnimationFrame=function(){return 0};
Element.prototype.animate=function(){return{cancel(){},finish(){},set onfinish(f){}}};
</script>
"""

SMOKE_JS_TAIL = """<script>
(function(){
function finish(){
  try{
    const bt=document.getElementById('bt');
    if(bt){bt.checked=true;if(bt.onchange)bt.onchange();slow=bt.checked;}
    if(typeof layout==='function')layout();
    run=true;lastT=null;
    for(let i=0;i<=120;i++)frame(i*1000/60);
    if(typeof draw==='function')draw();
    const sample=((document.querySelector('h1')||{}).textContent||'').replace(/\\s+/g,'').slice(0,8);
    const noto=document.fonts.check("600 32px 'Noto Serif SC'", sample);
    const latin=document.fonts.check("600 20px 'CW Latin'", 'Energy');
    const ital=document.fonts.check("italic 600 16px 'CW Latin'", 'mv');
    const ext=[...document.querySelectorAll('script[src],link[href]')].map(e=>e.getAttribute('src')||e.getAttribute('href'));
    const c=document.getElementById('c');
    document.documentElement.setAttribute('data-clawd', document.getElementById('clawdOn').checked?'1':'0');
    document.documentElement.setAttribute('data-font', [noto,latin,ital,document.fonts.size].join(','));
    document.documentElement.setAttribute('data-ext', ext.join('|'));
    document.documentElement.setAttribute('data-canvas', c&&c.width>0?'1':'0');
    document.documentElement.setAttribute('data-st', String(st&&st.t));
    document.documentElement.setAttribute('data-err', __e.join(' || '));
    document.documentElement.setAttribute('data-done','1');
  }catch(e){
    document.documentElement.setAttribute('data-err', String(e&&e.stack||e).slice(0,500));
    document.documentElement.setAttribute('data-done','1');
  }
}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(finish);else finish();
})();
</script>
"""


def run_chrome(cmd):
    """无头 Chrome 写完 dump-dom 后经常不退出。超时后收走已经写出的 stdout。"""
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, start_new_session=True)
    try:
        out, err = proc.communicate(timeout=18)
    except subprocess.TimeoutExpired:
        os.killpg(proc.pid, signal.SIGKILL)
        out, err = proc.communicate()
    return out or "", err or ""


def smoke(paths, shots):
    chrome = shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")
    if not chrome:
        die("未找到 google-chrome，无法做页面抽查")
    for path in paths:
        html = path.read_text(encoding="utf-8")
        html = html.replace("<head>", "<head>" + SMOKE_JS_HEAD, 1)
        html = html.replace("</body>", SMOKE_JS_TAIL + "</body>", 1)
        # 放到空目录里打开，确认不依赖旁边的 common/ 或其他页面。
        alone = Path(tempfile.mkdtemp(prefix="cw-alone-"))
        tmp = alone / path.name
        tmp.write_text(html, encoding="utf-8")
        shot = shots / (path.stem + ".png") if shots else None
        cmd = [chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
               "--hide-scrollbars", "--window-size=1280,720", "--force-device-scale-factor=1",
               "--virtual-time-budget=4000", f"--user-data-dir={tempfile.mkdtemp(prefix='cw-chrome-')}",
               "--dump-dom", "file://" + str(tmp)]
        if shot:
            cmd.insert(-2, f"--screenshot={shot}")
        try:
            dom, err = run_chrome(cmd)
        finally:
            tmp.unlink(missing_ok=True)
            alone.rmdir()
        attrs = dict(re.findall(r'data-(done|err|font|ext|canvas|st|clawd)="([^"]*)"', dom))
        print(f"smoke {path.name}: done={attrs.get('done')} t={attrs.get('st')} font={attrs.get('font')} canvas={attrs.get('canvas')} clawd={attrs.get('clawd')} ext={attrs.get('ext')!r} err={attrs.get('err')!r}")
        if attrs.get("done") != "1":
            die(f"{path.name} 抽查没有跑完。chrome 输出：\n{(err or '')[-1500:]}\nDOM 前 400 字：{dom[:400]}")
        if attrs.get("err"):
            die(f"{path.name} 运行报错：{attrs.get('err')}")
        if attrs.get("ext"):
            die(f"{path.name} 仍在请求外部资源：{attrs.get('ext')}")
        if attrs.get("canvas") != "1":
            die(f"{path.name} 画布没有尺寸")
        if attrs.get("clawd") != "0":
            die(f"{path.name} 的 Clawd 开关不是默认关闭")
        try:
            t = float(attrs.get("st") or "nan")
        except ValueError:
            t = float("nan")
        if not (t > 0):
            die(f"{path.name} 播放后 t 没有前进（t={attrs.get('st')}）")
        font = (attrs.get("font") or "").split(",")
        if font[:3] != ["true", "true", "true"]:
            die(f"{path.name} 字体未按预期加载：{attrs.get('font')}")
        if shot and not shot.is_file():
            die(f"{path.name} 没有写出截图")


def main():
    ap = argparse.ArgumentParser(description="导出第 2–16 页的离线单文件 HTML")
    ap.add_argument("--out", type=Path, default=ROOT / "dist" / "standalone")
    ap.add_argument("--no-check", action="store_true", help="跳过 node --check")
    ap.add_argument("--smoke", nargs="?", const="sample", choices=("sample", "all"),
                    help="打包后用无头 Chrome 抽查。sample 为第 2、9、16 页")
    ap.add_argument("--shots", type=Path, default=None, help="抽查时把截图写到这个目录")
    args = ap.parse_args()
    out = args.out if args.out.is_absolute() else ROOT / args.out
    pages = pack(out)
    if not args.no_check:
        if not shutil.which("node"):
            die("未找到 node，无法做语法检查")
        for path in pages:
            node_check(path)
        print(f"语法检查通过：{len(pages)} 页")
    if args.smoke:
        if args.smoke == "all":
            chosen = pages
        else:
            chosen = [p for p in pages if p.name.startswith(("page2-", "page9-", "page16-"))]
            if len(chosen) != 3:
                die("抽查页数量不对：" + ", ".join(p.name for p in chosen))
        shots = args.shots
        if shots and not shots.is_absolute():
            shots = ROOT / shots
        if shots:
            shots.mkdir(parents=True, exist_ok=True)
        smoke(chosen, shots)
    print(f"完成：{out}")


if __name__ == "__main__":
    main()
