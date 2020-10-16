const fs = require('fs');

const sizePrice = {small: 5.99, medium: 7.99, large: 9.99};

const toppingPrice = {pepperoni: 1.29, sausage: 1.29,
                        beef: 1.56, chicken: 1.2,
                        bacon: 1.29, salami: 1.35,
                        steak: 2.12, ham: 1.37};

const deliveryFee = 3.99;
const taxRate = 0.12;
let data = fs.readFileSync('./order_data/order-info.txt');
let pizza = JSON.parse(data);
let quantity = pizza["quantity"];
let topKey = Object.keys(toppingPrice);
let topPrice = 0;
let topping = []
let pizzaPrice = 0;

if(typeof(pizza["topping"]) == "string"){ //calculate price for one single topping item selected
    pizzaPrice = round((sizePrice[pizza["size"]] + toppingPrice[pizza["topping"]]))*quantity;
} else { //calculate price for multiple topping items selected
    for(let i =0; i < pizza["topping"].length; i++) {
        topping.push(pizza["topping"][i]);
    }
    topping.forEach(each => {
        topKey.forEach(key => {
            if(each == key) {
                topPrice = topPrice + toppingPrice[key];
            }
        });
    });
    pizzaPrice = round((sizePrice[pizza["size"]] + topPrice))*quantity;
}

//round final result to 2 decimal points
function round(amount) {
    return Math.round(amount * 100)/100;
}

let taxes = round((pizzaPrice + deliveryFee) * taxRate);
let totalPrice = round(pizzaPrice + deliveryFee + taxes);

//passing final price information to index.js page
module.exports = {pizzaPrice, taxes, totalPrice, deliveryFee}