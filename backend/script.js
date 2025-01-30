const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
    .connect("mongodb+srv://gnanasiddhikvarmasiruvuri:Siddhu@cluster0.mvj06.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));


// Define Schema
const productSchema = new mongoose.Schema({
    brand: String,
    model: String,
    storage: Number,
    ram: Number,
    screen_size: String,
    camera: String,
    processor: String,
    battery: Number,
    price: Number,
    color: String,
    availability: String,
    rating: Number,
    reviews: Number,
    image_url: String,
});

const Product = mongoose.model("Product", productSchema);

// API Routes

// Fetch all products
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Add a new product
app.post("/api/products", async (req, res) => {
    const { brand, model, storage, ram, screen_size, camera, color, availability, rating, reviews, processor, battery, price, image_url } = req.body;

    const newProduct = new Product({
        brand,
        model,
        storage,
        ram,
        screen_size,
        camera,
        processor,
        battery,
        color,
        availability,
        rating,
        reviews,
        price,
        image_url,
    });

    try {
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Search products based on query
app.get("/api/products/search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const searchRegex = new RegExp(query, "i");
        const products = await Product.find({
            $or: [
                { brand: searchRegex },
                { model: searchRegex },
                { processor: searchRegex },
                { camera: searchRegex },
            ],
        }).limit(5);

        res.json(products);
    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
