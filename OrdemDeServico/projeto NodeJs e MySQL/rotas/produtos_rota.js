// Importar o módulo express
const express = require('express');

// Extraindo a função Router do módulo express
const router = express.Router();

// Importar módulo de serviços
const servico = require('../servicos/produtos_servico');


// *** ADICIONE SUAS ROTAS AQUI

//rota principal
router.get('/', function(req, res){
    servico.formularioCadastro(req, res);
});

//rota principal contendo a situação
router.get('/:situacao', function(req, res){
    servico.formularioCadastroComSituacao(req, res);
});

//rota de listagem
router.get('/listar/:categoria', function(req, res){
    servico.listagemProdutos(req, res);
});

//rota de pesquisa
router.post('/pesquisa', function(req, res){
    servico.pesquisa(req, res);
});

//rota de cadastro
router.post('/cadastrar', function(req, res){
    servico.cadastrarProduto(req, res);
});

//rota para remover produtos
router.get('/remover/:codigo&:imagem', function(req, res){
    servico.removerProduto(req, res);
});

//rota para redirecionar para o formulário de alteração/edição
router.get('/formularioEditar/:codigo', function(req, res){
    servico.formularioEditar(req, res);
});

//rota para editar produtos
router.post('/editar', function(req, res){
    servico.editarProduto(req, res);
});

// Exportar o router
module.exports = router;