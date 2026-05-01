document.addEventListener('DOMContentLoaded', function() {
    const EXCHANGE_RATE = 1.1603; // 1 EUR ≈ 1.1603 USD

    const form = document.getElementById('orderForm');
    const totalEl = document.getElementById('total');
    const symbolEl = document.getElementById('currencySymbol');
    const totalHidden = document.getElementById('totalHidden');
    const symbolHidden = document.getElementById('currencySymbolHidden');

    const inputs = ['quantity', 'currency', 'country'];
    const checkboxes = ['secureShipping', 'withBox'];

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', calculateTotal);
    });

    checkboxes.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', calculateTotal);
    });

    function calculateTotal() {
        const qty = parseInt(document.getElementById('quantity').value) || 1;
        const currency = document.getElementById('currency').value;
        const countrySelect = document.getElementById('country');
        const secure = document.getElementById('secureShipping').checked;
        const box = document.getElementById('withBox').checked;

        let basePriceEur = 15;
        let shippingEur = parseFloat(countrySelect?.options[countrySelect.selectedIndex]?.dataset.shipping || 9.00);

        // Bulk discount
        if (qty >= 10) basePriceEur *= 0.9;

        // Shipping multiplier for multiple items
        if (qty > 1) shippingEur = Math.round(shippingEur * 1.5 * 100) / 100;

        let subtotalEur = (qty * basePriceEur) + (box ? 2.75 * qty : 0) + (secure ? 5.50 : 0) + shippingEur;

        let total, symbol;
        if (currency === 'USD') {
            total = subtotalEur * EXCHANGE_RATE;
            symbol = '$';
        } else {
            total = subtotalEur;
            symbol = '€';
        }

        totalEl.textContent = total.toFixed(2);
        symbolEl.textContent = symbol;

        totalHidden.value = total.toFixed(2);
        symbolHidden.value = symbol;
    }

    // Form submission with test card
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        if (paymentMethod && paymentMethod.value === 'credit') {
            const ccInput = document.createElement('input');
            ccInput.type = 'hidden';
            ccInput.name = 'credit_card_test';
            ccInput.value = '4242 4242 4242 4242'; // Test card
            form.appendChild(ccInput);
        }

        const formData = new FormData(form);
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            if (response.ok) {
                window.location.href = `thankyou.html?${new URLSearchParams(formData).toString()}`;
            } else {
                alert('Submission error. Please try again.');
            }
        })
        .catch(() => alert('Network error. Please try again later.'));
    });

    // Initial calculation
    calculateTotal();
});