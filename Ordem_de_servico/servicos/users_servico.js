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

    if (!email || !password) {
        return res.render('login', { erro: 'Por favor, preencha todos os campos.' });
    }

    let sql = `SELECT * FROM user WHERE email = ? AND senha = ?`;
    conexao.query(sql, [email, password], function(err, result) {
        if (err) {
            return res.render('login', { erro: 'Erro ao consultar o banco de dados' });
        }
        if (result.length > 0) {
            req.session.usuario = result[0]; //definindo o usuário na sessão
            res.redirect('/index_gerente'); 
        } else {
            return res.render('login', { erro: 'Credenciais Inválidas' });
        }
    });
}

function logout(req,res) {
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
        } else {
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

//**************************************************************/
//Tentando enviar email start
const nodemailer = require('nodemailer');
// Função para enviar e-mail
async function enviarEmail(nome) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '', //substitua pelo seu endereço de e-mail
            pass: '' //substitua pela sua senha do Gmail ou use um token de aplicativo
        }
    });

    const msg = {
        from: '', //substitua pelo seu endereço de e-mail
        to: '', //substitua pelo endereço de e-mail do administrador
        subject: 'Nova solicitação de serviço recebida',
        text: `Uma nova solicitação foi recebida de ${nome}.`
    };

    try {
        await transporter.sendMail(msg);
        console.log('E-mail enviado com sucesso!');
    } catch (error) {
        console.error('Ocorreu um erro ao enviar o e-mail:', error);
    }
}

// Função para inserir dados no banco de dados e enviar e-mail
async function inserirDadosEEnviarEmail(nome, email, siape, bloco, sala, descricaoProblema) {
    try {
        await inserirDadosNoBanco(nome, email, siape, bloco, sala, descricaoProblema);

        // Enviar e-mail informando sobre a nova solicitação
        enviarEmail(nome);

        console.log('E-mail enviado com sucesso!');
    } catch (error) {
        console.error('Ocorreu um erro:', error);
    }
}
//Tentando enviar email end
//**************************************************************/

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
    obterInformacoesSolicitacao,
    inserirDadosEEnviarEmail
};
