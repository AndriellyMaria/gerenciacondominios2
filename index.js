// Declaração de constantes e importação das dependências necessárias

const mysql = require('mysql2'); // Biblioteca para conexão com o banco de dados MySQL
const express = require('express'); // Framework web para Node.js
const bodyParser = require('body-parser'); // Middleware para análise de corpos de requisição


// Criação de uma instância do Express
const app = express();

app.use(express.static('public'));

// Configuração da conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host: 'localhost', // Endereço do banco de dados
    user: 'root', // Nome de usuário
    password: 'root', // Senha
    database: 'agencia_viagens', // Nome do banco de dados
    port:3306 // Porta do banco de dados
});


// Estabelece a conexão com o banco de dados e emite uma mensagem indicando seu status
connection.connect(function(err){
    if(err){
        console.error('Erro ', err);
    return
    }
        console.log("Conexão ok");
    });


// Middleware para análise de corpos de requisição
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())



// Rota para a página default
app.get("/", function(req, res){
res.sendFile(__dirname + "/index.html")
});



    //rota para cadastrar uma viagem
app.post('/cadastrar', function (req,res){

    //captura e armazenamento dos campos do formulário html
    const destino = req.body.destino;
    const data_viagem = req.body.data_viagem;
    const preco = req.body.preco;
    const vagas = req.body.vagas;
    const values = [destino, data_viagem, preco, vagas];
    const insert = "INSERT INTO viagens (destino, data_viagem, preco, vagas) VALUES (?,?,?,?)"

    connection.query(insert, values, function(err, result){
        if(!err){
            console.log("Viagem cadastrada com sucesso!");
            res.redirect('/listar');

        }else{
            console.log("Não foi possível cadastrar a viagem ", err);
            res.send("Erro!")
        }
    });
});

app.get('/listar', function(req,res){
    const listar = "SELECT * FROM viagens";
 
    connection.query(listar, function(err, rows){
        if(!err){
            console.log("Consulta realizada com sucesso!");
            res.send(`
                <html>
                <head>
                <title> Relatório de viagens  </title>
                <link rel="stylesheet" href="/style.css">
                </head>
                <body>

                    <h1>Relatório de viagens</h1>
 
                    <table>
                        <tr>
                            <th> Código </th>
                            <th> Destino </th>
                            <th> Data da Viagem </th>
                            <th> Valor </th>
                            <th> Vagas </th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.id}</td>
                                <td>${row.destino}</td>
                                <td>${row.data_viagem}</td>
                                <td>${row.preco}</td>
                                <td>${row.vagas}</td>

                                <td>
                                    <a href="/editar/${row.id}"><button class="Editar">Editar</button></a>
                                    <a href="/excluir/${row.id}"><button class="Excluir">Excluir</button></a>
                                </td>
                            </tr>
                    
                        `).join('')}
                    </table>
                    <a href="/"> Voltar </a>
                </body>
                </html>
                `);
        } else {
            console.log("Erro no relatório de viagens ", err);
            res.send("Erro")
        }
    });
});

app.get('/excluir/:id', function(req,res){
    const id = req.params.id; //obtém o ID da viagem a ser excluída da URL
 
    connection.query('DELETE FROM viagens WHERE id = ?', [id], function(err, result){
        if(err){
            console.error('Erro ao excluir a viagem.');
            res.status(500).send('Erro interno ao excluir as viagens.')
            return;
        }
        console.log('Viagem deletada com sucesso!');
        res.redirect('/listar');//redireciona para a listagem após a exclusão.
    });
});
 
app.get('/editar/:id', function(req, res){
    const id = req.params.id; // Obtém o ID da viagem a ser editada da URL
    const select = "SELECT * FROM viagens WHERE id = ?";
   
    connection.query(select, [id], function(err, rows){
        if(!err){
            console.log("Viagem encontrada com sucesso!");
            res.send(`
                <html>
                    <head>
                        <title> Editar Viagem </title>
                
                    </head>
                    <body>
                        <div class="edit-container">
                        <h1>Editar Viagem</h1>
                        <form action="/editar/${id}" method="POST">
                            <label for="destino">Destino:</label><br>
                            <input type="text" name="destino" value="${rows[0].destino}"><br><br>
                            <label for="data_viagem">Data da Viagem:</label><br>
                            <input type="date" name="data_viagem" value="${rows[0].data_viagem}"><br><br>
                            <label for="preco">Preço:</label><br>
                            <input type="number" name="preco" value="${rows[0].preco}"><br><br>
                            <label for="vagas">Vagas:</label><br>
                            <input type="number" name="vagas" value="${rows[0].vagas}"><br><br>
                            <input type="submit" value="Salvar">
                        </form>
                    </body>
                </html>`);
            } else {
                console.log("Erro no relatório de estoque ", err);
                res.send("Erro")
            }
        });
    });

    app.post('/editar/:id', function(req, res){
        const id = req.params.id; // Obtém o ID da viagem a ser editada da URL
        const destino = req.body.destino; 
        const data_viagem = req.body.data_viagem; 
        const preco = req.body.preco;
        const vagas = req.body.vagas; 
     
        const update = "UPDATE viagens SET destino = ?, data_viagem = ?, preco = ?, vagas = ? WHERE id = ?";
     
        connection.query(update, [destino, data_viagem, preco, vagas, id], function(err, result){
            if(!err){
                console.log("Viagem editada com sucesso!");
                res.redirect('/listar'); // Redireciona para a página de listagem após a edição
            }else{
                console.log("Erro ao editar a viagem ", err);
                res.send("Erro")
            }
        });
    });

module.exports = app;
});
