//importar modulo Express
const express = require('express');

//importar modulo fileupload
const fileupload = require('express-fileupload');

//importar modulo express-handlebars
const { engine } = require('express-handlebars');

//importar modulo de rotas
const rota_produto = require('./rotas/rotas_sistema');

//App
const app = express();

//habilitando o upload de arquivos
app.use(fileupload());

//adicionar bootstrap
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));

//adicionar CSS
app.use('/css', express.static('./css'));

//Referenciar a pasta de imagens
app.use('/imagens', express.static('./imagens'));

//configuração do express-handlebars
app.engine('handlebars', engine({
    helpers:{
        //Função auxiliar para verificar igualdade
        condicionalIgualdade: function(parametro1, parametro2, options){
            return parametro1 === parametro2 ? options.fn(this) : options.inverse(this);
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// manipulação de dados via rotas
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//rotas
app.use('/', rota_produto);


//Servidor
app.listen(8080);