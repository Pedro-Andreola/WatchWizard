const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const conn = require('./db/conn')
const Cliente = require('./models/Cliente')
const Produto = require('./models/Produto')


const PORT = 3000
const hostname = 'localhost'

let log = false
let usuario = ''
let tipoUsuario = ''
  
/* --------------------- Config express -------------------- */
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(express.static('public'))
/* --------------- Config express-handlebars --------------- */
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')
/* --------------------------------------------------------- */

// ===================== Acesso Cliente =======================


app.get('/carrinho', (req,res)=>{
    res.render('carrinho', {log, usuario, tipoUsuario})
})

app.get('/feminino', (req,res)=>{
    res.render('feminino', {log, usuario, tipoUsuario})
})
app.get('/masculino', (req,res)=>{
    res.render('masculino', {log, usuario, tipoUsuario})
})


// ====================== Acesso Gerente ======================

app.post('/editarProduto', async (req,res)=>{
    const nome = req.body.nome
    const tamanho = Number(req.body.tamanho)
    const cor = req.body.cor
    const tipo = req.body.tipo
    const quantidadeEstoque = Number(req.body.quantidadeEstoque)
    const precoUnitario = Number(req.body.precoUnitario)
    const descricao = req.body.descricao
    console.log(nome,tamanho, cor, tipo, quantidadeEstoque, precoUnitario, descricao)
    const dados = await Produto.findOne({raw:true, where: {nome:nome_produto}})
    console.log(dados)
    res.redirect('/editarProduto')

})

app.post('/consultaProduto', async (req, res)=>{
    const nome_produto = req.body.nome
    console.log(nome_produto)
    const dados = await Produto.findOne({raw:true, where: {nome:nome_produto}})
    console.log(dados)
    res.render('editarProduto',{log, usuario, tipoUsuario, valor:dados} )
})

app.get('/editarProduto', (req,res)=>{
    res.render('editarProduto', {log, usuario, tipoUsuario})
})

app.get('/listarProduto', async (req,res)=>{
    const dados = await Produto.findAll({raw:true})
    console.log(dados)
    res.render('listarProduto', {log, usuario, tipoUsuario, valores:dados})
})

app.post('/cadastrarProduto', async (req,res)=>{
    const nome = req.body.nome
    const tamanho = req.body.tamanho
    const cor = req.body.cor
    const tipo = req.body.tipo
    const quantidadeEstoque = req.body.quantidadeEstoque
    const precoUnitario = req.body.precoUnitario
    const descricao = req.body.descricao
    console.log(nome,tamanho, cor, tipo, quantidadeEstoque, precoUnitario, descricao)
    await Produto.create({nome:nome, tamanho:tamanho, cor: cor, tipo: tipo, quantidadeEstoque: quantidadeEstoque, precoUnitario: precoUnitario, descricao: descricao})
    let msg = 'Dados Cadastrados'
    res.render('cadastrarProduto', {log, usuario, tipoUsuario})
})

app.get('/cadastrarProduto', (req,res)=>{
    res.render('cadastrarProduto', {log, usuario, tipoUsuario})
})

// ===================== Compra/Carrinho ========================
app.post('/comprar', async(req,res)=>{
    const dados_carrinho = req.body
    console.log(dados_carrinho)

    const atualiza_promise = []
    for (const item of dados_carrinho){
        const produto = await Produto.findByPk(item.cod_prod, {raw:true})
        console.log(produto)
        if(!produto || produto.quantidadeEstoque < item.qtde){
            return res.status(400).json({message:"Produto não Disponível" + produto.quantidadeEstoque})
        }
        const atualiza_promessas = await Produto.update(
            {quantidadeEstoque: produto.quantidadeEstoque - item.qtde},
            {where:{id: item.cod_prod}}
        )
        atualiza_promise.push(atualiza_promessas)
    }
    try{
        await Promise.all(atualiza_promise)
        res.status(200).json({message:"Compra Realizada!"})
    }catch(error){
        console.error('Erro ao atualizar os dados '+ error)
        res.status(500).json({message: "Erro ao processar a compra"})
    }
})

// ====================== Login/Logout =======================
app.post('/login', async (req,res)=>{
    const email = req.body.email
    const senha = req.body.senha
    console.log(email,senha)
    const pesq = await Cliente.findOne({raw:true, where:{email:email,senha:senha}})
    console.log(pesq)
    let msg = 'Usuário não Cadastrado'
    if(pesq == null){
        res.render('login', {msg})
    }else if(email == pesq.email && senha == pesq.senha && pesq.tipo === 'admin'){
        log = true
        usuario = pesq.usuario
        tipoUsuario = pesq.tipo
        console.log(tipoUsuario)
        res.render('gerenciador', {log, usuario, tipoUsuario})        
    }else if(email == pesq.email && senha == pesq.senha && pesq.tipo === 'cliente'){
        log = true
        usuario = pesq.usuario
        tipoUsuario = pesq.tipo
        console.log(usuario)
        res.render('home', {log, usuario, tipoUsuario})
        
    }else{
        res.render('login', {msg})
    }
})

app.get('/login', (req,res)=>{
    log = false
    usuario = ''
    res.render('login', {log, usuario})
})

app.get('/logout', (req,res)=>{
    log = false
    usuario = ''
    res.render('home', {log, usuario})
})

// ==================== Rota Padrão ========================
app.get('/', (req,res)=>{
    log = false
    usuario = ''
    res.render('home', {log, usuario})
})
/* ------------------------------------------------- */
conn.sync().then(()=>{
    app.listen(PORT,hostname, ()=>{
        console.log(`Servidor Rodando em ${hostname}:${PORT}`)
    })
}).catch((error)=>{
    console.error('Erro de conexão com o banco de dados!'+error)
})
