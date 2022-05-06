self.addEventListener('push', e => {
    console.log('push!!', e)
    let datos = e.data.text()
    console.log(datos)

    //https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
    const title = 'Super Lista!'
    const options = {
        body: `Mensajes: ${datos}`,
        icon: 'images/icons/icon-72x72.png',
        badge: 'https://licores.ninja/wp-content/uploads/2018/04/cropped-ninja-n-02.png'
    }

    e.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', e => {
    console.log('click en notificación recibido!', e)

    e.notification.close()
    e.waitUntil(clients.openWindow('https://www.instagram.com'))
})
