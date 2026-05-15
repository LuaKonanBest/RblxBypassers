const mineflayer = require('mineflayer')
const { WebSocketServer } = require('ws')

const PORT_WS = process.env.PORT || 8080
const PASSWORD = 'kurtallen'

const wss = new WebSocketServer({ port: PORT_WS })

const bots = {}

function createBot(config, client, id) {

  let bot

  try {

    bot = mineflayer.createBot({
      host: config.host,
      port: config.port,
      username: config.username,
      auth: config.auth,
      version: false,
      skipValidation: true
    })

    bots[id] = bot

    console.log(`Connecting ${id}...`)

    if (client) {
      client.send(JSON.stringify({
        event: 'log',
        level: 'INFO',
        msg: `Connecting ${id}...`
      }))
    }

    bot.once('spawn', () => {

      console.log(`${id} spawned`)

      // Register
      setTimeout(() => {
        try {
          bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
        } catch {}
      }, 3000)

      // Login
      setTimeout(() => {
        try {
          bot.chat(`/login ${PASSWORD}`)
        } catch {}
      }, 6000)

      // Join queue
      setTimeout(() => {
        try {
          bot.chat('/joinqueue economy')
        } catch {}
      }, 9000)

      // Walk forward forever
      setInterval(() => {

        bot.setControlState('forward', true)

        bot.setControlState('jump', true)

        setTimeout(() => {
          bot.setControlState('jump', false)
        }, 500)

      }, 4000)

      // Spam chat
      setInterval(() => {

        try {
          bot.chat('KurtOnTop!')
        } catch {}

      }, 5000)

    })

    bot.on('login', () => {
      console.log(`${id} logged in`)
    })

    bot.on('kicked', (reason) => {

      console.log(`${id} kicked: ${reason}`)

      delete bots[id]

    })

    bot.on('error', (err) => {

      console.log(`${id} error: ${err.message}`)

      delete bots[id]

      // Reconnect
      setTimeout(() => {

        console.log(`Reconnecting ${id}...`)

        createBot(config, client, id)

      }, 10000)

    })

    bot.on('end', () => {

      console.log(`${id} disconnected`)

      delete bots[id]

    })

  } catch (e) {

    console.log(e.message)

  }
}

wss.on('connection', (client) => {

  console.log('Frontend connected')

  // AUTO START 100 BOTS
  const host = 'allaysmp.pro'
  const port = 25565
  const count = 100
  const delay = 3000
  const prefix = 'KurtOnTop'
  const auth = 'offline'

  async function launchBots() {

    for (let i = 1; i <= count; i++) {

      await new Promise(res => setTimeout(res, delay))

      const username = `${prefix}${String(i).padStart(4, '0')}`

      const id = username

      console.log(`Launching ${id}`)

      createBot({
        host,
        port,
        username,
        auth
      }, client, id)

    }
  }

  launchBots()

  client.on('message', (raw) => {

    const data = JSON.parse(raw)

    // Stop all bots
    if (data.action === 'stop_all') {

      Object.values(bots).forEach(bot => {

        try {
          bot.quit()
        } catch {}

      })

      for (let k in bots) {
        delete bots[k]
      }

      console.log('All bots stopped')

    }

  })

})

console.log(`🔥 Backend running on port ${PORT_WS}`)
