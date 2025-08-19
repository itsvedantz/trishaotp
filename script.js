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

// --- Initialize Firebase ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// --- DOM Elements ---
const loginTitle = document.getElementById('login-title');
const loginSubtitle = document.getElementById('login-subtitle');
const cardHeader = document.querySelector('.card-header');

const tabs = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.tab-panel');

// Owner panel elements
const phoneNumberInput = document.getElementById('phone-number');
const sendOtpBtn = document.getElementById('send-otp-btn');
const otpInput = document.getElementById('otp-input');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const otpGroup = document.getElementById('otp-group');

// Admin panel elements
const adminEmailInput = document.getElementById('admin-email');
const adminPasswordInput = document.getElementById('admin-password');
const adminLoginBtn = document.getElementById('admin-login-btn');

// Security panel elements
const securityEmailInput = document.getElementById('security-email');
const securityPasswordInput = document.getElementById('security-password');
const securityLoginBtn = document.getElementById('security-login-btn');

const statusMessage = document.getElementById('status-message');

// --- Tab Switching Logic ---
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const role = tab.dataset.role;

        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update header text and color
        if (role === 'owner') {
            loginTitle.textContent = 'Owner Login';
            loginSubtitle.textContent = 'Please enter your mobile number.';
            cardHeader.style.backgroundColor = 'var(--primary-color)';
        } else if (role === 'admin') {
            loginTitle.textContent = 'Admin Login';
            loginSubtitle.textContent = 'Please enter your credentials.';
            cardHeader.style.backgroundColor = 'var(--secondary-color)';
        } else if (role === 'security') {
            loginTitle.textContent = 'Security Login';
            loginSubtitle.textContent = 'Please enter your credentials.';
            cardHeader.style.backgroundColor = 'var(--secondary-color)';
        }

        // Show correct panel
        panels.forEach(panel => {
            if (panel.id === `${role}-panel`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        // Clear status message on tab switch
        updateStatus("", "info");
    });
});

// --- reCAPTCHA Verifier for OTP ---
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible',
    'callback': (response) => console.log("reCAPTCHA solved")
});

// --- Owner OTP Login Functions ---
const sendOtp = () => {
    const phoneNumber = "+91" + phoneNumberInput.value;
    if (phoneNumber.length !== 13) {
        updateStatus("Please enter a valid 10-digit number.", "error");
        return;
    }
    updateStatus("Sending OTP...", "info");
    auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            updateStatus("OTP sent successfully!", "success");
            otpGroup.style.display = 'flex';
            verifyOtpBtn.style.display = 'block';
            sendOtpBtn.style.display = 'none';
        }).catch((error) => {
            console.error("Error during OTP sending:", error);
            updateStatus("Failed to send OTP. Please try again.", "error");
        });
};

const verifyOtp = () => {
    const code = otpInput.value;
    if (code.length !== 6) {
        updateStatus("Please enter a valid 6-digit OTP.", "error");
        return;
    }
    updateStatus("Verifying OTP...", "info");
    window.confirmationResult.confirm(code).then((result) => {
        updateStatus("Login Successful!", "success");
        // IMPORTANT: Redirect to the owner dashboard
        window.location.href = "/owner-dashboard.html"; 
    }).catch((error) => {
        console.error("Error during OTP verification:", error);
        if (error.message.includes("not registered")) {
            updateStatus("This number is not registered. Contact office.", "error");
        } else {
            updateStatus("Invalid OTP. Please try again.", "error");
        }
    });
};

// --- Admin & Security Email/Password Login Function ---
const handleEmailPasswordLogin = (role) => {
    const email = (role === 'admin') ? adminEmailInput.value : securityEmailInput.value;
    const password = (role === 'admin') ? adminPasswordInput.value : securityPasswordInput.value;

    if (!email || !password) {
        updateStatus("Email and password cannot be empty.", "error");
        return;
    }
    updateStatus(`Logging in as ${role}...`, "info");

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            updateStatus("Login Successful!", "success");
            // IMPORTANT: Redirect to the correct dashboard based on role
            if (role === 'admin') {
                window.location.href = "/admin-dashboard.html";
            } else if (role === 'security') {
                window.location.href = "/security-dashboard.html";
            }
        })
        .catch((error) => {
            console.error(`${role} login error:`, error.code);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                updateStatus("Invalid email or password.", "error");
            } else {
                updateStatus("An error occurred. Please try again.", "error");
            }
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
adminLoginBtn.addEventListener('click', () => handleEmailPasswordLogin('admin'));
securityLoginBtn.addEventListener('click', () => handleEmailPasswordLogin('security'));
