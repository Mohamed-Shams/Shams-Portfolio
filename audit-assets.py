from PIL import Image
r=Image.open(r'C:/Users/MOHAME~1.SHA/AppData/Local/Temp/codex-clipboard-afefdfd1-c026-4304-b010-8af6378ab913.png')
for name,box in {'refinery':(715,211,791,361),'juice-card':(208,524,367,600),'cert-ignition':(586,891,626,933),'cert-aws':(753,891,786,933),'cert-aveva':(907,891,947,933),'cert-dataiku':(586,961,626,1003),'cert-siemens':(907,961,947,1003),'signature':(1101,279,1239,312)}.items():
 r.crop(box).save('public/assets/'+name+'.webp',quality=96)
