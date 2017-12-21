var express = require('express');
var router = express.Router();
var connection = require('./databaseConnect');
var js2xml = require('js2xmlparser');
require('express-validator/check');


router.get('/api/departament/list', function (req, res) {
    var results = [];
    var xml;
    connection().query("SELECT id, name, number_employee, chief_name from public.departament", function (err, result) {
        connection().end();
        if (err) return console.error(err);
        var data = result.rows;
        data.forEach(function (t) {
            t["link"] = "http://localhost:3000/api/departament/" + t["id"];
            results.push(JSON.parse(JSON.stringify(t)));
        });
        //console.log(JSON.parse(JSON.stringify(result.rows[0])));
        console.log(results);
        if (req.get('Accept') === 'application/json' || req.get('Accept') === 'text/html') {
            res.header('Content-Type', 'application/json');
            res.json(results);
        } else if (req.get('Accept') === 'application/xml') {
            res.header('Content-Type', 'application/xml');
            xml = js2xml.parse("departamente", results);
            res.send(xml);
        } else {
            res.sendStatus(406);
        }
    });
});

router.get('/api/departament/count', function (req, res) {
    connection().query("select count(*) from public.departament", function (err, result) {
        connection().end();
        if (err) return console.error(err);
        res.send(result.rows[0].count);
    });
});

router.get('/api/departament/:id', function (req, res) {
    var xml;
    connection().query("select id, name, number_employee, chief_name from public.departament where id=$1", [req.params.id], function (err, result) {
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

router.get('/api/departament', function (req, res) {

    req.checkQuery("page", 1).notEmpty().isNumeric();
    req.checkQuery("size", 3).notEmpty().isNumeric();

    var results = [];
    var i = req.query.page * req.query.size - req.query.size;
    var nr, xml;
    var prevPage = req.query.page - 1;
    var size = req.query.size;
    var error = req.validationErrors();

    function getNumberRecords(callback) {
        connection().query("select count(*) from public.departament", function (err, result) {
            connection().end();
            if (err) return console.error(err);
            nr = result.rows[0].count;
        });
        callback();
    }

    function getRecordsByPage(callback) {
        connection().query("SELECT * FROM public.departament ORDER BY name OFFSET " + i + " LIMIT " + req.query.size, function (err, result) {
            connection().end();
            if (err) return console.error(err);
            var data = result.rows;
            data.forEach(function (t) {
                t["link"] = "http://localhost:3000/api/departament/" + t["id"];
                results.push(JSON.parse(JSON.stringify(t)));
            });
            callback();
        });
    }

    function returnTypeOfData() {
        if (nr >= prevPage * size) {
            if (req.get('Accept') === 'application/json' || req.get('Accept') === 'text/html') {
                res.header('Content-Type', 'application/json');
                res.json(results);
            } else if (req.get('Accept') === 'application/xml') {
                res.header('Content-Type', 'application/xml');
                xml = js2xml.parse("departament", results);
                res.send(xml);
            } else {
                res.sendStatus(406);
            }
        } else {
            res.status(400);
            res.render('index', {title: "400", content: "Bad request"});
        }
    }

    if (error) {
        res.status(400);
        res.json(error);
    } else {
        getNumberRecords(function () {
            getRecordsByPage(function () {
                returnTypeOfData();
            });
        });
    }
});

router.get('/api/departament/filter', function (req, res) {

    req.checkQuery("name", "Re").notEmpty().isAlpha();

    var xml;
    var error = req.validationErrors();
    if (error) {
        res.status(400);
        res.json(error);
    } else {
        connection().query("select * from public.departament where name LIKE $1", ['%' + req.query.name + '%'],
            function (err, result) {
                connection().end();
                if (err) return console.error(err);
                console.log(result.rows);
                if (req.get('Accept') === 'application/json' || req.get('Accept') === 'text/html') {
                    res.header('Content-Type', 'application/json');
                    res.json(result.rows);
                } else if (req.get('Accept') === 'application/xml') {
                    res.header('Content-Type', 'application/xml');
                    xml = js2xml.parse(JSON.parse(JSON.stringify(result.rows)));
                    res.send(xml);
                } else {
                    res.sendStatus(406);
                }
            });
    }
});

router.post('/api/departament', function (req, res) {

    req.checkBody("name", "Resurse Umane").notEmpty().isAlpha();
    req.checkBody("number_employee", 3).notEmpty().isNumeric();
    req.checkBody("chief_name", "Istrati Ion").notEmpty().isAlpha();

    var error = req.validationErrors();

    if (error) {
        res.status(400);
        res.json(error)
    } else {
        connection().query("insert into public.departament (name, number_employee, chief_name) values ($1, $2, $3) " +
            "returning id, name, number_employee, chief_name",
            [req.body.name, req.body.number_employee, req.body.chief_name], function (err, result) {
                if (err) return console.error(err);
                connection().end();
                console.log(result.rows);
                res.render('index', {title: "200 OK", content: "Successfully created"});
                res.status(200);
            })
    }
});

router.put('/api/departament/:id', function (req, res) {
    connection().query("update public.departament set name=$1, " +
        "number_employee=$2, chief_name=$3 where id=$4 returning id, name, number_employee, chief_name",
        [req.body.name, req.body.number_employee, req.body.chief_name, req.params.id],
        function (err, result) {
            connection().end();
            if (err) return console.error(err);
            console.log(result.rows);
            res.render('index', {title: "200 OK", content: "Successfully Updated"});
        });
});

router.delete('/api/departament/:id', function (req, res) {
    connection().query("delete from public.departament where id=$1", [req.params.id],
        function (err) {
            connection().end();
            if (err) return console.error(err);
            res.render('index', {title: "200 OK", content: "Successfully Deleted"});
        });
});

module.exports = router;
