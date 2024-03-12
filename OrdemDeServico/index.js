// console.log("node rodadndo");
// imposntando o express
const express = require('express');
//importar modulo fileupload
const fileupload = require('express-fileupload');

//importando o msyql
const mysql = require('mysql2');
//importando express-handlebars
const { engine } = require ('express-handlebars');
//adicionar bootstrap
const app = express();
//habilitando o uploadfile
app.use(fileupload());
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));
//adicionar o estilo.css
app.use('/css', express.static('./css'));

//configuração do express-handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Manipulação de conexao de dados via rotas
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//rota do projeto
app.get('/', function(req, res) {
    res.render('formulario');
});



//criando a conexao com nosso BD
const conexao = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'128977',
    database:'ordemDeServico'

});
conexao.connect(function(erro){
    if(erro) throw erro;
    console.log('conexao efetuada com sucesso');
})

//rota de de cadastro do formulario

//rota de cadastrar produto
app.post('/cadastrar', function(req, res){
    //obter os dados
    let nome = req.body.nome;
    let valor = req.body.valor;
    let imagem = req.files.imagem.name;
    //estrutura sql
    let sql = `INSERT INTO produto (nome, valor, imagem) VALUES ('${valor}', ${valor}, '${imagem}')`;
   
    //executar comando SQL
    conexao.query(sql, function(erro, retorno){
        //caso ocorra error
        if(erro) throw erro;
        //caso ocorra o cadastro
        req.files.imagem.mv(__dirname+'/imagens/'+req.files.imagem.name);
        console.log(retorno)
    });

    // retornar para a rota principal
    res.redirect('/');

});


//servidor
app.listen(8080);