const CACHE_STATIC_NAME = 'static-v02'
const CACHE_INMUTABLE_NAME = 'inmutable-v02'
const CACHE_DYNAMIC_NAME = 'dynamic-v02'

const CON_CACHE = false

self.addEventListener('install', e => {
    console.log('sw install')

    // skip waiting automático
    self.skipWaiting()

    const cacheStatic = caches.open(CACHE_STATIC_NAME).then(cache => {
        console.log(cache)
        // Guardando los recursos de la APP SHELL (son los necesarios para que la web sea funcional)
        return cache.addAll([
            '/index.html',
            '/css/styles.css',
            '/js/main.js',
            '/js/api.js',
            '/plantillas/plantilla-lista.hbs',
            '/images/supermarket.jpg',
        ])
    })

    const cacheInmutable = caches.open(CACHE_INMUTABLE_NAME).then(cache => {
        console.log(cache)
        // Guardando los recursos de la APP SHELL (son los necesarios para que la web sea funcional)
        return cache.addAll([
            'https://code.jquery.com/jquery-3.6.0.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.7.7/handlebars.min.js',
            'https://code.getmdl.io/1.3.0/material.min.js',
            'https://code.getmdl.io/1.3.0/material.blue_grey-teal.min.css'
        ])
    })

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]))
})

self.addEventListener('activate', e => {
    console.log('sw activate')

    const cacheWhiteList = [
        CACHE_STATIC_NAME,
        CACHE_INMUTABLE_NAME,
        CACHE_DYNAMIC_NAME,
    ]

    // borrando todos los caches que no esten en la lista actual (version actual)
    e.waitUntil(
        caches.keys().then(nombres => {

            return Promise.all(
                nombres.map(key => {
                    if (!cacheWhiteList.includes(key)) {
                        return caches.delete(key)
                    }
                })
            )
        })
    )

})

self.addEventListener('fetch', e => {
    if (CON_CACHE) {
        let { url, method } = e.request

        if (method == 'GET' && !url.includes('mockapi.io')) {
            const respuesta = caches.match(e.request).then(res => {
                if (res) {
                    console.log('El recurso existe en el cache', url)
                    return res
                }
                console.warn('El recurso NO existe en el cache', url)

                return fetch(e.request).then(nuevaRespuesta => {
                    caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                        cache.put(e.request, nuevaRespuesta)
                    })
                    return nuevaRespuesta.clone()
                })
            })

            e.respondWith(respuesta)

        } else {
            console.warn('BYPASS', method, url)
        }
    }
})

self.addEventListener('push', e => {

    let datos = e.data.text()
    console.log(datos)

    const title = 'Super Lista de Productos'
    const options = {
        body: `Mensajes: ${datos}`,
        icon: 'images/icons/icon-72x72.png',
        badge: 'https://cdn0.iconfinder.com/data/icons/pinterest-ui-flat/48/Pinterest_UI-09-128.png'
    }

    e.waitUntil(self.registration.showNotification(title, options))

})

self.addEventListener('notificationclick', e => {
    console.log('Se realizo click en la notificacion')

    e.notification.close()
    //clients.openWindow('https://j-marcelo-rodriguez.github.io/portafolio/#')

})
