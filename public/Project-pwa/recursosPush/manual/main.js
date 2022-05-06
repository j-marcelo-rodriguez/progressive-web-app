
function registrarServiceWorker() {
    if('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            this.navigator.serviceWorker.register('./sw.js')
            .then(function(reg) {
                //console.log('el service worker se registró correctamente', reg)

                initialiseUI(reg)
                
                //Habilitamos el funcionamiento de las notificaciones
                Notification.requestPermission(function(res) {
                    if(res == 'granted') {
                        navigator.serviceWorker.ready.then(function(reg) {
                            console.log(reg)
                        })
                    }
                })                

                reg.onupdatefound = () => {
                    const installingWorker = reg.installing
                    installingWorker.onstatechange = () => {
                        console.log('SW ------>', installingWorker.state)
                        if(installingWorker.state === 'activated' && this.navigator.serviceWorker.controller) {
                            console.log('REINICIANDO...')

                            //reseteo la página a los 2 segundos
                            setTimeout(() => {
                                console.log('OK!')
                                location.reload()
                            },2000)
                        }
                    }
                }
            })
            .catch(function(err) {
                console.error('Error al registrar el service worker', err)
            })
        })
    }
    else {
        console.error('serviceWorker no está disponible en navigator')
    }
}
