// Importar o módulo de conexão com banco MySQL
const conexao = require('../bd/conexao_mysql');

// Importar o módulo file system
const fs = require('fs');

// Função para exibir o formulário para cadastro de produtos
function formularioCadastro(req, res){
    res.render('index');
}

function paginaLoginGerente(req,res) {
    res.render('login');
}

function paginaIndexGerente(req,res) {
    res.render('index_gerente');
}

function loginGerente(req,res) {
    let email = req.body.email;
    let password = req.body.password;

    let sql = `SELECT * FROM user WHERE email = ? AND senha = ?`;
    conexao.query(sql, [email, password], function(err, result) {
        if (err) {
            console.log("Erro ao consultar o banco de dados:", err);
            res.redirect('/login'); 
            return;
        }
        if (result.length > 0) {
            req.session.usuario = result[0]; // Definindo o usuário na sessão
            res.redirect('/index_gerente'); // Redireciona para a página de gerente se as credenciais estiverem corretas
        } else {
            console.log("Credenciais Inválidas");
            res.redirect('/login'); 
        }
    });
}

function logout(req,res) {
    // Destrua a sessão
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
        } else {
            // Redirecione o usuário para a página de login após o logout
            res.redirect('/login');
        }
    });
}


// Exportar funções
module.exports = {
    formularioCadastro,
    paginaLoginGerente,
    paginaIndexGerente,
    loginGerente,
    logout
};