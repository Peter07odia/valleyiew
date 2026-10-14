from pathlib import Path
from html.parser import HTMLParser
import json,re,shutil
root=Path(__file__).resolve().parents[1]
backup=Path('/Users/ifyodia/Downloads/backup-valleyviewmedical.ca-10-13-2026/public_html')
class Node:
 def __init__(self,tag='',attrs=(),parent=None): self.tag=tag;self.attrs=dict(attrs);self.parent=parent;self.children=[]
 def text(self): return ''.join(x if isinstance(x,str) else x.text() for x in self.children)
 def find(self,part):
  for c in self.children:
   if isinstance(c,Node):
    if part in c.attrs.get('class',''): yield c
    yield from c.find(part)
class Parser(HTMLParser):
 def __init__(self): super().__init__();self.root=Node();self.current=self.root
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs,self.current);self.current.children.append(n)
  if tag not in ('img','meta','link','input','br','hr','source','wbr','area','base','embed'):self.current=n
 def handle_startendtag(self,t,a): self.handle_starttag(t,a)
 def handle_endtag(self,t):
  n=self.current
  while n.parent:
   if n.tag==t:self.current=n.parent;break
   n=n.parent
 def handle_data(self,d):self.current.children.append(d)
data=json.loads((root.parent/'reviews/vvm-handoff-2026-10-14/source/data/locations.json').read_text())
locations=[]
ids={'brantford-lynden-road':'lynden-road','brantford-colborne':'colborne-east','peterborough-lansdowne-mall':'lansdowne-mall'}
days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
for l in data['locations']:
 hours=[]
 for day,key in zip(days,['mon','tue','wed','thu','fri','sat','sun']):
  unknown=isinstance(l['hours'],str) or (l['slug'] in ['oshawa','courtice'] and key in ['sat','sun'])
  v=None if unknown else l['hours'][key]
  hours.append(dict(day=day,open=v[0] if v else '',close=v[1] if v else '',isClosed=not unknown and v is None,status='to-be-confirmed' if unknown else 'confirmed'))
 a=l['address']; clean=lambda v: '' if not v or 'TODO_CONFIRM' in v else v
 locations.append(dict(id=ids.get(l['slug'],l['slug']),slug=l['slug'],region=l['region'],name='Valleyview Medical Centre - '+l['short_name'].split(' (')[0] if l['region']=='durham' else l['name'].replace('Valley View','Valleyview').replace(' – ',' - '),shortName=l['short_name'],address=a['street'],city=a['city'],province=a['province'],postalCode=clean(a['postal_code']),postalCodeStatus='confirmed' if clean(a['postal_code']) else 'to-be-confirmed',phone=l['phone'],fax=clean(l.get('fax')),email=clean(l.get('email')),contactStatus='confirmed',bookingUrl=l['ocean_booking'],hours=hours,doctorIds=[d.removeprefix('dr-').replace('olugbenga-oluwafunmilade-ajayi','olugbenga-ajayi') for d in l['doctors']]))
(root/'src/data/locations.json').write_text(json.dumps(locations,indent=2)+'\n')
doctors=[]
for file in (backup/'doctors').glob('*/index.html'):
 p=Parser();p.feed(file.read_text()); n=p.root
 def text(part):return next((x.text().strip() for x in n.find(part)), '')
 photo=next(n.find('__fillImage'),None)
 src=photo.attrs.get('src') if photo else '/images/doctors/logo.png'
 dest=root/'public'/src.lstrip('/'); dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(backup/src.lstrip('/'),dest)
 doctors.append(dict(id=file.parent.name.removeprefix('dr-'),name=text('__detailName'),role=((text('__detailCredentials')+' | ') if text('__detailCredentials') else '')+text('__detailTitle'),paragraphs=[p.strip() for p in text('__detailBio').split('\n\n') if p.strip()],image=src,sourceUrl='https://valleyviewmedical.ca/doctors/'+file.parent.name+'/'))
# Preserve original carousel order, then remaining doctors.
order=[d['slug'].removeprefix('dr-').replace('olugbenga-oluwafunmilade-ajayi','olugbenga-ajayi') for d in data['doctors']]
doctors.sort(key=lambda d: order.index(d['id']))
(root/'src/data/durham-doctors.json').write_text(json.dumps(doctors,indent=2,ensure_ascii=False)+'\n')
print(f'Imported {len(locations)} locations and {len(doctors)} Durham biographies/photos.')
