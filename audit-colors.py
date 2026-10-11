from PIL import Image
r=Image.open(r'C:/Users/MOHAME~1.SHA/AppData/Local/Temp/codex-clipboard-afefdfd1-c026-4304-b010-8af6378ab913.png').convert('RGB')
for name,box in {'hero_background':(30,55,60,65),'about_background':(1080,25,1110,35),'card_surface':(45,650,60,665),'skills_surface':(1120,760,1160,770),'page_gutter':(558,455,565,800)}.items():
 im=r.crop(box);vals=sorted(im.getdata());n=len(vals);print(name,vals[n//2])
