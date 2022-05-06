const apiLista = (function () {

    function getURL(id) {
        return 'https://61e2157c3050a100176820c9.mockapi.io/lista/' + (id? id : '')
    }

    /* GET */
    async function get() {
        try {
            let prods = await $.ajax({ url: getURL() })
            return prods
        }
        catch (error) {

            console.error('Error de GET', error)

            let prods = leerListaProductos()
            console.log(prods)
            return prods
        }

    }
    /* POST */
    async function post(prod) {
        try {
            let prodAgregado = await $.ajax({ url: getURL(), method: 'post', data: prod })
            return prodAgregado
        }
        catch (error) {

            console.error('Error de POST', error)
        }
    }
    /* PUT */
    async function put(id, prod) {
        try {
            let prodActualizado = await $.ajax({ url: getURL(id), method: 'put', data: prod })
            return prodActualizado
        }
        catch (error) {

            console.error('Error de PUT', error)
        }
    }
    /* DELETE */
    async function del(id) {
        try {
            let proBorrado = await $.ajax({ url: getURL(id), method: 'delete' })
            return proBorrado
        }
        catch (error) {

            console.error('Error de DELETE', error)
        }
    }

    async function deleteAll() {
        const progress = document.querySelector('progress')
        progress.style.display = 'block'

        let porcentaje = 0

        for (let i = 0; i < listaProductos.length; i++) {
            porcentaje = parseInt((i * 100) / listaProductos.length)
            console.log(porcentaje)
            progress.value = porcentaje

            let id = listaProductos[i].id
            await del(id)
        }

        porcentaje = 100
        progress.value = porcentaje

        setTimeout(() => {
            progress.style.display = 'none'
        }, 2000);

    }

    return {

        get: () => get(),
        post: prod => post(prod),
        put: (id, prod) => put(id, prod),
        delete: id => del(id),
        deleteAll: () => deleteAll()
    }

})()