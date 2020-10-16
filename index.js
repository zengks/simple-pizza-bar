const express = require('express');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const Validator = require('validatorjs');
const app = express();
const {pizzaPrice, taxes, deliveryFee, totalPrice} = require('./priceCalculator');

//set up static file directory
app.use(serveStatic(path.join(__dirname, 'public')));

app.use(express.json());

//set up the body parser to handle POST requests
app.use(bodyParser.urlencoded({extended : false}));

app.use(bodyParser.json());

//set up handlebar template engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

//listening for request at port 3000
app.listen(3000, ()=>{
    console.log('listening for port 3000...');
});

app.get('/', (req, res) => {
    res.render('index', {title : "Home"});
})

//get and post for order details
app.get('/order', (req, res) => {
    res.render('order', {title: "Order-Now"});
})

app.post('/order', (req, res) => {
    //create a text file with order details
    fs.writeFile('./order_data/order-info.txt', JSON.stringify(req.body), () => {
        console.log('order details written...')
    });
    res.redirect('/delivery-info');
})

//get and post for address details
app.get('/delivery-info', (req, res) => {
    res.render('delivery-info', {title: "Your Address"});
})

app.post('/delivery-info', (req, res) => {
    
    //define rules for input validation
    const rules = {
        lname: 'alpha',
        fname: 'alpha',
        phone: 'digits:10',
        street: 'alpha_num',
        suite: 'numeric',
        city: 'alpha',
        province: 'alpha',
        postal: 'alpha_num'
    };

    let dataArray = [];
    let data = {};
    let dataValues = Object.values(req.body);
    let dataKeys = Object.keys(req.body);
    dataValues.forEach(element => {
        dataArray.push(element.split(" ").join(""));
    });
    for(let i=0; i<dataArray.length; i++){
        data[dataKeys[i]] = dataArray[i];
    }
    let validation = new Validator(data, rules);
    if(validation.passes()){
        //create a file with address details for delivery
        fs.writeFile('./order_data/address-info.txt', JSON.stringify(req.body), () => {
            console.log('address information written...')
        });
        res.redirect('/confirmation');
    }else{
        //indicate errors during input validation
        res.jsonp(validation.errors.all())
    }
})

app.get('/confirmation', (req, res) => {
    fs.readFile('./order_data/order-info.txt', (err, data) => {
        if(err) {
            console.log(err);
            res.jsonp(err);
        } else{
            let orderData = JSON.parse(data);
            //passing data into webpage
            res.render('confirmation', {title: "Confirming Order",
                                        size: orderData["size"],
                                        crust:orderData["crust"],
                                        sauce:orderData["sauce"],
                                        topping:orderData["topping"],
                                        quantity:orderData["quantity"],
                                        pizzaPrice: pizzaPrice,
                                        deliveryFee: deliveryFee,
                                        taxes: taxes,
                                        totalPrice: totalPrice
            });
        }
    })
     
})

app.get('/delivery-time', (req, res) => {
    res.render('delivery-time', {title: "Delivery Time"});
})

//output 404 error if page isn't found
app.use((req, res) => {
    res.status(404).render('404');
})



