const express = require('express')  // Importamos express
const bodyParser = require('body-parser') // bodyParser sirve para transformar el body de la petición de forma mas simple que la nativa de node

const placesRoutes = require('./routes/places-routes') // Importamos los endpoints de places
const userRoutes = require('./routes/user-routes') // Importamos los endpoints de users

const HttpError = require('./models/http-error') // Importamos nuestro error personalizado
const app = express(); // Crea la aplicación express y la asignamos a la variable app

app.use(bodyParser.json()) // Con el método use, registramos un middleware que filtrará todas las peticiones y si tienen un body, lo transforma a json
app.use('/api/places', placesRoutes) // => /api/places/... // Middleware que deriva todas las rutas a api/places a los métodos de placesRoutes
app.use('/api/users', userRoutes) // => /api/users/... // Middleware que deriva todas las rutas a api/users a los métodos de placesRoutes
app.use((req, res, next) => { // Middleware que usamos cuando apuntamos a un endpoint no registrado
    const error = new HttpError('Could not find this route', 404)
    throw error;
})
app.use((error, req, res, next) => { // Middleware que retorna un mensaje de error cada vez que llamamos al método next() en los métodos anteriores
    if (res.headerSent) {
        return next()
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' })
});

app.listen(5000) // Método que permite a express escuchar todas las peticiones en el puerto indicado (Hace que se mantenga corriendo la aplicación)