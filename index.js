const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const canvasScore = document.querySelector("#score");
const startGame = document.querySelector("#startGameBtn");
const scoreContainer = document.getElementById("score-container");
const finalScore = document.getElementById("final-score");
const song = document.getElementById("theme-song");
const endGameSound = document.getElementById("end-game-sound");
const volumeHighBtn = document.getElementById("volume-high-btn");
const muteBtn = document.getElementById("mute-btn");
song.loop = true;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  drawPlayer() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  drawProjectile() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.drawProjectile();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  drawEnemy() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.drawEnemy();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  drawParticle() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.drawParticle();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

class ScoreNotification {
  constructor(x, y, text, duration = 0.75) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.alpha = 1;
    this.duration = duration;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }

  update() {
    this.draw();
    this.alpha -= 1 / (60 * this.duration); // Assuming 60 FPS, adjust duration
    if (this.alpha <= 0) {
      scoreNotifications.splice(scoreNotifications.indexOf(this), 1);
    }
  }
}

const xCoordinate = canvas.width / 2;
const yCoordinate = canvas.height / 2;

let player = new Player(xCoordinate, yCoordinate, 10, "white");
let projectiles = [];
let enemies = [];
let particles = [];
let scoreNotifications = [];

let enemiesTimer;
muteBtn.style.display = "none";

function init() {
  score = 0;
  canvasScore.innerHTML = score;
  player = new Player(xCoordinate, yCoordinate, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  scoreNotifications = [];
  song.play();
  toggleVisibility(volumeHighBtn, muteBtn);
  muteBtn.style.display = "none";
}

let score = 0;
function createEnemies() {
  enemiesTimer = setInterval(() => {
    const radius = Math.random() * (35 - 12) + 12;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360},50%,50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const speedMultiplier = score > 10000 ? 2 : 1;
    const velocity = {
      x: Math.cos(angle) * speedMultiplier,
      y: Math.sin(angle) * speedMultiplier,
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

let animationId;

function animate() {
  animationId = window.requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.drawPlayer();

  handleParticles();
  handleProjectiles();
  handleEnemies();
  handleScoreNotifications();
}

function handleParticles() {
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
}

function handleProjectiles() {
  projectiles.forEach((projectile, index) => {
    projectile.update();
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });
}

function handleEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.update();
    checkCollisions(enemy, index);
  });
}

function handleScoreNotifications() {
  scoreNotifications.forEach((notification) => {
    notification.update();
  });
}

function checkCollisions(enemy, index) {
  const distanceBtwPlayerAndEnemy = Math.hypot(
    xCoordinate - enemy.x,
    yCoordinate - enemy.y
  );
  //stop the game
  if (distanceBtwPlayerAndEnemy - player.radius - enemy.radius < 1) {
    cancelAnimationFrame(animationId);
    scoreContainer.style.display = "flex";
    finalScore.innerHTML = score;
    song.currentTime = 0;
    song.pause();
    endGameSound.play();
    clearInterval(enemiesTimer);
  }

  // remove projectile and enemy from canvas when colloids
  projectiles.forEach((projectile, projectileIndex) => {
    const distanceBtwProjAndEnemy = Math.hypot(
      projectile.x - enemy.x,
      projectile.y - enemy.y
    );
    if (distanceBtwProjAndEnemy - projectile.radius - enemy.radius < 1) {
      let scoreIncrease = enemy.radius - 10 > 10 ? 100 : 250;

      // Add a score notification instead of a score particle
      scoreNotifications.push(
        new ScoreNotification(enemy.x, enemy.y, `+${scoreIncrease}`)
      );
      //create brust effect when projectile and enemy hits
      for (let i = 0; i < enemy.radius * 2; i++) {
        particles.push(
          new Particle(enemy.x, enemy.y, Math.random() * 2, enemy.color, {
            x: (Math.random() - 0.5) * Math.random() * 5,
            y: (Math.random() - 0.5) * Math.random() * 5,
          })
        );
      }
      // decrease the size of enemy when hit by projectile and remove that projectile
      if (enemy.radius - 10 > 10) {
        gsap.to(enemy, { radius: enemy.radius - 10 });
        score += 100;
        canvasScore.innerHTML = score;
        setTimeout(() => {
          projectiles.splice(projectileIndex, 1);
        }, 0);
      } else {
        // remove both projectile and enemy when hit
        score += 250;
        canvasScore.innerHTML = score;
        setTimeout(() => {
          enemies.splice(index, 1);
          projectiles.splice(projectileIndex, 1);
        }, 0);
      }
    }
  });
}

window.addEventListener("click", (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );
});

startGame.addEventListener("click", () => {
  init();
  animate();
  createEnemies();
  scoreContainer.style.display = "none";
});

function toggleVisibility(elemToShow, elemToHide) {
  elemToShow.style.display = "block";
  elemToHide.style.display = "none";
}

muteBtn.addEventListener("click", () => {
  song.play();
  toggleVisibility(volumeHighBtn, muteBtn);
});

volumeHighBtn.addEventListener("click", () => {
  song.pause();
  toggleVisibility(muteBtn, volumeHighBtn);
});
