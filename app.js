/* NATO-alfabet */
const ALF = {
  nato: { taal: 'en-US', w: 'Alfa Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliett Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-ray Yankee Zulu'.split(' '),
    c: ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'], alt: { alpha: 'alfa', juliet: 'juliett', xray: 'x-ray', whisky: 'whiskey' } },
  nl: { taal: 'nl-NL', w: 'Anton Bernard Cornelis Dirk Eduard Ferdinand Gerard Hendrik Izaak Johan Karel Lodewijk Maria Nico Otto Pieter Quotiënt Richard Simon Theodoor Utrecht Victor Willem Xantippe Ypsilon Zaandam'.split(' '),
    c: ['Nul', 'Een', 'Twee', 'Drie', 'Vier', 'Vijf', 'Zes', 'Zeven', 'Acht', 'Negen'], alt: { quotient: 'quotiënt', isaak: 'izaak', ijmuiden: 'ypsilon', theo: 'theodoor', zacharias: 'zaandam' } },
};
const LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const st = opslag.lees('nato.v1', { alf: 'nato', qm: 'typ', goed: 0, tot: 0, reeks: 0, beste: 0, fout: {} });
const A = () => ALF[st.alf];
const woord = (l) => A().w[LET.indexOf(l)];
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');

function spreek(t) {
  if (!('speechSynthesis' in window)) return toast('Voorlezen werkt niet in deze browser');
  speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = A().taal; u.rate = .9; speechSynthesis.speak(u);
}
function grid() {
  $('#grid').innerHTML = LET.map((l, i) => `<button type="button" class="kaart" data-w="${A().w[i]}"><b>${l}</b><span>${A().w[i]}</span></button>`).join('');
  $$('#alf button').forEach((b) => b.classList.toggle('on', b.dataset.v === st.alf));
}
function omzet() {
  const t = $('#tekst').value.toUpperCase();
  $('#uit').innerHTML = [...t].map((c) => c === ' ' ? '<span class="sp"></span>' : LET.includes(c) ? `<span class="w"><i>${c}</i>${woord(c)}</span>`
    : /\d/.test(c) ? `<span class="w"><i>${c}</i>${A().c[+c]}</span>` : `<span class="x">${esc(c)}</span>`).join('');
}
const woorden = () => [...$('#tekst').value.toUpperCase()].map((c) => LET.includes(c) ? woord(c) : /\d/.test(c) ? A().c[+c] : c === ' ' ? '/' : '').filter(Boolean);

/* Quiz: letters die je vaak fout hebt komen vaker terug */
let vraag = null, klaar = false;
function kiesLetter() {
  const gew = LET.map((l) => 1 + (st.fout[l] || 0) * 2), som = gew.reduce((a, b) => a + b, 0);
  let r = Math.random() * som; for (let i = 0; i < LET.length; i++) { r -= gew[i]; if (r < 0) return LET[i]; } return 'Z';
}
function volgende() {
  let l; do l = kiesLetter(); while (vraag && l === vraag && Math.random() < .8);
  vraag = l; klaar = false; $('#fb').textContent = ''; $('#fb').className = 'fb';
  $('#vraag').textContent = st.qm === 'letter' ? woord(l) : l;
  $('#vraag').style.fontSize = st.qm === 'letter' ? '2.4rem' : '';
  $('#typ').hidden = st.qm !== 'typ'; $('#kies').hidden = st.qm === 'typ';
  if (st.qm === 'typ') { $('#antw').value = ''; $('#antw').disabled = false; if (matchMedia('(pointer:fine)').matches) $('#antw').focus(); }
  else {
    const opties = [l]; while (opties.length < 4) { const x = LET[Math.floor(Math.random() * 26)]; if (!opties.includes(x)) opties.push(x); }
    opties.sort(() => Math.random() - .5);
    $('#kies').innerHTML = opties.map((x) => `<button type="button" data-l="${x}">${st.qm === 'letter' ? x : woord(x)}</button>`).join('');
  }
  $$('#qm button').forEach((b) => b.classList.toggle('on', b.dataset.v === st.qm));
  score();
}
function score() {
  $('#score').textContent = `Score ${st.goed} / ${st.tot} · reeks ${st.reeks} · beste ${st.beste}`;
  const lastig = Object.entries(st.fout).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  $('#lastig').textContent = lastig.length ? 'Lastig: ' + lastig.map(([l]) => `${l} = ${woord(l)}`).join(', ') : '';
  opslag.schrijf('nato.v1', st);
}
function antwoord(ok) {
  klaar = true; st.tot++;
  if (ok) { st.goed++; st.reeks++; st.beste = Math.max(st.beste, st.reeks); st.fout[vraag] = Math.max(0, (st.fout[vraag] || 0) - 1); }
  else { st.reeks = 0; st.fout[vraag] = (st.fout[vraag] || 0) + 1; }
  $('#fb').className = 'fb ' + (ok ? 'ok' : 'bad');
  $('#fb').innerHTML = ok ? `<i class="mdi mdi-check-circle"></i> Goed! ${vraag} = ${woord(vraag)}` : `<i class="mdi mdi-close-circle"></i> Het is ${vraag} = ${woord(vraag)}`;
  score(); setTimeout(volgende, ok ? 900 : 1800);
}
$('#antw').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || klaar || !e.target.value.trim()) return;
  const v = norm(e.target.value), goed = norm(woord(vraag)), alt = Object.entries(A().alt).find(([k, w]) => norm(k) === v && norm(w) === goed);
  e.target.disabled = true; antwoord(v === goed || !!alt);
});
$('#kies').onclick = (e) => {
  const b = e.target.closest('button'); if (!b || klaar) return;
  $$('#kies button').forEach((x) => { x.disabled = true; if (x.dataset.l === vraag) x.classList.add('goed'); });
  if (b.dataset.l !== vraag) b.classList.add('fout');
  antwoord(b.dataset.l === vraag);
};
$('#qm').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; st.qm = b.dataset.v; volgende(); };
$('#reset').onclick = () => { Object.assign(st, { goed: 0, tot: 0, reeks: 0, fout: {} }); volgende(); };
$('#alf').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; st.alf = b.dataset.v; grid(); omzet(); volgende(); };
$('#grid').onclick = (e) => { const b = e.target.closest('.kaart'); if (b) spreek(b.dataset.w); };
$('#tekst').oninput = omzet;
$('#spreek').onclick = () => { const w = woorden(); if (w.length) spreek(w.join(', ').replace(/\//g, '.')); };
$('#kopie').onclick = () => { const w = woorden(); if (w.length) kopieer(w.join(' ')); };
grid(); volgende();
