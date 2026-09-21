const intro = document.getElementById("introFlower");
const seed = document.getElementById("seed");
const treeWrap = document.getElementById("treeWrap");
const tree = document.getElementById("tree");
const heart = document.getElementById("heart");
const falling = document.getElementById("fallingFlowers");
const message = document.querySelector(".message-inner");
const music = document.getElementById("music");

let started = false;
let audioCtx = null;
let melodyTimer = null;

/* ---------------- MÚSICA ---------------- */

async function startMusic() {
  try {
    music.volume = 0.55;
    await music.play();
  } catch (_) {
    startGeneratedMusic();
  }
}

function startGeneratedMusic() {
  if (audioCtx) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23];
  let i = 0;

  function playNote() {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = notes[i % notes.length];

    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.07, audioCtx.currentTime + .04);
    gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + 1.1);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.15);

    i++;
  }

  playNote();
  melodyTimer = setInterval(playNote, 900);
}

/* ---------------- GIRASOLES ---------------- */

/*
  Creamos cada girasol con 12 pétalos reales de CSS + centro marrón.
  Así no quedan como simples puntos negros.
*/
function makeFlower(size = 40) {
  const f = document.createElement("div");
  f.className = "heart-flower";
  f.style.width = size + "px";
  f.style.height = size + "px";

  let petals = "";
  for (let i = 0; i < 12; i++) {
    petals += `<div class="petal" style="--r:${i * 30}deg"></div>`;
  }

  f.innerHTML = `
    ${petals}
    <div class="flower-center">
      <i></i><i></i><i></i><i></i>
    </div>
  `;

  return f;
}

/*
  Genera una forma de corazón matemática y coloca girasoles
  dentro de ella. Se usa "point in polygon" para que los
  girasoles llenen de verdad la silueta, no una nube aleatoria.
*/
function buildHeartPolygon() {
  const polygon = [];
  const steps = 420;

  for (let i = 0; i <= steps; i++) {
    const t = (Math.PI * 2 * i) / steps;

    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    // Convertimos la fórmula a coordenadas del corazón.
    polygon.push({
      x: 50 + x * 2.48,
      y: 48 - y * 2.35
    });
  }

  return polygon;
}

function insidePolygon(x, y, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersects =
      ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

    if (intersects) inside = !inside;
  }

  return inside;
}

function heartPoints(count) {
  const polygon = buildHeartPolygon();
  const points = [];

  let minX = 100, maxX = 0, minY = 100, maxY = 0;

  polygon.forEach(p => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });

  /*
    Primero hacemos una cuadrícula ordenada. Esto produce una
    copa mucho más compacta y reconocible como corazón.
  */
  for (let y = minY; y <= maxY && points.length < count; y += 5.2) {
    for (let x = minX; x <= maxX && points.length < count; x += 5.2) {
      const jitterX = x + (Math.random() - .5) * 2.4;
      const jitterY = y + (Math.random() - .5) * 2.4;

      if (insidePolygon(jitterX, jitterY, polygon)) {
        points.push({ x: jitterX, y: jitterY });
      }
    }
  }

  // Mezclamos para que el nacimiento no sea demasiado mecánico.
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [points[i], points[j]] = [points[j], points[i]];
  }

  return points.slice(0, count);
}

function revealHeart() {
  const points = heartPoints(185);

  points.forEach((p, index) => {
    const flower = makeFlower(index % 6 === 0 ? 51 : 47);

    flower.style.left = p.x + "%";
    flower.style.top = p.y + "%";
    flower.style.animationDelay = (index * .035) + "s";

    heart.appendChild(flower);
  });
}

/* ---------------- TEXTO ---------------- */

function showMessage() {
  message.style.transition = "opacity 1.2s ease, transform 1.2s ease";
  message.style.opacity = "1";
  message.style.transform = "translateY(0)";

  const lines = [...document.querySelectorAll(".line")];

  lines.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(14px)";
    el.style.transition = "opacity .8s ease, transform .8s ease";

    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 900 + i * 700);
  });

  setTimeout(() => {
    document.querySelector(".love").style.opacity = "1";
  }, 3300);
}

/* ---------------- LLUVIA DE GIRASOLES ---------------- */

function createFallingFlower() {
  const f = makeFlower(42);
  f.className = "falling";

  f.style.left = (3 + Math.random() * 94) + "%";
  f.style.setProperty("--drift", ((Math.random() * 240) - 120) + "px");
  f.style.animationDuration = (5 + Math.random() * 3) + "s";
  f.style.animationDelay = (Math.random() * .8) + "s";

  falling.appendChild(f);

  setTimeout(() => f.remove(), 9500);
}

function rainFlowers() {
  for (let i = 0; i < 12; i++) {
    setTimeout(createFallingFlower, i * 260);
  }

  setInterval(createFallingFlower, 620);
}

/* ---------------- INICIO ---------------- */

function begin() {
  if (started) return;
  started = true;

  intro.style.opacity = "0";
  intro.style.transform = "translateX(-50%) scale(.72)";
  intro.style.pointerEvents = "none";

  startMusic();

  // 1. Semilla
  seed.classList.add("drop");

  // 2. Después de caer la semilla, crece el árbol
  setTimeout(() => {
    treeWrap.style.opacity = "1";
    tree.classList.add("grow");
  }, 1600);

  // 3. Cuando termina de crecer el árbol, aparecen los girasoles
  setTimeout(() => {
    revealHeart();
  }, 4400);

  // 4. Texto
  setTimeout(() => {
    showMessage();
  }, 5000);

  // 5. Lluvia final de girasoles
  setTimeout(() => {
    rainFlowers();
  }, 6200);
}

intro.addEventListener("click", begin);

intro.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    begin();
  }
});
