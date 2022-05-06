/* -------------------------------------------------------------------------------- */
/*                              VARIABLES GLOBALES                                  */
/* -------------------------------------------------------------------------------- */
let listaProductos = []

/* -------------------------------------------------------------------------------- */
/*                              FUNCIONES GLOBALES                                  */
/* -------------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------------- */
/*                              MANEJO DEL LOCALSTORAGE                             */

function guardarListaProductos(lista) {
    localStorage.setItem('lista', JSON.stringify(lista))
}

function leerListaProductos() {
    let lista = []
    let prods = localStorage.getItem('lista')

    if (prods) {
        try {
            lista = JSON.parse(prods)
        }
        catch {
            guardarListaProductos(lista)
        }
    }

    return lista
}
/* -------------------------------------------------------------------------------- */

async function borrarProd(id) {

    await apiLista.delete(id)
    renderLista()
}

async function cambiarValor(tipo, id, elem) {
    // regex for Ints --> /^[1-9][0-9]{1,2}$|^\d$/ ; regex for floats -->/^[0-9]+([,.][0-9]+)?$/g
    let index = listaProductos.findIndex(prod => prod.id == id)

    const valor = tipo == 'precio' ? parseFloat(elem.value) : parseInt(elem.value)
    listaProductos[index][tipo] = valor

    let prod = listaProductos[index]
    await apiLista.put(id, prod)
}


function configurarListeners() {

    /* ingreso producto */
    $('#btn-entrada-producto').click(async () => {
        let input = $('#ingreso-producto')
        let nombre = input.val()

        if (nombre) { /* AGREGAR REG EXP */
            let producto = { nombre, cantidad: 1, precio: 0 }

            await apiLista.post(producto)
            renderLista()
            input.val(null)
        }
    })

    /* borrar todos los productos */
    $('#btn-borrar-productos').click(() => {

        if (listaProductos.length) {
            var dialog = $('dialog')[0];
            dialog.showModal()
        }
    })
}

async function renderLista() {

    try {
        let plantilla = await $.ajax({ url: 'plantillas/plantilla-lista.hbs' })
        let template = Handlebars.compile(plantilla)

        // Obteniendo la lista de productos desde el recurso remoto(mockapi)
        listaProductos = await apiLista.get()

        // guardar la lista de productos en el localStorage
        guardarListaProductos(listaProductos)

        let html = template({ listaProductos })
        $('#lista').html(html)

        let ul = $('#contenedor-lista')
        componentHandler.upgradeElements(ul)
    }
    catch (error) {
        console.error("error renderLista", error)
    }

}

function registrarServiceWorker() {

    if ('serviceWorker' in navigator) {
        /* esto se debe ejecutar cuando todo el documento web este cargado */
        this.navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                
                notificaciones.initialiseUI(reg)

                //Solicitamos permiso al sistema operativo para mostrar las notificaciones
                Notification.requestPermission(function (result) {
                    if (result === 'granted') {
                        navigator.serviceWorker.ready.then(function (registration) {
                            console.log('registration',registration)
                        })
                    }
                })

                reg.onupdatefound = () => {
                    const installingWorker = reg.installing
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state == 'activated') {
                            console.log('se recargo la pagina automaticamente')
                            setTimeout(() => {
                                location.reload()
                            }, 2000);
                        }
                    }
                }

            })
            .catch(err => {
                console.error('error al registrar el serviceWorker', err)
            })


    } else {
        console.error('serviceWorker no esta disponible en navigator')
    }

}

function iniDialog() {

    var dialog = $('dialog')[0];

    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }

    dialog.querySelector('.aceptar').addEventListener('click', async function () {
        dialog.close();

        await apiLista.deleteAll()
        renderLista()

    });
    dialog.querySelector('.cancelar').addEventListener('click', function () {
        dialog.close();
    });
}

function testCache() {
    if (window.caches) {
        console.log('navegador soporta CACHES')

        caches.open('prueba-1')
        caches.open('prueba-2')
        caches.open('prueba-3')

        caches.has('prueba-2').then(r => console.log(r))
        caches.has('prueba-3').then(console.log)

        caches.delete('prueba-1').then(console.log)

        caches.keys().then(console.log)

        caches.open('cache-v1.1').then(cache => {

            console.log(cache)

            cache.addAll([
                '/index.html',
                '/css/styles.css',
                '/images/supermarket.jpg'
            ]).then(() => {
                console.log('recursos agregados')

                cache.delete('/css/styles.css').then(console.log)

                cache.match('/index.html').then(r => {
                    if (r) {
                        console.log('Recurso encontrado')
                        //r.text().then(console.log)

                    } else {
                        console.error('Recurso NO encontrado')
                    }
                })

                cache.put('/index.html', new Response('HOLA MUNDO CRUEL!!!'))

                cache.keys().then(recursos => console.log('Recursos del cache', recursos))
                cache.keys().then(recursos => {
                    recursos.forEach(recurso => {

                        console.log(recurso.url)
                    })
                });


            })
        })

    } else {
        console.warn('no soporta CACHES')
    }
}

function start() {

    registrarServiceWorker()
    configurarListeners()
    iniDialog()

    renderLista()
}




/* -------------------------------------------------------------------------------- */
/*                                  EJECUCIÓN                                       */
/* -------------------------------------------------------------------------------- */
//start()
$(document).ready(start)