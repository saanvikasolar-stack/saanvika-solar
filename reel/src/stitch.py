import sys
from PIL import Image, ImageFilter
out=sys.argv[1]; files=sys.argv[2:11]
T='/root/.claude/projects/-home-user-saanvika-solar/001dd869-dfe5-5ea8-8e83-d84f27c82793/tool-results/'
tiles=[Image.open(T+f).convert('RGB') for f in files]
tw,th=tiles[0].size
sx=tw/1080; sy=th/1920
W=round(3080*sx); H=round(5481*sy)
canvas=Image.new('RGB',(W,H))
# paste in reverse so that overlaps are covered consistently; use feathered masks on overlaps
for idx,t in enumerate(tiles):
    i=idx%3; j=idx//3
    x=round(i*1000*sx); y=round(j*1780*sy)
    canvas.paste(t,(x,y))
canvas=canvas.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
canvas.save(out, quality=93); print(out, canvas.size)
