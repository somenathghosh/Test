var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var db = require('node-mysql');
var mongoose = require('mongoose');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var DB = db.DB;

var box = new DB({
    host     : 'us-cdbr-iron-east-01.cleardb.net',
    user     : 'b141b333912ca6',
    password : '2c91bba3',
    database : 'heroku_aa8f23881258c37'
});



var queryAgeRange = 'select distinct AGE_RANGE from new_table_3 order by AGE_RANGE';
var queryYear = 'select distinct YEAR from new_table_3 order by YEAR';


var queryTop= ['select SUM(number) as num, cause, year, age_range from new_table_3  where year =1990  and measure <> "daly" group by cause order by num DESC limit 10;','select SUM(number) as num, cause, year, age_range from new_table_3  where year =2010 and measure <> "daly" group by cause order by num DESC limit 10;'];


function queryBuilder (argument) {
    
    var query = 'select SUM(number) as num, cause, year, age_range from new_table_3  where year ='+ argument.year +' and measure <> "daly" and age_range = "'+ argument.age_range + '" group by cause order by num DESC limit 10;' ;

    return query;
}

var resultSet = {};

/*box.connect(function(conn, cb) {
    
    conn.query(queryYear, function function_name (err, resYear) {
        //console.log(resYear);
        resYear.forEach(function(ele, index1){

            //console.log(ele.YEAR)

            conn.query(queryAgeRange, function function_name (err, resAge) {
                //console.log(resAge);
                resultSet[ele.YEAR] = {};

                resAge.forEach(function(element,index2){


                    var query = queryBuilder({year:ele.YEAR, age_range: element.AGE_RANGE, limit:10});
                    //console.log(query);
                    conn.query(query, function function_name (err, res) {
                         
                        //resultSet[ele.YEAR][element.AGE_RANGE] = res;

                        console.log(res);

                            
                    });

                });

            });




        });

        console.log(resultSet);


            
    });

});*/







app.use('/', routes);


app.get('/alldata', function(req, res){

    box.connect(function(conn, cb) {
    
        

            var result = [];
            
            var i =0;

            conn.query(queryTop[i], function function_name (err, res1) {

                //console.log(res);
                result[i] = res1;
                i++;
                conn.query(queryTop[i], function function_name (err, res1) {

                    //console.log(res);
                    result[i] = res1;
                    res.send(result); 
                          
                }); 
                      
            }); 

        


            /*setTimeout(function(){
                console.log(result);
                
            }, 2000);*/


        });

                


});




app.post('/getData', function(req, res){

    console.log(req.body.age_range);

    box.connect(function(conn, cb) {
    
            var result = [];
            
            var i =0;

            var query = req.body.age_range === 'all' ? queryTop[0] : queryBuilder({year:1990, age_range: req.body.age_range, limit:10});
            console.log(query);
            conn.query(query, function function_name (err, res1) {

                //console.log(res);
                result[i] = res1;
                i++;
                var query = req.body.age_range === 'all' ? queryTop[1] : queryBuilder({year:2010, age_range: req.body.age_range, limit:10});
                conn.query(query, function function_name (err, res1) {

                    //console.log(res);
                    result[i] = res1;
                    res.send(result); 
                          
                }); 
                      
            }); 



        });
    
    //res.send();

                


});




app.get('/age_range', function(req, res){
    box.connect(function(conn, cb) {
        conn.query(queryAgeRange, function function_name (err, result) {
            res.send(result);
        });

    });


});

app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
