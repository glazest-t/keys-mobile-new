"""Package the standalone UI kit, never the workspace or private configuration."""
from pathlib import Path
import json, zipfile, re
root=Path(__file__).resolve().parents[1]
source=root/'dist/ui-kit'
if not (source/'manifest.json').is_file():
    raise SystemExit('Run npm run build first')
config=(source/'reference-app/maps/config.js').read_text()
if config.strip()!='globalThis.KeysMapsConfig={apiKey:"",styleId:""};':
    raise SystemExit('Refusing to export nonempty map configuration')
forbidden={'.env','.env.local','.DS_Store'}
files=[p for p in source.rglob('*') if p.is_file()]
if any(p.name in forbidden or 'node_modules' in p.parts for p in files):
    raise SystemExit('Unexpected private/build file in UI kit')
out=root/'output/UI-kit-Keys-1.0.zip';out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in sorted(files):z.write(p,Path('UI-kit-Keys')/p.relative_to(source))
print(f'{out}\n{len(files)} files · {out.stat().st_size/1024/1024:.1f} MB')
