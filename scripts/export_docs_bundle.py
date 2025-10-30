#!/usr/bin/env python3
import datetime, pathlib
from pathlib import Path

FILES = [
    'docs/hb_agro_intel/dds.md',
    'docs/hb_agro_intel/srs.md',
    'docs/hb_agro_intel/roadmap.md',
    'docs/hb_agro_intel/project_status.md',
    'docs/hb_agro_intel/user_stories.md',
]

out_dir = Path('docs/hb_agro_intel/exports')
out_dir.mkdir(parents=True, exist_ok=True)
out = out_dir / f"intellicore_docs_{datetime.date.today().strftime('%Y%m%d')}.md"

with open(out, 'w', encoding='utf-8') as w:
    w.write(f"# Intellicore — Documentação Completa ({datetime.date.today()})\n\n")
    for p in FILES:
        w.write(f"\n---\n\n## {Path(p).name}\n\n")
        with open(p, 'r', encoding='utf-8') as r:
            w.write(r.read())
            w.write("\n")

print(out)
