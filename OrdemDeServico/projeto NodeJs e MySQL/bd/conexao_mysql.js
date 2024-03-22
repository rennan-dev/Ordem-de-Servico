//importar modulo mysql
const mysql = require('mysql2');

//configuração de conexão
const conexao = mysql.createConnection({
    host:'localhost',
    user:'root',
    password: 'ars131236',
    database:'projeto'
});

//teste de conexão
conexao.connect(function(erro){
    if(erro) throw erro;
    console.log('conexao efetuada com sucesso!');
});

//exportar modulo 
module.exports = conexao;