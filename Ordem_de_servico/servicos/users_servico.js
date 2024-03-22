// Importar o módulo de conexão com banco MySQL
const conexao = require('../bd/conexao_mysql');

// Importar o módulo file system
const fs = require('fs');

const crypto = require('crypto');

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
            req.session.usuario = result[0]; // Definindo o usuário na sessão
            res.redirect('/index_gerente'); // Redireciona para a página de gerente se as credenciais estiverem corretas
        } else {
            return res.render('login', { erro: 'Credenciais Inválidas' });
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

//**************************************************************/
//enviar formulario do servidor para o banco de dados
/*
function inserirDadosNoBanco(nome, email, siape, bloco, sala, descricaoProblema) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO form_servidor (nome, email, siape, bloco, sala, descricaoProblema, data_solicitacao, status) VALUES (?, ?, ?, ?, ?, ?, NOW(), `pendente`)';
        conexao.query(sql, [nome, email, siape, bloco, sala, descricaoProblema], (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}*/
//**************************************************************/

//*****************************TESTE********************************/
function gerarProtocolo() {
    return crypto.randomBytes(4).toString('hex').toUpperCase(); // Gera um código hexadecimal de 8 caracteres (4 bytes)
}

function inserirDadosNoBanco(nome, email, siape, bloco, sala, descricaoProblema, protocolo) {
    return new Promise((resolve, reject) => {
        //let protocolo;
        const tentativasMaximas = 5;
        let tentativas = 0;

        function inserirComProtocoloUnico() {
            //protocolo = gerarProtocolo();
            const sqlVerificar = 'SELECT COUNT(*) AS count FROM form_servidor WHERE protocolo = ?';
            conexao.query(sqlVerificar, [protocolo], (errorVerificar, resultsVerificar) => {
                if (errorVerificar) {
                    reject(errorVerificar);
                } else {
                    if (resultsVerificar[0].count === 0) {
                        const sqlInserir = 'INSERT INTO form_servidor (nome, email, siape, bloco, sala, descricaoProblema, data_solicitacao, status, protocolo) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)';
                        conexao.query(sqlInserir, [nome, email, siape, bloco, sala, descricaoProblema, 'pendente', protocolo], (errorInserir, resultInserir) => {
                            if (errorInserir) {
                                reject(errorInserir);
                            } else {
                                resolve(resultInserir);
                            }
                        });
                    } else {
                        if (tentativas < tentativasMaximas) {
                            tentativas++;
                            inserirComProtocoloUnico();
                        } else {
                            reject(new Error('Não foi possível gerar um protocolo único após várias tentativas.'));
                        }
                    }
                }
            });
        }

        inserirComProtocoloUnico();
    });
}
//***************************FIM TESTE******************************/

//**************************************************************/
//Tentando enviar email start
const nodemailer = require('nodemailer');
// Função para enviar e-mail
async function enviarEmail(nome,email,protocolo) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'rennansouzaalves@gmail.com', // Substitua pelo seu endereço de e-mail
            pass: 'fxtg kmjk kgnz yhbl' // Substitua pela sua senha do Gmail ou use um token de aplicativo
        }
    });

    const msg = {
        from: 'rennansouzaalves@gmail.com', // Substitua pelo seu endereço de e-mail
        to: 'rennansouzaalves@gmail.com', // Substitua pelo endereço de e-mail do administrador
        subject: 'Nova solicitação de serviço recebida',
        text: `Uma nova solicitação foi recebida de ${nome}.`
    };

    const msg2 = {
        from: 'rennansouzaalves@gmail.com', // Substitua pelo seu endereço de e-mail
        to: email, // Substitua pelo endereço de e-mail do administrador
        subject: 'Nova solicitação de serviço recebida',
        text: `Olá ${nome}, sua solicitação foi recebida com sucesso, seu protocolo é ${protocolo}`
    };

    try {
        await transporter.sendMail(msg);
        await transporter.sendMail(msg2);
        console.log('E-mail enviado com sucesso!');
    } catch (error) {
        console.error('Ocorreu um erro ao enviar o e-mail:', error);
    }
}

// Função para inserir dados no banco de dados e enviar e-mail
async function inserirDadosEEnviarEmail(nome, email, siape, bloco, sala, descricaoProblema) {
    try {

        let protocolo = gerarProtocolo();

        await inserirDadosNoBanco(nome, email, siape, bloco, sala, descricaoProblema, protocolo);

        // Enviar e-mail informando sobre a nova solicitação
        enviarEmail(nome, email, protocolo);

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