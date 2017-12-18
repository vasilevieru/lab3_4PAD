var express = require('express');
var router = express.Router();
var connection = require('./databaseConnect');
var xml = require('xml');

router.get('/angajati/list', function (req, res) {
    var results = [];
    connection().query("select * from public.angajat", function (err, result) {
        connection().end();
        if (err) return console.error(err);
        var data = result.rows;
        data.forEach(function (t) {
        t["link"] = "http://localhost:3000/angajati/" + t["id"];
        results.push(t);
        });
        res.send(results);
    });
});

router.get('/angajati/count', function (req, res) {
    connection().query("select count(*) from public.angajat", function (err, result) {
        connection().end();
        if(err) return console.error(err);
        res.send(result.rows[0].count);
    });
});

router.get('/angajati/:id', function (req, res) {

    connection().query("select id, name, salary from public.angajat where id=$1", [req.params.id], function (err, result) {
        connection().end();
        if (err) return console.error(err);
        if(req.get('Accept') === 'application/json' || req.get('Accept') === 'text/html'){
            res.header('Content-Type', 'application/json');
            res.json(result.rows);
        }else if(req.get('Accept') === 'application/xml') {
            res.header('Content-Type', 'application/xml');
            res.send(xml(result.rows));
        }else{
            res.sendStatus(406);
        }
    });
});

router.get('/angajati', function (req, res) {

    var i = req.query.page * req.query.size - req.query.size;
    var nr;
    var prevPage = req.query.page -1;
    var size = req.query.size;
    connection().query("select count(*) from public.angajat", function (err, result) {
        connection().end();
        if(err) return console.error(err);
        nr = result.rows[0].count;
    });

    connection().query("SELECT * FROM public.angajat ORDER BY name OFFSET " + i + " LIMIT "+ req.query.size, function (err, result) {
        connection().end();
        if (err) return console.error(err);
        if(nr >= prevPage*size){
            if(req.get('Accept') === 'application/json' || req.get('Accept') === 'text/html'){
                res.header('Content-Type', 'application/json');
                res.json(result.rows);
            }else if(req.get('Accept') === 'application/xml') {
                res.header('Content-Type', 'application/xml');
                res.send(xml(result.rows));
            }else{
                res.sendStatus(406);
            }
        }else {
            res.status(400);
            res.render('index',{title:"400", content: "Bad request"});
        }

    });
});

router.get('/angajat/filter', function (req, res) {
    connection().query("select * from public.angajat where name LIKE $1",['%' + req.query.name + '%'],
        function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            if(req.get('Accept') === 'application/json' || req.get('Accept') === 'text/html'){
                res.header('Content-Type', 'application/json');
                res.json(result.rows);
            }else if(req.get('Accept') === 'application/xml') {
                res.header('Content-Type', 'application/xml');
                res.send(xml(result.rows));
            }else{
                res.sendStatus(406);
            }
        });
});

router.post('/angajati', function (req, res) {
    if(!req.body.name || !req.body.salary){
        res.status(400);
        res.render('index',{title:"400", content: "Bad request"});
    }else{
        connection().query("insert into public.angajat (name, salary) values ($1,$2) returning id, name, salary", [req.body.name, req.body.salary], function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            res.render('index',{title: "200 OK", content: "Successfully created"});
        });
    }
});

router.put('/angajati/:id', function (req, res) {
    connection().query("update public.angajat set name=$1, salary=$2 where id=$3 " +
        "returning id, name, salary", [req.body.name, req.body.salary, req.params.id],
        function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            res.render('index', {title: "200 OK", content: "Successfully updated"});
        });
});

router.delete('/angajati/:id', function (req, res) {
    connection().query("delete from public.angajat where id=$1",
        [req.params.id], function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            res.render('index', {title: "200 OK", content: "Successfully deleted"});
        });
});

module.exports = router;
