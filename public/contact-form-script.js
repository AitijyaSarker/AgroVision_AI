// Traditional JavaScript for Contact Form - Standalone HTML Version

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    const submitBtn = document.getElementById('submit-btn');
    const buttonText = submitBtn.querySelector('.button-text');
    const buttonLoader = submitBtn.querySelector('.button-loader');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            mobile: document.getElementById('mobile').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        // Validate form
        const errors = validateForm(formData);
        
        if (Object.keys(errors).length > 0) {
            showErrors(errors);
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        buttonText.style.display = 'none';
        buttonLoader.style.display = 'flex';

        try {
            // Simulate API call (replace with actual API endpoint)
            await submitForm(formData);
            
            // Show success
            form.style.display = 'none';
            successMessage.style.display = 'flex';
            
            // Reset form after 3 seconds
            setTimeout(() => {
                form.reset();
                form.style.display = 'flex';
                successMessage.style.display = 'none';
                submitBtn.disabled = false;
                buttonText.style.display = 'inline';
                buttonLoader.style.display = 'none';
            }, 3000);
            
        } catch (error) {
            alert('Error submitting form. Please try again.');
            submitBtn.disabled = false;
            buttonText.style.display = 'inline';
            buttonLoader.style.display = 'none';
        }
    });

    function validateForm(data) {
        const errors = {};

        // Name validation
        if (!data.name) {
            errors.name = 'Name is required';
        }

        // Email or mobile required
        if (!data.email && !data.mobile) {
            errors.contact = 'Email or mobile number is required';
        }

        // Email validation
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                errors.email = 'Please enter a valid email';
            }
        }

        // Mobile validation
        if (data.mobile) {
            const mobileRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
            const cleanMobile = data.mobile.replace(/\s+/g, '');
            if (!mobileRegex.test(cleanMobile)) {
                errors.mobile = 'Please enter a valid mobile number (01XXXXXXXXX)';
            }
        }

        // Message validation
        if (!data.message) {
            errors.message = 'Message is required';
        }

        return errors;
    }

    function showErrors(errors) {
        for (const [field, message] of Object.entries(errors)) {
            const errorElement = document.getElementById(`${field}-error`);
            const inputElement = document.getElementById(field);
            
            if (errorElement) {
                errorElement.textContent = message;
            }
            
            if (inputElement) {
                inputElement.classList.add('error');
            }
        }
    }

    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        const inputElements = document.querySelectorAll('input, textarea');
        
        errorElements.forEach(el => el.textContent = '');
        inputElements.forEach(el => el.classList.remove('error'));
    }

    async function submitForm(data) {
        // Save to localStorage as fallback
        const submissions = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
        submissions.push({
            ...data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('contact_submissions', JSON.stringify(submissions));

        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form submitted:', data);
                resolve();
            }, 1500);
        });

        // In production, replace with actual API call:
        /*
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit form');
        }
        */
    }
});


