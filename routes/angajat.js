var express = require('express');
var router = express.Router();
var connection = require('./databaseConnect');

/*router.get('/angajati', function (req, res, next) {

    var query = connection().query("select * from public.angajat;", function (err, result) {
        connection().end();
        if (err) return console.error(err);
        res.send(result.rows)
    });
});*/

router.get('/angajati/:id', function (req, res, next) {

    var query = connection().query("select id, name, salary from public.angajat where id=$1 returning id, name, salary", [req.params.id], function (err, result) {
        connection().end();
        if (err) return console.error(err);
        res.send(result.rows);
    });
});

router.get('/angajati', function (req, res) {

    var results = [];
    var i = req.query.page * req.query.size - req.query.size;
    var j = parseInt(i) + parseInt(req.query.size);

    var query = connection().query("select * from public.angajat", function (err, result) {
        connection().end();
        if (err) return console.error(err);
        for (var k = i; k < j; k++) {
            results.push(result.rows[k]);
        }
        res.send(results);
    });
});

router.get('/angajat/filter', function (req, res) {
    var query = connection().query("select * from public.angajat where name LIKE $1",['%' + req.query.name + '%'],
        function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            res.send(result.rows);
        });
});

router.post('/angajati', function (req, res) {
    var query = connection().query("insert into public.angajat (name, salary) values ($1,$2) returning id, name, salary", [req.body.name, req.body.salary], function (err, result) {
        connection().end();
        if (err) return console.error(err);
        console.log(result.rows);
        res.render('index',{title: "200 OK", content: "Successfully created"});
    });
});

router.put('/angajati', function (req, res) {
    var query = connection().query("update public.angajat set name=$1, salary=$2 where id=$3 " +
        "returning id, name, salary", [req.body.name, req.body.salary, req.query.id],
        function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            res.render('index', {title: "200 OK", content: "Successfully updated"});
        });
});

router.delete('/angajati', function (req, res) {
    var query = connection().query("delete from public.angajat where id=$1 returning id, name, salary",
        [req.query.id], function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            res.render('index', {title: "200 OK", content: "Successfully deleted"});
        });
});

module.exports = router;
