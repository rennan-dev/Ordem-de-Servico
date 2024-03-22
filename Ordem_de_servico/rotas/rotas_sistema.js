// Importar o módulo express
const express = require('express');

// Extraindo a função Router do módulo express
const router = express.Router();

//importar o módulo para armanezar a sessão de login
const session = require('express-session');

// Configuração do middleware de sessão
router.use(session({
    secret: 'seu_segredo_aqui',
    resave: false,
    saveUninitialized: true
}));

// Importar módulo de serviços
const servico = require('../servicos/users_servico');
const conexao = require('../bd/conexao_mysql');

//ROTAS:

const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Mês começa do zero
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

//buscar protocolo no banco de dados
router.get('/buscar_protocolo', async (req, res) => {
    const { protocolo } = req.query;

    try {
        if (!protocolo) {
            return res.redirect('/?erro=' + encodeURIComponent('Por favor, insira um protocolo.'));
        }

        let sql = `SELECT * FROM form_servidor WHERE protocolo = ?`;
        conexao.query(sql, [protocolo], function(err, result) {
            if (err) {
                return res.status(500).send('Erro ao consultar o banco de dados');
            }
            if (result.length > 0) {
                // Recupere todas as informações do protocolo encontrado
                const protocoloEncontrado = result[0];

                // Formate a data antes de passá-la para o template
                protocoloEncontrado.data_solicitacao = formatDate(protocoloEncontrado.data_solicitacao);

                // Renderize a página de solicitação e passe as informações do protocolo como contexto
                res.render('solicitacao', { protocoloEncontrado });
            } else {
                return res.redirect('/?erro=' + encodeURIComponent('Protocolo não encontrado'));
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar protocolo no banco de dados');
    }
});

//rota para a página de pesquisa de solicitações dos servidores
router.get('/solicitacao', function (req, res) {
    // Supondo que você tenha uma variável protocolos com os dados a serem exibidos na página
    const protocolos = [
        { protocolo: 'Protocolo1', informacao: 'Informacao1' },
        { protocolo: 'Protocolo2', informacao: 'Informacao2' },
        // Adicione mais objetos de protocolo conforme necessário
    ];

    // Renderizar a página Handlebars e passar os dados necessários
    res.render('solicitacao', { protocolos: protocolos });
});

//atualizar status da solicitação
router.post('/atualizar_status', async (req, res) => {
    try {
        const { protocolo, novoStatus } = req.body;

        // Execute a query para atualizar o status no banco de dados
        const sql = `UPDATE form_servidor SET status = ? WHERE protocolo = ?`;
        conexao.query(sql, [novoStatus, protocolo], function(err, result) {
            if (err) {
                return res.status(500).send('Erro ao atualizar o status no banco de dados');
            }
            // Envie uma resposta de sucesso
            res.status(200).send('Status atualizado com sucesso');
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao processar a solicitação');
    }
});


//rota de login do gerente de TI (mova esta rota para cima)
router.get('/login', function(req,res) {
    servico.paginaLoginGerente(req,res);
});

router.post('/login', function(req,res) {
    servico.loginGerente(req,res);
});

// Middleware de autenticação
router.use(function(req, res, next) {
    // Verifica se a rota não é a de login, a rota principal ou a rota de submissão do formulário
    if (req.path !== '/login' && req.path !== '/' && req.path !== '/formulario') {
        // Verifique se o usuário está autenticado
        if (req.session && req.session.usuario) {
            // Se o usuário estiver autenticado, continue o fluxo da solicitação
            next(); 
        } else {
            // Se o usuário não estiver autenticado, redirecione-o para a página principal
            res.redirect('/');
        }
    } else {
        // Se a rota for a de login, a rota principal ou a rota de submissão do formulário, continua o fluxo da solicitação
        next();
    }
});


router.get('/index_gerente', function(req,res) {
    servico.paginaIndexGerente(req,res);
});

//rota para lidar com a submissão do formulário do servidor
router.post('/formulario', function(req, res) {
    let nome = req.body.nome;
    let email = req.body.email;
    let siape = req.body.siape;
    let bloco = req.body.bloco;
    let sala = req.body.sala;
    let descricaoProblema = req.body.descricaoProblema;

    // Verificar se todos os campos estão preenchidos
    if (!nome || !email || !siape || !bloco || !sala || !descricaoProblema) {
        return res.render('index', { erro: 'Por favor, preencha todos os campos.' });
    }

    // Chame a função do serviço para inserir os dados no banco de dados
    servico.inserirDadosEEnviarEmail(nome, email, siape, bloco, sala, descricaoProblema)
        .then(() => {
            // Redirecione o usuário para uma página de sucesso ou faça outra ação apropriada
            res.redirect('/sucesso');
        })
        .catch((error) => {
            // Lide com qualquer erro que ocorra durante a inserção dos dados no banco de dados
            console.error('Erro ao inserir dados no banco de dados:', error);
            // Redirecione o usuário para uma página de erro ou faça outra ação apropriada
            res.redirect('/erro');
        });
});

router.get('/selecionar_data', function(req, res) {
    const { data_solicitacao } = req.query;

    // Verificar se a data de solicitação foi fornecida
    if (!data_solicitacao) {
        // Se a data não foi fornecida, renderizar a página novamente com a mensagem de erro
        return res.render('index_gerente', { erro: 'Por favor, selecione uma data antes de pesquisar.' });
    }

    // Converter a data para o formato YYYY-MM-DD
    const partesData = data_solicitacao.split('/'); // Dividir a data em partes
    const dataFormatada = partesData[2] + '-' + partesData[1] + '-' + partesData[0]; // Formatar para YYYY-MM-DD

    res.redirect(`/solicitacoes?data_solicitacao=${dataFormatada}`);
});

router.get('/solicitacoes', async function(req, res) {
    const { data_solicitacao } = req.query;

    try {
        // Chamar a função do serviço para obter os nomes e IDs das solicitações na data especificada
        const nomesEIds = await servico.obterNomesEIdsPorData(data_solicitacao);

        // Renderizar a página solicitacoes.handlebars com os nomes e IDs
        res.render('solicitacoes', { diaSelecionado: data_solicitacao, nomesEIds });
    } catch (error) {
        console.error('Erro ao obter nomes e IDs por data:', error);
        res.status(500).send('Erro interno do servidor');
    }
});


// Rota para visualizar solicitação individual
router.get('/detalhes_solicitacao/:id', async function(req, res) {
    const { id } = req.params;

    try {
        // Chamar a função do serviço para obter as informações da solicitação pelo ID
        const solicitacao = await servico.obterInformacoesSolicitacao(id);

        // Renderizar a página de detalhes_solicitacao.handlebars com as informações da solicitação
        res.render('detalhes_solicitacao', { solicitacao });
    } catch (error) {
        console.error('Erro ao obter informações da solicitação:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

//rota para logout
router.get('/logout', function(req,res) {
    servico.logout(req,res);
});

//rota principal
router.get('/', function(req, res){
    servico.formularioCadastro(req, res);
});

// Exportar o router
module.exports = router;
