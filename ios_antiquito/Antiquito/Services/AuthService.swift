import Foundation
import FirebaseAuth

// MARK: – Firebase Auth wrapper (mirrors Firebase usage in RN app)
enum AuthService {

    // MARK: – Listen for auth state
    static func startListening(store: AppStore) {
        Auth.auth().addStateDidChangeListener { _, firebaseUser in
            DispatchQueue.main.async {
                if let fu = firebaseUser {
                    // Only admit verified emails
                    if fu.isEmailVerified {
                        let user = AppUser(
                            id:    fu.uid,
                            email: fu.email ?? "",
                            name:  fu.displayName ?? fu.email?.components(separatedBy: "@").first ?? "User"
                        )
                        store.login(user)
                    }
                } else {
                    store.logout()
                }
                if !store.authReady {
                    store.authReady = true
                }
            }
        }
    }

    // MARK: – Sign in
    static func signIn(email: String, password: String) async throws {
        let result = try await Auth.auth().signIn(withEmail: email, password: password)
        guard result.user.isEmailVerified else {
            try Auth.auth().signOut()
            throw AuthError.emailNotVerified
        }
    }

    // MARK: – Register
    static func register(email: String, password: String) async throws {
        let result = try await Auth.auth().createUser(withEmail: email, password: password)
        try await result.user.sendEmailVerification()
        try Auth.auth().signOut()  // force them to verify before logging in
    }

    // MARK: – Sign out
    static func signOut() throws {
        try Auth.auth().signOut()
    }

    // MARK: – Resend verification
    static func resendVerification() async throws {
        try await Auth.auth().currentUser?.sendEmailVerification()
    }
}

// MARK: – Custom errors
enum AuthError: LocalizedError {
    case emailNotVerified

    var errorDescription: String? {
        switch self {
        case .emailNotVerified:
            return "Please verify your email before logging in. Check your inbox."
        }
    }
}
