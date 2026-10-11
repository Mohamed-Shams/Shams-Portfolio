from PIL import Image
from pathlib import Path
import shutil
out=Path('public/assets')
r=Image.open(r'C:/Users/MOHAME~1.SHA/AppData/Local/Temp/codex-clipboard-afefdfd1-c026-4304-b010-8af6378ab913.png')
for name,box in {'air':(33,523,193,600),'juice':(580,558,839,726),'wells':(382,524,538,600),'city':(33,688,193,742),'drilling':(208,688,366,742),'water':(382,688,538,742),'plant':(18,355,306,438),'about':(1349,47,1488,272)}.items():
 r.crop(box).save(out/(name+'.webp'),quality=94)
Image.open(r'D:/Users/mohamed.shams/Downloads/profile-Krt68yLu.png').save(out/'portrait.webp',quality=94)
shutil.copyfile(r'D:/Users/mohamed.shams/Downloads/Mohamed_Ahmed_Shams_Portfolio_Complete/Mohamed-Shams-Portfolio/static/assets/MohamedAhmedShams_CV.pdf',out/'MohamedAhmedShams_CV.pdf')

