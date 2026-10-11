from PIL import Image,ImageDraw
r=Image.open(r'C:/Users/MOHAME~1.SHA/AppData/Local/Temp/codex-clipboard-afefdfd1-c026-4304-b010-8af6378ab913.png').convert('RGB')
panels={'about':(1071,12,1520,437),'projects':(16,450,556,821),'skills':(1071,452,1520,800),'experience':(16,830,556,1024),'certifications':(567,821,1061,1024),'contact':(1071,816,1520,1024),'case':(567,450,1061,812)}
canvas=Image.new('RGB',(1500,2400),'#202a34'); d=ImageDraw.Draw(canvas); y=10
for name,box in panels.items():
 src=r.crop(box); cur=Image.open('screenshots/audit/before/'+name+'.png').convert('RGB'); w=600; sh=int(src.height*w/src.width); ch=int(cur.height*w/cur.width)
 d.text((15,y),name+' REFERENCE',fill='white');d.text((760,y),name+' BEFORE',fill='white');y+=20
 canvas.paste(src.resize((w,sh)),(15,y));canvas.paste(cur.resize((w,ch)),(760,y));y+=max(sh,ch)+25
canvas.crop((0,0,1500,min(y,2400))).save('screenshots/audit/baseline-sections.jpg')
