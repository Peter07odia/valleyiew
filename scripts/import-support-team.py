"""Import non-physician team members from the original public site backup.

Reads only the public team page data (doctors/index.txt) and staff photos from
the static export, plus the Peterborough site's confirmed staff, and writes
src/data/support-team.json. Run: python3 scripts/import-support-team.py
"""
from pathlib import Path
import json, re, shutil

root = Path(__file__).resolve().parents[1]
backup = Path('/Users/ifyodia/Downloads/backup-valleyviewmedical.ca-10-13-2026/public_html')
raw = (backup / 'doctors/index.txt').read_bytes()
text = raw.decode('utf-8')

def resolve(ref):
    """Next.js flight data stores long strings as `<id>:T<hex length>,<bytes>` rows."""
    if not ref or not ref.startswith('$'):
        return ref or ''
    m = re.search(rb'(?<![0-9a-f])' + re.escape(ref[1:].encode()) + rb':T([0-9a-f]+),', raw)
    return raw[m.end():m.end() + int(m.group(1), 16)].decode('utf-8') if m else ''

people = []
for m in re.finditer(r'\{[^{}]*"name":"[^"]+"[^{}]*\}', text):
    try:
        item = json.loads(m.group(0))
    except json.JSONDecodeError:
        continue
    if item.get('category') in ('staff', 'pharmacists', 'manager') and item not in people:
        people.append(item)

CATEGORY = {'staff': 'administrative', 'pharmacists': 'pharmacists', 'manager': 'management'}
profile_id = lambda name: re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

profiles, members = {}, []
(root / 'public/images/staff').mkdir(parents=True, exist_ok=True)
for item in people:
    bio = resolve(item.get('bio'))
    image = item['image']
    if image.startswith('/images/staff/'):
        src = backup / image.lstrip('/')
        shutil.copyfile(src, root / 'public' / image.lstrip('/'))
    else:
        image = '/images/branding/vvm-logo.png'
    pid = profile_id(item['name'])
    if bio:
        paragraphs = [p.strip() for p in bio.split('\n') if p.strip()]
        profile = profiles.setdefault(pid, {'id': pid, 'name': item['name'], 'image': image, 'paragraphs': [],
                                             'sourceUrl': 'https://valleyviewmedical.ca/doctors/'})
        # One person can appear in two groups; keep each distinct paragraph once.
        profile['paragraphs'] += [p for p in paragraphs if p not in profile['paragraphs']]
    members.append({'name': item['name'], 'title': item['title'], 'category': CATEGORY[item['category']],
                    'locationIds': item['locationSlugs'], 'image': image})

# Peterborough staff confirmed on the current Peterborough site (valleyviewpeterborough.ca).
members += [
    {'name': 'Musab Waseem', 'title': 'Clinic Manager', 'category': 'management',
     'locationIds': ['lansdowne-mall', 'peterborough-pharmacy'], 'image': '/images/staff/musab.jpg'},
    {'name': 'Jaspreet Kaur', 'title': 'Clinic Coordinator', 'category': 'administrative',
     'locationIds': ['lansdowne-mall', 'peterborough-pharmacy'], 'image': '/images/branding/vvm-logo.png'},
]
for member in members:
    pid = profile_id(member['name'])
    member['profileId'] = pid if pid in profiles else None

out = {'profiles': list(profiles.values()), 'members': members}
(root / 'src/data/support-team.json').write_text(json.dumps(out, indent=2, ensure_ascii=False) + '\n')
print(f"{len(members)} roles, {len(profiles)} profiles")
