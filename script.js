let mode = 'stopwatch';
let interval = null;
let seconds = 0;
let currentBgColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg-color');

function playClick() {
  const clickSound = document.getElementById('clickSound');
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.error("Error playing click sound:", e));
  }
}

function setCustomTimer() {
  playClick();
  const hrs = Math.max(0, parseInt(document.getElementById('customHours').value) || 0);
  const mins = Math.max(0, parseInt(document.getElementById('customMinutes').value) || 0);
  const secs = Math.max(0, parseInt(document.getElementById('customSeconds').value) || 0);
  seconds = hrs * 3600 + mins * 60 + secs;
  updateDisplay('timer');
}

function switchScreens(hideId, showId) {
  playClick();

  const hide = document.getElementById(hideId);
  const show = document.getElementById(showId);

  if (hide) {
    hide.classList.remove('active');
    hide.classList.add('slide-left');
  }

  if (show) {
    show.classList.remove('active');
    show.classList.remove('slide-left');
    show.classList.add('slide-right');
    show.style.display = 'flex';
  }

  setTimeout(() => {
    if (hide) {
      hide.style.display = 'none';
      hide.classList.remove('slide-left');
    }
    if (show) {
      show.classList.remove('slide-right');
      show.classList.add('active');
    }
  }, 600);
}

function goToMode(selectedMode) {
  mode = selectedMode;
  if (selectedMode === 'focus') {
    switchScreens('chooseModeScreen', 'focusTimeScreen');
  } else {
    switchScreens('chooseModeScreen', 'timerScreen');
    switchMode(selectedMode);
  }
}

function formatTime(sec) {
  const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
  const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const secs = String(sec % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function updateDisplay(targetDisplay = 'auto') {
  const formatted = formatTime(seconds);
  const displayElement = document.getElementById('display');
  const focusDisplayElement = document.getElementById('focusDisplay');

  if (targetDisplay === 'timer' || (targetDisplay === 'auto' && mode !== 'focus')) {
    if (displayElement) displayElement.textContent = formatted;
  }
  if (targetDisplay === 'focus' || (targetDisplay === 'auto' && mode === 'focus' && focusDisplayElement && document.getElementById('focusOverlay').style.display === 'flex')) {
    if (focusDisplayElement) focusDisplayElement.textContent = formatted;
  }
}

function toggle() {
  playClick();
  const btn = document.getElementById('toggleBtn');
  const display = document.getElementById('display');

  if (interval) {
    clearInterval(interval);
    interval = null;
    btn.textContent = 'Start';
  } else {
    btn.textContent = 'Pause';
    interval = setInterval(() => {
      if (mode === 'stopwatch') {
        seconds++;
      } else {
        if (seconds > 0) {
          seconds--;
          if (seconds === 0) {
            const alertSound = document.getElementById('alertSound');
            if (alertSound) alertSound.play().catch(e => console.error("Error playing alert sound:", e));
            if (display) display.classList.add('sparkle-effect');
            setTimeout(() => {
              if (display) display.classList.remove('sparkle-effect');
            }, 3000);
            clearInterval(interval);
            interval = null;
            btn.textContent = 'Start';
          }
        } else {
          clearInterval(interval);
          interval = null;
          btn.textContent = 'Start';
        }
      }
      updateDisplay('timer');
    }, 1000);
  }
}

function startFocusMode() {
  playClick();

  if (!interval) {
    const inputHours = parseInt(document.getElementById('focusHours').value) || 0;
    const inputMinutes = parseInt(document.getElementById('focusMinutes').value) || 0;
    const inputSeconds = parseInt(document.getElementById('focusSeconds').value) || 0;
    seconds = Math.max(0, inputHours * 3600 + inputMinutes * 60 + inputSeconds);
  }

  if (seconds <= 0) {
    alert("Please enter a valid time for Focus Mode.");
    return;
  }

  document.getElementById('focusOverlay').style.display = 'flex';
  updateDisplay('focus');

  clearInterval(interval);
  interval = setInterval(() => {
    if (seconds > 0) {
      seconds--;
      updateDisplay('focus');
      if (seconds === 0) {
        const alertSound = document.getElementById('alertSound');
        if (alertSound) alertSound.play().catch(e => console.error("Error playing alert sound:", e));

        const focusDisplay = document.getElementById('focusDisplay');
        if (focusDisplay) focusDisplay.classList.add('sparkle-effect');
        setTimeout(() => {
          if (focusDisplay) focusDisplay.classList.remove('sparkle-effect');
        }, 3000);
        clearInterval(interval);
        interval = null;
        document.getElementById('focusHours').value = '';
        document.getElementById('focusMinutes').value = '';
        document.getElementById('focusSeconds').value = '';
      }
    } else {
      clearInterval(interval);
      interval = null;
      document.getElementById('focusHours').value = '';
      document.getElementById('focusMinutes').value = '';
      document.getElementById('focusSeconds').value = '';
    }
  }, 1000);
}

function exitFocusMode() {
  playClick();
  clearInterval(interval);
  interval = null;
  seconds = 0;
  document.getElementById('focusOverlay').style.display = 'none';
  document.getElementById('focusHours').value = '';
  document.getElementById('focusMinutes').value = '';
  document.getElementById('focusSeconds').value = '';

  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active', 'slide-left', 'slide-right');
    screen.style.display = 'none';
  });
  document.getElementById('chooseModeScreen').style.display = 'flex';
  document.getElementById('chooseModeScreen').classList.add('active');
}

function pauseFocusMode() {
  playClick();
  clearInterval(interval);
  interval = null;
  document.getElementById('focusOverlay').style.display = 'none';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  document.getElementById('focusHours').value = hrs > 0 ? hrs : '';
  document.getElementById('focusMinutes').value = mins > 0 ? mins : '';
  document.getElementById('focusSeconds').value = secs > 0 ? secs : '';

  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active', 'slide-left', 'slide-right');
    screen.style.display = 'none';
  });
  document.getElementById('focusTimeScreen').style.display = 'flex';
  document.getElementById('focusTimeScreen').classList.add('active');
}

function reset() {
  playClick();
  clearInterval(interval);
  interval = null;
  seconds = 0;
  updateDisplay('timer');
  document.getElementById('toggleBtn').textContent = 'Start';
  document.getElementById('customHours').value = '';
  document.getElementById('customMinutes').value = '';
  document.getElementById('customSeconds').value = '';
}

function switchMode(newMode) {
  mode = newMode;
  reset();
  const modeLabel = document.getElementById('modeLabel');
  if (modeLabel) {
    modeLabel.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
  }

  const isTimer = (mode === 'timer');
  const presetContainer = document.getElementById('presetContainer');
  const customTimeContainer = document.getElementById('customTimeContainer');

  if (presetContainer) {
    presetContainer.style.display = isTimer ? 'flex' : 'none';
  }
  if (customTimeContainer) {
    customTimeContainer.style.display = isTimer ? 'flex' : 'none';
  }
}

function setTimer(mins) {
  playClick();
  seconds = mins * 60;
  updateDisplay('timer');
  document.getElementById('customHours').value = '';
  document.getElementById('customMinutes').value = '';
  document.getElementById('customSeconds').value = '';
}

function changeBackground(color) {
  playClick();
  document.documentElement.style.setProperty('--primary-bg-color', color);
  currentBgColor = color;
}

const canvas = document.getElementById('fireflyCanvas');
const ctx = canvas.getContext('2d');
let fireflies = [];
const NUM_FIREFLIES = 10;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Firefly {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 1.5 + 0.5;
    this.lightness = Math.random() * 0.4 + 0.2;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.life = Math.random() * 100 + 50;
    this.initialLife = this.life;
    this.alpha = 0;
    this.blinkRate = Math.random() * 0.0005 + 0.0005;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    this.life -= 1;
    this.alpha = (Math.sin(this.life * this.blinkRate * Math.PI) + 1) / 2;
    if (this.life <= 0) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.life = Math.random() * 100 + 50;
      this.initialLife = this.life;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.alpha = 0;
    }
  }

  draw() {
    const baseR = 127, baseG = 140, baseB = 20;
    const brightness = 0.4 + Math.random() * 0.1;
    const glowColor = `rgba(${Math.min(256, baseR * brightness)}, ${Math.min(256, baseG * brightness)}, ${Math.min(256, baseB * brightness)}, ${this.alpha * 0.9})`;
    ctx.filter = `blur(${this.radius * 2}px)`;
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';
    const coreColor = `rgba(${Math.min(255, baseR * (brightness + 0.3))}, ${Math.min(255, baseG * (brightness + 0.3))}, ${Math.min(255, baseB * (brightness + 0.3))}, ${this.alpha})`;
    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initFireflies() {
  fireflies = [];
  for (let i = 0; i < NUM_FIREFLIES; i++) {
    fireflies.push(new Firefly());
  }
}

function animateFireflies() {
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg-color');
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  fireflies.forEach(f => {
    f.update();
    f.draw();
  });
  requestAnimationFrame(animateFireflies);
}

window.onload = () => {
  updateDisplay();
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active', 'slide-left', 'slide-right');
    screen.style.display = 'none';
  });
  const hello = document.getElementById('helloScreen');
  if (hello) {
    hello.classList.add('active');
    hello.style.display = 'flex';
    hello.style.position = 'relative';
  }
  document.getElementById('focusOverlay').style.display = 'none';
  changeBackground(getComputedStyle(document.documentElement).getPropertyValue('--primary-bg-color'));
  initFireflies();
  animateFireflies();
};
