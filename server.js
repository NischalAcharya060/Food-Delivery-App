const express = require('express');
const stripe = require('stripe')('sk_test_51MlaZ8HNqasSknnsYvvIm7MgbGNLePEHsSz5K1ptdZKqgnYgz3CUpRvWaeFjjIjw0MonD8t5o89nsnAXFI1CCgL800rzkyAu7V');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/create-payment-intent', async (req, res) => {
   // Convert into NPR
    let { amount } = req.body;
    amount *= 100;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'npr',
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(400).send({
            error: {
                message: error.message,
            },
        });
    }
});

app.listen(3000, () => console.log('Server is running on port 3000'));
