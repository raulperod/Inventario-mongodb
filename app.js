var express = require("express");
var bodyParser = require("body-parser")
var Usuario = require("./app_server/models/usuario").Usuario;
var cookieSession = require("cookie-session");
var app = express();
// importacion de las rutas
var router_user = require("./app_server/routes/routes_user");
var router_sucursal = require("./app_server/routes/routes_sucursal");
var router_category = require("./app_server/routes/routes_category");
var router_product = require("./app_server/routes/routes_product");
var router_almacen = require("./app_server/routes/routes_almacen");
var router_historial = require("./app_server/routes/routes_historial");
var router_consumo = require("./app_server/routes/routes_consumo");
// para utilizar los metodos PUT y DELETE
var methodOverride = require("method-override");
// importacion de middleware para verificar el tipo de usuario
var session_admin = require("./app_server/middleware/session_admin");
var session_active = require("./app_server/middleware/session_active");
var session_general_admin = require("./app_server/middleware/session_general_admin");
// -------------------- configuracion de mongo ------------------------------------- //
var mongoose = require("mongoose");
// conectar a la base de datos
mongoose.Promise = require("bluebird");
var uristring = process.env.PROD_MONGODB || 'mongodb://localhost/gelishtime';
mongoose.connect(uristring);
// ------- impresiones de log dependiendo de la situacion ---------------------------//
// si se conecto
mongoose.connection.on('connected', function () {
 console.log('Mongoose connected to ' + uristring);
});
// si hubo un error
mongoose.connection.on('error',function (err) {
 console.log('Mongoose connection error: ' + err);
});
// si se desconecto
mongoose.connection.on('disconnected', function () {
 console.log('Mongoose disconnected');
});
// si se desconecto, el porque se desconecto
gracefulShutdown = function (msg, callback) {
 mongoose.connection.close(function () {
 console.log('Mongoose disconnected through ' + msg);
 callback();
 });
};
// For nodemon restarts
process.once('SIGUSR2', function () {
 gracefulShutdown('nodemon restart', function () {
 process.kill(process.pid, 'SIGUSR2');
 });
});
// For app termination
process.on('SIGINT', function() {
 gracefulShutdown('app termination', function () {
 process.exit(0);
 });
});
// For Heroku app termination
process.on('SIGTERM', function() {
 gracefulShutdown('Heroku app shutdown', function () {
 process.exit(0);
 });
});
// ------------------------------------------------------------------------------//
app.set('port', (process.env.PORT || 8080)); // definir el puerto
// servir archivos publicos
app.use("/src",express.static("src"));
// parsers
app.use(bodyParser.json()); // para peticiones application/json
app.use(bodyParser.urlencoded({extended:true}));
// Para los metodos PUT y DELETE
app.use(methodOverride("_method"));
// configuracion del gestor de sesiones
app.use(cookieSession({
  name: "session",
  keys: ["gelish","time"],
  // Cookie Options
  expires: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 horas de session
}));
// configura el motor de vistas con pug
app.set("view engine","pug");
app.set('views', './app_server/views'); // define la ruta de las vistas
// -------------------------------------------------------------------------//
// -------------------- Configuracion de las rutas -------------------------//
// gelishtime/
// Metodo GET
app.get("/",function(req,res){
  // verifica si existe un usuario logeado
  if(req.session.user_id){
    res.redirect("/almacen");  // lo redirecciona a almacen
  }else{
    // si no esta logeado lo manda al login
    res.redirect("/login");
  }
});
// gelishtime/logout
// Metodo GET
// para terminar la sesion
app.get("/logout",function(req,res){
  // cierra la sesion del usuario
  req.session = null;
  res.locals.usuario = null;
  // te redirecciona al inicio
  res.redirect("/login");
});
// gelishtime/login
// Metodo GET y POST

// Metodo GET
app.get("/login",function(req,res){
  // si no esta logeado entra al login
  if(!req.session.user_id){
    // manda falsa las alertas y renderisa login
    res.render("login",{alertUsername:false,alertPassword:false,usuario:false,alertStatus:false});
  }else{  // si ya esta logeado, entonces se redirecciona al almacen
    res.redirect("/almacen");
  }
});

// Metodo POST
app.post("/login",function(req,res){
    // busca al usuario
    Usuario.findOne({username:req.body.username})
            .populate("sucursal")
            .exec(function(err,usuario){

      if(!err && usuario){
        // si encontro al usuario entonces inicia sesion
        if(usuario.status){
          if(req.body.password == usuario.password){ // si el password coincide
            // genera la sesion para el usuario
            req.session.user_id = usuario._id;
            res.locals.usuario = usuario;
            res.redirect("/almacen"); // redirecciona al almacen
          }else{ // si el password no coincide, manda una alerta del password
            res.render("login",{alertPassword:true,alertUsername:false,usuario:false,alertStatus:false,username:req.body.username,password:req.body.password});
          }
        }else{ // si el usuario esta inactivo entonces manda una alerta
          res.render("login",{alertStatus:true,alertUsername:false,alertPassword:false,usuario:false,username:req.body.username,password:req.body.password});
        }
      }else if(!usuario){
        // si no existe el usuario entonces, manda una alerta
        res.render("login",{alertUsername:true,alertPassword:false,usuario:false,alertStatus:false,username:req.body.username,password:req.body.password});
      }else if(err){ // si hubo un error
        console.log(String(err));
        res.redirect("/login");
      }
    });
});
// ----------------------------- Rutas -----------------------------------------//
// gelishtime/users
app.use("/users",session_admin);
app.use("/users",router_user);
// gelishtime/sucursales
app.use("/sucursales",session_general_admin);
app.use("/sucursales",router_sucursal);
// gelishtime/categories
app.use("/categories",session_general_admin);
app.use("/categories",router_category);
// gelishtime/products
app.use("/products",session_general_admin);
app.use("/products",router_product);
// gelishtime/almacen
app.use("/almacen",session_active);
app.use("/almacen",router_almacen);
// gelishtime/almacen
app.use("/historial",session_admin);
app.use("/historial",router_historial);
// gelishtime/consumos
app.use("/consumos",session_active);
app.use("/consumos",router_consumo);
// inicia el servidor en el puerto 8080
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
