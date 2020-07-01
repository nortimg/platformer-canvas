import {playRandomAudio} from './audio.js'

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

const CANVAS_WIDTH = 1300
const CANVAS_HEIGHT = 700
const TERRA_HEIGHT = 100
const FPS = 60
let then, now, elapsed, FPSInterval

canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT


class Platform {
    constructor(config) {
        this.width = config.width
        this.height = config.height
        this.x = config.x
        this.y = config.y
        this.theme = config.theme
    }

    render() {
        const src = this.theme
        const img = document.createElement('img')
        img.src = src
        return img
    }
}

const obstacle = new Platform({
    width: 100,
    height: 100,
    x: 300,
    y: 300,
    theme: './img/Platform.png'
})

const obstacle2 = new Platform({
    width: 100,
    height: 100,
    x: 600,
    y: 350,
    theme: './img/Platform.png'
})

const obstacle3 = new Platform({
    width: 100,
    height: 100,
    x: 990,
    y: 278,
    theme: './img/Platform.png'
})

const terrain = new Platform({
    width: 100,
    height: 100,
    x: 0,
    y: CANVAS_HEIGHT - TERRA_HEIGHT,
    theme: './img/Terrain.png'
})

const terrainImage = terrain.render()




const obstImage = obstacle.render()
const obstImage2 = obstacle2.render()
const obstImage3 = obstacle3.render()

function isCollided(obst, obj) {
    const collided = (
        obj.x + obj.width > obst.x &&
        obj.x < obst.x + obst.width &&
        obj.y < obst.y + obst.height &&
        obj.y + obj.height > obst.y
    )

    return collided
}


class Player {
    constructor(config) {
        this.xPrev = config.xPrev
        this.yPrev = config.yPrev
        this.width = config.width
        this.height = config.height
        this.x = config.x
        this.y = config.y
        this.xVelocity = config.xVelocity
        this.yVelocity = config.yVelocity
        this.state = config.state
        this.theme = config.theme
        this.frame = config.frame
        this.frames = config.frames

        this.FPSInterval = 1000 / config.FP
        this.skin = this.render()
    }

    render() {
        const src = this.theme
        const img = document.createElement('img')
        img.src = src
        return img
    }
}

const controller = {
    left: false,
    right: false,
    up: false,
    KeyListener(e) {
        const keyState = e.type === 'keydown'
        switch (e.key) {
            case 'ArrowLeft':
                this.left = keyState
                break
            case 'ArrowRight':
                this.right = keyState
                break
            case 'ArrowUp':
                playRandomAudio()
                this.up = keyState
                break
        }
        
        if (player.frame < player.frames - 1) 
            player.frame++
        else 
            player.frame = 0
    }
}

const player = new Player({
    xPrev: 0,
    yPrev: 0,
    width: 50,
    height: 50,
    x: 0,
    y: 0,
    xVelocity: 0,
    yVelocity: 0,
    FPS: 60,
    state: 'staying',
    theme: './img/Player.png', 
    frame: 0, 
    frames: 5
})

const update = () => {
    player.xPrev = player.x
    player.yPrev = player.y

    if (controller.up && player.state !== 'jumping') {  // Jump
        player.yVelocity -= 50
        player.state = 'jumping'
    }

    if (controller.left) {
        player.xVelocity -= 1
    }

    if (controller.right) {
        player.xVelocity += 1
    }

    player.yVelocity += 1
    player.x += player.xVelocity
    player.y += player.yVelocity
    player.xVelocity *= 0.9
    player.yVelocity *= 0.9

    if (player.x < 0) { // Collisions
        player.x = 0
    } else if (player.x > CANVAS_WIDTH - player.width) {
        player.x = CANVAS_WIDTH - player.width
    }

    if (player.y > CANVAS_HEIGHT - player.height - TERRA_HEIGHT) {
        player.y = CANVAS_HEIGHT - player.height - TERRA_HEIGHT
        player.yVelocity = 0
        player.state = 'staying'
    }


    collideHandler(obstacle, player)
    collideHandler(obstacle2, player)
    collideHandler(obstacle3, player)

    requestAnimationFrame(update)
}

const collideHandler = (obst, obj) => {
    if (isCollided(obst, obj)) {
        if (obj.xPrev >= obst.x + obst.width) {
            obj.x = obst.x + obst.width
            obj.xVelocity = 0
        }

        else if (obj.xPrev + obj.width <= obst.x) {
            obj.x = obst.x - obj.width
            obj.xVelocity = 0
        }

        if (obj.yPrev + obj.height <= obst.y) {
            obj.y = obst.y - obj.height
            obj.yVelocity = 0
            obj.state = 'staying'
        }

        if (obj.yPrev >= obst.y + obst.height) {
            obj.y = obst.y + obst.height
            obj.yVelocity = 0
        }
    }
}

const drawPlayer = () => {
    context.fillStyle = '#000000'
    context.drawImage(
        player.skin, 
        199 * player.frame, 
        0, 
        200, 
        200, 
        player.x, 
        player.y, 
        player.width, 
        player.height
    )
}

const draw = (then) => {
    // Background
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Player
    drawPlayer()
    // context.drawImage(obstImage, )
    requestAnimationFrame(draw)

    // Obstacle
    context.fillStyle = '#00ff00'
    context.drawImage(obstImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height)
    context.drawImage(obstImage2, obstacle2.x, obstacle2.y, obstacle2.width, obstacle2.height)
    context.drawImage(obstImage3, obstacle3.x, obstacle3.y, obstacle3.width, obstacle3.height)


    // Terrain
    for (let i = 0; i < 13; ++i) {
        context.drawImage(terrainImage, terrain.x + 100 * i, terrain.y, terrain.width, terrain.height)
    }
}


const startAnimation = (FPS) => {
    FPSInterval = 1000 / FPS
    then = performance.now()
    update()
    draw(then)
}

const animation = (newTime) => {
    requestAnimationFrame(animation)
    now = newTime
    elapsed = now - then

    if (elapsed > FPSInterval) { // Прошло ли времени больше, чем надо
        then = now - (elapsed % FPSInterval)
        update()
        draw()
    }
}

startAnimation(FPS)

addEventListener('keydown', controller.KeyListener.bind(controller))
addEventListener('keyup', controller.KeyListener.bind(controller))