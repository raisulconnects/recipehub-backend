const Payment = require("../models/Payment");
const User = require("../models/User");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { type, recipeId } = req.body;
    if (!type)
      return res.status(400).json({ message: "Payment type is required" });

    let session;
    if (type === "recipe") {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: req.user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Recipe Purchase" },
              unit_amount: 299,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: req.user.id,
          userEmail: req.user.email,
          type,
          recipeId: recipeId || "",
        },
        success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=recipe`,
        cancel_url: `${process.env.CLIENT_URL}`,
      });
    } else if (type === "premium") {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: req.user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Premium Membership" },
              unit_amount: 999,
            },
            quantity: 1,
          },
        ],
        metadata: { userId: req.user.id, userEmail: req.user.email, type },
        success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=premium`,
        cancel_url: `${process.env.CLIENT_URL}`,
      });
    } else {
      return res.status(400).json({ message: "Invalid payment type" });
    }

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id)
      return res.status(400).json({ message: "Session ID is required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid")
      return res.status(400).json({ message: "Payment not completed" });

    const existing = await Payment.findOne({ transactionId: session_id });
    if (existing) return res.json({ message: "Payment already verified" });

    const { userId, userEmail, type, recipeId } = session.metadata;

    await Payment.create({
      userEmail,
      userId,
      amount: session.amount_total / 100,
      type,
      recipeId: recipeId || null,
      transactionId: session_id,
      paymentStatus: "success",
    });

    if (type === "premium") {
      await User.findByIdAndUpdate(userId, { isPremium: true });
    }

    res.json({ message: "Payment verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPurchased = async (req, res) => {
  try {
    const payments = await Payment.find({
      userEmail: req.user.email,
      type: "recipe",
      paymentStatus: "success",
    }).populate("recipeId");

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Payment.find().sort({ paidAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
