var express = require('express');
var router = express.Router();
var connection = require('./databaseConnect');
var js2xml = require('js2xmlparser');
require('express-validator/check');

router.get('/api/angajati/list', function (req, res) {
    var results = [];
    var xml;
    connection().query("select * from public.angajat", function (err, result) {
        connection().end();
        if (err) return console.error(err);
        var data = result.rows;
        data.forEach(function (t) {
            t["link"] = "http://localhost:3000/api/angajati/" + t["id"];
            results.push(JSON.parse(JSON.stringify(t)));
        });
        if (req.get('Accept') === 'application/json' || req.get('Accept') === 'text/html') {
            res.header('Content-Type', 'application/json');
            res.json(results);
        } else if (req.get('Accept') === 'application/xml') {
            res.header('Content-Type', 'application/xml');
            xml = js2xml.parse("angajat", results);
            res.send(xml);
        } else {
            res.sendStatus(406);
        }
    });
});

router.get('/api/angajati/count', function (req, res) {
    connection().query("select count(*) from public.angajat", function (err, result) {
        connection().end();
        if (err) return console.error(err);
        res.send(result.rows[0].count);
    });
});

router.get('/api/angajati/:id', function (req, res) {
    var xml;
        connection().query("select id, name, salary from public.angajat where id=$1", [req.params.id], function (err, result) {
            connection().end();
            if (err) return console.error(err);
            if (req.get('Accept') === 'application/json' || req.get('Accept') === 'text/html') {
                res.header('Content-Type', 'application/json');
                res.json(result.rows);
            } else if (req.get('Accept') === 'application/xml') {
                res.header('Content-Type', 'application/xml');
                xml = js2xml.parse("angajat", JSON.parse(JSON.stringify(result.rows)));
                res.send(xml);
            } else {
                res.sendStatus(406);
            }
        });
});

router.get('/api/angajati', function (req, res) {

    req.checkQuery("page", "1").notEmpty().isNumeric();
    req.checkQuery("size", "5").notEmpty().isNumeric();

    var results = [];
    var i = req.query.page * req.query.size - req.query.size;
    var nr, xml;
    var prevPage = req.query.page - 1;
    var size = req.query.size;

    function getNumberRecords(callback) {
        connection().query("select count(*) from public.angajat", function (err, result) {
            connection().end();
            if (err) return console.error(err);
            nr = result.rows[0].count;
        });

        callback();
    }

    function getRecordsByPage(callback) {
        connection().query("SELECT * FROM public.angajat ORDER BY name OFFSET " + i + " LIMIT " + req.query.size, function (err, result) {
            connection().end();
            if (err) return console.error(err);
            var data = result.rows;
            data.forEach(function (t) {
                t["link"] = "http://localhost:3000/api/angajati/" + t["id"];
                results.push(JSON.parse(JSON.stringify(t)));
            });
            callback();
        });
    }

    function returnTypeOfData() {
        if (nr > prevPage * size) {
            if (req.get('Accept') === 'application/json' || req.get('Accept') === 'text/html') {
                res.header('Content-Type', 'application/json');
                res.json(results);
            } else if (req.get('Accept') === 'application/xml') {
                res.header('Content-Type', 'application/xml');
                xml = js2xml.parse("angajat", results);
                res.send(xml);
            } else {
                res.sendStatus(406);
            }
        } else {
            res.status(400);
            res.render('index', {title: "400", content: "Bad request"});
        }
    }

    var errors = req.validationErrors();
    if (errors) {
        res.status(400);
        res.json(errors);
    } else {
        getNumberRecords(function () {
            getRecordsByPage(function () {
                returnTypeOfData();
            });
        });
    }
});

router.get('/api/angajati/filter', function (req, res) {

    req.checkQuery("name", "Resurse Umane").notEmpty().isAlpha();

    var xml;
    var error = validationErrors();

    if (error) {
        res.status(400);
        res.json(error);
    } else {
        connection().query("select * from public.angajat where name LIKE $1", ['%' + req.query.name + '%'],
            function (err, result) {
                connection().end();
                if (err) return console.error(err);
                console.log(result.rows);
                if (req.get('Accept') === 'application/json' || req.get('Accept') === 'text/html') {
                    res.header('Content-Type', 'application/json');
                    res.json(result.rows);
                } else if (req.get('Accept') === 'application/xml') {
                    res.header('Content-Type', 'application/xml');
                    xml = js2xml.parse("angajat", JSON.parse(JSON.stringify(result.rows)));
                    res.send(xml);
                } else {
                    res.sendStatus(406);
                }
            });
    }
});

router.post('/api/angajati', function (req, res) {

    req.checkBody("name", "Vasile Vieru").notEmpty().isAlpha();
    req.checkBody("salary", "4000").notEmpty().isNumeric();

    var errors = req.validationErrors();
    if (errors) {
        res.send(errors);
    } else {
        connection().query("insert into public.angajat (name, salary) values ($1,$2) returning id, name, salary", [req.body.name, req.body.salary], function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            res.render('index', {title: "200 OK", content: "Successfully created"});
        });
    }
});

router.put('/api/angajati/:id', function (req, res) {
    connection().query("update public.angajat set name=$1, salary=$2 where id=$3 " +
        "returning id, name, salary", [req.body.name, req.body.salary, req.params.id],
        function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            res.render('index', {title: "200 OK", content: "Successfully updated"});
        });
});

router.delete('/api/angajati/:id', function (req, res) {
    connection().query("delete from public.angajat where id=$1",
        [req.params.id], function (err) {
            connection().end();
            if (err) return console.error(err);
            res.render('index', {title: "200 OK", content: "Successfully deleted"});
        });
});

module.exports = router;
