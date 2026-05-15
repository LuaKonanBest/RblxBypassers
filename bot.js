const mineflayer = require('mineflayer')

const HOST = 'play.Leztusasmp.xyz'
const PORT = 25565
const PASSWORD = 'kurtallen'

let running = true
const bots = []

function createBot(id) {

    const bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: `KurtOnTop${id}`
    })

    bots.push(bot)

    bot.once('spawn', () => {
        console.log(`${bot.username} joined`)

        // Register
        setTimeout(() => {
            bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
        }, 3000)

        // Login
        setTimeout(() => {
            bot.chat(`/login ${PASSWORD}`)
        }, 5000)

        // Straight movement
        setInterval(() => {
            if (!running) return

            bot.setControlState('forward', true)

            // Jump sometimes
            bot.setControlState('jump', true)

            setTimeout(() => {
                bot.setControlState('jump', false)
            }, 500)

        }, 3000)

        // Spam chat every 5 sec
        setInterval(() => {
            if (!running) return

            bot.chat('KurtOnTop!')
        }, 5000)
    })

    // Auto reconnect
    bot.on('end', () => {
        console.log(`${bot.username} disconnected. Reconnecting...`)

        setTimeout(() => {
            createBot(id)
        }, 5000)
    })

    bot.on('kicked', (reason) => {
        console.log(`${bot.username} kicked:`, reason)
    })

    bot.on('error', (err) => {
        console.log(`${bot.username} error:`, err.message)
    })
}

// Start bots
function startBots() {

    running = true

    console.log('Starting bots...')

    for (let i = 1; i <= 100; i++) {

        setTimeout(() => {
            createBot(i)
        }, i * 1000)
    }
}

// Stop bots
function stopBots() {

    running = false

    console.log('Stopping bots...')

    bots.forEach(bot => {
        try {
            bot.quit()
        } catch {}
    })
}

// Auto start
startBots()

// Console commands
process.stdin.on('data', (data) => {

    const cmd = data.toString().trim().toLowerCase()

    if (cmd === 'start') {
        startBots()
    }

    if (cmd === 'stop') {
        stopBots()
    }
})
