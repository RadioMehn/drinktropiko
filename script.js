document.addEventListener('DOMContentLoaded', () => {
    
    /* --- 1. DATA CONFIGURATION --- */
    const products = [
        {
            id: 'oasis',
            name: "Oasis Orange",
            flavor: "Zesty Orange & Coconut",
            abv: "5% ABV", 
            prices: {
                single: 120,
                pack: 700
            },
            image: "images/oasis.png",
            bgColor: "#FFD3B6", 
            desc: "A citrus explosion softened by creamy coconut."
        },
        {
            id: 'pina',
            name: "Piña Paradise",
            flavor: "Pineapple & Coconut",
            abv: "7% ABV", 
            prices: {
                single: 120,
                pack: 700
            },
            image: "images/pina.png",
            bgColor: "#FFF59D", 
            desc: "The classic tropical duo, reimagined."
        }
    ];

    let cart = [];

    /* --- 2. AGE GATE LOGIC (Runs on every page) --- */
    const ageGate = document.getElementById('age-gate');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const underageMsg = document.getElementById('underage-msg');

    if (localStorage.getItem('isAdult') === 'true') {
        ageGate.style.display = 'none';
    } else {
        document.body.style.overflow = 'hidden';
    }

    if(btnYes) {
        btnYes.addEventListener('click', () => {
            localStorage.setItem('isAdult', 'true');
            ageGate.style.opacity = '0';
            document.body.style.overflow = 'auto';
            setTimeout(() => { ageGate.style.display = 'none'; }, 500);
        });
    }

    if(btnNo) {
        btnNo.addEventListener('click', () => {
            underageMsg.classList.remove('hidden');
            btnYes.style.display = 'none';
            btnNo.style.display = 'none';
        });
    }

    /* --- 3. SCROLL ANIMATIONS --- */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

    /* --- 4. RENDER CATALOGUE (Only if on Home Page) --- */
    const catalogueContainer = document.getElementById('catalogue-container');
    
    if (catalogueContainer) {
        products.forEach(prod => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            
            card.innerHTML = `
                <div class="card-img-container" style="background-color: ${prod.bgColor}40;">
                    <img src="${prod.image}" alt="${prod.name}" class="prod-img">
                </div>
                <div class="card-info">
                    <h3>${prod.name}</h3>
                    <span>${prod.flavor} | ${prod.abv}</span>
                    <button class="btn btn-outline" onclick="window.location.href='shop.html'">Buy Now</button>
                </div>
            `;
            catalogueContainer.appendChild(card);
        });
    }

    /* --- 5. RENDER SHOP (Only if on Shop Page) --- */
    const shopContainer = document.getElementById('shop-container');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total-price');

    if (shopContainer) {
        products.forEach(prod => {
            const item = document.createElement('div');
            item.classList.add('shop-item');
            const selectId = `select-${prod.id}`;
            
            item.innerHTML = `
                <img src="${prod.image}" alt="${prod.name}" class="shop-thumb">
                <div class="shop-details">
                    <h4>${prod.name}</h4>
                    <p style="font-size:0.8rem; color:#666; margin-bottom:8px;">${prod.desc}</p>
                    <p style="font-size:0.8rem; font-weight:bold; color:var(--primary-green); margin-bottom:8px;">${prod.abv}</p>
                    
                    <select id="${selectId}" class="size-selector">
                        <option value="single">Single Can - ₱${prod.prices.single}</option>
                        <option value="pack">6-Pack - ₱${prod.prices.pack}</option>
                    </select>
                </div>
                <div class="shop-actions">
                    <button class="btn btn-primary" onclick="initAddToCart('${prod.id}')">Add to Cart</button>
                </div>
            `;
            shopContainer.appendChild(item);
        });

        // Wrapper function
        window.initAddToCart = function(productId) {
            const product = products.find(p => p.id === productId);
            const selectElement = document.getElementById(`select-${productId}`);
            const size = selectElement.value;
            const price = product.prices[size];
            
            addToCart(product, size, price);
        };

        // Add to Cart
        function addToCart(product, size, price) {
            const cartItemId = `${product.id}-${size}`;
            const existingItem = cart.find(item => item.cartId === cartItemId);
            
            if (existingItem) {
                existingItem.qty++;
            } else {
                cart.push({
                    cartId: cartItemId,
                    name: product.name,
                    sizeLabel: size === 'single' ? 'Single' : '6-Pack',
                    price: price,
                    qty: 1
                });
            }
            updateCartDisplay();
        }

        // Update Cart UI
        function updateCartDisplay() {
            cartItemsContainer.innerHTML = '';
            let total = 0;

            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is thirsty.</p>';
            } else {
                cart.forEach(item => {
                    total += item.price * item.qty;
                    const div = document.createElement('div');
                    div.classList.add('cart-item');
                    div.innerHTML = `
                        <div style="display:flex; flex-direction:column;">
                            <span>${item.name} (${item.sizeLabel})</span>
                            <span style="font-size:0.8em; color:#888;">x${item.qty}</span>
                        </div>
                        <span>₱${(item.price * item.qty).toLocaleString()}</span>
                    `;
                    cartItemsContainer.appendChild(div);
                });
            }
            cartTotalEl.innerText = `₱${total.toLocaleString()}`;
        }
    }

   /* --- 6. CHECKOUT LOGIC (WITH FILE UPLOAD) --- */
    const checkoutBtn = document.getElementById('checkout-btn');
    const modal = document.getElementById('checkout-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const orderForm = document.getElementById('order-form');
    const orderStatus = document.getElementById('order-status');
    const modalTotal = document.getElementById('modal-total-price'); // New element

    // PASTE YOUR GOOGLE WEB APP URL HERE
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdIaXvqHEU8IR4436A88iIEWB2lyIVcmsQ_XssP105hP496Op2D9Ia-JEBqJN6ut0W/exec'; 

    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if(cart.length > 0) {
                // Update the total price inside the modal
                const currentTotal = document.getElementById('cart-total-price').innerText;
                modalTotal.innerText = `Total to Pay: ${currentTotal}`;
                
                modal.classList.remove('hidden');
                orderStatus.innerText = "";
                orderForm.style.display = "block";
            } else {
                alert("Add some drinks first!");
            }
        });
    }

    if(cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if(orderForm) {
        orderForm.addEventListener('submit', e => {
            e.preventDefault();
            
            const submitBtn = orderForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            const fileInput = document.getElementById('cust-proof');
            
            if (fileInput.files.length === 0) {
                alert("Please upload your proof of payment!");
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();

            // Start Loading
            submitBtn.disabled = true;
            submitBtn.innerText = "Uploading...";
            orderStatus.innerText = "Sending payment proof...";
            
            // Read the file content
            reader.readAsDataURL(file);
            reader.onload = function() {
                const base64File = reader.result; // This is the image data
                
                const customerName = document.getElementById('cust-name').value;
                const customerPhone = document.getElementById('cust-phone').value;
                const customerAddress = document.getElementById('cust-address').value;
                
                let orderDetails = cart.map(item => `${item.name} (${item.sizeLabel}) x${item.qty}`).join(", ");
                let totalVal = document.getElementById('cart-total-price').innerText;

                let formData = {
                    name: customerName,
                    contact: customerPhone,
                    address: customerAddress,
                    items: orderDetails,
                    total: totalVal,
                    file: base64File, // Sending the image data
                    fileName: file.name,
                    mimeType: file.type
                };

                fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                .then(response => {
                    orderStatus.innerText = "Order Received! We'll review your payment shortly.";
                    orderStatus.style.color = "green";
                    orderForm.reset();
                    orderForm.style.display = "none";
                    cart = []; 
                    updateCartDisplay();
                    
                    setTimeout(() => {
                        modal.classList.add('hidden');
                        submitBtn.disabled = false;
                        submitBtn.innerText = originalText;
                    }, 4000);
                })
                .catch(error => {
                    orderStatus.innerText = "Error! Please try again.";
                    orderStatus.style.color = "red";
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalText;
                    console.error('Error:', error);
                });
            };
        });
    }

    /* --- 7. MOBILE NAVIGATION LOGIC --- */
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if (burger) {
        burger.addEventListener('click', () => {
            // Toggle Nav
            nav.classList.toggle('nav-active');

            // Animate Links
            navLinks.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });

            // Burger Animation
            burger.classList.toggle('toggle');
        });
        
        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('nav-active');
                burger.classList.remove('toggle');
                navLinks.forEach(link => link.style.animation = '');
            });
        });
    }
});
