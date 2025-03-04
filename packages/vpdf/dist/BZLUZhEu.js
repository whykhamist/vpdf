import { defineComponent as m, ref as x, computed as r, createBlock as g, watch as v, onMounted as b, openBlock as d, resolveDynamicComponent as u, normalizeClass as h, nextTick as k, createElementBlock as w, createVNode as i, createElementVNode as a, unref as _, toDisplayString as l } from "vue";
import { _ as y } from "./_V6eeIlB.js";
import { d as j, y as z } from "./DYig_lRG.js";
const C = 4, B = 4, E = 4, P = 4, q = 4, N = 4, $ = 4, D = 5, L = 4, V = 4, A = 4, F = 5, I = 4, M = 4, S = 4, T = 4, G = 6, H = 4, J = 5, K = 4, O = 4, Q = 4, R = 4, U = 4, W = 4, X = 4, Y = 4, Z = 4, s4 = 4, t4 = 4, o4 = 4, e4 = 4, p4 = 4, n4 = 5, c4 = 4, a4 = 5, i4 = 4, l4 = 4, m4 = 5, r4 = 17, d4 = 5, f4 = 6, x4 = 4, g4 = 5, v4 = 4, b4 = 4, u4 = 4, h4 = 4, k4 = 4, w4 = 4, _4 = 4, y4 = 4, j4 = 4, z4 = 4, C4 = 4, B4 = 4, E4 = 5, P4 = 5, q4 = 6, N4 = 5, $4 = 4, D4 = 5, L4 = 6, V4 = 4, A4 = 6, F4 = 4, I4 = 4, M4 = 5, S4 = 8, T4 = 4, G4 = 5, H4 = 4, J4 = 4, K4 = 4, O4 = 6, Q4 = 4, R4 = 4, U4 = 5, W4 = 4, X4 = 4, Y4 = 4, Z4 = 4, ss = 4, ts = 4, os = 4, es = 4, ps = 4, ns = 4, cs = 4, as = 4, is = 5, ls = 5, ms = 5, rs = 5, ds = 5, fs = 5, xs = 5, gs = 5, vs = 7, bs = 10, us = 10, hs = 5, ks = 4, ws = 4, _s = 4, ys = 5, js = 4, zs = 4, Cs = 4, Bs = 4, Es = 5, Ps = 4, qs = 4, Ns = 4, $s = 4, Ds = 4, Ls = 4, Vs = 4, As = 4, Fs = 5, Is = 4, Ms = 5, Ss = 2, Ts = 5, Gs = 4, Hs = 4, Js = 6, Ks = 4, Os = 4, Qs = 5, Rs = 4, Us = 4, Ws = 5, Xs = 4, Ys = 4, Zs = 4, st = 6, tt = 4, ot = 5, et = 4, pt = 4, nt = 5, ct = 5, at = 5, it = 5, lt = 4, mt = 4, rt = 4, dt = 4, ft = 4, xt = 4, gt = 4, vt = 4, bt = 5, ut = 4, ht = 5, kt = 7, wt = 4, _t = 4, yt = 4, jt = 6, zt = 4, Ct = 4, Bt = 5, Et = 4, Pt = 9, qt = 9, Nt = 5, $t = 5, Dt = 5, Lt = 4, Vt = 6, At = 10, Ft = 5, It = 4, Mt = 4, St = 5, Tt = 4, Gt = 5, Ht = 5, Jt = 4, Kt = 4, Ot = 4, Qt = 4, Rt = 4, Ut = 4, Wt = 5, Xt = 4, Yt = 4, Zt = 4, so = 4, to = 4, oo = 5, eo = 5, po = 4, no = 4, co = 5, ao = 4, io = 5, lo = 7, mo = 7, ro = 4, fo = 4, xo = 4, go = 4, vo = 7, bo = 4, uo = 4, ho = 4, ko = 4, wo = 4, _o = 4, yo = 4, jo = 4, zo = 4, Co = 4, Bo = 4, Eo = 4, Po = 4, qo = 4, No = 9, $o = 4, Do = 4, Lo = 4, Vo = 4, Ao = 9, Fo = 9, Io = 4, Mo = 4, So = 4, To = 5, Go = 5, Ho = 8, Jo = 4, Ko = 4, Oo = 4, Qo = 5, Ro = 4, Uo = 6, Wo = 4, Xo = 4, Yo = 6, Zo = 5, se = 6, te = 5, oe = 5, ee = 4, pe = 4, ne = 7, ce = 4, ae = 5, ie = 4, le = 4, me = 4, re = 4, de = 4, fe = 7, xe = 5, ge = 4, ve = 4, be = 4, ue = 7, he = 10, ke = 7, we = 5, _e = 4, ye = 4, je = 4, ze = 5, Ce = 5, Be = 5, Ee = 5, Pe = 5, qe = 5, Ne = 4, $e = 4, De = 13, Le = 4, Ve = 5, Ae = 6, Fe = 5, Ie = 5, Me = 5, Se = 4, Te = 4, Ge = 4, He = 4, Je = 5, Ke = 4, Oe = 4, Qe = 4, Re = 4, Ue = 4, We = 5, Xe = 4, Ye = 4, Ze = 4, sp = 5, tp = 4, op = 4, ep = 4, pp = 4, np = 4, cp = 4, ap = 4, ip = 4, lp = 4, mp = 4, rp = 4, dp = 4, fp = 6, xp = 4, gp = 5, vp = 5, bp = 4, up = 5, hp = 7, kp = 4, wp = 5, _p = 4, yp = 4, jp = 4, zp = 4, Cp = 4, Bp = 5, Ep = 5, Pp = 4, qp = 4, Np = 4, $p = 4, Dp = 4, Lp = 4, Vp = 5, Ap = 4, Fp = 5, Ip = 5, Mp = 6, Sp = 4, Tp = 5, Gp = 5, Hp = 4, Jp = 4, Kp = 5, Op = 4, Qp = 4, Rp = 5, Up = 4, Wp = 6, Xp = 4, Yp = 5, Zp = 6, sn = 6, tn = 5, on = 7, en = 5, pn = 4, nn = 5, cn = 4, an = 7, ln = 7, mn = 7, rn = 7, dn = 7, fn = 9, xn = 4, gn = 5, vn = 6, bn = 4, un = 5, hn = 4, kn = 4, wn = 4, _n = 5, yn = 5, jn = 5, zn = 4, Cn = 4, Bn = 4, En = 4, Pn = 4, qn = 4, Nn = 4, $n = 4, Dn = 4, Ln = 4, Vn = 4, An = 4, Fn = 4, In = 4, Mn = 4, Sn = 4, Tn = 4, Gn = 5, Hn = 4, Jn = 4, Kn = 4, On = 4, Qn = 4, Rn = 4, Un = 4, Wn = {
  aa: C,
  aac: B,
  ac: E,
  accdb: P,
  accdt: q,
  ace: N,
  adn: $,
  ai: D,
  aif: L,
  aifc: V,
  aiff: A,
  ait: F,
  amr: I,
  ani: M,
  apk: S,
  app: T,
  applescript: G,
  asax: H,
  asc: J,
  ascx: K,
  asf: O,
  ash: Q,
  ashx: R,
  asm: U,
  asmx: W,
  asp: X,
  aspx: Y,
  asx: Z,
  au: s4,
  aup: t4,
  avi: o4,
  axd: e4,
  aze: p4,
  bak: n4,
  bash: c4,
  bat: a4,
  bin: i4,
  blank: l4,
  bmp: m4,
  bowerrc: r4,
  bpg: d4,
  browser: f4,
  bz2: x4,
  bzempty: g4,
  c: v4,
  cab: b4,
  cad: u4,
  caf: h4,
  cal: k4,
  cd: w4,
  cdda: _4,
  cer: y4,
  cfg: j4,
  cfm: z4,
  cfml: C4,
  cgi: B4,
  chm: E4,
  class: 7,
  cmd: P4,
  "code-workspace": 5,
  codekit: q4,
  coffee: N4,
  coffeelintignore: $4,
  com: D4,
  compile: L4,
  conf: V4,
  config: A4,
  cpp: F4,
  cptx: I4,
  cr2: M4,
  crdownload: S4,
  crt: T4,
  crypt: G4,
  cs: H4,
  csh: J4,
  cson: K4,
  csproj: O4,
  css: Q4,
  csv: R4,
  cue: U4,
  cur: W4,
  dart: X4,
  dat: Y4,
  data: Z4,
  db: ss,
  dbf: ts,
  deb: os,
  default: 6,
  dgn: es,
  dist: ps,
  diz: ns,
  dll: cs,
  dmg: as,
  dng: is,
  doc: ls,
  docb: ms,
  docm: rs,
  docx: ds,
  dot: fs,
  dotm: xs,
  dotx: gs,
  download: vs,
  dpj: bs,
  ds_store: us,
  dsn: hs,
  dtd: ks,
  dwg: ws,
  dxf: _s,
  editorconfig: ys,
  el: js,
  elf: zs,
  eml: Cs,
  enc: Bs,
  eot: Es,
  eps: Ps,
  epub: qs,
  eslintignore: Ns,
  exe: $s,
  f4v: Ds,
  fax: Ls,
  fb2: Vs,
  fla: As,
  flac: Fs,
  flv: Is,
  fnt: Ms,
  folder: Ss,
  fon: Ts,
  g2: Gs,
  ga: Hs,
  gadget: Js,
  gdp: Ks,
  gem: Os,
  gif: Qs,
  gitattributes: Rs,
  gitignore: Us,
  go: Ws,
  gp: Xs,
  gpg: Ys,
  gpl: Zs,
  gradle: st,
  gz: tt,
  h: ot,
  handlebars: et,
  hbs: pt,
  heic: nt,
  hlp: ct,
  hs: at,
  hsl: it,
  htm: lt,
  html: mt,
  ibooks: rt,
  icns: dt,
  ico: ft,
  ics: xt,
  idx: gt,
  iff: vt,
  ifo: bt,
  image: ut,
  img: ht,
  iml: kt,
  in: 5,
  inc: wt,
  indd: _t,
  inf: yt,
  info: jt,
  ini: zt,
  inv: Ct,
  iso: Bt,
  j2: Et,
  jar: Pt,
  java: qt,
  jpe: Nt,
  jpeg: $t,
  jpg: Dt,
  js: Lt,
  json: Vt,
  jsp: At,
  jsx: Ft,
  key: It,
  kf8: Mt,
  kmk: St,
  ksh: Tt,
  kt: Gt,
  kts: Ht,
  kup: Jt,
  less: Kt,
  lex: Ot,
  licx: Qt,
  lisp: Rt,
  lit: Ut,
  lnk: Wt,
  lock: Xt,
  log: Yt,
  lua: Zt,
  m: so,
  m2v: to,
  m3u: oo,
  m3u8: eo,
  m4: po,
  m4a: no,
  m4r: co,
  m4v: ao,
  map: io,
  master: lo,
  mc: mo,
  md: ro,
  mdb: fo,
  mdf: xo,
  me: go,
  mi: vo,
  mid: bo,
  midi: uo,
  mk: ho,
  mkv: ko,
  mm: wo,
  mng: _o,
  mo: yo,
  mobi: jo,
  mod: zo,
  mov: Co,
  mp2: Bo,
  mp3: Eo,
  mp4: Po,
  mpa: qo,
  mpd: No,
  mpe: $o,
  mpeg: Do,
  mpg: Lo,
  mpga: Vo,
  mpp: Ao,
  mpt: Fo,
  msg: Io,
  msi: Mo,
  msu: So,
  nef: To,
  nes: Go,
  nfo: Ho,
  nix: Jo,
  npmignore: Ko,
  ocx: Oo,
  odb: Qo,
  ods: Ro,
  odt: Uo,
  ogg: Wo,
  ogv: Xo,
  ost: Yo,
  otf: Zo,
  ott: se,
  ova: te,
  ovf: oe,
  p12: ee,
  p7b: pe,
  pages: ne,
  part: ce,
  pcd: ae,
  pdb: ie,
  pdf: le,
  pem: me,
  pfx: re,
  pgp: de,
  ph: fe,
  phar: xe,
  php: ge,
  pid: ve,
  pkg: be,
  pl: ue,
  plist: he,
  pm: ke,
  png: we,
  po: _e,
  pom: ye,
  pot: je,
  potx: ze,
  pps: Ce,
  ppsx: Be,
  ppt: Ee,
  pptm: Pe,
  pptx: qe,
  prop: Ne,
  ps: $e,
  ps1: De,
  psd: Le,
  psp: Ve,
  pst: Ae,
  pub: Fe,
  py: Ie,
  pyc: Me,
  qt: Se,
  ra: Te,
  ram: Ge,
  rar: He,
  raw: Je,
  rb: Ke,
  rdf: Oe,
  rdl: Qe,
  reg: Re,
  resx: Ue,
  retry: We,
  rm: Xe,
  rom: Ye,
  rpm: Ze,
  rpt: sp,
  rsa: tp,
  rss: op,
  rst: ep,
  rtf: pp,
  ru: np,
  rub: cp,
  sass: ap,
  scss: ip,
  sdf: lp,
  sed: mp,
  sh: rp,
  sit: dp,
  sitemap: fp,
  skin: xp,
  sldm: gp,
  sldx: vp,
  sln: bp,
  sol: up,
  sphinx: hp,
  sql: kp,
  sqlite: wp,
  step: _p,
  stl: yp,
  svg: jp,
  swd: zp,
  swf: Cp,
  swift: Bp,
  swp: Ep,
  sys: Pp,
  tar: qp,
  tax: Np,
  tcsh: $p,
  tex: Dp,
  tfignore: Lp,
  tga: Vp,
  tgz: Ap,
  tif: Fp,
  tiff: Ip,
  tmp: Mp,
  tmx: Sp,
  torrent: Tp,
  tpl: Gp,
  ts: Hp,
  tsv: Jp,
  ttf: Kp,
  twig: Op,
  txt: Qp,
  udf: Rp,
  vb: Up,
  vbproj: Wp,
  vbs: Xp,
  vcd: Yp,
  vcf: Zp,
  vcs: sn,
  vdi: tn,
  vdx: on,
  vmdk: en,
  vob: pn,
  vox: nn,
  vscodeignore: cn,
  vsd: an,
  vss: ln,
  vst: mn,
  vsx: rn,
  vtx: dn,
  war: fn,
  wav: xn,
  wbk: gn,
  webinfo: vn,
  webm: bn,
  webp: un,
  wma: hn,
  wmf: kn,
  wmv: wn,
  woff: _n,
  woff2: yn,
  wps: jn,
  wsf: zn,
  xaml: Cn,
  xcf: Bn,
  xfl: En,
  xlm: Pn,
  xls: qn,
  xlsm: Nn,
  xlsx: $n,
  xlt: Dn,
  xltm: Ln,
  xltx: Vn,
  xml: An,
  xpi: Fn,
  xps: In,
  xrb: Mn,
  xsd: Sn,
  xsl: Tn,
  xspf: Gn,
  xz: Hn,
  yaml: Jn,
  yml: Kn,
  z: On,
  z1: Qn,
  zip: Rn,
  zsh: Un
}, f = Wn, Xn = (t, e, o = "span", s = "path") => {
  for (let p = 0; p < e; p++) {
    const n = document.createElement(o);
    n.classList.add(s + (p + 1)), t.appendChild(n);
  }
}, Yn = (t) => {
  for (; t.firstChild; )
    t.removeChild(t.firstChild);
}, Zn = (t, e = "blank") => {
  var o;
  return ((o = t.classList.value.split(" ").find((s) => s.replace("fi-", "") in f)) == null ? void 0 : o.replace("fi-", "")) ?? e;
}, sc = (t = "fi", e = { tag: "span", classPrefix: "path" }) => {
  let o = [];
  typeof t == "string" ? o = Array.from(document.getElementsByClassName(t)) : o = [t];
  for (let s = 0; s < o.length; s++) {
    const p = o[s];
    Yn(p);
    const n = Zn(p), c = f[n];
    Xn(p, c, e.tag, e.classPrefix);
  }
}, tc = /* @__PURE__ */ m({
  __name: "file-icons",
  props: {
    name: {},
    tag: { default: "span" },
    options: {}
  },
  setup(t) {
    const e = t, o = x(), s = r(() => {
      var n, c;
      return {
        tag: (n = e.options) == null ? void 0 : n.tag,
        classPrefix: (c = e.options) == null ? void 0 : c.classPrefix
      };
    }), p = () => {
      k(() => {
        sc(o.value, s.value);
      });
    };
    return v([() => e.name, s], p), b(p), (n, c) => (d(), g(u(n.tag), {
      ref_key: "el",
      ref: o,
      class: h(`fi fi-${n.name}`)
    }, null, 8, ["class"]));
  }
}), oc = { class: "relative cursor-pointer select-none overflow-hidden px-2 py-1" }, ec = { class: "flex items-center gap-2" }, pc = { class: "flex flex-auto flex-col justify-center gap-0.5" }, nc = { class: "text-sm font-semibold leading-none" }, cc = { class: "text-xs leading-none" }, mc = /* @__PURE__ */ m({
  __name: "attachmentItem",
  props: {
    attachment: {},
    size: {}
  },
  setup(t) {
    const e = t, o = r(() => {
      const s = j(e.attachment.rawFilename);
      return s ? z(s) ?? "blank" : "blank";
    });
    return (s, p) => (d(), w("div", oc, [
      i(y, { class: "bg-blue-500" }),
      a("div", ec, [
        i(_(tc), {
          name: o.value,
          class: "text-3xl"
        }, null, 8, ["name"]),
        a("div", pc, [
          a("div", nc, l(s.attachment.filename), 1),
          a("div", cc, l(s.size), 1)
        ])
      ])
    ]));
  }
});
export {
  mc as default
};
//# sourceMappingURL=BZLUZhEu.js.map
