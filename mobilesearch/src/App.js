import React, { useState, useEffect, useRef } from "react";
import { Search, Smartphone, X } from "lucide-react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newProduct, setNewProduct] = useState({
    brand: "",
    model: "",
    storage: "",
    ram: "",
    screen_size: "",
    camera: "",
    processor: "",
    battery: "",
    price: "",
    image_url: "",
  });
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (err) {
      setError("Unable to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async (query) => {
    if (!query) {
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/search?query=${query}`
      );
      setProducts(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    fetchSearchResults(e.target.value);
  };

  const handleSuggestionClick = (product) => {
    setSearchQuery(`${product.brand} ${product.model}`);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    inputRef.current?.blur();
    fetchProducts();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/products", newProduct);
      setProducts((prevProducts) => [...prevProducts, response.data]);
      setNewProduct({
        brand: "",
        model: "",
        storage: "",
        ram: "",
        screen_size: "",
        camera: "",
        processor: "",
        battery: "",
        price: "",
        image_url: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Smartphone className="h-8 w-8 text-indigo-600" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">Mobile Store</h1>
          </div>
          <div ref={searchRef} className="relative">
            <input
              ref={inputRef}
              type="text"
              className="border border-gray-300 rounded-lg pl-10 pr-10 py-2 w-80 focus:ring-2 focus:ring-indigo-500"
              placeholder="Search for mobiles..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" />
            {searchQuery && (
              <button onClick={handleClearSearch} className="absolute right-3 top-2.5">
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg border border-gray-200">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product._id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start space-x-3"
                    onClick={() => handleSuggestionClick(product)}
                  >
                    <img
                      src={product.image_url}
                      alt={product.model}
                      className="h-12 w-12 object-cover rounded-lg"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {product.brand} {product.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.ram}GB RAM • {product.storage}GB Storage
                      </div>
                      <div className="text-sm font-medium text-indigo-600">
                        ₹{product.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white p-4 shadow-md rounded-lg">
              <img
                src={product.image_url}
                alt={product.model}
                className="w-full h-40 object-cover rounded-md"
              />
              <h3 className="mt-2 font-medium">{product.brand} {product.model}</h3>
              <p className="text-lg font-bold text-indigo-600">₹{product.price}</p>
            </div>
          ))}
        </div>

        {/* Product Upload Form */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Add a New Product</h2>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 gap-4">
            <input
              type="text"
              name="brand"
              value={newProduct.brand}
              onChange={handleInputChange}
              placeholder="Brand"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="model"
              value={newProduct.model}
              onChange={handleInputChange}
              placeholder="Model"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="number"
              name="storage"
              value={newProduct.storage}
              onChange={handleInputChange}
              placeholder="Storage (GB)"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="number"
              name="ram"
              value={newProduct.ram}
              onChange={handleInputChange}
              placeholder="RAM (GB)"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="screen_size"
              value={newProduct.screen_size}
              onChange={handleInputChange}
              placeholder="Screen Size"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="camera"
              value={newProduct.camera}
              onChange={handleInputChange}
              placeholder="Camera"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="processor"
              value={newProduct.processor}
              onChange={handleInputChange}
              placeholder="Processor"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="number"
              name="battery"
              value={newProduct.battery}
              onChange={handleInputChange}
              placeholder="Battery (mAh)"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="number"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              placeholder="Price (₹)"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="image_url"
              value={newProduct.image_url}
              onChange={handleInputChange}
              placeholder="Image URL"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
            <button type="submit" className="bg-indigo-600 text-white rounded-lg p-2">
              Add Product
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
