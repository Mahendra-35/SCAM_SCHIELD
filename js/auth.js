/**
 * AI AQUA FARM MANAGEMENT SYSTEM - AUTHENTICATION & ROLE ACCESS
 * Manages Firebase Auth session, registration, login, logout, password reset,
 * and Role-Based Access Control (Admin vs Farmer).
 */

class AuthService {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('aqua_active_user')) || {
            uid: 'demo_admin_01',
            email: 'admin@aquafarm.ai',
            displayName: 'Farm Administrator',
            role: 'Admin'
        };
        this.listeners = [];
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAdmin() {
        return this.currentUser && (this.currentUser.role === 'Admin' || this.currentUser.role === 'admin');
    }

    isFarmer() {
        return this.currentUser && (this.currentUser.role === 'Farmer' || this.currentUser.role === 'farmer');
    }

    onAuthStateChanged(callback) {
        this.listeners.push(callback);
        callback(this.currentUser);
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.currentUser));
    }

    async login(email, password) {
        if (window.isFirebaseConfigured() && window.fbAuth) {
            try {
                // Firebase SDK Modular Login
                const userCredential = await window.fbAuth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Fetch role from Firestore user profile if available
                let role = email.includes('admin') ? 'Admin' : 'Farmer';
                let displayName = user.displayName || email.split('@')[0];

                if (window.fbFirestore) {
                    try {
                        const doc = await window.fbFirestore.collection('users').doc(user.uid).get();
                        if (doc.exists) {
                            const data = doc.data();
                            if (data.role) role = data.role;
                            if (data.displayName) displayName = data.displayName;
                        }
                    } catch (e) {
                        console.warn("Could not fetch user role profile from Firestore:", e);
                    }
                }

                this.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: displayName,
                    role: role,
                    emailVerified: user.emailVerified
                };
                localStorage.setItem('aqua_active_user', JSON.stringify(this.currentUser));
                this.notifyListeners();
                return { 
                    success: true, 
                    user: this.currentUser,
                    emailVerified: user.emailVerified
                };
            } catch (err) {
                console.error("Firebase Login Error:", err.code, err.message);
                let friendlyMsg = err.message;
                
                if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                    friendlyMsg = 'Invalid email or password. If you haven\'t created an account yet, please click "Create Account" below to register.';
                } else if (err.code === 'auth/invalid-email') {
                    friendlyMsg = 'Please enter a valid email address format.';
                } else if (err.code === 'auth/too-many-requests') {
                    friendlyMsg = 'Access blocked due to multiple failed login attempts. Please try again later or reset your password.';
                }

                return { success: false, message: friendlyMsg, code: err.code };
            }
        } else {
            // Local Demo Login Logic
            let role = 'Farmer';
            let name = 'Aqua Farmer';
            if (email.toLowerCase().includes('admin')) {
                role = 'Admin';
                name = 'Farm Administrator';
            }

            this.currentUser = {
                uid: 'usr_' + Date.now(),
                email: email,
                displayName: name,
                role: role,
                emailVerified: true
            };
            localStorage.setItem('aqua_active_user', JSON.stringify(this.currentUser));
            this.notifyListeners();
            return { success: true, user: this.currentUser, emailVerified: true };
        }
    }

    async register(email, password, displayName, role = 'Farmer') {
        if (window.isFirebaseConfigured() && window.fbAuth) {
            try {
                const userCredential = await window.fbAuth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Update Profile Display Name
                await user.updateProfile({ displayName: displayName });

                // Send Verification Email via Firebase Auth
                let verificationSent = false;
                try {
                    await user.sendEmailVerification();
                    verificationSent = true;
                } catch (vErr) {
                    console.warn("Could not send verification email:", vErr);
                }

                // Save user profile & role to Cloud Firestore
                if (window.fbFirestore) {
                    await window.fbFirestore.collection('users').doc(user.uid).set({
                        uid: user.uid,
                        email: email,
                        displayName: displayName,
                        role: role,
                        createdAt: new Date().toISOString()
                    });
                }

                this.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: displayName,
                    role: role,
                    emailVerified: user.emailVerified
                };
                localStorage.setItem('aqua_active_user', JSON.stringify(this.currentUser));
                this.notifyListeners();

                return { 
                    success: true, 
                    user: this.currentUser,
                    verificationSent: verificationSent,
                    message: verificationSent ? 'Registration successful! A verification email has been sent to ' + email : 'Registration successful!'
                };
            } catch (err) {
                console.error("Firebase Register Error:", err.code, err.message);
                let friendlyMsg = err.message;
                if (err.code === 'auth/email-already-in-use') {
                    friendlyMsg = 'This email address is already registered. Please click "Sign In" instead.';
                } else if (err.code === 'auth/weak-password') {
                    friendlyMsg = 'The password is too weak. Please use at least 6 characters.';
                } else if (err.code === 'auth/invalid-email') {
                    friendlyMsg = 'Please enter a valid email address.';
                }
                return { success: false, message: friendlyMsg, code: err.code };
            }
        } else {
            this.currentUser = {
                uid: 'usr_' + Date.now(),
                email: email,
                displayName: displayName || 'Aquaculture Operator',
                role: role,
                emailVerified: true
            };
            localStorage.setItem('aqua_active_user', JSON.stringify(this.currentUser));
            this.notifyListeners();
            return { success: true, user: this.currentUser, verificationSent: true, message: 'Registration successful! Verification email sent (Simulation).' };
        }
    }

    async resendVerificationEmail() {
        if (window.isFirebaseConfigured() && window.fbAuth && window.fbAuth.currentUser) {
            try {
                await window.fbAuth.currentUser.sendEmailVerification();
                return { success: true, message: 'Verification email sent successfully!' };
            } catch (err) {
                return { success: false, message: err.message };
            }
        } else {
            return { success: true, message: 'Verification email resent (Simulation).' };
        }
    }

    async resetPassword(email) {
        if (window.isFirebaseConfigured() && window.fbAuth) {
            try {
                await window.fbAuth.sendPasswordResetEmail(email);
                return { success: true, message: 'Password reset link sent to ' + email };
            } catch (err) {
                return { success: false, message: err.message };
            }
        } else {
            return { success: true, message: 'Password reset email simulation sent to ' + email };
        }
    }

    logout() {
        if (window.isFirebaseConfigured() && window.fbAuth) {
            window.fbAuth.signOut();
        }
        this.currentUser = null;
        localStorage.removeItem('aqua_active_user');
        this.notifyListeners();
    }
}

window.authService = new AuthService();
