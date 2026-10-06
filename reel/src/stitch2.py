import sys, json
from PIL import Image, ImageFilter
# usage: stitch2.py out.jpg f1..f9  (blob basenames in tool-results dir)
out=sys.argv[1]; files=sys.argv[2:11]
T='/root/.claude/projects/-home-user-saanvika-solar/001dd869-dfe5-5ea8-8e83-d84f27c82793/tool-results/'
tiles=[Image.open(T+f).convert('RGB') for f in files]
tw,th=tiles[0].size; sx=tw/1080; sy=th/1920
W=round(3080*sx); H=round(5481*sy)
canvas=Image.new('RGB',(W,H))
for idx,t in enumerate(tiles):
    i=idx%3; j=idx//3
    canvas.paste(t,(round(i*1000*sx),round(j*1780*sy)))
canvas=canvas.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
canvas.save(out, quality=93); print(out, canvas.size)
