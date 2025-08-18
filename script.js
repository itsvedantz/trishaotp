// Replace with your Firebase project's configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAXC10Z6hsCmH7MknRtAwnjzXsoSecpEyE',
  authDomain: 'handwriter-e701a.firebaseapp.com',
  projectId: 'handwriter-e701a',
  storageBucket: 'handwriter-e701a.firebasestorage.app',
  messagingSenderId: '132314462200',
  appId: '1:132314462200:web:b6a4cf66ba3ff04f8cc80d'
};

// --- END OF CONFIG ---

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Get DOM Elements
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const sendLinkBtn = document.getElementById('send-link-btn');
const messageDiv = document.getElementById('message');

// Function to display messages
const showMessage = (message, type) => {
    messageDiv.textContent = message;
    messageDiv.className = type; // 'success' or 'error'
};

// 1. Handle Sending the Login Link
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) {
        showMessage('Please enter an email address.', 'error');
        return;
    }

    // Disable button to prevent multiple clicks
    sendLinkBtn.disabled = true;
    sendLinkBtn.textContent = 'Sending...';

    const actionCodeSettings = {
        // URL you want to redirect back to. The domain must be whitelisted
        // in the Firebase Console.
        url: window.location.href, // Redirect back to this same page
        handleCodeInApp: true,
    };

    auth.sendSignInLinkToEmail(email, actionCodeSettings)
        .then(() => {
            // The link was successfully sent.
            window.localStorage.setItem('emailForSignIn', email);
            showMessage(`A login link has been sent to ${email}. Please check your inbox.`, 'success');
            loginForm.style.display = 'none'; // Hide the form
        })
        .catch((error) => {
            console.error("Firebase Error:", error.code, error.message);
            showMessage(`Error: ${error.message}`, 'error');
            sendLinkBtn.disabled = false;
            sendLinkBtn.textContent = 'Send Login Link';
        });
});

// 2. Handle Login when user clicks the link and returns to the page
document.addEventListener('DOMContentLoaded', () => {
    if (auth.isSignInWithEmailLink(window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            // User opened the link on a different device. Ask for email.
            email = window.prompt('Please provide your email for confirmation');
        }
        
        if (!email) {
            showMessage('Email is required to complete sign-in.', 'error');
            return;
        }

        auth.signInWithEmailLink(email, window.location.href)
            .then((result) => {
                window.localStorage.removeItem('emailForSignIn');
                
                console.log("Successfully signed in!", result.user);
                
                // TODO: Redirect to the user's dashboard page
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                   // window.location.href = '/dashboard.html'; 
                   alert("Redirecting to dashboard!");
                }, 2000);

            })
            .catch((error) => {
                console.error("Firebase Sign-In Error:", error.code, error.message);
                showMessage(`Error signing in: ${error.message}`, 'error');
            });
    }
});
