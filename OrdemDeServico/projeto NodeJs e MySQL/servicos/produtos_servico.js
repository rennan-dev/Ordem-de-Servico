// Importar o módulo de conexão com banco MySQL
const conexao = require('../bd/conexao_mysql');

// Importar o módulo file system
const fs = require('fs');

// Função para exibir o formulário para cadastro de produtos
function formularioCadastro(req, res){
    res.render('formulario');
}

// Função para exibir o formulário para cadastro de produtos e a situação
function formularioCadastroComSituacao(req, res){
    res.render('formulario', {situacao:req.params.situacao});
}

// Função para exibir o formulário para edição de produtos
function formularioEditar(req, res){
    //SQL
    let sql = `SELECT * FROM produtos WHERE codigo = ${req.params.codigo}`;

    //Executar o SQL
    conexao.query(sql, function(erro, retorno){
        //caso haja erro no comando SQL
        if(erro) throw erro;

        //caso consiga executar o comando SQL
        //foi criado o objeto produto(singular)
        res.render('formularioEditar', {produto:retorno[0]});
    });
}

// Função para exibir a listagem de produtos
function listagemProdutos(req, res){
    //obter categoria
    let categoria = req.params.categoria;

    //SQL
    let sql = '';
    if(categoria == 'todos'){
        sql = 'SELECT * FROM produtos ORDER BY RAND()';
    }else{
        //ORDER BY nome ASC - coloca a lista em ordem alfabética a partir dos nomes
        sql = `SELECT * FROM produtos WHERE categoria = '${categoria}' ORDER BY nome ASC`;
    }

    //Executar comando SQL
    conexao.query(sql, function(erro, retorno){
    res.render('lista', {produtos:retorno});
    });
}

// Função para realizar a pesquisa de produtos
function pesquisa(req, res){
    //obter o termo pesquisado
    let termo = req.body.termo;

    //SQL
    let sql = `SELECT * FROM produtos WHERE nome LIKE '%${termo}%'`;

    //Executar comando SQL
    conexao.query(sql, function(erro, retorno){

        let semRegistros = retorno.length == 0 ? true : false;

    res.render('lista', {produtos:retorno, semRegistros:semRegistros});
    });
}

// Função para realizar o cadastro de produtos
function cadastrarProduto(req, res){
    try {
        //obter os dados que serão utilizados para o cadastro
       let nome = req.body.nome;
       let valor = req.body.valor;
       let categoria = req.body.categoria;
       let imagem = req.files.imagem.name;
    
       //validar o nome do produto e o valor
       if(nome == '' || valor == '' || isNaN(valor) || categoria == ''){
            res.redirect('/falhaCadastro');
       }else{
            //SQL
            let sql = `INSERT INTO produtos (nome, valor, imagem, categoria) VALUES ('${nome}', ${valor}, '${imagem}', '${categoria}')`;
    
            //Executar comando SQL
            conexao.query(sql, function(erro, retorno){
                //caso ocorra algum erro
                if(erro) throw erro;
    
                //caso ocorra o cadastro
                req.files.imagem.mv(__dirname+'/../imagens/'+req.files.imagem.name);
                console.log(retorno);
       });
    
       //retornar para a rota principal
       res.redirect('/okCadastro');
       }
    
       
       } catch (erro) {
        res.redirect('/falhaCadastro');
       }
}

// Função para realizar a remoção de produtos
function removerProduto(req, res){
     //tratamento de excessão
     try {
        //SQL
        let sql = `DELETE FROM produtos WHERE codigo = ${req.params.codigo}`;

        //Executar o comando SQL
        conexao.query(sql, function(erro, retorno){
            //caso falhe o comando SQL
            if(erro) throw erro;

            //caso o comando SQL funcione
            fs.unlink(__dirname+'/../imagens/'+req.params.imagem, (erro_imagem)=>{
                console.log('Falha ao remover a imagem');
            });
        });

        //redirecionamento para rota principal
        res.redirect('/okRemover');
    } catch (erro) {
        res.redirect('/falhaRemover');
    }
}

// Função responsável pela edição de produtos
function editarProduto(req, res){
    //obter os dados do formulário
    let nome = req.body.nome;
    let valor = req.body.valor;
    let codigo = req.body.codigo;
    let nomeImagem = req.body.nomeImagem;

    //validar nome do produto e valor
    if(nome == '' || valor == '' || isNaN(valor)){
        res.redirect('/falhaEdicao');
    }else{
         //definir o tipo de edição
        try{
            //objeto de imagem
            let imagem = req.files.imagem;

            //SQL
            let sql = `UPDATE produtos SET nome='${nome}', valor=${valor}, imagem='${imagem.name}' WHERE codigo=${codigo}`;

            //Executar comando SQL
            conexao.query(sql, function(erro, retorno){
                //caso falhe o comando SQL
                if(erro) throw erro;

            //remover imagem antiga
            fs.unlink(__dirname+'/../imagens/'+nomeImagem, (erro_imagem)=>{
                console.log('Falha ao remover a imagem');
            });

            //cadastrar nova imagem
            imagem.mv(__dirname+'/../imagens/'+imagem.name);
        });
        
         }catch(erro){
             //SQL
             let sql = `UPDATE produtos SET nome='${nome}', valor=${valor} WHERE codigo=${codigo}`;

            //Executar comando SQL
            conexao.query(sql, function(erro, retorno){
                if(erro) throw erro;
            });
        }    

        //Redirecionamento
        res.redirect('/okEdicao');

    }
}

// Exportar funções
module.exports = {
    formularioCadastro,
    formularioCadastroComSituacao,
    formularioEditar,
    listagemProdutos,
    pesquisa,
    cadastrarProduto,
    removerProduto,
    editarProduto
};