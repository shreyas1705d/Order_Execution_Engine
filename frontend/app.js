// API Configuration - works for both local and production
const isProduction = window.location.hostname !== 'localhost';
const API_BASE_URL = isProduction
    ? `${window.location.protocol}//${window.location.host}`
    : 'http://localhost:3000';
const WS_BASE_URL = isProduction
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    : 'ws://localhost:3000';

// State management
let activeOrderId = null;
let activeWebSocket = null;
let orderHistory = [];

// DOM Elements
const orderForm = document.getElementById('orderForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const formMessage = document.getElementById('formMessage');
const activeOrderSection = document.getElementById('activeOrderSection');
const activeOrderIdDisplay = document.getElementById('activeOrderId');
const activeOrderDetails = document.getElementById('activeOrderDetails');
const orderResult = document.getElementById('orderResult');
const orderHistoryContainer = document.getElementById('orderHistory');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadOrderHistory();
    renderOrderHistory();

    orderForm.addEventListener('submit', handleOrderSubmit);
});

// Handle order form submission
async function handleOrderSubmit(e) {
    e.preventDefault();

    const formData = new FormData(orderForm);
    const orderData = {
        tokenIn: formData.get('tokenIn'),
        tokenOut: formData.get('tokenOut'),
        amount: parseFloat(formData.get('amount'))
    };

    // Validation
    if (!orderData.tokenIn || !orderData.tokenOut) {
        showMessage('Please select both tokens', 'error');
        return;
    }

    if (orderData.tokenIn === orderData.tokenOut) {
        showMessage('Cannot swap the same token', 'error');
        return;
    }

    if (orderData.amount <= 0) {
        showMessage('Amount must be greater than 0', 'error');
        return;
    }

    // Show loading state
    setLoading(true);
    hideMessage();

    try {
        const response = await fetch(`${API_BASE_URL}/orders/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.orderId) {
            showMessage('Order created successfully!', 'success');

            // Store order in history
            const order = {
                orderId: data.orderId,
                ...orderData,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            addToOrderHistory(order);

            // Start tracking this order
            trackOrder(data.orderId, orderData);

            // Reset form
            orderForm.reset();
        } else {
            throw new Error('No order ID received');
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        showMessage(`Error: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

// Track order with WebSocket
function trackOrder(orderId, orderData) {
    activeOrderId = orderId;

    // Show tracking section
    activeOrderSection.style.display = 'block';
    activeOrderIdDisplay.textContent = orderId;
    activeOrderDetails.textContent = `${orderData.tokenIn} → ${orderData.tokenOut} | Amount: ${orderData.amount}`;

    // Reset timeline
    resetTimeline();

    // Close existing WebSocket if any
    if (activeWebSocket) {
        activeWebSocket.close();
    }

    // Connect to WebSocket
    const wsUrl = `${WS_BASE_URL}/ws/orders/${orderId}`;
    console.log('Connecting to WebSocket:', wsUrl);

    activeWebSocket = new WebSocket(wsUrl);

    activeWebSocket.onopen = () => {
        console.log('WebSocket connected for order:', orderId);
    };

    activeWebSocket.onmessage = (event) => {
        try {
            const update = JSON.parse(event.data);
            console.log('WebSocket update:', update);
            handleOrderUpdate(update);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    activeWebSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        showMessage('Connection error. Please refresh the page.', 'error');
    };

    activeWebSocket.onclose = () => {
        console.log('WebSocket closed for order:', orderId);
    };

    // Scroll to tracker
    activeOrderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Handle order status updates
function handleOrderUpdate(update) {
    const { status, data } = update;

    console.log('Status update:', status, data);

    // Update timeline
    updateTimeline(status, data);

    // Update order in history
    updateOrderInHistory(activeOrderId, status, data);

    // Handle completion
    if (status === 'completed') {
        showOrderResult(data);
        setTimeout(() => {
            if (activeWebSocket) {
                activeWebSocket.close();
            }
        }, 2000);
    }

    // Handle failure
    if (status === 'failed') {
        showOrderError(data);
        setTimeout(() => {
            if (activeWebSocket) {
                activeWebSocket.close();
            }
        }, 2000);
    }
}

// Update timeline visualization
function updateTimeline(status, data) {
    const timelineItems = document.querySelectorAll('.timeline-item');

    // Map status to timeline items
    const statusMap = {
        'pending': 0,
        'fetching_quotes': 1,
        'building': 2,
        'submitted': 3,
        'confirmed': 4,
        'completed': 5,
        'failed': 5
    };

    const currentIndex = statusMap[status];

    if (currentIndex !== undefined) {
        timelineItems.forEach((item, index) => {
            if (index < currentIndex) {
                item.classList.add('completed');
                item.classList.remove('active');
            } else if (index === currentIndex) {
                item.classList.add('active');
                item.classList.remove('completed');

                // Update message
                const messageEl = item.querySelector('.timeline-message');
                if (data && data.message) {
                    messageEl.textContent = data.message;
                }
                if (data && data.provider) {
                    messageEl.textContent += ` (${data.provider})`;
                }
                if (data && data.txHash) {
                    messageEl.textContent += ` - TX: ${data.txHash.substring(0, 8)}...`;
                }
                if (data && data.executedPrice) {
                    messageEl.textContent += ` - Price: ${data.executedPrice}`;
                }
            } else {
                item.classList.remove('active', 'completed');
            }
        });
    }
}

// Reset timeline
function resetTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.classList.remove('active', 'completed');
        const messageEl = item.querySelector('.timeline-message');
        messageEl.textContent = '';
    });
    orderResult.classList.remove('show');
    orderResult.innerHTML = '';
}

// Show order result
function showOrderResult(data) {
    orderResult.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: var(--status-success);">✓ Order Completed Successfully!</h3>
        ${data.txHash ? `<p><strong>Transaction Hash:</strong> ${data.txHash}</p>` : ''}
        ${data.executedPrice ? `<p><strong>Executed Price:</strong> ${data.executedPrice}</p>` : ''}
        ${data.message ? `<p>${data.message}</p>` : ''}
    `;
    orderResult.classList.add('show');
}

// Show order error
function showOrderError(data) {
    orderResult.style.background = 'rgba(248, 113, 113, 0.1)';
    orderResult.style.borderColor = 'var(--status-error)';
    orderResult.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: var(--status-error);">✗ Order Failed</h3>
        <p>${data.error || data.message || 'An error occurred during order execution'}</p>
    `;
    orderResult.classList.add('show');
}

// Order history management
function loadOrderHistory() {
    try {
        const stored = localStorage.getItem('orderHistory');
        if (stored) {
            orderHistory = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading order history:', error);
        orderHistory = [];
    }
}

function saveOrderHistory() {
    try {
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    } catch (error) {
        console.error('Error saving order history:', error);
    }
}

function addToOrderHistory(order) {
    orderHistory.unshift(order); // Add to beginning

    // Keep only last 20 orders
    if (orderHistory.length > 20) {
        orderHistory = orderHistory.slice(0, 20);
    }

    saveOrderHistory();
    renderOrderHistory();
}

function updateOrderInHistory(orderId, status, data) {
    const order = orderHistory.find(o => o.orderId === orderId);
    if (order) {
        order.status = status;
        if (data) {
            order.lastUpdate = data;
        }
        saveOrderHistory();
        renderOrderHistory();
    }
}

function renderOrderHistory() {
    if (orderHistory.length === 0) {
        orderHistoryContainer.innerHTML = '<p class="empty-state">No orders yet. Create your first order above!</p>';
        return;
    }

    orderHistoryContainer.innerHTML = orderHistory.map(order => {
        const date = new Date(order.createdAt);
        const timeAgo = getTimeAgo(date);

        return `
            <div class="order-card" onclick="viewOrderDetails('${order.orderId}')">
                <div class="order-card-header">
                    <span class="order-card-id">${order.orderId.substring(0, 8)}...</span>
                    <span class="status-badge ${order.status}">${order.status}</span>
                </div>
                <div class="order-card-details">
                    <div class="order-card-swap">${order.tokenIn} → ${order.tokenOut}</div>
                    <div class="order-card-amount">Amount: ${order.amount}</div>
                    <div class="order-card-time">${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');
}

function viewOrderDetails(orderId) {
    const order = orderHistory.find(o => o.orderId === orderId);
    if (order) {
        alert(`Order Details:\n\nOrder ID: ${order.orderId}\nSwap: ${order.tokenIn} → ${order.tokenOut}\nAmount: ${order.amount}\nStatus: ${order.status}\nCreated: ${new Date(order.createdAt).toLocaleString()}`);
    }
}

// Utility functions
function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline';
    btnLoader.style.display = loading ? 'flex' : 'none';
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

function hideMessage() {
    formMessage.className = 'form-message';
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (activeWebSocket) {
        activeWebSocket.close();
    }
});
