#!/usr/bin/env python3
"""Check the text and structure of the downloadable Grift introduction with Poppler and MuPDF."""
import argparse
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def inspect_pdf(path):
    def info(*args):
        return subprocess.run(["pdfinfo", *args, str(path)], check=True,
                              text=True, capture_output=True).stdout

    pdf_info = info()
    page_count = int(re.search(r"^Pages:\s+(\d+)", pdf_info, re.M)[1])
    title = re.search(r"^Title:\s+(.+)", pdf_info, re.M)
    structure = info("-struct-text")
    xmp = ET.fromstring(info("-meta"))
    dc = {"dc": "http://purl.org/dc/elements/1.1/",
          "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#"}
    headings = []
    failures = []
    if not title or title[1].strip() != xmp.findtext(".//dc:title//rdf:li", namespaces=dc):
        failures.append("Info と XMP に一致する資料名が必要です")
    if xmp.findtext(".//dc:language//rdf:li", namespaces=dc) != "ja-JP":
        failures.append("資料の XMP 言語は ja-JP が必要です")
    if not structure.startswith("Document\n"):
        failures.append("文書の構造がありません")
    sections = re.split(r"^  Sect\s*$", structure, flags=re.M)[1:]
    if len(sections) != page_count:
        failures.append(f"ページ数 {page_count} に対してページごとの区切りが {len(sections)} 件です")
    for page, section in enumerate(sections, 1):
        role = "H1" if page == 1 else "H2"
        heading = re.search(r'^\s*' + role + r' \(block\)\n\s*"([^"]+)"', section, re.M)
        first_text = re.search(r'^\s*"([^"]+)"', section, re.M)
        if not heading or not first_text or first_text[1] != heading[1]:
            failures.append(f"{page}ページ目の最初に本文と対応する{role}見出しが必要です")
        else:
            headings.append(heading[1])
    consultation = [
        section for section in sections
        if re.search(r'^\s*H2 \(block\)\n\s*"テスト導入のご相談"$', section, re.M)
    ]
    signposts = ["ご相談いただける方", "費用について", "お申し込みの方法", "まず CLI を見てみたい方へ"]
    if len(consultation) != 1 or re.findall(
            r'^\s*H3 \(block\)\n\s*"([^"]+)"', consultation[0], re.M) != signposts:
        failures.append("テスト導入のご相談ページでは、対象・費用・申し込み・CLIを本文と同じ順に見出しで選べるようにしてください")
    fig_lines = re.findall(r"^\s*Figure.*$", structure, re.M)
    meaningful = [line for line in fig_lines
                  if re.match(r'^\s*Figure \["[^"]*[ぁ-んァ-ン一-龯][^"]*"\]:$', line)
                  and not re.search(r"(\.png|\.jpe?g|/home/|/Users/)", line, re.I)]
    if not fig_lines or len(meaningful) != len(fig_lines):
        failures.append(f"説明のある図は {len(meaningful)}/{len(fig_lines)} 点です")
    if not headings or len(set(headings)) != page_count:
        failures.append("各ページを区別できる見出しが必要です")
    viewer = subprocess.run(["mutool", "show", str(path), "trailer/Root/Lang",
                             "trailer/Root/ViewerPreferences/DisplayDocTitle", "outline"],
                            check=True, capture_output=True, text=True).stdout.splitlines()
    if viewer[:2] != ["(ja-JP)", "true"]:
        failures.append("PDF閲覧ソフトが日本語と資料名を使用する設定が必要です")
    bookmarks = []
    for line in viewer[2:]:
        record = re.match(r'^\|\s+"(.+)"\s+#page=(\d+)\b', line)
        if record:
            bookmarks.append((record[1], int(record[2])))
    if not headings or bookmarks != [(text, i) for i, text in enumerate(headings, 1)]:
        failures.append("各しおりの題名と移動先をページ見出しにそろえてください")
    if sections and "会社概要" in sections[-1]:
        rows = re.split(r"^\s*TR:", sections[-1], flags=re.M)[1:]
        pairs = [re.findall(r"^\s*(TH|TD):", row, flags=re.M) for row in rows]
        if (not rows or any(pair != ["TH", "TD"] for pair in pairs)
                or any("/Scope /Row" not in row for row in rows)):
            failures.append("会社概要は左の項目名を行見出し、右の値をデータとして読み上げます")
    if failures:
        sys.exit("\n".join(failures))
    print(f"{page_count}ページ、先頭見出し{len(headings)}件、図の日本語説明{len(meaningful)}件、資料名と言語のメタデータを確認しました。")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path, nargs="?",
                        default=Path(__file__).resolve().parents[1] / "public/downloads/grift-cli-overview.pdf")
    inspect_pdf(parser.parse_args().pdf)
