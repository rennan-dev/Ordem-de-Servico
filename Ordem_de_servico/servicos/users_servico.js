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

//enviar formulario do servidor para o banco de dados
function inserirDadosNoBanco(nome, email, siape, bloco, sala, descricaoProblema) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO form_servidor (nome, email, siape, bloco, sala, descricaoProblema, data_solicitacao) VALUES (?, ?, ?, ?, ?, ?, NOW())';
        conexao.query(sql, [nome, email, siape, bloco, sala, descricaoProblema], (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

// Função para obter informações com base na data
function obterInformacoesPorData(dataSolicitacao) {
    return new Promise((resolve, reject) => {
        // Consulta SQL para selecionar informações com base na data
        const sql = `SELECT * FROM form_servidor WHERE DATE(data_solicitacao) = ?`;

        // Executar a consulta SQL
        conexao.query(sql, [dataSolicitacao], (error, results) => {
            if (error) {
                console.error('Erro ao executar consulta SQL:', error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

//função para obter solicitações de dia especifico
function obterNomesPorData(dataSolicitacao) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, nome FROM form_servidor WHERE DATE(data_solicitacao) = ?`;
        conexao.query(sql, [dataSolicitacao], (error, results) => {
            if (error) {
                reject(error);
            } else {
                const nomes = results.map(result => result.nome);
                resolve(nomes);
            }
        });
    });
}

// Função para obter nomes e IDs das solicitações por data
function obterNomesEIdsPorData(dataSolicitacao) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, nome FROM form_servidor WHERE DATE(data_solicitacao) = ?`;
        conexao.query(sql, [dataSolicitacao], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

// Função para obter informações da solicitação pelo ID
function obterInformacoesSolicitacao(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM form_servidor WHERE id = ?';
        conexao.query(sql, [id], (error, results) => {
            if (error) {
                reject(error);
            } else {
                if (results.length > 0) {
                    resolve(results[0]);
                } else {
                    reject(new Error('Solicitação não encontrada'));
                }
            }
        });
    });
}



// Exportar funções
module.exports = {
    formularioCadastro,
    paginaLoginGerente,
    paginaIndexGerente,
    loginGerente,
    logout,
    inserirDadosNoBanco,
    obterInformacoesPorData,
    obterNomesPorData,
    obterNomesEIdsPorData,
    obterInformacoesSolicitacao
};