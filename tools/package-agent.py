#!/usr/bin/env python3
"""Package the built agent documentation with Python's standard library."""
from pathlib import Path
import posixpath
import re
import sys
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


def package_agent(root: Path) -> None:
    files = [root / name for name in ["AGENTS.md", "README.md", "chapters.json"]]
    files += sorted((root / "chapters").glob("*.md"))
    files += sorted((root / "reference").glob("*.json"))
    links = re.compile(r"https://nikitakozin\.github\.io/core-docs/([^\s)\"<>?#]+\.(?:md|json))")
    with ZipFile(root / "core-agent.zip", "w") as archive:
        for path in sorted(files):
            name = path.relative_to(root).as_posix()
            text = path.read_text(encoding="utf-8")
            if path.suffix == ".md":
                text = links.sub(lambda match: posixpath.relpath(match[1], posixpath.dirname(name) or "."), text)
            entry = ZipInfo("core/" + name, date_time=(1980, 1, 1, 0, 0, 0))
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, text.encode("utf-8"), compress_type=ZIP_DEFLATED, compresslevel=9)
    print(f"Packaged {len(files)} agent files: {root / 'core-agent.zip'}")


if __name__ == "__main__":
    package_agent(Path(sys.argv[1] if len(sys.argv) > 1 else "docs"))
