'use strict';
/* ¿Aguantás un vivo? — un minuto vendiendo ropa en vivo, sola; después, con Ezra.
   Los textos que contesta Ezra en la 2ª vuelta son los que manda el bot de verdad. */

const URL_JUEGO = 'https://botezra63-cyber.github.io/aguantas-un-vivo/';
const DUR_SOLA = 60;
const DUR_EZRA = 20;
const VIDAS = 5;

const $ = (s) => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
const plata = (n) => '$' + Math.round(n).toLocaleString('es-AR');
const mezclar = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const AUTO = new URLSearchParams(location.search).has('auto');

// Todo lo que pasa por acá son textos fijos del juego (ninguno viene de la gente).
function poner(el, html) { el.replaceChildren(document.createRange().createContextualFragment(html)); }

const PRENDAS = [
  { ico: '🧥', n: 'Campera puffer', p: 35000, sena: 10000 },
  { ico: '👖', n: 'Jean wide leg', p: 28000, sena: 8000 },
  { ico: '🧶', n: 'Sweater trenzado', p: 26000, sena: 8000 },
  { ico: '👗', n: 'Vestido de lino', p: 31000, sena: 10000 },
  { ico: '👚', n: 'Buzo oversize', p: 22000, sena: 7000 },
  { ico: '🧣', n: 'Tapado de paño', p: 48000, sena: 15000 },
];
const TALLES = ['S', 'M', 'M', 'L', 'L', 'XL'];

// Usuario de TikTok y quién figura en la transferencia. A veces paga otro.
const CLIENTAS = [
  { u: 'mabe.gomez', n: 'MARÍA BELÉN GÓMEZ' },
  { u: 'caro.22', n: 'CAROLINA PAZ RÍOS' },
  { u: 'luu_fer', n: 'LUCÍA FERNÁNDEZ' },
  { u: 'flor.de.lanus', n: 'JORGE ALBERTO PÉREZ', quien: 'el marido' },
  { u: 'agus.moda', n: 'AGUSTINA MORENO' },
  { u: 'sol.vintage', n: 'SOLEDAD IBARRA' },
  { u: 'meli.k', n: 'MELINA KOHAN' },
  { u: 'romi.cba', n: 'RAMÓN SANTIAGO VERA', quien: 'el papá' },
  { u: 'vale.mdq', n: 'VALERIA SUÁREZ' },
  { u: 'nati.ropita', n: 'NATALIA CÁCERES' },
  { u: 'pau_23', n: 'PAULA ÁVILA' },
  { u: 'cami.ok', n: 'CAMILA OCAMPO' },
  { u: 'belu_s', n: 'ROSA BEATRIZ SOSA', quien: 'la mamá' },
  { u: 'juli.rosario', n: 'JULIETA ROMERO' },
  { u: 'yani.outlet', n: 'YANINA BRITOS' },
  { u: 'dai.ledesma', n: 'DAIANA LEDESMA' },
  { u: 'ro.martinez', n: 'ROCÍO MARTÍNEZ' },
  { u: 'euge.vk', n: 'EUGENIA VILLALBA' },
  { u: 'mili.tienda', n: 'GASTÓN M. ACOSTA', quien: 'el novio' },
  { u: 'lu.benitez', n: 'LUCIANA BENÍTEZ' },
];
const MIRONAS = ['holaa.soy.ani', 'tati_bsas', 'moni.rq', 'la.pato', 'any.sh', 'gise_ok', 'fer.lomas', 'marce.t'];
const RUIDO = ['hermosa 😍', 'holaa desde Lanús 👋', 'de dónde sos?', '🔥🔥🔥', 'precio??', 'hacés envíos a Córdoba?', 'la quiero en verde',
  'me encanta tu pelo', 'llegué tarde 😭', 'cuánto sale el envío?', 'mostrá la espalda', 'tenés en negro?', '❤️❤️❤️', 'buenas noches!!',
  'qué lindo local', 'sos la mejor', 'se ve divino', 'la de recién cuánto era?', 'el talle es grande?', 'saludos a todas 💕', 'aceptan mercado pago?'];
const DICHO_YO = (t) => pick([`YO la ${t} 🙋`, `yo ${t}!!`, `YOOO ${t}`, `me la llevo en ${t}`, `${t} para mí 🙋`, `YO talle ${t}`, `yo yo yo ${t}`]);
const DICHO_PREG = ['cuánto te debo? 🥺', 'hola!! cuánto te debo?', 'me pasás el saldo?', 'cuánto me falta?', 'ya te pagué la seña, cuánto queda?', 'cuánto era lo mío?'];
const DICHO_ENOJO = ['bueno me voy a otro vivo 😤', 'me clavaste el visto 😒', 'no me contesta nadie??', 'ya fue, no la quiero 🙄', 'hola??? 😡'];
const COLORES = ['#e5484d', '#f76b15', '#ffb224', '#30a46c', '#0090ff', '#8e4ec6', '#d6409f', '#12a594', '#5b4ce6'];

// Textos reales del bot (bloques/ventas_respuestas.py).
const BOT = {
  sena_nueva: (i, p) => `¡Recibimos tu seña de ${i}! 💖 Tu pedido es el ${p}.`,
  pedir_tiktok: '¡Gracias por tu seña! 💖 ¿Cuál es tu usuario de TikTok?',
  tu_saldo: (p, s) => `Tu pedido ${p} tiene un saldo de ${s} 💖`,
};

/* ── Estado ─────────────────────────────────────────────── */
const J = {};
let sonido = true;
try { sonido = localStorage.getItem('vivo-sonido') !== 'no'; } catch (e) { /* sin almacenamiento */ }

function reiniciar(modo) {
  Object.assign(J, {
    modo, t: 0, dur: modo === 'sola' ? DUR_SOLA : DUR_EZRA, vidas: VIDAS,
    corriendo: false, pausa: false, ocupada: null, eligiendo: null,
    vendido: 0, escapado: 0, contestadas: 0, msgsEzra: 0, pagosEzra: 0,
    st: { ventas: 0, ventasPlata: 0, sinDueno: 0, equivocada: 0, sinRespuesta: 0, noCuaderno: 0 },
    pedidos: [], vivos: [], colaEzra: [], tiktokSabido: new Set(),
    prox: { ruido: 0.4, claim: 1.5, pago: modo === 'sola' ? 8 : 99, preg: modo === 'sola' ? 15 : 5, prenda: 15, ezra: 0 },
    prenda: Math.floor(Math.random() * PRENDAS.length), nPedido: 1240 + Math.floor(Math.random() * 40), mirando: 280 + Math.floor(Math.random() * 60),
    ultimo: 0, finEn: null, prendaLibre: 0,
  });
}

/* ── Sonido (sintetizado, sin archivos) ─────────────────── */
let ac = null;
function tono(f, d = 0.12, tipo = 'sine', vol = 0.06, f2) {
  if (!sonido) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime;
    o.type = tipo; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + d + 0.02);
  } catch (e) { /* sin audio */ }
}
const SND = {
  ok() { tono(880, 0.08, 'sine', 0.07); setTimeout(() => tono(1320, 0.12, 'sine', 0.06), 70); },
  mal() { tono(200, 0.28, 'sawtooth', 0.05, 80); },
  noti() { tono(1046, 0.07, 'triangle', 0.05); setTimeout(() => tono(1568, 0.09, 'triangle', 0.045), 80); },
  caja() { tono(1568, 0.05, 'square', 0.025); setTimeout(() => tono(2093, 0.14, 'triangle', 0.05), 55); },
  tic() { tono(700, 0.04, 'square', 0.02); },
  cuenta() { tono(523, 0.12, 'triangle', 0.06); },
  ya() { tono(1046, 0.25, 'triangle', 0.07); },
};
const vibrar = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* nada */ } };

/* ── Pantallas ──────────────────────────────────────────── */
function mostrar(id) {
  for (const s of document.querySelectorAll('.pantalla')) s.hidden = s.id !== id;
  const sc = document.getElementById(id); if (sc && sc.classList.contains('claro')) sc.scrollTop = 0;
}

function empezar(modo) {
  reiniciar(modo);
  mostrar('juego');
  $('#juego').classList.toggle('con-ezra', modo === 'ezra');
  $('#chat').replaceChildren(); $('#banners').replaceChildren(); $('#ezra').replaceChildren();
  $('#ezra').hidden = modo !== 'ezra';
  $('#otra-prenda').hidden = modo !== 'ezra';
  $('#vidas').hidden = modo !== 'sola';
  $('#ocupada').hidden = true; $('#elegir').hidden = true; $('#hoja').hidden = true;
  const der = $('#hud-der');
  der.classList.toggle('hud-mal', modo === 'sola'); der.classList.toggle('hud-bien', modo === 'ezra');
  $('#hud-der-t').textContent = modo === 'sola' ? 'Se te escapó' : 'Ezra contestó';
  pintarVidas(); pintarPrenda(false); hud(); reloj();
  const v = $('#vid'); try { v.currentTime = 0; const p = v.play(); if (p) p.catch(() => {}); } catch (e) { /* queda la foto */ }

  if (modo === 'sola') cuentaAtras(arrancar);
  else {
    cartel('<div class="cartel-caja"><div class="c-t">Mismo vivo.<br>Ahora Ezra atiende tu WhatsApp.</div><div class="c-p">Vos mostrá ropa. Tocá 👗 para sacar otra prenda.</div><button class="btn btn-1" id="dale">Dale</button></div>');
    $('#dale').onclick = () => { cerrarCartel(); arrancar(); };
    if (AUTO) setTimeout(() => $('#dale') && $('#dale').click(), 1200);
  }
}

function arrancar() {
  J.corriendo = true; J.ultimo = performance.now();
  requestAnimationFrame(cuadro);
}

function cuentaAtras(fin) {
  let n = 3;
  const uno = () => {
    if (n === 0) { cartel('<div class="cuenta">¡Ya!</div>'); SND.ya(); setTimeout(() => { cerrarCartel(); fin(); }, 450); return; }
    cartel(`<div class="cuenta">${n}</div>`); SND.cuenta(); n--; setTimeout(uno, 650);
  };
  uno();
}
function cartel(html) { const c = $('#cartel'); poner(c, html); c.hidden = false; }
function cerrarCartel() { $('#cartel').hidden = true; }

/* ── El reloj del juego ─────────────────────────────────── */
function cuadro(ts) {
  if (!J.corriendo) return;
  const dt = Math.min(0.1, Math.max(0, (ts - J.ultimo) / 1000)); J.ultimo = ts;
  if (!J.pausa) { J.t += dt; paso(); }
  if (J.corriendo) requestAnimationFrame(cuadro);
}

function intensidad() { return J.modo === 'sola' ? J.t / 55 : 0.5 + (J.t / J.dur) * 0.5; }

function paso() {
  const t = J.t, k = intensidad();
  if (t >= J.prox.ruido) { ruido(); J.prox.ruido = t + rnd(0.9, 1.7) * lerp(1, 0.7, k); }
  if (t >= J.prox.claim) { nuevoPedido(); J.prox.claim = t + rnd(0.8, 1.2) * lerp(3.4, 1.3, k); }
  if (t >= J.prox.pago) { nuevoPago(); J.prox.pago = t + rnd(0.8, 1.2) * lerp(6, 2.6, k); }
  if (t >= J.prox.preg) { nuevaPregunta(); J.prox.preg = t + rnd(0.8, 1.2) * lerp(8.5, 3.6, k); }
  if (t >= J.prox.prenda) { otraPrenda(false); J.prox.prenda = t + 15; }

  if (J.modo === 'ezra') {
    for (const o of J.pedidos) if (o.pagoEn && t >= o.pagoEn) { o.pagoEn = null; ezraSena(o); }
    if (J.colaEzra.length && t >= J.prox.ezra) { mostrarEzra(J.colaEzra.shift()); J.prox.ezra = t + (J.colaEzra.length > 3 ? 1.1 : 1.6); }
  }

  for (const v of J.vivos.slice()) if (t >= v.vence) vencer(v);
  if (J.eligiendo && t >= J.eligiendo.vence) elegir(null);
  if (J.ocupada && t >= J.ocupada.hasta) { const fn = J.ocupada.fn; J.ocupada = null; $('#ocupada').hidden = true; if (fn) fn(); }

  if (Math.random() < 0.02) { J.mirando += Math.floor(rnd(-3, 9)); $('#mirando').textContent = `${J.mirando} mirando`; }
  reloj();
  if (AUTO) jugadorAuto();
  if (J.finEn === null && t >= J.dur) terminar(J.modo === 'sola' ? 'tiempo' : 'ezra');
}

function reloj() {
  const quedan = Math.max(0, Math.ceil(J.dur - J.t));
  const r = $('#reloj');
  r.textContent = `${Math.floor(quedan / 60)}:${String(quedan % 60).padStart(2, '0')}`;
  r.classList.toggle('apurado', J.modo === 'sola' && quedan <= 10);
}

function hud(salta) {
  const v = $('#hud-vendido'), d = $('#hud-der-n');
  v.textContent = plata(J.vendido);
  d.textContent = J.modo === 'sola' ? plata(J.escapado) : `${J.msgsEzra} msj`;
  const el = salta === 'v' ? v : salta === 'd' ? d : null;
  if (el) { el.classList.remove('salta'); void el.offsetWidth; el.classList.add('salta'); }
}

function pintarVidas() {
  poner($('#vidas'), Array.from({ length: VIDAS }, (_, i) => `<span class="${i < J.vidas ? '' : 'rota'}">❤️</span>`).join(''));
}

function pintarPrenda(anima) {
  const p = PRENDAS[J.prenda], el = $('#prenda');
  poner(el, `<i>${p.ico}</i><span><b>${p.n}</b>${plata(p.p)} · seña ${plata(p.sena)}</span>`);
  if (anima) { el.classList.remove('cambio'); void el.offsetWidth; el.classList.add('cambio'); }
}

function otraPrenda(rafaga) {
  J.prenda = (J.prenda + 1) % PRENDAS.length; pintarPrenda(true);
  if (rafaga) {
    const n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) setTimeout(() => { if (J.corriendo) nuevoPedido(); }, 180 + i * rnd(220, 380));
  }
}

/* ── Comentarios ────────────────────────────────────────── */
function avatar(u) {
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `<span class="av" style="background:${COLORES[h % COLORES.length]}">${u[0].toUpperCase()}</span>`;
}
function comentario(u, texto, clase = '', chip = '') {
  const li = document.createElement('li');
  if (clase) li.className = clase;
  poner(li, `${avatar(u)}<span><span class="c-u">${u}</span>${texto}</span>${chip ? `<span class="c-chip">${chip}</span>` : ''}`);
  const chat = $('#chat'); chat.appendChild(li);
  // Si hay muchos, se va el más viejo que no esté esperando un toque.
  while (chat.children.length > 9) {
    const viejo = [...chat.children].find((x) => !x.classList.contains('activo'));
    if (!viejo) break; viejo.remove();
  }
  return li;
}
function ruido() {
  const u = Math.random() < 0.5 ? pick(MIRONAS) : pick(CLIENTAS).u;
  comentario(u, pick(RUIDO));
}

/* ── Pedidos, pagos y preguntas ─────────────────────────── */
function nuevoPedido() {
  const p = PRENDAS[J.prenda], c = pick(CLIENTAS), talle = pick(TALLES);
  const o = { c, p, talle, t: J.t, anotado: false, pagado: false, asignado: false, preguntado: false, cancelado: false, numero: null };
  J.pedidos.push(o);
  if (J.modo === 'sola') {
    const li = comentario(c.u, DICHO_YO(talle), 'activo claim', 'Anotar');
    const v = { tipo: 'claim', o, el: li, vence: J.t + lerp(6, 4.5, intensidad()) };
    li.style.setProperty('--dur', `${v.vence - J.t}s`);
    li.addEventListener('pointerdown', () => tocar(v));
    J.vivos.push(v);
  } else {
    comentario(c.u, DICHO_YO(talle), 'claim-ezra');
    o.pagoEn = J.t + rnd(2, 4);
  }
}

function nuevoPago() {
  if (J.modo !== 'sola') return;
  const cand = J.pedidos.filter((o) => !o.pagado && !o.cancelado && J.t - o.t > 1.6);
  if (!cand.length) return;
  const o = cand[0]; o.pagado = true;
  const el = document.createElement('div');
  el.className = 'banner';
  poner(el, `<span class="b-ico">🏦</span><span class="b-txt"><small>Banco · Transferencia recibida</small><b>${plata(o.p.sena)}</b> de ${o.c.n}</span><span class="b-chip">¿De quién?</span>`);
  const v = { tipo: 'pago', o, el, vence: J.t + lerp(6.5, 5, intensidad()) };
  el.style.setProperty('--dur', `${v.vence - J.t}s`);
  el.addEventListener('pointerdown', () => tocar(v));
  const b = $('#banners'); b.appendChild(el);
  while (b.children.length > 3) b.firstElementChild.remove();
  J.vivos.push(v); SND.noti();
}

function nuevaPregunta() {
  const cand = J.pedidos.filter((o) => !o.preguntado && !o.cancelado && J.t - o.t > 3);
  if (!cand.length) return;
  const o = pick(cand.slice(0, 4)); o.preguntado = true;
  if (J.modo === 'sola') {
    const li = comentario(o.c.u, pick(DICHO_PREG), 'activo preg', 'Contestar');
    const v = { tipo: 'preg', o, el: li, vence: J.t + lerp(7, 5.5, intensidad()) };
    li.style.setProperty('--dur', `${v.vence - J.t}s`);
    li.addEventListener('pointerdown', () => tocar(v));
    J.vivos.push(v);
  } else {
    const dicho = pick(DICHO_PREG);
    comentario(o.c.u, dicho);
    J.colaEzra.push({ tipo: 'preg', o, dicho });
  }
}

function sacar(v) { J.vivos = J.vivos.filter((x) => x !== v); }

/* ── Tocar (1ª vuelta) ──────────────────────────────────── */
function tocar(v) {
  if (!J.corriendo || J.pausa || J.finEn !== null || !J.vivos.includes(v)) return;
  if (J.ocupada || J.eligiendo) { manosOcupadas(); return; }
  sacar(v);
  if (v.tipo === 'claim') {
    v.el.classList.remove('activo', 'claim'); v.el.classList.add('hecho');
    v.el.querySelector('.c-chip').textContent = '✓ Anotado';
    v.o.anotado = true; J.vendido += v.o.p.p; hud('v'); SND.ok();
    ocupar(0.35, 'Anotando en el cuaderno…');
  } else if (v.tipo === 'preg') {
    v.el.classList.remove('activo', 'preg');
    v.el.querySelector('.c-chip').textContent = '…';
    ocupar(1.4, 'Buscando en el cuaderno…', () => {
      if (!v.o.anotado) {
        v.el.classList.add('perdido'); v.el.querySelector('.c-chip').textContent = 'No está 🤷';
        J.st.noCuaderno++; aviso(`@${v.o.c.u} no está en el cuaderno 🤷`, 'mal'); golpe();
      } else {
        v.el.classList.add('hecho'); v.el.querySelector('.c-chip').textContent = '✓ Contestado';
        J.contestadas++; SND.ok();
      }
    });
  } else if (v.tipo === 'pago') {
    v.el.classList.add('sale'); setTimeout(() => v.el.remove(), 300);
    ocupar(1.0, 'Abriendo el banco…', () => abrirEleccion(v.o));
  }
}

function ocupar(seg, texto, fn) {
  J.ocupada = { hasta: J.t + seg, fn };
  $('#ocupada-t').textContent = texto;
  const barra = $('#ocupada-barra'); barra.style.setProperty('--dur', `${seg}s`);
  barra.style.animation = 'none'; void barra.offsetWidth; barra.style.animation = '';
  $('#ocupada').hidden = false;
}

function manosOcupadas() {
  const o = $('#ocupada');
  if (!o.hidden) { o.classList.remove('sacude'); void o.offsetWidth; o.classList.add('sacude'); }
  SND.tic(); vibrar(30);
}

function abrirEleccion(o) {
  if (J.finEn !== null) return;
  const cuantas = o.anotado ? 2 : 3;
  const anotadas = [...new Set(J.pedidos.filter((x) => x.anotado && x.c.u !== o.c.u).map((x) => x.c.u))];
  const relleno = mezclar(CLIENTAS.map((c) => c.u).filter((u) => u !== o.c.u && !anotadas.includes(u)));
  let ops = mezclar(anotadas).slice(0, cuantas);
  while (ops.length < cuantas) ops.push(relleno.shift());
  if (o.anotado) ops.push(o.c.u);
  ops = mezclar(ops);
  poner($('#elegir-d'), `<b>${plata(o.p.sena)}</b> de <b>${o.c.n}</b>`);
  poner($('#elegir-ops'), ops.map((u) => `<button data-u="${u}">@${u}</button>`).join('') + '<button class="nose" data-u="">No sé 🤷</button>');
  for (const b of $('#elegir-ops').children) b.addEventListener('pointerdown', () => elegir(b.dataset.u));
  const dur = 5.5;
  J.eligiendo = { o, vence: J.t + dur };
  const barra = $('#elegir-barra'); barra.style.setProperty('--dur', `${dur}s`);
  barra.style.animation = 'none'; void barra.offsetWidth; barra.style.animation = '';
  $('#elegir').hidden = false;
}

function elegir(u) {
  const e = J.eligiendo; if (!e) return;
  J.eligiendo = null; $('#elegir').hidden = true;
  const o = e.o, monto = plata(o.p.sena);
  if (u && u === o.c.u) {
    o.asignado = true; SND.caja();
    aviso(o.c.quien ? `¡Bien! Era ${o.c.quien} de @${o.c.u} 👏` : `✓ ${monto} → @${o.c.u}`, 'bien');
  } else if (u) {
    J.st.equivocada++; J.escapado += o.p.sena; hud('d');
    aviso(`Se la anotaste a @${u}. Era de @${o.c.u} 😬`, 'mal'); golpe();
  } else {
    J.st.sinDueno++; J.escapado += o.p.sena; hud('d');
    const primer = o.c.n.split(' ')[0].toLowerCase().replace(/^./, (x) => x.toUpperCase());
    aviso(o.c.quien ? `Era ${o.c.quien} de @${o.c.u}. ¿Cómo ibas a saber? 🤦` : `${monto} de ${primer}… ¿y ${primer} quién es? 🤷`, 'mal'); golpe();
  }
}

/* ── Lo que se escapa ───────────────────────────────────── */
function vencer(v) {
  sacar(v);
  if (v.tipo === 'claim') {
    v.el.classList.remove('activo', 'claim'); v.el.classList.add('perdido');
    v.el.querySelector('.c-chip').textContent = 'Se fue';
    J.st.ventas++; J.st.ventasPlata += v.o.p.p; J.escapado += v.o.p.p; hud('d'); SND.mal();
  } else if (v.tipo === 'pago') {
    v.el.classList.add('sale'); setTimeout(() => v.el.remove(), 300);
    J.st.sinDueno++; J.escapado += v.o.p.sena; hud('d');
    aviso(`${plata(v.o.p.sena)} sin anotar. ¿De quién era? 🤷`, 'mal'); golpe();
  } else if (v.tipo === 'preg') {
    v.el.classList.remove('activo', 'preg'); v.el.classList.add('perdido');
    v.el.querySelector('.c-chip').textContent = 'Sin respuesta';
    J.st.sinRespuesta++;
    if (v.o.anotado && !v.o.cancelado) { v.o.cancelado = true; J.escapado += v.o.p.p; hud('d'); }
    setTimeout(() => { if (J.corriendo) comentario(v.o.c.u, pick(DICHO_ENOJO), 'enojo'); }, 350);
    golpe();
  }
}

function golpe() {
  if (J.modo !== 'sola' || J.finEn !== null) return;
  J.vidas--; pintarVidas(); SND.mal(); vibrar([40, 30, 60]);
  const g = $('#golpe'); g.classList.remove('si'); void g.offsetWidth; g.classList.add('si');
  if (J.vidas <= 0) terminar('colapso');
}

let avisoT = null;
function aviso(texto, tipo = '') {
  const el = $('#toast'); el.textContent = texto; el.className = `toast si ${tipo}`;
  clearTimeout(avisoT); avisoT = setTimeout(() => { el.className = 'toast'; }, 2200);
}

/* ── 2ª vuelta: Ezra contesta ───────────────────────────── */
function ezraSena(o) {
  o.pagado = true; o.asignado = true; o.numero = `P-${J.nPedido++}`;
  J.vendido += o.p.p; J.pagosEzra++; hud('v'); SND.caja();
  const primera = !J.tiktokSabido.has(o.c.u); J.tiktokSabido.add(o.c.u);
  J.colaEzra.push({ tipo: 'sena', o, primera });
}

function mostrarEzra(m) {
  const zona = $('#ezra'), o = m.o, el = document.createElement('div');
  el.className = 'ez';
  let h = '<div class="ez-top"><span class="ez-wa">✓</span><b>Ezra</b> · WhatsApp de lola.showroom</div>';
  if (m.tipo === 'sena') {
    h += `<div class="bur ella foto"><i>🧾</i><span>${plata(o.p.sena)} · ${o.c.n}</span></div>`;
    h += `<div class="bur ezra">${BOT.sena_nueva(plata(o.p.sena), o.numero)}</div>`;
    if (m.primera) { h += `<div class="bur ezra">${BOT.pedir_tiktok}</div><div class="bur ella">@${o.c.u}</div>`; J.msgsEzra += 2; }
    else J.msgsEzra += 1;
  } else {
    // Si ya pagó la seña, le dice el saldo; si todavía no, le queda el total.
    const pedido = o.numero || `P-${J.nPedido++}`; if (!o.numero) o.numero = pedido;
    const quedan = o.pagado ? o.p.p - o.p.sena : o.p.p;
    h += `<div class="bur ella">${m.dicho}</div><div class="bur ezra">${BOT.tu_saldo(pedido, plata(quedan))}</div>`;
    J.msgsEzra += 1; J.contestadas++;
  }
  poner(el, h);
  zona.prepend(el);
  hud('d');
  [...zona.querySelectorAll('.ez')].slice(2).forEach((x) => { x.classList.add('sale'); setTimeout(() => x.remove(), 350); });
  setTimeout(() => { el.classList.add('sale'); setTimeout(() => el.remove(), 350); }, 4200);
}

/* ── Fin de cada vuelta ─────────────────────────────────── */
function terminar(motivo) {
  if (J.finEn !== null) return;
  J.finEn = J.t;
  J.corriendo = false;
  $('#ocupada').hidden = true; $('#elegir').hidden = true; J.eligiendo = null;
  try { $('#vid').pause(); } catch (e) { /* nada */ }
  if (J.modo === 'sola') {
    // Lo que quedó en el aire también se escapa.
    for (const v of J.vivos) if (v.tipo === 'claim') { J.st.ventas++; J.st.ventasPlata += v.o.p.p; J.escapado += v.o.p.p; }
    J.sola = { seg: Math.min(DUR_SOLA, J.t), escapado: J.escapado, vendido: J.vendido, st: { ...J.st }, contestadas: J.contestadas, motivo };
    try { sessionStorage.setItem('vivo-sola', JSON.stringify(J.sola)); } catch (e) { /* nada */ }
    cartel(`<div class="cartel-caja"><div class="c-t">${motivo === 'colapso' ? 'Te colapsó el vivo 😵' : '¡Terminó el vivo!'}</div></div>`);
    setTimeout(() => { cerrarCartel(); resultadoSola(); }, 1300);
  } else {
    J.ezra = { vendido: J.vendido, msgs: J.msgsEzra, pagos: J.pagosEzra };
    cartel('<div class="cartel-caja"><div class="c-t">¡Terminó el vivo!</div><div class="c-p">Y no quedó nada sin contestar.</div></div>');
    setTimeout(() => { cerrarCartel(); resultadoFinal(); }, 1400);
  }
}

function fraseSegun(seg) {
  if (seg >= DUR_SOLA) return 'Aguantaste el vivo entero. Igual tenés 23 mensajes sin leer.';
  if (seg < 20) return 'Ni arrancaste y ya te estaban reclamando.';
  if (seg < 40) return 'Normal. Así es un vivo de verdad.';
  return 'Sos rapidísima. Igual no alcanza.';
}

function resultadoSola() {
  const s = J.sola, seg = Math.floor(s.seg), colapso = s.motivo === 'colapso';
  $('#r1-kicker').textContent = colapso ? 'Aguantaste' : 'Llegaste al final';
  $('#r1-seg').textContent = colapso ? `${seg} segundos` : '60 segundos';
  $('#r1-escapo').textContent = plata(s.escapado);
  const filas = [];
  const fila = (n, uno, varios) => `<b>${n}</b> ${n === 1 ? uno : varios}`;
  if (s.st.ventas) filas.push(['🙋', fila(s.st.ventas, 'venta sin anotar', 'ventas sin anotar')]);
  if (s.st.sinDueno) filas.push(['💸', fila(s.st.sinDueno, 'transferencia sin saber de quién', 'transferencias sin saber de quién')]);
  if (s.st.equivocada) filas.push(['😬', fila(s.st.equivocada, 'pago anotado a otra clienta', 'pagos anotados a otra clienta')]);
  if (s.st.sinRespuesta) filas.push(['💬', fila(s.st.sinRespuesta, 'clienta sin respuesta', 'clientas sin respuesta')]);
  if (s.st.noCuaderno) filas.push(['📒', fila(s.st.noCuaderno, 'que no estaba en el cuaderno', 'que no estaban en el cuaderno')]);
  if (!filas.length) filas.push(['✨', 'No se te escapó nada. ¿Sos real?']);
  poner($('#r1-lista'), filas.map(([i, t]) => `<li><span class="ico">${i}</span><span>${t}</span></li>`).join(''));
  $('#r1-frase').textContent = fraseSegun(colapso ? s.seg : DUR_SOLA);
  mostrar('res1');
  if (AUTO) setTimeout(() => $('#con-ezra').click(), 2500);
}

function resultadoFinal() {
  const s = J.sola, e = J.ezra;
  $('#f-sola-escapo').textContent = s ? plata(s.escapado) : '—';
  $('#f-sola-n').textContent = s ? `Aguantaste ${s.motivo === 'colapso' ? Math.floor(s.seg) : 60} s y vendiste ${plata(s.vendido)}` : '';
  $('#f-ezra-n').textContent = `Vendiste ${plata(e.vendido)} y Ezra contestó ${e.msgs} mensajes`;
  mostrar('final');
}

/* ── Compartir ──────────────────────────────────────────── */
function textoCompartir() {
  const s = J.sola;
  if (!s) return '¿Aguantás un vivo? Un minuto vendiendo ropa en vivo, sola 😵';
  if (s.motivo !== 'colapso') return `Aguanté el vivo entero… y se me escaparon ${plata(s.escapado)} 😵 ¿Vos aguantás?`;
  return `Atendí un vivo sola y aguanté ${Math.floor(s.seg)} segundos 😵 Se me escaparon ${plata(s.escapado)}. ¿Vos aguantás?`;
}
function compartir() {
  const texto = textoCompartir(), enc = encodeURIComponent;
  $('#hoja-texto').textContent = `${texto} ${URL_JUEGO}`;
  $('#sh-wa').href = `https://wa.me/?text=${enc(`${texto} ${URL_JUEGO}`)}`;
  $('#sh-x').href = `https://x.com/intent/post?text=${enc(texto)}&url=${enc(URL_JUEGO)}`;
  $('#hoja').hidden = false;
}
async function copiar() {
  const b = $('#sh-copiar'), txt = `${textoCompartir()} ${URL_JUEGO}`;
  try { await navigator.clipboard.writeText(txt); b.textContent = '¡Copiado!'; } catch (e) { b.textContent = URL_JUEGO; }
  setTimeout(() => { b.textContent = 'Copiar el link'; }, 1800);
}

/* ── Jugador automático (?auto, para grabar la demo) ───── */
function jugadorAuto() {
  if (J.modo === 'ezra') { if (Math.random() < 0.02) $('#otra-prenda').dispatchEvent(new Event('pointerdown')); return; }
  if (J.eligiendo) {
    if (!J.eligiendo.decide) J.eligiendo.decide = J.t + rnd(0.7, 1.6);
    if (J.t >= J.eligiendo.decide) {
      const o = J.eligiendo.o, ops = [...$('#elegir-ops').children].map((b) => b.dataset.u);
      elegir(o.anotado && Math.random() < 0.75 ? o.c.u : pick(ops));
    }
    return;
  }
  if (J.ocupada) return;
  for (const v of J.vivos) {
    if (!v.mira) v.mira = J.t + rnd(0.45, 1.3);
    if (J.t >= v.mira) { tocar(v); return; }
  }
}

/* ── Arranque ───────────────────────────────────────────── */
function pintarSonido() { const b = $('#sonido'); b.textContent = sonido ? '🔊 Con sonido' : '🔇 Sin sonido'; b.setAttribute('aria-pressed', String(sonido)); }
$('#sonido').addEventListener('click', () => { sonido = !sonido; try { localStorage.setItem('vivo-sonido', sonido ? 'si' : 'no'); } catch (e) { /* nada */ } pintarSonido(); });
$('#empezar').addEventListener('click', () => empezar('sola'));
$('#con-ezra').addEventListener('click', () => empezar('ezra'));
$('#otra-vez-1').addEventListener('click', () => empezar('sola'));
$('#otra-vez-2').addEventListener('click', () => empezar('sola'));
$('#otra-prenda').addEventListener('pointerdown', () => {
  if (!J.corriendo || J.pausa || J.t < (J.prendaLibre || 0)) return;
  J.prendaLibre = J.t + 2.5; otraPrenda(true); SND.tic();
});
for (const b of document.querySelectorAll('[data-compartir]')) b.addEventListener('click', compartir);
$('#sh-copiar').addEventListener('click', copiar);
$('#hoja-cerrar').addEventListener('click', () => { $('#hoja').hidden = true; });
$('#hoja').addEventListener('click', (e) => { if (e.target.id === 'hoja') $('#hoja').hidden = true; });
$('#ocupada').addEventListener('pointerdown', manosOcupadas);
document.addEventListener('visibilitychange', () => {
  if (!J.corriendo) return;
  J.pausa = document.hidden;
  $('#juego').classList.toggle('pausa', J.pausa);
  if (!J.pausa) J.ultimo = performance.now();
});
pintarSonido();
reiniciar('sola');
try { const s = sessionStorage.getItem('vivo-sola'); if (s) J.sola = JSON.parse(s); } catch (e) { /* nada */ }
if (AUTO) setTimeout(() => $('#empezar').click(), 800);
