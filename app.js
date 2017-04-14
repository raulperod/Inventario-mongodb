var express = require("express");
var bodyParser = require("body-parser")
var cookieSession = require("cookie-session");
var app = express();
var methodOverride = require("method-override");
app.set('port', (process.env.PORT || 8080));
app.use("/src",express.static("src"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(cookieSession({
  name: "session",
  keys: ["gelish","time"],
  expires: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 horas de session
}));
app.set("view engine","pug");
app.set('views', './app_server/views');

app.get("/",function(req,res){
  // verifica si existe un usuario logeado
  if(req.session.user_id){
    res.redirect("/almacen");  // lo redirecciona a almacen
  }else{
    // si no esta logeado lo manda al login
    res.redirect("/login");
  }
});

app.get("/logout",function(req,res){
  // cierra la sesion del usuario
  req.session = null;
  res.locals.usuario = null;
  // te redirecciona al inicio
  res.redirect("/login");
});

app.get("/login",function(req,res){
  // si no esta logeado entra al login
  if(!req.session.user_id){
    // manda falsa las alertas y renderisa login
    res.render("login",{alertUsername:false,alertPassword:false,usuario:false,alertStatus:false});
  }else{  // si ya esta logeado, entonces se redirecciona al almacen
    res.redirect("/almacen");
  }
});

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
            res.render("login",{alertPassword:true,alertUsername:false,usuario:false,alertStatus:false,username:req.body.username});
          }
        }else{ // si el usuario esta inactivo entonces manda una alerta
          res.render("login",{alertStatus:true,alertUsername:false,alertPassword:false,usuario:false,username:req.body.username});
        }
      }else if(!usuario){
        // si no existe el usuario entonces, manda una alerta
        res.render("login",{alertUsername:true,alertPassword:false,usuario:false,alertStatus:false,username:req.body.username});
      }else if(err){ // si hubo un error
        console.log(String(err));
        res.redirect("/login");
      }
    });
});
// ----------------------------- Rutas -----------------------------------------//
// gelishtime/almacen
app.use("/almacen",session_active);
app.use("/almacen",router_almacen);
// gelishtime/consumos
app.use("/consumos",session_active);
app.use("/consumos",router_consumo);
// gelishtime/basicos
app.use("/basicos",session_active_sucursal);
app.use("/basicos",router_basico);
// gelishtime/users
app.use("/users",session_admin);
app.use("/users",router_user);
// gelishtime/tecnicas
app.use("/tecnicas",session_admin);
app.use("/tecnicas",router_tecnica);
// gelishtime/almacen
app.use("/historial",session_admin);
app.use("/historial",router_historial);
// gelishtime/sucursales
app.use("/sucursales",session_general_admin);
app.use("/sucursales",router_sucursal);
// gelishtime/categories
app.use("/categories",session_general_admin);
app.use("/categories",router_category);
// gelishtime/products
app.use("/products",session_general_admin);
app.use("/products",router_product);


