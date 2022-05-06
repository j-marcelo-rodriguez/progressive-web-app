'use strict';

const webPush = require('../src/index.js');
const express = require('express')
const fs = require('fs')
const app = express()

const PORT = 8080

app.use(express.static('public/Project-pwa'))
app.use(express.json())

//------------------------------------
//endpoint para recibir las vapid keys
//------------------------------------
let vapidKeys = {}
try {
  vapidKeys = JSON.parse(fs.readFileSync('vapidkeys.dat','utf-8'))
}
catch {
  vapidKeys = {}
}
console.log('vapidKeys inicial: ', vapidKeys)

app.get('/vapidkeys', (req,res) => {
  vapidKeys = webPush.generateVAPIDKeys();
  fs.writeFile('vapidkeys.dat', JSON.stringify(vapidKeys), () => {
    res.json({data: vapidKeys})
  })
})

//--------------------------------------
//endpoint para realizar una suscripción
//--------------------------------------
let suscripcion
try {
  suscripcion = JSON.parse(fs.readFileSync('suscripcion.dat','utf-8'))
}
catch {
  suscripcion = {}
}
console.log('suscripcion inicial: ', suscripcion)

app.post('/suscripcion', (req,res) => {
  let datos = req.body
  //console.log(datos)
  suscripcion = datos
  fs.writeFile('suscripcion.dat', JSON.stringify(suscripcion), () => {
    res.json({res: 'ok', suscripcion})
  })
})

//-------------------------------------
//endpoint para enviar una notificación
//-------------------------------------
app.get('/notification', (req,res) => {
  let query = req.query

  //---------------------------------------------
  //verifico que haya suscripción y vapid pedidas
  //---------------------------------------------
  if(!Object.keys(suscripcion).length || !Object.keys(vapidKeys).length) {
    res.json({res: suscripcion})
  }    
  else { 
    //-------------------------
    // Armo objeto subscription
    //-------------------------
    let subscription = {
      endpoint: suscripcion.endpoint,
      keys: {
        p256dh: suscripcion.keys.p256dh || null,
        auth: suscripcion.keys.auth || null
      }
    }
    //-------------
    // Armo payload
    //-------------
    let payload = query.payload || "Mensaje default de notificación"
    
    //--------------------
    // Armo objeto options
    //--------------------
    let options = {
      TTL : suscripcion.expirationTime? suscripcion.expirationTime : 0,
      vapidDetails : {
        subject: query.subject || 'mailto: danielsanchez68@hotmail.com',
        publicKey: vapidKeys.publicKey || null,
        privateKey: vapidKeys.privateKey || null
      }
    }

    //-------------------
    // Envio notificacion
    //-------------------
    webPush.sendNotification(subscription, payload, options)
    .then(() => {
      console.log('Push message sent.');
      res.json({res: 'ok', subscription, payload, options})
    }, err => {
      console.log('Error sending push message: ');
      console.log(err);
      res.json({res: 'error', err})
    })
  }
})

app.listen(PORT, err => {
  if(err) return console.log(`Error de servidor ${err}`)
  console.log(`Servidor express escuchando en el puerto ${PORT}`)
})
