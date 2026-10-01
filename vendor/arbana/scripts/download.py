from pathlib import Path
import re, urllib.request, concurrent.futures, json
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'source'
ORIGIN='https://test.llmteam.tech'
known=set()
fail=[]
def download(path):
    target=SOURCE/path.lstrip('/')
    if target.exists(): return path,target.read_bytes()
    try:
        data=urllib.request.urlopen(ORIGIN+path,timeout=45).read()
        if data.startswith(b'<!doctype') and not path.endswith('.html'): raise ValueError('HTML fallback')
        target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
        return path,data
    except Exception as e: fail.append((path,str(e)));return path,b''
def discover(s):
    paths=set(re.findall(r'["\x27`](/(?:images|videos|icons|assets)/[^"\x27`\s?]+)["\x27`]',s))
    paths.update('/assets/'+x for x in re.findall(r'["\x27`](?:\./|assets/)([^"\x27`\s]+\.(?:js|css))["\x27`]',s))
    paths.update(re.findall(r'url\(["\x27]?(/[^)"\x27]+)',s))
    return {x for x in paths if '${' not in x}
pending=discover((SOURCE/'index-C4VobzN0.js').read_text()+(SOURCE/'index-CB6t6fWP.css').read_text())|{'/manifest.webmanifest','/icons/favicon-64.png','/icons/apple-touch-icon.png'}
while pending:
    batch=pending-known;known.update(batch)
    if not batch:break
    pending=set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        for path,data in pool.map(download,sorted(batch)):
            if path.endswith(('.js','.css','.webmanifest')):
                pending.update(discover(data.decode()))
    print(f'Downloaded {len(known)} files; failures {len(fail)}',flush=True)
(SOURCE/'asset-report.json').write_text(json.dumps({'files':sorted(known),'failures':fail},ensure_ascii=False,indent=2))
