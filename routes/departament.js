var express = require('express');
var router = express.Router();
var connection = require('./databaseConnect');

/*router.get('/departament', function (req, res, next) {
    var query = connection().query("SELECT id, name, number_employee, chief_name from public.departament", function (err, result) {
        connection().end();
        if (err) return console.error(err);
        console.log(result.rows);
        res.send(result.rows);
    });
});*/

router.get('/departament/', function (req, res) {
    var results = [];
    var i = req.query.page * req.query.size - req.query.size;
    var j = parseInt(i) + parseInt(req.query.size);

    var query = connection().query("select * from public.departament;", function (err, result) {
        connection().end();
        if (err) return console.error(err);
        for (var k = i; k < j; k++) {
            results.push(result.rows[k]);
        }
        res.send(results);
    });
});

router.get('/departament/filter', function (req, res) {
    var query = connection().query("select * from public.departament where name LIKE $1",['%' + req.query.name + '%'],
        function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            res.send(result.rows);
        });
});

router.post('/departament', function (req, res) {
    var query = connection().query("insert into public.departament (name, number_employee, chief_name) values ($1, $2, $3) " +
        "returning id, name, number_employee, chief_name",
        [req.body.name, req.body.number_employee, req.body.chief_name], function (err, result) {
            if (err) return console.error(err);
            connection().end();
            console.log(result.rows);
            res.render('index', {title: "200 OK", content: "Successfully created"});
            res.status(200);
        })
});

router.put('/departament', function (req, res) {
    var query = connection().query("update public.departament set name=$1, " +
        "number_employee=$2, chief_name=$3 where id=$4 returning id, name, number_employee, chief_name",
        [req.body.name, req.body.number_employee, req.body.chief_name, req.query.id],
        function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            res.render('index', {title: "200 OK", content: "Successfully Updated"});
        });
});

router.delete('/departament', function (req, res) {
    var query = connection().query("delete from public.departament where id=$1", [req.query.id],
        function (err, result) {
            connection().end();
            if (err) return console.error(err);
            res.render('index', {title: "200 OK", content: "Successfully Deleted"});
        });
});

module.exports = router;
