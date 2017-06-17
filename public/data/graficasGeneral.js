var formularioTopTen,
    formularioComparacion,
    datos,//para los datos de la grafica
    options = { //para las opciones de la grafica
    title: 'Basicos Usados por Tecnica',
    hAxis: {title: 'Tecnica',  titleTextStyle: {color: '#333'}},
    vAxis: {title: 'Cantidad',  titleTextStyle: {color: '#333'}, minValue: 0},
    legend: { position: 'none' },
    bar: { groupWidth: "80%" },
    width: 900,
    height: 400
},
    grafica;//para la grafica// funcion que obtiene el nombre de los productos

function agregarFilas(bajas){
    for(var i=0 ; bajas[i] && i<10 ; i++){
        var nombre = bajas[i].nombre;
        var cantidad = bajas[i].cantidad;
        $('#dataTables-example tr:last').after('<tr><td>'+nombre+'</td><td>'+cantidad+'</td></tr>');
    }
}
function eliminaFilas(){
    // Obtenemos el total de columnas (tr) del id "dataTables-example"
    var trs=$("#dataTables-example tr").length;
    for(var i=1 ; i<trs ; i++){
        // Eliminamos la ultima columna
        $("#dataTables-example tr:last").remove();
    }
}
function dibujar(data){
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        //son las llaves para acceder al arreglo de objetoBasicos
        //var keys = Object.keys(objetoBasicos);
        datos = new google.visualization.DataTable();
        datos.addColumn('string', "Nombre");
        datos.addColumn('number', "Cantidad");
        for ( let i = 0 ; i < data.length ; i++){
            datos.addRow([data[i].nombre,data[i].cantidad]);
        }
        grafica = new google.visualization.ColumnChart(document.getElementById('grafica'));
        grafica.draw(datos, options);
    }
}
function contarBajasTopten(data) {
    var bajas = data,
        topten = [];

    while( bajas.length !== 0 ){
        var producto = bajas[0].producto,
            total = 0;
        bajas = bajas.filter(b => {
            if(b.producto.codigo === producto.codigo){
                total += b.cantidad;
                return false;
            }
            return true;

        })
        topten.push({ nombre:producto.nombre, cantidad:total});
    }
    return topten;
}
function contarBajasTecnicas(data) {
    var bajas = data,
        comparacion = [];

    while( bajas.length !== 0 ){
        var tecnica = bajas[0].tecnica,
            total = 0;
        bajas = bajas.filter(b => {
            if(b.tecnica.nombre === tecnica.nombre && b.tecnica.apellido === tecnica.apellido){
                total++;
                return false;
            }
            return true;
        })
        comparacion.push({ nombre:tecnica.nombre+' '+tecnica.apellido, cantidad:total});
    }
    return comparacion;
}

function obtenerTopTen() {
    $.ajax({
        url: '/historial/generaltop',
        type: 'POST',
        data: formularioTopTen.serialize(),
        success : function(data) {
            // top ten
            eliminaFilas(); // elimino las filas
            // si no he inicializado productos
            agregarFilas(contarBajasTopten(data));
        }
    });
}
// obtencion de los datos para el top ten
function obtenerComparacion() {
    $.ajax({
        url: '/historial/generalbas',
        type: 'POST',
        data: formularioComparacion.serialize(),
        success : function(data) {
            // top ten
            dibujar(contarBajasTecnicas(data))
        }
    });
}

// funcion principal
$(function(){

    // obtengo el formulario del topten
    formularioTopTen = $('#formtopten');
    formularioComparacion = $('#formbasicos');
    obtenerTopTen();
    obtenerComparacion();

    // fechas para el top ten
    $("input[name=iniciot]").change(function(){
        obtenerTopTen();
	});
    $("input[name=finalt]").change(function(){
        obtenerTopTen();
	});
     // select de sucursal
    $("select[name=sucursaltop]").change(function(){
        obtenerTopTen();
    });
    // fecha para los basicos por tecnica
    $("input[name=iniciob]").change(function(){
        obtenerComparacion();
	});
    $("input[name=finalb]").change(function(){
        obtenerComparacion();
	});
    // select del producto basico
    $("select[name=basico]").change(function(){
        obtenerComparacion();
    });
    // select del sucursal basico
    $("select[name=sucursalbas]").change(function(){
        obtenerComparacion();
    });
});
