#!/usr/bin/env python3
"""Read current Core sources from the official latest directory; never execute them.

Python 3.9+, standard library only. No source files are written to the project.
--audit checks every JS filename found in the live index (including .min.js).
A successful fetch/hash is NOT a semantic API review or a browser integration test.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import json
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener

BASE = "https://cdn.sdelal.tech/core/latest/"
MAX_BYTES = 4 * 1024 * 1024
EXPECTED_JS = {"importmap.js", "collapse.js", "event.js", "field.js", "form.js",
               "motion.js", "navigation.js", "popup.js", "resource.js", "slider.js", "state.js"}


def allowed_url(url: str) -> bool:
    parsed = urlparse(url)
    return (parsed.scheme == "https" and parsed.netloc == "cdn.sdelal.tech"
            and parsed.path.startswith("/core/latest/")
            and not parsed.query and not parsed.fragment and "%" not in parsed.path
            and ".." not in parsed.path)


class OfficialRedirectsOnly(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        target = urljoin(req.full_url, newurl)
        if not allowed_url(target):
            raise ValueError("Redirect outside the official latest directory refused: " + target)
        return super().redirect_request(req, fp, code, msg, headers, target)


def fetch_text(url: str, timeout: float = 20.0) -> tuple[str, bytes]:
    if not allowed_url(url):
        raise ValueError("Only the official Core latest directory is allowed")
    req = Request(url, headers={"User-Agent": "CoreDocs-SourceInspector/1.0",
                                "Accept-Encoding": "identity"})
    with build_opener(OfficialRedirectsOnly).open(req, timeout=timeout) as response:
        raw = response.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise ValueError("Source exceeds the 4 MiB inspection limit")
    text = raw.decode("utf-8-sig")
    if not text.strip():
        raise ValueError("Empty response")
    return text, raw


class IndexLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.names: set[str] = set()

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        href = dict(attrs).get("href", "")
        url = urljoin(BASE, href)
        if not allowed_url(url):
            return
        tail = url[len(BASE):]
        if re.fullmatch(r"[A-Za-z0-9_-]+(?:\.min)?\.(?:js|css|html)", tail):
            self.names.add(tail)


def discover(index_html: str) -> list[str]:
    parser = IndexLinks()
    parser.feed(index_html)
    names = sorted(parser.names)
    if not names:
        raise ValueError("No source links found in the CDN index; inspection is incomplete")
    return names


def inspect_one(name: str, timeout: float) -> dict:
    url = BASE + name
    result = {"file": name, "url": url, "source_reviewed": False, "runtime_tested": False}
    try:
        text, raw = fetch_text(url, timeout)
        if re.match(r"\s*<(?:!doctype|html|head|body)\b", text, re.I):
            raise ValueError("Received HTML instead of JavaScript source")
        result.update(ok=True, bytes=len(raw), lines=len(text.splitlines()),
                      sha256=hashlib.sha256(raw).hexdigest())
    except (OSError, ValueError, UnicodeError, HTTPError, URLError) as exc:
        result.update(ok=False, error=str(exc))
    return result


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--audit", action="store_true", help="Fetch/hash ALL JS in the live CDN index")
    mode.add_argument("--show", metavar="FILENAME", help="Print one full source, e.g. popup.js or core.css")
    parser.add_argument("--timeout", type=float, default=20, help="Per-request timeout in seconds (1..120)")
    args = parser.parse_args(argv)
    if not 1 <= args.timeout <= 120:
        parser.error("--timeout must be between 1 and 120")
    try:
        index, _ = fetch_text(BASE, args.timeout)
        names = discover(index)
        if args.show:
            if args.show not in names:
                raise ValueError("File is not present in the current official index: " + args.show)
            text, raw = fetch_text(BASE + args.show, args.timeout)
            if args.show.endswith((".js", ".css")) and re.match(r"\s*<(?:!doctype|html|head|body)\b", text, re.I):
                raise ValueError("Received HTML instead of the requested source")
            print("Source: " + BASE + args.show, file=sys.stderr)
            print("SHA-256: " + hashlib.sha256(raw).hexdigest(), file=sys.stderr)
            sys.stdout.write(text)
            if not text.endswith("\n"):
                sys.stdout.write("\n")
            return 0
        js = [n for n in names if n.endswith(".js")]
        if not js:
            raise ValueError("The index contains no JavaScript; audit is incomplete")
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda name: inspect_one(name, args.timeout), js))
        missing = sorted(EXPECTED_JS.difference(js))
        ok = all(item["ok"] for item in results) and not missing
        print(json.dumps({"checked_at": datetime.now(timezone.utc).isoformat(),
                          "source": BASE, "all_listed_js_fetched": all(i["ok"] for i in results),
                          "missing_expected_entries": missing, "ok": ok,
                          "api_audit_complete": False,
                          "note": "Read sources and test API before use. HTTP/hash checks are not API documentation.",
                          "files": results}, ensure_ascii=False, indent=2))
        return 0 if ok else 1
    except (OSError, ValueError, UnicodeError, HTTPError, URLError) as exc:
        print(json.dumps({"ok": False, "source": BASE, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
