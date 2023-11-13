const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const Produto = db.define('produto',{
    nome: {
        type: DataTypes.STRING(75)
    },
    tamanho:{
        type: DataTypes.INTEGER
    },
    cor:{
        type: DataTypes.STRING(50)
    },
    tipo:{
        type: DataTypes.STRING(50)
    },
    quantidadeEstoque: {
        type: DataTypes.INTEGER
    },
    precoUnitario: {
        type: DataTypes.FLOAT
    },
    descricao: {
        type: DataTypes.TEXT
    }
},{
    createdAt: false,
    updatedAt: false
})

// Produto.sync({force:true})

module.exports = Produto