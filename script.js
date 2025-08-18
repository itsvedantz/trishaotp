// Replace with your Firebase project's configuration
const firebaseConfig = {
  apiKey: "AIzaSyASu68tWy_iKi-pUCl7tMFt4QaTVcXdcVM",
  authDomain: "trishaotp-5b919.firebaseapp.com",
  projectId: "trishaotp-5b919",
  storageBucket: "trishaotp-5b919.firebasestorage.app",
  messagingSenderId: "120386199395",
  appId: "1:120386199395:web:814a4975d6db9b8a42bd56",
  measurementId: "G-L97N94LMMP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const phoneNumberInput = document.getElementById('phone-number');
const sendOtpBtn = document.getElementById('send-otp-btn');
const otpInput = document.getElementById('otp-input');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const otpGroup = document.querySelector('.otp-group');
const statusMessage = document.getElementById('status-message');

// Set up reCAPTCHA verifier
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible',
    'callback': (response) => {
        // reCAPTCHA solved, allow sendOtp to continue.
        console.log("reCAPTCHA solved");
    }
});

// --- Send OTP Function ---
const sendOtp = () => {
    const phoneNumber = "+91" + phoneNumberInput.value;
    const appVerifier = window.recaptchaVerifier;

    if (phoneNumber.length !== 13) {
        updateStatus("Please enter a valid 10-digit number.", "error");
        return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";
    updateStatus("Sending OTP...", "info");

    auth.signInWithPhoneNumber(phoneNumber, appVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            updateStatus("OTP sent successfully!", "success");
            // Show OTP section
            otpGroup.style.display = 'flex';
            verifyOtpBtn.style.display = 'block';
            sendOtpBtn.style.display = 'none';
        }).catch((error) => {
            console.error("Error during OTP sending:", error);
            updateStatus("Failed to send OTP. Please try again.", "error");
            recaptchaVerifier.render().then(function(widgetId) {
                grecaptcha.reset(widgetId);
            });
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = "Send OTP";
        });
};

// --- Verify OTP Function ---
const verifyOtp = () => {
    const code = otpInput.value;
    if (code.length !== 6) {
        updateStatus("Please enter a valid 6-digit OTP.", "error");
        return;
    }

    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Verifying...";
    updateStatus("Verifying OTP...", "info");

    window.confirmationResult.confirm(code).then((result) => {
        // User signed in successfully.
        const user = result.user;
        console.log("User signed in:", user);
        updateStatus("Login Successful!", "success");
        // Redirect to the dashboard or home page
        window.location.href = "/dashboard.html"; // <-- CHANGE TO YOUR DASHBOARD PAGE
    }).catch((error) => {
        // User couldn't sign in (bad verification code?)
        console.error("Error during OTP verification:", error);
        updateStatus("Invalid OTP. Please try again.", "error");
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = "Verify & Login";
    });
};

// --- Helper function to update status message ---
const updateStatus = (message, type) => {
    statusMessage.textContent = message;
    statusMessage.style.color = type === 'success' ? 'var(--success-color)' : (type === 'error' ? 'var(--error-color)' : 'var(--text-color)');
};


// --- Event Listeners ---
sendOtpBtn.addEventListener('click', sendOtp);
verifyOtpBtn.addEventListener('click', verifyOtp);
