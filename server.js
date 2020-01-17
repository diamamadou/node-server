const yargs = require('yargs');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const ingredientsTable = require('./ingredients');
const app = express();

app.use(bodyParser.json());

// Configuration
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'rootroot',
    database: 'aston_node',
});

connection.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('connected on database');
    }
});

/**************************************************
 * Ligne de commande
 *************************************************/

const argv = yargs.command('import', 'Ajouter des ingrédients', {
    file: {
        describe: 'Fichier à importer',
        alias: 'f',
        required: true
    }
}).command('reset', 'supprimer les lignes de la table LTIngredient', {

}).argv;

let cmd = argv._[0];
let file = argv.file;

if(cmd === 'import' && typeof file === "string") {
    let ingredients = ingredientsTable.fetchIngredients(file);
    ingredients.forEach(ingredient => {
        let query = '' +
            'INSERT INTO ltingredient(status, label, description, image64) ' +
            'VALUES(' + ingredient.status + ', "' + ingredient.label + '", "' + ingredient.description + '", "' + ingredient.image64 + '")';
        connection.query(query, (err, result) => {
        });
    });
    console.log('votre fichier a été ajouté dans la base de données avec succés :)')

} else if (cmd === 'reset') {
    console.log('resetting');
    const query = 'DELETE FROM ltingredient';
    connection.query(query, (err, result) => {
       if(err) {
           console.log('Une erreur est survenue !');
       } else {
           console.log('Toutes les lignes de la table Ingrédient ont été supprimées !');
       }
    });
} else {
    console.log('Commande non reconnue');
}

/**************************************************
 * API REST
 *************************************************/

// Affichage de la liste des ingrédients
app.get('/ingredients', (req, res) => {
    const query = 'SELECT * FROM ltingredient';
    connection.query(query, (err, result) => {
        res.json({ingredients: result})
    })
});

// Affichage d'un ingrédient donné
app.get('/ingredient/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM ltingredient WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        res.json({ingredient: result[0]})
    })
});

// Ajout d'un nouveau ingrédient
app.post('/ingredient', (req, res) => {
   const {status, label, description, image64} = req.body.ingredient;
   const query = 'INSERT INTO ltingredient (status, label, description, image64) VALUES (?, ?, ?, ?)'
   connection.query(query, [status, label, description, image64], (err, result) => {
       console.log('Votre nouveau ingrédient a été ajouté dans la base de données !');
       res.json({ingredientId: result.insertId});
   });
});

// Modification d'un ingrédient
app.patch('/ingredient/:id', (req, res) => {
    const id = req.params.id;
    const {status, label, description, image64} = req.body.ingredient;
    const query = 'UPDATE ltingredient SET status = ?, label = ?, description = ?, image64 = ?  WHERE id = ?';
    connection.query(query, [status, label, description, image64, id], (err, result) => {
        console.log('L\'ingrédient ' + label + ' a été mis à jour');
        res.json({ingredient: result[0]});
    })
});

// Suppression d'un ingrédient
app.delete('/ingredient/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM ltingredient WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        console.log('L\'ingrédient dont l\'identifiant est ' + id + ' a été supprimé');
        res.json({ingredientDeleted: true});
    });
});

// Mise en service du serveur
app.listen(5000, () => {
    console.log('Listenning on server 5000');
});
