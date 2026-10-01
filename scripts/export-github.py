"""Export a self-contained repository without local working data or build output."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
out = root / 'output' / 'keys-github-ready.zip'
paths = ['.github', '.gitignore', '.nvmrc', 'README.md', 'PUBLISH.md',
         'package.json', 'package-lock.json', 'build.mjs', 'src', 'scripts',
         'tests', 'design', 'vendor/arbana/README.md', 'vendor/arbana/package.json',
         'vendor/arbana/source', 'vendor/arbana/src', 'vendor/arbana/scripts',
         'vendor/arbana/tests']
files = []
for name in paths:
    path = root / name
    if not path.exists():
        raise SystemExit(f'Missing required export input: {name}')
    for file in path.rglob('*') if path.is_dir() else [path]:
        if not file.is_file() or file.name == '.DS_Store' or '__pycache__' in file.parts:
            continue
        if file.is_symlink():
            raise SystemExit(f'Export does not allow symlinks: {file}')
        if file.stat().st_size >= 100 * 1024 * 1024:
            raise SystemExit(f'File exceeds GitHub regular file limit: {file}')
        files.append(file)
out.parent.mkdir(exist_ok=True)
with ZipFile(out, 'w', ZIP_DEFLATED, compresslevel=6) as archive:
    for file in sorted(set(files)):
        archive.write(file, 'keys-mobile/' + file.relative_to(root).as_posix())
print(f'{out}\n{len(set(files))} files, {out.stat().st_size / 1024 / 1024:.1f} MB')
