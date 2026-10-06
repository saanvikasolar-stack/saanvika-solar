import subprocess, sys
T = float(sys.argv[1]) if len(sys.argv) > 1 else 30.5
OUT = sys.argv[2] if len(sys.argv) > 2 else 'sfx_mix.wav'
# (time s, file, gain)
cues = [
 (0.05,'dramatic_sting',0.9),(0.72,'slap',0.8),
 (1.80,'whoosh',0.9),(2.00,'pop',0.8),(2.25,'pop',0.7),(2.70,'ding',0.7),
 (4.60,'record_scratch',0.9),(5.05,'slap',0.5),
 (7.00,'ding',0.7),(7.50,'pop',0.6),
 (9.60,'boing',0.85),(10.45,'boing',0.7),(11.15,'pop',0.8),
 (12.00,'whoosh',0.6),(12.15,'pop',0.7),(12.9,'ding',0.5),(13.2,'pop',0.6),
 (14.40,'whoosh',0.5),(14.60,'pop',0.8),(14.70,'pop',0.8),
 (16.80,'dramatic_sting',0.95),(17.00,'slap',0.7),(17.9,'boing',0.6),
 (19.00,'whoosh',0.9),(19.72,'slap',0.9),(19.75,'ding',0.8),(19.9,'pop',0.6),
 (21.30,'ding',0.6),(22.00,'whoosh',0.7),
 (23.40,'whoosh',0.7),(23.5,'pop',0.6),(24.30,'cash_register',0.95),(25.10,'drumroll',0.5),
 (26.40,'whoosh',0.8),(26.60,'slap',0.8),(26.62,'pop',0.9),(27.40,'ding',0.8),(29.0,'pop',0.6),
]
inputs=[]; fc=[]
for i,(t,f,g) in enumerate(cues):
    inputs += ['-i', f'sfx/{f}.wav']
    fc.append(f'[{i}]volume={g},adelay={int(t*1000)}|{int(t*1000)}[a{i}]')
mix = ''.join(f'[a{i}]' for i in range(len(cues))) + f'amix=inputs={len(cues)}:normalize=0,apad=whole_dur={T},alimiter=limit=0.9,afade=t=out:st={T-0.6}:d=0.6,atrim=0:{T}[out]'
cmd = ['ffmpeg','-y','-loglevel','error'] + inputs + ['-filter_complex', ';'.join(fc)+';'+mix, '-map','[out]','-ar','48000','-ac','2', OUT]
subprocess.run(cmd, check=True)
print('mixed', OUT, len(cues), 'cues')
