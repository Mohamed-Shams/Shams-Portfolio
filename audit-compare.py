from PIL import Image,ImageDraw
from pathlib import Path
out=Path('screenshots/audit/comparisons');out.mkdir(exist_ok=True)
r=Image.open(r'C:/Users/MOHAME~1.SHA/AppData/Local/Temp/codex-clipboard-afefdfd1-c026-4304-b010-8af6378ab913.png').convert('RGB')
panels={'about':(1071,12,1520,437),'projects':(16,450,556,821),'skills':(1071,452,1520,800),'experience':(16,830,556,1024),'certifications':(567,821,1061,1024),'contact':(1071,816,1520,1024),'case':(567,450,1061,812),'desktop-hero':(16,12,793,439),'arabic-mobile':(821,30,1041,486)}
for name,box in panels.items():
 imgs=[r.crop(box)]
 for phase in ['before','after']:
  file='en-desktop-hero.png' if name=='desktop-hero' else 'ar-mobile-hero.png' if name=='arabic-mobile' else name+'.png'
  im=Image.open('screenshots/audit/'+phase+'/'+file).convert('RGB')
  if name=='desktop-hero':im=im.crop((0,0,1440,800))
  imgs.append(im)
 w=390 if name=='arabic-mobile' else 560
 scaled=[im.resize((w,round(im.height*w/im.width)),Image.Resampling.LANCZOS) for im in imgs]
 h=max(im.height for im in scaled)+55
 c=Image.new('RGB',(w*3+40,h),'#1b252f');d=ImageDraw.Draw(c)
 for i,(label,im) in enumerate(zip(['REFERENCE','BEFORE','AFTER'],scaled)):
  x=10+i*(w+10);d.text((x,13),name.upper()+' / '+label,fill='#f1a342');c.paste(im,(x,40))
 c.save(out/(name+'.jpg'),quality=94)
 # An overlay is useful for geometry, not as a fidelity score: content/images differ.
 if name in ['desktop-hero','arabic-mobile']:
  base=scaled[0];actual=scaled[2].resize(base.size)
  Image.blend(base,actual,.5).save(out/(name+'-overlay.jpg'),quality=94)
