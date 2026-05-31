/*
 * LUXURY PRODUCT GALLERY - MAIN JAVASCRIPT
 * ============================================
 * This script handles:
 * - Fetching product data from JSON file
 * - Rendering product cards dynamically
 * - Filtering products by price range
 * - Updating statistics and UI
 * ============================================
 */

// Elements
const productContainer = document.querySelector(".product-container");
const loadingElement = document.querySelector(".loading-element");
const filterButtons = document.querySelectorAll(".filter-btn");
const rangeInput = document.querySelector("#range-input");
const inputValueText = document.querySelector(".input-value-text");
const valueDisplay = document.querySelector(".value-display");
const totalProductsElement = document.querySelector("#total-products");
const visibleProductsElement = document.querySelector("#visible-products");

// Global Variables
let allProducts = []; // Stores all products data
let currentFilter = "all"; // Current active filter

/**
 * ============================================
 * INITIALIZE APPLICATION
 * ============================================
 */
document.addEventListener("DOMContentLoaded", () => {
  // Load products when page loads
  getProduct();

  // Initialize event listeners
  initializeEventListeners();
});

/**
 * ============================================
 * FETCH PRODUCT DATA FROM JSON FILE
 * ============================================
 */
const getProduct = async () => {
  try {
    // Show loading animation
    loadingElement.classList.add("show");

    // Fetch data from JSON file
    const res = await fetch("./data.json");

    // Check if response is successful
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse JSON data
    const data = await res.json();

    // Store data globally
    allProducts = data;

    // Display all products initially
    showProduct(data);
    // Update statistics
    updateStatistics(data);
  } catch (error) {
    // Display error message if fetch fails
    productContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Products</h3>
                <p>${error.message}</p>
                <button onclick="getProduct()" class="retry-btn">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
  } finally {
    // Hide loading animation
    loadingElement.classList.remove("show");
  }
};

/*
============================================
RENDER PRODUCT CARDS TO THE DOM
============================================
 */
const showProduct = (products) => {
  // Clear existing content
  productContainer.innerHTML = "";

  // Check if there are products to display
  if (products.length === 0) {
    productContainer.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters to see more products.</p>
            </div>
        `;
    updateStatistics([]);
    return;
  }

  // Generate HTML for each product
  products.forEach((product) => {
    const { name, id, url, price, description } = product;

    // Create product card HTML
    const productCard = `
            <section class="content-item" data-id="${id}">
                <div class="image-box">
                    <img src="${url}" alt="${name}" class="image" loading="lazy" />
                    <div class="description-box">
                        <p class="description-text">
                            ${description}
                        </p>
                    </div>
                </div>
                <h3 class="texts name">${name}</h3>
                <h3 class="texts price">${renderPrice(price)} $</h3>
                <div class="product-badge">
                    ${getPriceBadge(price)}
                </div>
            </section>
        `;

    // Add product card to container
    productContainer.innerHTML += productCard;
  });

  // Update statistics with filtered products
  updateStatistics(products);
};

/**
 * ============================================
 * FORMAT PRICE WITH COMMA SEPARATORS
 * ============================================
 */
const renderPrice = (price) => {
  const number = parseInt(price);
  return number.toLocaleString();
};

/**
 * ============================================
 * GET BADGE BASED ON PRICE RANGE
 * ============================================
 */
const getPriceBadge = (price) => {
  if (price > 200000000) {
    return '<span class="badge ultra">ULTRA PREMIUM</span>';
  } else if (price > 100000000) {
    return '<span class="badge premium">PREMIUM</span>';
  } else {
    return '<span class="badge affordable">AFFORDABLE</span>';
  }
};

/**
 * ============================================
 * INITIALIZE ALL EVENT LISTENERS
 * ============================================
 */
const initializeEventListeners = () => {
  // Filter button click events
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", handleFilterClick);
  });

  // Range input change event
  rangeInput.addEventListener("input", handleRangeInput);

  // Add CSS for badges
  addBadgeStyles();
};

/**
 * ============================================
 * HANDLE FILTER BUTTON CLICKS
 * ============================================
 */
const handleFilterClick = (e) => {
  // Remove active class from all buttons
  filterButtons.forEach((btn) => btn.classList.remove("active"));

  // Add active class to clicked button
  e.currentTarget.classList.add("active");

  // Get filter type from data attribute
  const dataFilter = e.currentTarget.dataset.filter;
  currentFilter = dataFilter;

  // Apply filter based on selection
  if (dataFilter === "all") {
    showProduct(allProducts);
  } else {
    renderFilteredProducts(dataFilter);
  }
};

/**
 * ============================================
 * FILTER PRODUCTS BY PRICE CATEGORY
 * ============================================
 */
const renderFilteredProducts = (filterType) => {
  let filteredItems = null;

  switch (filterType) {
    case "over-200":
      filteredItems = allProducts.filter((item) => item.price > 200000000);
      break;
    case "over-100":
      filteredItems = allProducts.filter((item) => item.price > 100000000);
      break;
    case "lover-then-100":
      filteredItems = allProducts.filter((item) => item.price < 100000000);
      break;
    default:
      filteredItems = allProducts;
  }

  // Display filtered products
  showProduct(filteredItems);
};

/**
 * ============================================
 * HANDLE PRICE RANGE INPUT CHANGES
 * ============================================
 */
const handleRangeInput = () => {
  // Get current range value
  const rangeValue = rangeInput.value;

  // Update display text
  inputValueText.textContent = `⬅️ Max: ${rangeValue} M$`;
  valueDisplay.textContent = rangeValue;

  // Filter products based on range
  filterByPriceRange(parseInt(rangeValue));
};

/**
 * ============================================
 * FILTER PRODUCTS BY MAXIMUM PRICE
 * ============================================
 */
const filterByPriceRange = (maxPriceInMillions) => {
  // Convert to actual price (add 6 zeros for millions)
  const maxPrice = maxPriceInMillions * 1000000;

  // Filter products below max price
  const filteredItems = allProducts.filter((item) => item.price <= maxPrice);

  // Apply additional filter if active
  let finalFilteredItems = filteredItems;
  if (currentFilter !== "all") {
    finalFilteredItems = applyCombinedFilter(filteredItems, currentFilter);
  }

  // Display filtered products
  showProduct(finalFilteredItems);
};

/**
 * ============================================
 * APPLY COMBINED FILTER (RANGE + CATEGORY)
 * ============================================
 */
const applyCombinedFilter = (products, filterType) => {
  switch (filterType) {
    case "over-200":
      return products.filter((item) => item.price > 200000000);
    case "over-100":
      return products.filter((item) => item.price > 100000000);
    case "lover-then-100":
      return products.filter((item) => item.price < 100000000);
    default:
      return products;
  }
};

/**
 * ============================================
 * UPDATE STATISTICS DISPLAY
 * ============================================
 */
const updateStatistics = (products) => {
  // Update total products count
  totalProductsElement.textContent = allProducts.length;

  // Update visible products count
  visibleProductsElement.textContent = products.length;

  // Add animation effect
  visibleProductsElement.style.transform = "scale(1.1)";
  setTimeout(() => {
    visibleProductsElement.style.transform = "scale(1)";
  }, 300);
};

/*
 * ============================================
 * ADD DYNAMIC CSS FOR BADGES
 * ============================================
 */
const addBadgeStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
        .product-badge {
            position: absolute;
            top: 15px;
            right: 15px;
        }
        
        .badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .badge.ultra {
            background: linear-gradient(45deg, #ff0080, #ff8c00);
            color: white;
        }
        
        .badge.premium {
            background: linear-gradient(45deg, #40e0d0, #20b2aa);
            color: white;
        }
        
        .badge.affordable {
            background: linear-gradient(45deg, #32cd32, #228b22);
            color: white;
        }
        
        .error-message, .no-products {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            background: rgba(255, 0, 0, 0.1);
            border-radius: 16px;
            border: 1px solid rgba(255, 0, 0, 0.3);
        }
        
        .error-message i, .no-products i {
            font-size: 3rem;
            color: #ff4757;
            margin-bottom: 1rem;
        }
        
        .retry-btn {
            margin-top: 1rem;
            padding: 10px 20px;
            background: linear-gradient(45deg, #ff0080, #ff8c00);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: transform 0.3s;
        }
        
        .retry-btn:hover {
            transform: scale(1.05);
        }
    `;
  document.head.appendChild(style);
};
