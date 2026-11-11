#!/usr/bin/env python3
"""
Deterministic helper for Incremental Codebase Context Engine.
Python 3.10+. Read-only with respect to application source code.
Commands: status, index, verify.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

EXCLUDED_DIRS = {
    ".git", ".hg", ".svn", ".venv", "venv", "env", "__pycache__",
    "node_modules", "vendor", "dist", "build", "target", "coverage",
    ".next", ".nuxt", ".turbo", ".cache", ".pytest_cache", ".mypy_cache",
    ".ruff_cache", ".idea", ".vscode", ".gradle", "bin", "obj",
    ".context-engine"
}
EXCLUDED_NAMES = {
    ".env", ".env.local", ".env.production", "id_rsa", "id_ed25519",
    "credentials.json", "secrets.json"
}
MAX_FILE_BYTES = 2 * 1024 * 1024
ROOT = Path.cwd()
CTX = ROOT / ".context-engine"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def run_git(args: list[str]) -> subprocess.CompletedProcess[str] | None:
    try:
        return subprocess.run(
            ["git", *args], cwd=ROOT, text=True, encoding="utf-8",
            errors="replace", capture_output=True, check=False
        )
    except FileNotFoundError:
        return None


def git_root() -> Path | None:
    result = run_git(["rev-parse", "--show-toplevel"])
    if result is None or result.returncode != 0:
        return None
    return Path(result.stdout.strip()).resolve()


def git_status() -> dict:
    root = git_root()
    if root is None:
        return {
            "git_available": False,
            "message": "Not inside a Git repository or Git is unavailable.",
            "changed": [], "untracked": [], "deleted": [], "renamed": []
        }

    result = run_git(["status", "--short", "--untracked-files=all", "."])
    if result is None or result.returncode != 0:
        return {"git_available": True, "error": (result.stderr if result else "Git unavailable")}

    changed, untracked, deleted, renamed = [], [], [], []
    for line in result.stdout.splitlines():
        if len(line) < 4:
            continue
        status = line[:2]
        path = line[3:].strip()
        if " -> " in path:
            old, new = path.split(" -> ", 1)
            renamed.append({"from": old.strip('"'), "to": new.strip('"'), "status": status})
        elif status == "??":
            untracked.append(path.strip('"'))
        elif "D" in status:
            deleted.append(path.strip('"'))
        else:
            changed.append({"path": path.strip('"'), "status": status})

    head = run_git(["rev-parse", "HEAD"])
    return {
        "git_available": True,
        "repo_root": str(root),
        "head": head.stdout.strip() if head and head.returncode == 0 else None,
        "changed": changed,
        "untracked": untracked,
        "deleted": deleted,
        "renamed": renamed
    }


def iter_files():
    for current, dirs, names in os.walk(ROOT):
        dirs[:] = sorted(d for d in dirs if d not in EXCLUDED_DIRS)
        for name in sorted(names):
            if name in EXCLUDED_NAMES or name.endswith((".pyc", ".pyo", ".class", ".o", ".obj", ".webm", ".jpg", ".png", ".ico", ".svg", ".ttf")):
                continue
            path = Path(current) / name
            try:
                rel = path.relative_to(ROOT).as_posix()
                if path.is_symlink() or path.stat().st_size > MAX_FILE_BYTES:
                    continue
                yield path, rel
            except (OSError, ValueError):
                continue


def make_index():
    entries = []
    for path, rel in iter_files():
        try:
            data = path.read_bytes()
            # Skip likely binary files.
            if b"\x00" in data[:8192]:
                continue
            stat = path.stat()
            entries.append({
                "path": rel,
                "extension": path.suffix.lower(),
                "size_bytes": stat.st_size,
                "sha256": hashlib.sha256(data).hexdigest(),
                "modified_at": datetime.fromtimestamp(
                    stat.st_mtime, timezone.utc
                ).isoformat(timespec="seconds")
            })
        except OSError:
            continue

    payload = {
        "schema_version": 1,
        "generated_at": utc_now(),
        "root": str(ROOT),
        "file_count": len(entries),
        "files": entries
    }
    CTX.mkdir(parents=True, exist_ok=True)
    target = CTX / "file_index.json"
    target.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Indexed {len(entries)} files -> {target}")
    return payload


def verify():
    required = [
        "PROJECT_CONTEXT.md", "architecture.md", "project_map.md",
        "file_index.json", "dependency_graph.json", "metadata.json"
    ]
    missing = []
    placeholders = []
    for name in required:
        p = CTX / name
        if not p.exists():
            missing.append(name)
            continue
        if p.suffix == ".md":
            text = p.read_text(encoding="utf-8", errors="replace")
            if "PENDING INITIALIZATION" in text or "Status: PENDING" in text:
                placeholders.append(name)
        elif p.name == "metadata.json":
            try:
                meta = json.loads(p.read_text(encoding="utf-8"))
                if meta.get("initialization_status") != "complete":
                    placeholders.append(name)
            except json.JSONDecodeError:
                placeholders.append(name + " (invalid JSON)")
    print(json.dumps({
        "context_directory": str(CTX),
        "missing": missing,
        "pending_or_placeholder": placeholders,
        "ready": not missing and not placeholders
    }, indent=2))
    return 0 if not missing and not placeholders else 1


def main():
    parser = argparse.ArgumentParser(description="Incremental Context Engine helper")
    parser.add_argument("command", choices=["status", "index", "verify"])
    args = parser.parse_args()

    if args.command == "status":
        print(json.dumps(git_status(), indent=2, ensure_ascii=False))
        return 0
    if args.command == "index":
        make_index()
        return 0
    if args.command == "verify":
        return verify()
    return 2


if __name__ == "__main__":
    sys.exit(main())
