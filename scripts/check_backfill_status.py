#!/usr/bin/env python3
"""
Compatibility wrapper for historical cron jobs that still invoke
`scripts/check_backfill_status.py` from the repo root.
Delegates to the relocated implementation under `src/scripts/scripts` e
 garante que as variáveis do `.env` e o virtualenv do projeto sejam
carregados antes da execução.
"""
from __future__ import annotations

import os
import runpy
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = REPO_ROOT / '.env'
VENV_PYTHON = REPO_ROOT / 'venv' / 'bin' / 'python'
BOOTSTRAP_FLAG = 'CHECK_BACKFILL_BOOTSTRAPPED'
DELEGATE = REPO_ROOT / 'src' / 'scripts' / 'scripts' / 'check_backfill_status.py'


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding='utf-8').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#'):
            continue
        if line.lower().startswith('export '):
            line = line.split(None, 1)[1]
        if '=' not in line:
            continue
        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip()
        if not key:
            continue
        if value and len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
            value = value[1:-1]
        os.environ.setdefault(key, value)


def _ensure_venv_python() -> None:
    if os.environ.get(BOOTSTRAP_FLAG) == '1':
        return
    if not VENV_PYTHON.exists():
        return

    current = Path(sys.executable).resolve()
    target = VENV_PYTHON.resolve()
    if current == target:
        return

    env = os.environ.copy()
    env[BOOTSTRAP_FLAG] = '1'
    argv = [str(target), str(Path(__file__).resolve()), *sys.argv[1:]]
    os.execve(str(target), argv, env)


def main() -> None:
    _load_env_file(ENV_FILE)
    _ensure_venv_python()

    if not DELEGATE.exists():
        raise SystemExit(f'Delegate script not found at {DELEGATE}')
    runpy.run_path(str(DELEGATE), run_name='__main__')


if __name__ == '__main__':
    main()
