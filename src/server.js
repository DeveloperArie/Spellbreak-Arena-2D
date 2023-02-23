const express = require('express') // importing express
const { createServer } = require("http") // importing http
const { Server } = require("socket.io") // importing socket.io
const { Boundary, Consumable, boundaries, consumables } = require('./map')
const app = express() // creating express app
const httpServer = createServer(app) // passing express to the server
const io = new Server(httpServer) // creating the server
const TICK_RATE = 30
const SOCKET_LIST = []
const PLAYER_LIST = []
const PROJECTILE_LIST = []
let deletedItems = []
let deletedItem = []
let timer = 60

class Player {
    constructor({position, velocity}, id){
        this.position = position
        this.velocity = velocity
        this.id = id
        this.height = 20
        this.width = 20
        this.pressingRight = false
        this.pressingLeft = false
        this.pressingUp = false
        this.pressingDown = false
        this.isDashing = false
        this.angle = 0
        this.rotation
        this.mouseX
        this.mouseY
        this.targetVelocityX
        this.targetVelocityY
        this.health = 200
        this.powerUp
        this.isConsuming
        this.projectileIsColliding
        this.powerUpTimer = 0
        this.powerUpTime = 200
        this.score = 0
    }
    updatePosition(){
        if(this.pressingRight){
            this.position.x += this.velocity.x
        }
        if(this.pressingLeft){
            this.position.x -= this.velocity.x
        }
        if(this.pressingUp){
            this.position.y -= this.velocity.y
        }
        if(this.pressingDown){
            this.position.y += this.velocity.y
        }
        if(this.isDashing){
            this.position.y += this.velocity.y
        }
        playerBoundaryCollisionDetection()
        playerConsumableCollisionDetection()
    }
    updateFacingPosition(){
        this.angle = Math.atan2(this.mouseX - this.position.x, -(this.mouseY -this.position.y))
        this.rotation = this.angle - Math.PI/2
        this.targetVelocityX = Math.cos(this.rotation)
        this.targetVelocityY = Math.sin(this.rotation)
    }
}

Player.onConnect = function(socket){
    let player = new Player({
        position: {
            x: 50,
            y: 760
        },
        velocity: {
            x: 5,
            y: 5
        }}, socket.id)
    PLAYER_LIST[socket.id] = player
    socket.on('keypress', function(data){
        if(data.inputID === 'right'){
            player.pressingRight = data.pressed
        }
        if(data.inputID === 'left'){
            player.pressingLeft = data.pressed
        }
        if(data.inputID === 'down'){
            player.pressingDown = data.pressed
        }
        if(data.inputID === 'up'){
            player.pressingUp = data.pressed
        }
    })
    socket.on('mouseposition', function(data) {
        player.mouseX = data.mX
        player.mouseY = data.mY
    })
    socket.on('clicked', function(data){
        if(data.type === 'fire'){
            fire(player)
        }
        else if(data.type === 'toxic'){
            toxic(player)
        }
        else if(data.type === 'ice'){
            ice(player)
        }
        else{
            fire(player)
        }
    })
    socket.on('drankpotion', () => {
        player.isConsuming = false
    })
    socket.on('collided', () => {
        player.projectileIsColliding = false
    })
    
}

Player.onDisconnect = function(socket){
    delete PLAYER_LIST[socket.id]
}

class Projectile {
    constructor({position, velocity}, width, height, damage, color, time, parent, angle, modifier){
        this.position = position
        this.velocity = velocity
        this.width = width,
        this.height = height
        this.timer = 0
        this.damage = damage
        this.color = color
        this.time = time
        this.parent = parent
        this.angle = angle
        this.modifier = modifier
    }
    updatePosition(){
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        projectilePlayerCollisionDetection()
        PROJECTILE_LIST.forEach((projectile, index) => {
            if(projectile.timer++ > projectile.time){
                PROJECTILE_LIST.splice(index, 1)
            }
        })     
    }
}

function fire(player){
    let fireball
    if(player.powerUp){
        fireball = new Projectile({
            position: {
                x: player.position.x + player.width / 2,
                y: player.position.y + player.height / 2
            },
            velocity: {
                x: player.targetVelocityX * 10,
                y: player.targetVelocityY * 10
            },
        }, 10, 10, 75, 'red', 70, player.id, player.angle)
    } else {
        fireball = new Projectile({
            position: {
                x: player.position.x + player.width / 2,
                y: player.position.y + player.height / 2
            },
            velocity: {
                x: player.targetVelocityX * 10,
                y: player.targetVelocityY * 10
            },
        }, 5, 5, 50, 'red', 50, player.id, player.angle)
    }
    PROJECTILE_LIST.push(fireball)
}

function toxic(player){
    let toxicModifier = [-0.2, -0.1, 0, 0.1, 0.2]
    let toxicObj
    if(player.powerUp){
        toxicModifier = [-0.1, -0.05, 0, 0.05, 0.1]
        for(let i = 0; i <= 5; i++){
            for(let j = 0; j < toxicModifier.length; j ++){
                player.targetVelocityX = Math.cos(player.rotation - toxicModifier[i])
                player.targetVelocityY = Math.sin(player.rotation - toxicModifier[i])
            }
            toxicObj = new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y + player.height / 2
                },
                velocity: {
                    x: player.targetVelocityX * 10,
                    y: player.targetVelocityY * 10
                },
            }, 4, 4, 20, 'green', 225, player.id, player.angle)
            PROJECTILE_LIST.push(toxicObj)
        }
    } else {
        for(let i = 0; i <= 5; i++){
            for(let j = 0; j < toxicModifier.length; j ++){
                player.targetVelocityX = Math.cos(player.rotation - toxicModifier[i])
                player.targetVelocityY = Math.sin(player.rotation - toxicModifier[i])
            }
            toxicObj = new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y + player.height / 2
                },
                velocity: {
                    x: player.targetVelocityX * 8,
                    y: player.targetVelocityY * 8
                },
            }, 4, 4, 20, 'green', 150, player.id, player.angle)  
            PROJECTILE_LIST.push(toxicObj) 
        }
    }
}

function ice(player){
    let icelance
    if(player.powerUp){
        icelance = new Projectile({
            position: {
                x: player.position.x + player.width / 2,
                y: player.position.y + player.height / 2
            },
            velocity: {
                x: player.targetVelocityX * 20,
                y: player.targetVelocityY * 20
            }
        }, 8, 8, 200, 'blue', 80, player.id, player.angle)
    } else {
        icelance = new Projectile({
            position: {
                x: player.position.x + player.width / 2,
                y: player.position.y + player.height / 2
            },
            velocity: {
                x: player.targetVelocityX * 15,
                y: player.targetVelocityY * 15
            }
        }, 4, 4, 150, 'blue', 40, player.id, player.angle)
    }
    PROJECTILE_LIST.push(icelance)
}

function projectilePlayerCollisionDetection(){
    for(let i = 0; i < PROJECTILE_LIST.length; i++){
        const projectile = PROJECTILE_LIST[i]
        for (let key in PLAYER_LIST){
            const player = PLAYER_LIST[key]
            projectileBoundaryCollisionDetection(player)
                if(projectile.parent !== player.id) {
                    if(projectile.position.y <= player.position.y + player.height && 
                    projectile.position.y + projectile.height >= player.position.y &&
                    projectile.position.x + projectile.width >= player.position.x && 
                    projectile.position.x <= player.position.x + player.width)
                    {
                        player.health -= projectile.damage
                        if(player.health <= 0){
                            let shooter = PLAYER_LIST[projectile.parent]
                            if(shooter){
                                shooter.score += 1
                            }
                            player.health = 200
                            player.position.x = 50
                            player.position.y = 780
                    }
                    PROJECTILE_LIST.splice(i, 1)
                    player.projectileIsColliding = true
                }
            }
        }
    }
}

function projectileBoundaryCollisionDetection(player){
    PROJECTILE_LIST.forEach((projectile, index) => {
        if (projectile.position.x < 0 || projectile.position.x > 840 || projectile.position.y < 0 || projectile.position.y > 840) {
            PROJECTILE_LIST.splice(index, 1)
            player.projectileIsColliding = true
        }
        for(let i = 0; i < boundaries.length; i++){
            let boundary = boundaries[i]
            if(projectile.position.y 
                <= 
                boundary.position.y + boundary.height && 
                projectile.position.y + projectile.height 
                >= 
                boundary.position.y &&
                projectile.position.x + projectile.width 
                >=
                boundary.position.x && 
                projectile.position.x 
                <= 
                boundary.position.x + boundary.width) {
                    PROJECTILE_LIST.splice(index, 1)
                    player.projectileIsColliding = true
            }
        } 
    })
}

function playerBoundaryCollisionDetection(){
    boundaries.forEach(boundary => {
        for(let i in PLAYER_LIST){
            let player = PLAYER_LIST[i]
            if (player.position.x < 0 || player.position.x > 840 || player.position.y < 0 || player.position.y > 840){
                player.velocity.x = 0;
                player.velocity.y = 0;    
            }
            if(player.position.y + player.velocity.y
                <= 
                boundary.position.y + boundary.height &&
            player.position.x + player.width + player.velocity.x 
                >= 
                boundary.position.x &&
            player.position.y + player.height + player.velocity.y 
                >= 
                boundary.position.y &&
            player.position.x + player.velocity.x 
                <= 
                boundary.position.x + boundary.width){
                
                player.velocity.x = 0;
                player.velocity.y = 0; 
            } 
        }
    })
}

function circleRectangleCollisionDetection(p, c){
    const distX = Math.abs(c.position.x - p.position.x - p.width / 2)
    const distY = Math.abs(c.position.y - p.position.y - p.height / 2)
        if(distX > (p.width / 2 + c.radius)){
            return false
        }
        if(distY > (p.height / 2 + c.radius)){
            return false
        }
        if(distX <= (p.width / 2)){
            return true
        } else if(distY <= (p.height / 2)){
            return true
        }
        const dx = distX - p.width / 2
        const dy = distY - p.height / 2
        return (dx*dx + dy*dy <=(c.radius*c.radius))
}

function playerConsumableCollisionDetection(){
    for(let p in PLAYER_LIST){
        let player = PLAYER_LIST[p]
        for(let i = consumables.length - 1; 0 <= i; i--) {
            const consumable = consumables[i]
            if(circleRectangleCollisionDetection(player, consumable)){
                if(consumable.color === 'green' && player.health < 200){
                    player.health += 25
                    deletedItem = consumables.splice(i, 1)
                    deletedItems.push(deletedItem)
                    deletedItems.forEach(deletedItem => {
                        setTimeout(function(){
                            consumables.splice(i, 0, ...deletedItem)
                        }, 5000)
                    })
                    deletedItems.pop(deletedItem)
                    player.isConsuming = true
                } else if(consumable.color === 'blue'){
                    player.powerUp = true
                    deletedItem = consumables.splice(i, 1)
                    deletedItems.push(deletedItem)
                    deletedItems.forEach(deletedItem => {
                        setTimeout(function(){
                            consumables.splice(i, 0, ...deletedItem)
                        }, 5000)
                    })
                    deletedItems.pop(deletedItem)
                    player.isConsuming = true
                    console.log(player.isConsuming)
                } 
            }
        } 
    }
}

Player.update = function(){
    let pack = []
    for(let i in PLAYER_LIST){
        let player = PLAYER_LIST[i]
        player.updatePosition()
        player.updateFacingPosition()
        pack.push({
            x: player.position.x,
            y: player.position.y,
            vx: player.velocity.x,
            vy: player.velocity.y,
            w: player.width,
            h: player.height,
            a: player.angle,
            hh: player.health,
            pr: player.pressingRight,
            pl: player.pressingLeft ,
            pu: player.pressingUp,
            pd: player.pressingDown,
            pdash: player.isDashing,
            consumed: player.isConsuming,
            pColliding: player.projectileIsColliding,
            fx: player.frameX
        })
    } 
    return pack
}

Projectile.update = function(){
    let pack = []
    for(let i in PROJECTILE_LIST){
        let projectile = PROJECTILE_LIST[i]
        projectile.updatePosition()
        pack.push({
            x: projectile.position.x,
            y: projectile.position.y,
            w: projectile.width,
            h: projectile.height,
            c: projectile.color,
            a: projectile.angle,
            colliding: projectile.parent.projectileIsColliding
        })
    } 
    return pack
}

Boundary.update = function(){
    let pack = []
    for(let i in boundaries){
        let boundary = boundaries[i]
        boundary.rotateBoundary()
        pack.push({
            x: boundary.position.x,
            y: boundary.position.y,
            w: boundary.width,
            h: boundary.height,
            m: boundary.modifier,
            cx: boundary.centerX,
            cy: boundary.centerY
        })
    } 
    return pack
}

Consumable.update = function(){
    let pack = []
    for(let i in consumables){
        let consumable = consumables[i]
        pack.push({
            x: consumable.position.x,
            y: consumable.position.y,
            r: consumable.radius,
            c: consumable.color,
        })
    } 
    return pack
}

io.on('connection', (socket) => {
    console.log('socket connection', socket.id)
    SOCKET_LIST[socket.id] = socket
    socket.on('signIn', function(data){
        if(data.username.length > 0){
            Player.onConnect(socket)
            socket.emit('signInRes', {success: true})
        }else{
            socket.emit('signInRes', {success: false}) 
        }
        console.log(data)
    })
    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id]
        Player.onDisconnect(socket)
        console.log('a player disconnected')
    })
    socket.on('sendMsgToServer', function(data){
        let playerName = ('' + socket.id).slice(2,7)
        for(let i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data)
        }
    })
})

setInterval (function(){
    let pack = {
        player: Player.update(),
        projectile: Projectile.update(), 
        boundary: Boundary.update(),
        consumable: Consumable.update(), 
    } 
    for(let i in SOCKET_LIST){  
        let socket = SOCKET_LIST[i]
        socket.emit('newPositions', pack)
    }  
},1000 / TICK_RATE)

app.use(express.static('public')) // stating the directory that will be hosted
httpServer.listen(2000) // telling the server to listen to port 2000