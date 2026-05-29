document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. Sticky Header Functionality
    // ==========================================================================
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // ==========================================================================
    // 2. Mobile Navigation Hamburger Menu Toggle
    // ==========================================================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // ==========================================================================
    // 3. Testimonial Carousel Indicator Logic
    // ==========================================================================
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    
    if (dots.length > 0 && testimonials.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                // Remove active classes
                dots.forEach(d => d.classList.remove('active'));
                testimonials.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked dot and matching testimonial
                dot.classList.add('active');
                testimonials[index].classList.add('active');
            });
        });

        // Auto play testimonials
        let currentTestimonial = 0;
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            if(dots[currentTestimonial]) {
                dots[currentTestimonial].click();
            }
        }, 6000);
    }

    // ==========================================================================
    // 4. Form Mock Submission and Toast Notification
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get values
            const name = document.getElementById('form-name').value;
            const email = document.getElementById('form-email').value;
            const message = document.getElementById('form-message').value;

            if (!name || !email || !message) {
                showToast('Please fill in all fields.', 'error');
                return;
            }

            // Mock success state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';

            setTimeout(() => {
                showToast(`Thank you, ${name}! Your message has been sent successfully.`, 'success');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }, 1200);
        });
    }

    // Custom Toast Notification Creator
    function showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '✓' : '✗'}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Animate out and destroy
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }

    // ==========================================================================
    // 5. Reactive Cart & Item Detail Modal State Machine
    // ==========================================================================
    let cart = [];
    let currentModalItem = null;

    // Modal DOM Elements
    const itemModal = document.getElementById('item-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalItemImg = document.getElementById('modal-item-img');
    const modalItemTitleOverlay = document.getElementById('modal-item-title-overlay');
    const modalItemPrice = document.getElementById('modal-item-price');
    const modalItemPriceOriginal = document.getElementById('modal-item-price-original');
    const modalItemDesc = document.getElementById('modal-item-desc');
    const modalQtyVal = document.getElementById('modal-qty-val');
    const modalQtyMinus = document.getElementById('modal-qty-minus');
    const modalQtyPlus = document.getElementById('modal-qty-plus');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');
    const addonCheckboxes = document.querySelectorAll('.addons-section input[type="checkbox"]');
    const instructionsInput = document.getElementById('instructions-input');

    // Cart Sidebar DOM Elements
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartBadgeVal = document.getElementById('cart-badge-val');
    
    // Totals DOM Elements
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartDelivery = document.getElementById('cart-delivery');
    const cartDiscount = document.getElementById('cart-discount');
    const cartGrandtotal = document.getElementById('cart-grandtotal');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Attach listeners to all dish and spice product card add buttons
    const cartIcons = document.querySelectorAll('.cart-icon-btn');
    cartIcons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const card = btn.closest('.product-card') || btn.closest('.dish-card');
            if (!card) return;

            // Extract data
            const title = card.querySelector('h3').innerText;
            const priceText = (card.querySelector('.dish-price') || card.querySelector('.spice-price')).innerText;
            const image = card.querySelector('img').src;
            
            // Get or mock description
            const descEl = card.querySelector('.dish-desc');
            const desc = descEl ? descEl.innerText : `Experience our premium signature ${title} blend. Made using authentic ingredients, slow-roasted, and carefully portioned for unmatched flavor.`;
            
            // Open modal popup with product details
            openProductModal(title, priceText, image, desc);
        });
    });

    // Function to Open Modal
    function openProductModal(title, priceText, image, desc) {
        const basePrice = parseFloat(priceText.replace('$', ''));
        const originalPrice = (basePrice * 1.25).toFixed(2); // Mock original price 25% higher

        currentModalItem = {
            title,
            basePrice,
            image,
            desc
        };

        // Populate Modal
        modalItemImg.src = image;
        modalItemImg.alt = title;
        modalItemTitleOverlay.innerText = title;
        modalItemPrice.innerText = priceText;
        modalItemPriceOriginal.innerText = `$${originalPrice}`;
        modalItemDesc.innerText = desc;
        
        // Reset state
        modalQtyVal.innerText = '1';
        addonCheckboxes.forEach(cb => cb.checked = false);
        instructionsInput.value = '';

        // Show Modal
        itemModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scrolling
    }

    // Close Modal Event Handler
    function closeProductModal() {
        itemModal.classList.remove('active');
        document.body.style.overflow = ''; // Unlock scrolling
        currentModalItem = null;
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeProductModal);
    }

    // Close modal on clicking outside content card
    if (itemModal) {
        itemModal.addEventListener('click', (e) => {
            if (e.target === itemModal) {
                closeProductModal();
            }
        });
    }

    // Modal Quantity Controls
    if (modalQtyMinus && modalQtyPlus && modalQtyVal) {
        modalQtyMinus.addEventListener('click', () => {
            let qty = parseInt(modalQtyVal.innerText);
            if (qty > 1) {
                modalQtyVal.innerText = (qty - 1).toString();
            }
        });

        modalQtyPlus.addEventListener('click', () => {
            let qty = parseInt(modalQtyVal.innerText);
            modalQtyVal.innerText = (qty + 1).toString();
        });
    }

    // Modal Add To Cart trigger
    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', () => {
            if (!currentModalItem) return;

            const quantity = parseInt(modalQtyVal.innerText);
            const instructions = instructionsInput.value.trim();

            // Calculate selected addons
            let selectedAddons = [];
            let addonsPriceTotal = 0;

            addonCheckboxes.forEach(cb => {
                if (cb.checked) {
                    const price = parseFloat(cb.getAttribute('data-price'));
                    const name = cb.getAttribute('data-name');
                    selectedAddons.push({ name, price });
                    addonsPriceTotal += price;
                }
            });

            const unitPrice = currentModalItem.basePrice + addonsPriceTotal;

            // Check if identical item is already in cart (same title + same addons + same instructions)
            const existingItemIndex = cart.findIndex(item => {
                if (item.title !== currentModalItem.title) return false;
                if (item.instructions !== instructions) return false;
                if (item.addons.length !== selectedAddons.length) return false;
                
                // Compare addons array elements
                return item.addons.every(addon => 
                    selectedAddons.some(sa => sa.name === addon.name)
                );
            });

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += quantity;
            } else {
                cart.push({
                    title: currentModalItem.title,
                    image: currentModalItem.image,
                    basePrice: currentModalItem.basePrice,
                    unitPrice: unitPrice,
                    quantity: quantity,
                    addons: selectedAddons,
                    instructions: instructions
                });
            }

            // Close Modal
            closeProductModal();

            // Render Cart Drawer
            renderCart();

            // Open Cart Drawer
            openCartDrawer();

            // Show feedback
            showToast(`${currentModalItem.title} added to your cart!`, 'success');
        });
    }

    // ==========================================================================
    // Cart Drawer Navigation Controls
    // ==========================================================================
    function openCartDrawer() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartDrawer() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (openCartBtn) openCartBtn.addEventListener('click', openCartDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    // ==========================================================================
    // Render Cart Contents
    // ==========================================================================
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        
        let totalItemsCount = 0;
        let subtotalVal = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="cart-empty-message">Your cart is empty. Add some delicious Afro-Caribbean flavor!</div>`;
            cartBadgeVal.innerText = '0';
            cartBadgeVal.style.transform = 'scale(0)';
        } else {
            cart.forEach((item, index) => {
                totalItemsCount += item.quantity;
                const itemTotalPrice = item.unitPrice * item.quantity;
                subtotalVal += itemTotalPrice;

                // Create addons string list
                let addonsHTML = '';
                if (item.addons.length > 0) {
                    addonsHTML = `<div class="cart-item-addons">+ Addons: ${item.addons.map(a => a.name).join(', ')}</div>`;
                }

                let noteHTML = '';
                if (item.instructions) {
                    noteHTML = `<div class="cart-item-addons" style="color:var(--color-red); font-style:italic;">Note: "${item.instructions}"</div>`;
                }

                const itemCard = document.createElement('div');
                itemCard.className = 'cart-item-card';
                itemCard.innerHTML = `
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.title}</h4>
                        ${addonsHTML}
                        ${noteHTML}
                        <div class="cart-item-price">$${itemTotalPrice.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="cart-qty-btn cart-qty-minus" data-index="${index}">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="cart-qty-btn cart-qty-plus" data-index="${index}">+</button>
                    </div>
                    <button class="cart-item-remove" data-index="${index}">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                `;
                cartItemsContainer.appendChild(itemCard);
            });

            // Update badge
            cartBadgeVal.innerText = totalItemsCount.toString();
            cartBadgeVal.style.transform = 'scale(1)';
            cartBadgeVal.classList.add('pulse');
            setTimeout(() => {
                cartBadgeVal.classList.remove('pulse');
            }, 400);
        }

        // Calculate Totals
        const taxVal = subtotalVal * 0.15; // 15% Caribbean Tax
        const deliveryVal = subtotalVal > 0 ? 3.99 : 0.00;
        const discountVal = subtotalVal > 0 ? (subtotalVal + taxVal) * 0.10 : 0.00; // 10% Discount mock
        const grandTotalVal = subtotalVal + taxVal + deliveryVal - discountVal;

        // Render Values
        cartSubtotal.innerText = `$${subtotalVal.toFixed(2)}`;
        cartTax.innerText = `$${taxVal.toFixed(2)}`;
        cartDelivery.innerText = `$${deliveryVal.toFixed(2)}`;
        cartDiscount.innerText = `-$${discountVal.toFixed(2)}`;
        cartGrandtotal.innerText = `$${grandTotalVal.toFixed(2)}`;
    }

    // Attach cart actions listeners via Event Delegation on parent body
    cartItemsContainer.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.cart-qty-btn') || e.target.closest('.cart-item-remove');
        if (!targetBtn) return;

        const index = parseInt(targetBtn.getAttribute('data-index'));

        if (targetBtn.classList.contains('cart-qty-minus')) {
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            renderCart();
        } else if (targetBtn.classList.contains('cart-qty-plus')) {
            cart[index].quantity += 1;
            renderCart();
        } else if (targetBtn.classList.contains('cart-item-remove')) {
            const title = cart[index].title;
            cart.splice(index, 1);
            renderCart();
            showToast(`${title} removed from cart.`, 'error');
        }
    });

    // Mock Checkout handler
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Please add items to your cart first.', 'error');
                return;
            }

            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = 'Processing Order...';

            setTimeout(() => {
                showToast('Order received! Thank you for choosing Senties Kitchen. Prepare for bold Caribbean flavors!', 'success');
                cart = [];
                renderCart();
                closeCartDrawer();
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = 'Checkout <i class="fa-solid fa-arrow-right arrow-icon"></i>';
            }, 2000);
        });
    }

    // Run first empty cart render
    renderCart();
});
