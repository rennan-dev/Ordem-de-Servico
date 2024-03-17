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

//ROTAS:

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
