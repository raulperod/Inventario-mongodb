var express = require("express");
var bodyParser = require("body-parser")
var Usuario = require("./app_server/models/usuario").Usuario;
var cookieSession = require("cookie-session");
var app = express();
var router_user = require("./app_server/routes/routes_user");
var router_sucursal = require("./app_server/routes/routes_sucursal");
var router_category = require("./app_server/routes/routes_category");
var router_product = require("./app_server/routes/routes_product");
var router_almacen = require("./app_server/routes/routes_almacen");
var router_historial = require("./app_server/routes/routes_historial");
var router_consumo = require("./app_server/routes/routes_consumo");
// para utilizar los metodos PUT y DELETE
var methodOverride = require("method-override");

var session_admin = require("./app_server/middleware/session_admin");
var session_active = require("./app_server/middleware/session_active");
var session_general_admin = require("./app_server/middleware/session_general_admin");
var mongoose = require("mongoose");
// conectar a la base de datos
mongoose.Promise = require("bluebird");
var uristring =
  process.env.PROD_MONGODB ||
  'mongodb://localhost/gelishtime';
mongoose.connect(uristring);
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
app.set('port', (process.env.PORT || 8080));
// servir archivos publicos
app.use("/src",express.static("src"));
// parsers
app.use(bodyParser.json()); // para peticiones application/json
app.use(bodyParser.urlencoded({extended:true}));
// Para los metodos
app.use(methodOverride("_method"));
// configuracion del gestor de sesiones
app.use(cookieSession({
  name: "session",
  keys: ["gelish","time"],
  // Cookie Options
  //maxAge: 8 * 60 * 60 * 1000 // 8 horas de session
  expires: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 horas de session
}));
// configura el motor de vistas
app.set("view engine","pug");
app.set('views', './app_server/views');
// -------------------------------------------------------------------------
// localhost/
// Metodo GET y POST
// Metodo GET
app.get("/",function(req,res){
  // verifica si existe un usuario logeado
  if(req.session.user_id){
    res.redirect("/almacen")
  }else{
    // si no esta logeado lo manda al login
    res.redirect("/login");
  }
});
// Metodo POST
// para terminar la sesion, por mientras
app.get("/logout",function(req,res){
  // cierra la sesion del usuario
  req.session = null;
  res.locals.usuario = null;
  // te redirecciona al inicio Metodo GET
  res.redirect("/login");
});
// FIN de localhost/
// --------------------------------------------------------

// -------------------------------------------------------------------------
// localhost/login
// Metodo GET y POST

// Metodo GET
// renderisa ingresar con el metodo GET
app.get("/login",function(req,res){
  // si no esta logeado entra al login
  if(!req.session.user_id){
    res.render("login",{alertUsername:false,alertPassword:false,usuario:false,alertStatus:false});
  }else{  // si ya esta, entonces se redirecciona al inicio
    res.redirect("/almacen");
  }
});

// Metodo POST
// renderisa el ingreso con el metodo POST
app.post("/login",function(req,res){
    // busca al usuario
    Usuario.findOne({username:req.body.username}).populate("sucursal").exec(function(err,usuario){
      if(!err && usuario){
        // si encontro al usuario entonces inicia sesion
        if(usuario.status){
          if(req.body.password == usuario.password){
            req.session.user_id = usuario._id;
            res.locals.usuario = usuario;
            res.redirect("/almacen");
          }else{
            res.render("login",{alertPassword:true});
          }

        }else{
          res.render("login",{alertStatus:true});
        }
      }else if(!usuario){
        console.log(String(err));
        res.render("login",{alertUsername:true});
      }
    });
});
// FIN de localhost/login
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// localhost/users
app.use("/users",session_admin);
app.use("/users",router_user);
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
// localhost/sucursales
app.use("/sucursales",session_general_admin);
app.use("/sucursales",router_sucursal);
// -------------------------------------------------------------------------
// localhost/categories
app.use("/categories",session_general_admin);
app.use("/categories",router_category);
// -------------------------------------------------------------------------
// localhost/products
app.use("/products",session_general_admin);
app.use("/products",router_product);
// -------------------------------------------------------------------------
// localhost/almacen
app.use("/almacen",session_active);
app.use("/almacen",router_almacen);
// -------------------------------------------------------------------------
// localhost/almacen
app.use("/historial",session_admin);
app.use("/historial",router_historial);
// -------------------------------------------------------------------------
// localhost/consumos
app.use("/consumos",session_active);
app.use("/consumos",router_consumo);
// -------------------------------------------------------------------------
// inicia el servidor en el puerto 8080
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
// FIN
