const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(
  "sk_test_51H29lND835pyLuLJ2KXRiywyOIiwyzEfjMyeyytqvtY73Z7dv3vLcFJUxxB54WHZZDOtNllr85NdZOKt3bKda2X400FlgadZyt"
);
const shortid = require("shortid");

const app = express();
app.use(express.json());
app.use(cors());

var PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Add your Stripe Secret Key ");
});

app.post("/checkout", async (req, res) => {
  console.log("Request:", req.body);

  let error;
  let status;
  try {
    const { product, token } = req.body;

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    const idempotency_key = shortid.generate();
    const charge = await stripe.charges.create(
      {
        amount: product.price * 100,
        currency: "INR",
        customer: customer.id,
        receipt_email: token.email,
        description: `Purchased the ${product.name}`,
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip,
          },
        },
      },
      {
        idempotency_key,
      }
    );
    console.log("Charge:", { charge });
    status = "success";
  } catch (error) {
    console.error("Error:", error);
    status = "failure";
  }

  res.json({ error, status });
});

app.listen(PORT);

console.log("Server Run at 4000");
