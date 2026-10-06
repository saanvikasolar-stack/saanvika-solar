import math, wave, struct, random
SR=48000
def write(name, samples, gain=0.9):
    m=max(1e-9,max(abs(s) for s in samples)); 
    with wave.open(f'sfx/{name}.wav','wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        frames=b''.join(struct.pack('<hh', int(32767*gain*s/m), int(32767*gain*s/m)) for s in samples)
        w.writeframes(frames)
def env(t, a, d): return min(1,t/a) * math.exp(-d*max(0,t-a))
def boing():
    out=[]
    for i in range(int(SR*0.6)):
        t=i/SR; f=380*math.exp(-1.8*t)+40*math.sin(2*math.pi*9*t)
        out.append(math.sin(2*math.pi*f*t*(1+0.15*math.sin(2*math.pi*11*t)))*env(t,0.005,5))
    return out
def record_scratch():
    out=[]; random.seed(3); ph=0.0
    for i in range(int(SR*0.5)):
        t=i/SR; f=1600*math.exp(-4*t)+200
        ph+=2*math.pi*f/SR
        n=random.uniform(-1,1)
        s=(0.55*math.sin(ph)+0.45*n)*(0.3+0.7*abs(math.sin(2*math.pi*18*t)))*env(t,0.005,4)
        out.append(s)
    return out
def dramatic_sting():
    out=[]
    notes=[(0.0,0.28,110),(0.32,0.28,103.8),(0.66,1.5,82.4)]
    N=int(SR*2.2)
    for i in range(N):
        t=i/SR; s=0
        for st,du,f in notes:
            if t>=st:
                tt=t-st; e=env(tt,0.01,1.2 if du>1 else 7)
                s+= (math.sin(2*math.pi*f*tt)+0.5*math.sin(2*math.pi*2*f*tt)+0.25*math.sin(2*math.pi*3*f*tt))*e*(1 if tt<du+0.6 else 0)
        out.append(math.tanh(1.6*s))
    return out
def cash_register():
    out=[]; random.seed(5)
    for i in range(int(SR*0.7)):
        t=i/SR; s=0
        if t<0.05: s+=random.uniform(-1,1)*0.6*env(t,0.002,40)
        s+=math.sin(2*math.pi*2600*t)*env(t,0.002,16)*0.8
        if t>0.13:
            tt=t-0.13; s+=math.sin(2*math.pi*3900*tt)*env(tt,0.002,14)*0.7
        if t>0.26:
            tt=t-0.26; s+=(math.sin(2*math.pi*2093*tt)+0.5*math.sin(2*math.pi*4186*tt))*env(tt,0.002,5)*0.6
        out.append(s)
    return out
def whoosh():
    out=[]; random.seed(7); lp=0
    for i in range(int(SR*0.45)):
        t=i/SR; n=random.uniform(-1,1); lp=lp+0.15*(n-lp)
        out.append(lp*math.sin(math.pi*t/0.45)**2)
    return out
def pop():
    out=[]
    for i in range(int(SR*0.15)):
        t=i/SR; f=700+600*math.exp(-30*t)
        out.append(math.sin(2*math.pi*f*t)*env(t,0.002,30))
    return out
def ding():
    out=[]
    for i in range(int(SR*1.0)):
        t=i/SR
        out.append((math.sin(2*math.pi*1760*t)+0.4*math.sin(2*math.pi*2637*t)+0.2*math.sin(2*math.pi*3520*t))*env(t,0.002,3.5))
    return out
def drumroll():
    out=[]; random.seed(11)
    for i in range(int(SR*1.3)):
        t=i/SR; ph=(t%0.065)
        out.append(random.uniform(-1,1)*(math.exp(-ph*90))*(0.6+0.4*t/1.3))
    return out
def slap():
    out=[]; random.seed(13)
    for i in range(int(SR*0.25)):
        t=i/SR; out.append(random.uniform(-1,1)*env(t,0.001,35)+0.5*math.sin(2*math.pi*180*t)*env(t,0.001,25))
    return out
for n,f in [('boing',boing),('record_scratch',record_scratch),('dramatic_sting',dramatic_sting),('cash_register',cash_register),('whoosh',whoosh),('pop',pop),('ding',ding),('drumroll',drumroll),('slap',slap)]:
    write(n,f()); print(n,'ok')
