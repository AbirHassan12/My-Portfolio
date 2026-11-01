export const noise = `float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p*=2.;a*=.5;}return s;}`
export const vs = `varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 m=modelViewMatrix*vec4(position,1.);vV=normalize(-m.xyz);gl_Position=projectionMatrix*m;}`
export const planet = `uniform float t;uniform vec3 L;varying vec3 vP,vN,vV;void main(){float f=fbm(vP*1.6+vec3(t*.02,0,0));vec3 c=mix(vec3(.06,.04,.3),vec3(.49,.36,1.),smoothstep(.35,.6,f));c=mix(c,vec3(0.,.85,1.),smoothstep(.62,.8,f)*.7);float d=max(dot(normalize(vN),L),0.);c*=.12+d*1.2;gl_FragColor=vec4(c,1.);}`
export const cloud = `uniform float t;uniform vec3 L;varying vec3 vP,vN,vV;void main(){float f=smoothstep(.5,.8,fbm(vP*2.4+vec3(t*.05)));float d=max(dot(normalize(vN),L),0.)+.15;gl_FragColor=vec4(vec3(.9,.9,1.)*d,f*.55);}`
export const atm = `uniform float k;varying vec3 vN,vV;void main(){float i=pow(.72-dot(normalize(vN),vV),2.5)*k;gl_FragColor=vec4(mix(vec3(.49,.36,1.),vec3(0.,.85,1.),.5),1.)*i;}`
export const diskVert = `varying vec2 u;void main(){u=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
export const disk = `uniform float t,k;varying vec2 u;void main(){float r=length(u),a=atan(u.y,u.x);float f=(1.-smoothstep(3.,7.,r))*smoothstep(2.6,3.4,r);float b=.6+.4*sin(a*6.+t*2.-r*3.);vec3 c=mix(vec3(0.,.85,1.),vec3(.7,.4,1.),smoothstep(3.,6.,r));gl_FragColor=vec4(c*b*k,f);}`
export const nebVert = `varying vec2 u;void main(){u=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
export const nebula = `uniform vec3 c;varying vec2 u;void main(){vec2 d=u-.5;float r=1.-smoothstep(0.,.5,length(d));float f=fbm(vec3(u*4.,1.));gl_FragColor=vec4(c,r*r*f*.55);}`
