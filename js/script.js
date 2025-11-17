// main.js - Simplified version for UrbanBrew Coffee Roasters
class UrbanBrewApp {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.loadCart();
            this.updateCartCount();
        });
    }

    setupEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                e.preventDefault();
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    this.addToCart(productCard);
                }
            }
        });

        // Cart icon toggle
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-icon') || e.target.closest('.cart-icon')) {
                e.preventDefault();
                this.toggleCartDropdown();
            }
            
            if (e.target.classList.contains('close-cart')) {
                this.closeCartDropdown();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'contact-form') {
                e.preventDefault();
                this.handleContactForm(e.target);
            }
            
            if (e.target.id === 'workshop-enquiry') {
                e.preventDefault();
                this.handleWorkshopEnquiry(e.target);
            }
        });
    }

    addToCart(productCard) {
        const product = {
            id: this.generateProductId(productCard),
            name: productCard.querySelector('.product-name').textContent,
            price: this.parsePrice(productCard.querySelector('.product-price').textContent),
            image: productCard.querySelector('img').src,
            category: productCard.querySelector('.product-category').textContent,
            quantity: 1
        };

        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(product);
        }

        this.saveCart();
        this.updateCartCount();
        this.updateCartDropdown();
        this.showNotification(`${product.name} added to cart!`, 'success');
    }

    generateProductId(productCard) {
        const name = productCard.querySelector('.product-name').textContent;
        const price = productCard.querySelector('.product-price').textContent;
        return btoa(`${name}-${price}`).slice(0, 12);
    }

    parsePrice(priceText) {
        const match = priceText.match(/R(\d+(?:\.\d{2})?)/);
        return match ? parseFloat(match[1]) : 0;
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    updateCartDropdown() {
        const cartItems = document.querySelector('.cart-items');
        const emptyCart = document.querySelector('.empty-cart');
        const totalAmount = document.querySelector('.total-amount');
        
        if (this.cart.length === 0) {
            emptyCart.style.display = 'block';
            cartItems.innerHTML = '';
            cartItems.appendChild(emptyCart);
        } else {
            emptyCart.style.display = 'none';
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item-row" data-id="${item.id}">
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNGNUY1REMiLz48cGF0aCBkPSJNMzAgMzBMMjUgMjVIMzVMMzAgMzBaIiBmaWxsPSIjNkY0RTM3Ii8+PC9zdmc+'">
                    </div>
                    <div class="item-details">
                        <h5 class="item-name">${item.name}</h5>
                        <p class="item-category">${item.category}</p>
                        <p class="item-price">R${item.price.toFixed(2)}</p>
                    </div>
                    <div class="item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-quantity" data-id="${item.id}">−</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item" data-id="${item.id}" title="Remove item">🗑️</button>
                    </div>
                </div>
            `).join('');

            // Add event listeners to quantity buttons
            document.querySelectorAll('.quantity-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    const isIncrease = e.target.classList.contains('increase-quantity');
                    this.updateQuantity(id, isIncrease ? 1 : -1);
                });
            });

            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    this.removeFromCart(id);
                });
            });
        }

        // Update total
        if (totalAmount) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            totalAmount.textContent = `R${total.toFixed(2)}`;
        }
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(0, item.quantity + change);
            if (item.quantity === 0) {
                this.removeFromCart(productId);
            } else {
                this.saveCart();
                this.updateCartCount();
                this.updateCartDropdown();
            }
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.updateCartDropdown();
        this.showNotification('Item removed from cart', 'info');
    }

    toggleCartDropdown() {
        const cartDropdown = document.querySelector('.cart-dropdown');
        if (cartDropdown) {
            cartDropdown.classList.toggle('active');
        }
    }

    closeCartDropdown() {
        const cartDropdown = document.querySelector('.cart-dropdown');
        if (cartDropdown) {
            cartDropdown.classList.remove('active');
        }
    }

    handleContactForm(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });
        
        if (isValid) {
            this.showNotification('Thank you! Your message has been sent.', 'success');
            form.reset();
        } else {
            this.showNotification('Please fill in all required fields.', 'error');
        }
    }

    handleWorkshopEnquiry(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });
        
        if (isValid) {
            this.showNotification('Thank you for your interest! We\'ll contact you soon.', 'success');
            form.reset();
        } else {
            this.showNotification('Please fill in all required fields.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #27ae60;
                    color: white;
                    padding: 16px 20px;
                    border-radius: 8px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    z-index: 10000;
                    max-width: 400px;
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .notification.show {
                    transform: translateX(0);
                    opacity: 1;
                }
                .notification-error {
                    background: #e74c3c;
                }
                .notification-info {
                    background: #3498db;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    loadCart() {
        const savedCart = localStorage.getItem('urbanbrew-cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    saveCart() {
        localStorage.setItem('urbanbrew-cart', JSON.stringify(this.cart));
    }
}

// Initialize the application
const urbanBrewApp = new UrbanBrewApp();

// Close cart when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.cart-item') && !e.target.closest('.cart-dropdown')) {
        urbanBrewApp.closeCartDropdown();
    }
});

// Gallery functionality
class Gallery {
    constructor() {
        this.galleryItems = [];
        this.currentIndex = 0;
        this.filter = 'all';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupGallery();
            this.setupFilters();
            this.setupLightbox();
            this.setupScrollAnimation();
        });
    }

    setupGallery() {
        this.galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Get filter value
                this.filter = e.target.dataset.filter;
                
                // Filter gallery items
                this.filterGallery();
            });
        });
    }

    filterGallery() {
        this.galleryItems.forEach(item => {
            const category = item.dataset.category;
            
            if (this.filter === 'all' || category === this.filter) {
                item.style.display = 'block';
                
                // Add slight delay for animation
                setTimeout(() => {
                    item.classList.add('visible');
                }, 100);
            } else {
                item.classList.remove('visible');
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }

    setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxTitle = document.getElementById('lightbox-title');
        const lightboxDescription = document.getElementById('lightbox-description');
        const closeBtn = document.querySelector('.lightbox-close');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');

        // Open lightbox when gallery item is clicked
        this.galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openLightbox(index);
            });
        });

        // Close lightbox
        closeBtn.addEventListener('click', () => {
            this.closeLightbox();
        });

        // Navigate lightbox
        prevBtn.addEventListener('click', () => {
            this.navigateLightbox(-1);
        });

        nextBtn.addEventListener('click', () => {
            this.navigateLightbox(1);
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                this.navigateLightbox(-1);
            } else if (e.key === 'ArrowRight') {
                this.navigateLightbox(1);
            }
        });

        // Close when clicking outside image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                this.closeLightbox();
            }
        });
    }

    openLightbox(index) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxTitle = document.getElementById('lightbox-title');
        const lightboxDescription = document.getElementById('lightbox-description');
        
        const item = this.galleryItems[index];
        const image = item.querySelector('.gallery-image');
        const overlay = item.querySelector('.gallery-overlay');
        const title = overlay.querySelector('h3');
        const description = overlay.querySelector('p');

        this.currentIndex = index;
        
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxTitle.textContent = title.textContent;
        lightboxDescription.textContent = description.textContent;
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    navigateLightbox(direction) {
        const filteredItems = this.getFilteredItems();
        let newIndex = this.currentIndex + direction;
        
        if (newIndex < 0) {
            newIndex = filteredItems.length - 1;
        } else if (newIndex >= filteredItems.length) {
            newIndex = 0;
        }
        
        // Find the actual index in the full gallery items array
        const actualIndex = this.galleryItems.indexOf(filteredItems[newIndex]);
        this.openLightbox(actualIndex);
    }

    getFilteredItems() {
        if (this.filter === 'all') {
            return this.galleryItems;
        }
        return this.galleryItems.filter(item => item.dataset.category === this.filter);
    }

    setupScrollAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.galleryItems.forEach(item => {
            observer.observe(item);
        });
    }
}

// Initialize gallery
const gallery = new Gallery();

// Add gallery link to navigation in existing JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Update navigation to include gallery
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === 'gallery.html') {
            link.classList.add('active');
        }
    });
});

// Lightbox Gallery Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize lightbox with custom settings
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
            'resizeDuration': 300,
            'wrapAround': true,
            'imageFadeDuration': 300,
            'positionFromTop': 100,
            'showImageNumberLabel': true,
            'alwaysShowNavOnTouchDevices': true,
            'fitImagesInViewport': true,
            'maxWidth': 1200,
            'maxHeight': 800
        });
    }
    
    // Add keyboard navigation for lightbox
    document.addEventListener('keydown', function(e) {
        const lightboxVisible = document.querySelector('.lightbox').style.display === 'block';
        
        if (lightboxVisible) {
            if (e.key === 'Escape') {
                // Close lightbox on ESC key
                if (typeof lightbox !== 'undefined') {
                    lightbox.end();
                }
            } else if (e.key === 'ArrowLeft') {
                // Previous image on left arrow
                document.querySelector('.lb-prev').click();
            } else if (e.key === 'ArrowRight') {
                // Next image on right arrow
                document.querySelector('.lb-next').click();
            }
        }
    });
    
    // Add touch swipe support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const lightboxVisible = document.querySelector('.lightbox').style.display === 'block';
        
        if (lightboxVisible) {
            if (touchEndX < touchStartX - 50) {
                // Swipe left - next image
                document.querySelector('.lb-next').click();
            } else if (touchEndX > touchStartX + 50) {
                // Swipe right - previous image
                document.querySelector('.lb-prev').click();
            }
        }
    }
    
    // Preload images for better performance
    function preloadGalleryImages() {
        const imageUrls = [
            'images/H1.avif',
            'images/H2.avif',
            'images/H3.avif'
        ];
        
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }
    
    // Call preload function when page loads
    preloadGalleryImages();
});

// Workshop booking functionality for enquiry.html
        document.addEventListener('DOMContentLoaded', function() {
            // Get all "Book Now" buttons
            const bookNowButtons = document.querySelectorAll('.book-now-btn');
            
            // Add click event listeners to each button
            bookNowButtons.forEach((button, index) => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Get workshop details from the card
                    const workshopCard = this.closest('.workshop-card');
                    const workshopTitle = workshopCard.querySelector('.workshop-title').textContent;
                    const workshopPrice = workshopCard.querySelector('.workshop-price').textContent;
                    const workshopDetails = workshopCard.querySelector('.workshop-desc').textContent;
                    
                    // Create booking form
                    createBookingForm(workshopTitle, workshopPrice, workshopDetails);
                });
            });
            
            // Function to create and display booking form
            function createBookingForm(title, price, description) {
                // Create modal overlay
                const modalOverlay = document.createElement('div');
                modalOverlay.className = 'modal-overlay';
                
                // Create modal content
                const modalContent = document.createElement('div');
                modalContent.className = 'booking-modal';
                
                // Modal HTML content
                modalContent.innerHTML = `
                    <div class="modal-header">
                        <h2 style="color: #8B4513; margin-bottom: 0.5rem;">Book Workshop</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    
                    <div class="workshop-info">
                        <h3 style="color: #8B4513; margin-bottom: 0.5rem;">${title}</h3>
                        <p style="color: #666; margin-bottom: 0.5rem;">${description}</p>
                        <div style="font-weight: bold; color: #8B4513;">${price}</div>
                    </div>
                    
                    <form id="booking-form" class="booking-form">
                        <div class="form-group">
                            <label for="booking-name">Full Name *</label>
                            <input type="text" id="booking-name" name="booking-name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-email">Email Address *</label>
                            <input type="email" id="booking-email" name="booking-email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-phone">Phone Number *</label>
                            <input type="tel" id="booking-phone" name="booking-phone" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-date">Preferred Date *</label>
                            <input type="date" id="booking-date" name="booking-date" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-participants">Number of Participants *</label>
                            <select id="booking-participants" name="booking-participants" required>
                                <option value="">Select number</option>
                                <option value="1">1 Participant</option>
                                <option value="2">2 Participants</option>
                                <option value="3">3 Participants</option>
                                <option value="4">4 Participants</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-notes">Additional Notes</label>
                            <textarea id="booking-notes" name="booking-notes" rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="confirm-booking">Confirm Booking</button>
                            <button type="button" class="cancel-booking">Cancel</button>
                        </div>
                    </form>
                `;
                
                // Append modal to overlay and overlay to body
                modalOverlay.appendChild(modalContent);
                document.body.appendChild(modalOverlay);
                
                // Set minimum date to today
                const dateInput = modalContent.querySelector('#booking-date');
                const today = new Date().toISOString().split('T')[0];
                dateInput.min = today;
                
                // Close modal functionality
                const closeModal = modalContent.querySelector('.close-modal');
                const cancelBtn = modalContent.querySelector('.cancel-booking');
                
                const closeModalFunction = () => {
                    document.body.removeChild(modalOverlay);
                };
                
                closeModal.addEventListener('click', closeModalFunction);
                cancelBtn.addEventListener('click', closeModalFunction);
                modalOverlay.addEventListener('click', (e) => {
                    if (e.target === modalOverlay) {
                        closeModalFunction();
                    }
                });
                
                // Form submission
                const bookingForm = modalContent.querySelector('#booking-form');
                bookingForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // Get form data
                    const formData = {
                        workshop: title,
                        name: document.getElementById('booking-name').value,
                        email: document.getElementById('booking-email').value,
                        phone: document.getElementById('booking-phone').value,
                        date: document.getElementById('booking-date').value,
                        participants: document.getElementById('booking-participants').value,
                        notes: document.getElementById('booking-notes').value,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Validate form
                    if (validateBookingForm(formData)) {
                        // Process booking
                        processBooking(formData);
                        
                        // Close modal
                        closeModalFunction();
                    }
                });
            }
            
            // Form validation function
            function validateBookingForm(formData) {
                if (!formData.name.trim()) {
                    alert('Please enter your full name.');
                    return false;
                }
                
                if (!formData.email.trim() || !isValidEmail(formData.email)) {
                    alert('Please enter a valid email address.');
                    return false;
                }
                
                if (!formData.phone.trim()) {
                    alert('Please enter your phone number.');
                    return false;
                }
                
                if (!formData.date) {
                    alert('Please select a preferred date.');
                    return false;
                }
                
                if (!formData.participants) {
                    alert('Please select the number of participants.');
                    return false;
                }
                
                return true;
            }
            
            // Email validation helper function
            function isValidEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }
            
            // Process booking function
            function processBooking(bookingData) {
                // Here you would typically send the data to your backend
                // For now, we'll just show a success message and log the data
                
                console.log('Booking submitted:', bookingData);
                
                // Show success message
                alert(`Thank you for booking "${bookingData.workshop}"!\n\nWe have received your booking request for ${bookingData.participants} participant(s) on ${formatDate(bookingData.date)}. We will contact you at ${bookingData.email} to confirm your booking.\n\nBooking Reference: UB${Date.now().toString().slice(-6)}`);
                
                // You can add AJAX call here to send data to your server
                /*
                fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Booking successful:', data);
                    alert('Booking confirmed! Check your email for details.');
                })
                .catch(error => {
                    console.error('Booking error:', error);
                    alert('There was an error processing your booking. Please try again.');
                });
                */
            }
            
            // Date formatting helper function
            function formatDate(dateString) {
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return new Date(dateString).toLocaleDateString(undefined, options);
            }
        });