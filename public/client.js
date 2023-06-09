const socket = io("ws://localhost:2000");
const canvas = document.querySelector("canvas");
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const chatForm = document.getElementById("chat-form");
const signDiv = document.getElementById("signDiv");
const username = document.getElementById("username");
const signIn = document.getElementById("signIn");
const gameDiv = document.getElementById("gameDiv");
const startBtn = document.getElementById("start");
const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");
const timeLeft = document.getElementById("timeleft");
const c = canvas.getContext("2d");
canvas.width = 840;
canvas.height = 840;
let mouseX = 0;
let mouseY = 0;
const img = {};
img.player = new Image();
img.player.src = "img/mage.png";
img.fireball = new Image();
img.fireball.src = "img/fireball.png";
img.toxic = new Image();
img.toxic.src = "img/toxic.png";
img.icelance = new Image();
img.icelance.src = "img/icelance.png";
img.map = new Image();
img.map.src = "/img/grass.png";
img.tiles = new Image();
img.tiles.src = "/img/box.png";
img.potion = new Image();
img.potion.src = "/img/pt1.png";
img.buff = new Image();
img.buff.src = "/img/pt2.png";
const audio = {};
audio.fireball = new Audio();
audio.fireball.src = "audio/fireball.mp3";
audio.fireballCollision = new Audio();
audio.fireballCollision.src = "audio/fireball-collision.mp3";
audio.icelance = new Audio();
audio.icelance.src = "audio/icelance.mp3";
audio.icecrack = new Audio();
audio.icecrack.src = "audio/icecrack.mp3";
audio.toxic = new Audio();
audio.toxic.src = "audio/toxic.mp3";
audio.splash = new Audio();
audio.splash.src = "audio/splash.mp3";
audio.walking = new Audio();
audio.walking.src = "audio/walking.mp3";
audio.potion = new Audio();
audio.potion.src = "audio/potion.mp3";
audio.intro = new Audio();
audio.intro.src = "audio/intro.mp3";
const PLAYER_LIST = [];
const staggerFrames = 2;
let fireBallFrameX = 0;
let iceLanceFrameX = 0;
let gameFrame = 0;
let frameX = 0;
startBtn.onclick = function () {
  socket.emit("startGame");
};
signIn.onclick = function () {
  socket.emit("signIn", { username: username.value });
};
socket.on("roomFull", () => {
  alert("Sorry the room is full. Please try again later");
});
socket.on("updateScore", function (data) {
    document.getElementById("scoreYou").textContent = data.scoreYou
    document.getElementById("scoreEnemy").textContent = data.scoreEnemy
    console.log(`UPDATE SCORE: ${JSON.stringify(data)}`)
    if (data.scoreEnemy == 7 && data.scoreYou == 7){
        alert("Game draw!")
    }
    else if (data.scoreYou >=7) {
        alert(`You won!. Opponent score: ${data.scoreEnemy}`)
    } else if (data.scoreEnemy >= 7){
        alert(`You lost!. Opponent score: ${data.scoreEnemy}`)
    }
})
socket.on("signInRes", function (data) {
  if (data.success) {
    signDiv.style.display = "none";
    gameDiv.style.display = "inline-block";
    score1.innerText += data.username + ": ";
    score2.innerText += data.username + ": ";
  } else alert("Sign in unsuccessful");
});
socket.on("addToChat", function (data) {
  chatBox.innerHTML += "<div>" + data + "</div>";
  chatBox.scrollTop = chatBox.scrollHeight;
});
chatForm.onsubmit = function (e) {
  e.preventDefault();
  socket.emit("sendMsgToServer", chatInput.value);
  chatInput.value = "";
};
socket.on("timer", function (data) {
  timeLeft.innerText = " " + data.time;
});
socket.on("newPositions", function (data) {
  c.clearRect(0, 0, 840, 840);
  c.fillStyle = "#CAE9FF";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.drawImage(img.map, 0, 0, canvas.width, canvas.height);

    const CROSSHAIR_E = 10
    c.moveTo(mouseX, mouseY - CROSSHAIR_E)
    c.lineTo(mouseX, mouseY + CROSSHAIR_E)
    c.moveTo(mouseX - CROSSHAIR_E, mouseY)
    c.lineTo(mouseX + CROSSHAIR_E, mouseY)
    c.stroke()
    c.save()

  for (let i = 0; i < data.boundary.length; i++) {
    c.save();
    c.translate(data.boundary[i].cx, data.boundary[i].cy);
    c.rotate((data.boundary[i].m * Math.PI) / 180);
    c.translate(-data.boundary[i].cx, -data.boundary[i].cy);
    c.fillStyle = "#5FA8D3";
    c.fillRect(
      data.boundary[i].x,
      data.boundary[i].y,
      data.boundary[i].w,
      data.boundary[i].h
    );
    c.drawImage(
      img.tiles,
      data.boundary[i].x,
      data.boundary[i].y,
      data.boundary[i].w,
      data.boundary[i].h
    );
    c.restore();
  }


    // Consumable
  for (let i = 0; i < data.consumable.length; i++) {
      c.beginPath()
      c.closePath()
    // c.beginPath();
    // c.arc(
    //   data.consumable[i].x,
    //   data.consumable[i].y,
    //   data.consumable[i].r,
    //   0,
    //   Math.PI * 2
    // );
    // c.fillStyle = data.consumable[i].c;
    // c.closePath();
    if (data.consumable[i].c === "green") {
      c.drawImage(
        img.potion,
        data.consumable[i].x - data.consumable[i].r,
        data.consumable[i].y - data.consumable[i].r,
        data.consumable[i].r * 2,
        data.consumable[i].r * 2
      );
    }
    if (data.consumable[i].c === "blue") {
      c.drawImage(
        img.buff,
        data.consumable[i].x - data.consumable[i].r,
        data.consumable[i].y - data.consumable[i].r,
        data.consumable[i].r * 2,
        data.consumable[i].r * 2
      );
    }
  }

    // Player
  for (let i = 0; i < data.player.length; i++) {
    c.fillStyle = "red";
    c.fillRect(data.player[i].x - 15, data.player[i].y - 40, 50, 5);
    c.fillStyle = "green";
    c.fillRect(
      data.player[i].x - 15,
      data.player[i].y - 40,
      50 * (data.player[i].hh / 200),
      5
    );
    c.save();
    c.translate(
      data.player[i].x + data.player[i].w / 2,
      data.player[i].y + data.player[i].h / 2
    );
    console.log(data.player[i].a);
    c.rotate(data.player[i].a);
    c.translate(
      -data.player[i].x - data.player[i].w / 2,
      -data.player[i].y - data.player[i].h / 2
    );
    c.drawImage(
      img.player,
      0,
      0,
      200,
      200,
      data.player[i].x - data.player[i].w / 2,
      data.player[i].y - data.player[i].h / 2,
      data.player[i].w * 2,
      data.player[i].h * 2
    );
    if (
      data.player[i].pr ||
      data.player[i].pl ||
      data.player[i].pu ||
      data.player[i].pd
    ) {
      c.drawImage(
        img.player,
        frameX * 200,
        0,
        200,
        200,
        data.player[i].x - data.player[i].w / 2,
        data.player[i].y - data.player[i].h / 2,
        data.player[i].w * 2,
        data.player[i].h * 2
      );
      if (gameFrame % staggerFrames == 0) {
        if (frameX < 11) frameX++;
        else frameX = 0;
      }
      gameFrame++;
    }
    c.restore();
  }
  for (let i = 0; i < data.projectile.length; i++) {
    c.save();
    c.translate(
      data.projectile[i].x + data.projectile[i].w / 2,
      data.projectile[i].y + data.projectile[i].h / 2
    );
    c.rotate(data.projectile[i].a);
    c.translate(
      -data.projectile[i].x - data.projectile[i].w / 2,
      -data.projectile[i].y - data.projectile[i].h / 2
    );
    if (data.projectile[i].c === "red") {
      c.save();
      c.translate(
        data.projectile[i].x + data.projectile[i].w / 2,
        data.projectile[i].y + data.projectile[i].h / 2
      );
      c.rotate((-90 * Math.PI) / 180);
      c.translate(
        -data.projectile[i].x - data.projectile[i].w / 2,
        -data.projectile[i].y - data.projectile[i].h / 2
      );
      c.drawImage(
        img.fireball,
        fireBallFrameX * 130,
        0,
        130,
        60,
        data.projectile[i].x,
        data.projectile[i].y,
        data.projectile[i].w * 4,
        data.projectile[i].h * 2
      );
      if (gameFrame % staggerFrames == 0) {
        if (fireBallFrameX < 7) fireBallFrameX++;
        else fireBallFrameX = 0;
      }
      gameFrame++;
      c.restore();
    }
    if (data.projectile[i].c === "green") {
      c.drawImage(
        img.toxic,
        data.projectile[i].x - data.projectile[i].w,
        data.projectile[i].y - data.projectile[i].h / 2,
        data.projectile[i].w * 3,
        data.projectile[i].h * 3
      );
    }
    if (data.projectile[i].c === "blue") {
      c.save();
      c.translate(
        data.projectile[i].x + data.projectile[i].w / 2,
        data.projectile[i].y + data.projectile[i].h / 2
      );
      c.rotate((-90 * Math.PI) / 180);
      c.translate(
        -data.projectile[i].x - data.projectile[i].w / 2,
        -data.projectile[i].y - data.projectile[i].h / 2
      );
      c.drawImage(
        img.icelance,
        iceLanceFrameX * 40,
        0,
        40,
        40,
        data.projectile[i].x - data.projectile[i].w * 3,
        data.projectile[i].y - data.projectile[i].h * 3,
        data.projectile[i].w * 4,
        data.projectile[i].h * 4
      );
      if (gameFrame % staggerFrames == 0) {
        if (iceLanceFrameX < 7) iceLanceFrameX++;
        else iceLanceFrameX = 0;
      }
      gameFrame++;
      c.restore();
    }
    if (data.projectile[i].colliding) {
      if (data.projectile[i].c === "red") {
        audio.fireballCollision.play();
      }
      if (data.projectile[i].c === "green") {
        audio.splash.play();
      }
      if (data.projectile[i].c === "blue") {
        audio.icecrack.play();
      }
      socket.emit("collided");
    }
    c.restore();
  }

});
const keys = {
  one: {
    pressed: false,
  },
  two: {
    pressed: false,
  },
  three: {
    pressed: false,
  },
};
window.addEventListener("keydown", (event) => {
  if (event.code == "KeyD") {
    socket.emit("keypress", { inputID: "right", pressed: true });
  }
  if (event.code == "KeyA") {
    socket.emit("keypress", { inputID: "left", pressed: true });
  }
  if (event.code == "KeyS") {
    socket.emit("keypress", { inputID: "down", pressed: true });
  }
  if (event.code == "KeyW") {
    socket.emit("keypress", { inputID: "up", pressed: true });
  }
  if (event.code == "ShiftLeft") {
    socket.emit("keypress", { inputID: "shift", pressed: true });
  }
  if (event.key == "1") {
    keys.one.pressed = true;
    keys.two.pressed = false;
    keys.three.pressed = false;
  }
  if (event.key == "2") {
    keys.two.pressed = true;
    keys.one.pressed = false;
    keys.three.pressed = false;
  }
  if (event.key == "3") {
    keys.three.pressed = true;
    keys.one.pressed = false;
    keys.two.pressed = false;
  }
  if (["KeyD", "KeyA", "KeyS", "KeyW"].includes(event.code)) {
    audio.walking.play();
  }
});
window.addEventListener("keyup", (event) => {
  if (event.code == "KeyD") {
    socket.emit("keypress", { inputID: "right", pressed: false });
  }
  if (event.code == "KeyA") {
    socket.emit("keypress", { inputID: "left", pressed: false });
  }
  if (event.code == "KeyS") {
    socket.emit("keypress", { inputID: "down", pressed: false });
  }
  if (event.code == "KeyW") {
    socket.emit("keypress", { inputID: "up", pressed: false });
  }
  if (event.code == "ShiftLeft") {
    socket.emit("keypress", { inputID: "shift", pressed: false });
  }
  if (["KeyD", "KeyA", "KeyS", "KeyW"].includes(event.code)) {
    audio.walking.pause();
  }
});
window.addEventListener("mousemove", (event) => {
  let pos = getMousePos(canvas, event);
  mouseX = pos.x;
  mouseY = pos.y;
  socket.emit("mouseposition", { mX: pos.x, mY: pos.y });
});
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  const x = evt.clientX - rect.left;
  const y = evt.clientY - rect.top;
  console.log({ x, y });
  return {
    x,
    y,
  };
}
const throttle = (fn, delay) => {
  let last = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - last < delay) {
      return;
    }
    last = now;
    return fn(...args);
  };
};
function isMouseInsideCanvas() {
    return !(mouseX < 0 || mouseX > 840 || mouseY < 0 || mouseY > 840)
}
function isGameScreen() {
    return signDiv.style.display === "none"
}
window.addEventListener(
  "click",
  throttle(() => {
    if (isMouseInsideCanvas() && isGameScreen() && (
      keys.one.pressed ||
      (!keys.one.pressed && !keys.two.pressed && !keys.three.pressed)

    )) {
      socket.emit("clicked", { type: "fire" });
      audio.fireball.play();
    }
  }, 500)
);
window.addEventListener(
  "click",
  throttle(() => {
    if (isMouseInsideCanvas() && (keys.two.pressed)) {
      socket.emit("clicked", { type: "toxic" });
      audio.toxic.play();
    }
  }, 1000)
);
window.addEventListener(
  "click",
  throttle(() => {
    if (isMouseInsideCanvas() && keys.three.pressed) {
      socket.emit("clicked", { type: "ice" });
      audio.icelance.play();
    }
  }, 1500)
);
