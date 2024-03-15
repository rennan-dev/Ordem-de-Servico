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
    // Verifica se a rota não é a de login ou a rota principal
    if (req.path !== '/login' && req.path !== '/') {
        // verificando se o usuario esta autenticado
        if (req.session && req.session.usuario) {
            // Se o usuário estiver autenticado, continue o fluxo da solicitação
            next(); 
        } else {
            // Se o usuário não estiver autenticado, redirecione-o para a página de login
            res.redirect('/login');
        }
    } else {
        // Se a rota for a de login ou a rota principal, continua o fluxo da solicitação
        next();
    }
});

router.get('/index_gerente', function(req,res) {
    servico.paginaIndexGerente(req,res);
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
