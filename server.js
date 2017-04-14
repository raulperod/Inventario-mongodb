/**
 * Created by Raul Perez on 13/04/2017.
 */
'use strict'

const app = require('./app')

app.listen(app.get('port'), err => {
    if(err) throw err
    console.log(`Servidor ejecutandose en el pueto ${app.get('port')}`)
})