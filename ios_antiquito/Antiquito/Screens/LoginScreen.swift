import SwiftUI

struct LoginScreen: View {
    @Binding var showRegister: Bool
    @State private var email    = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMsg: String?

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "magnifyingglass.circle.fill")
                            .font(.system(size: 56))
                            .foregroundColor(AppColors.primary)
                        Text("ANTIQUITO")
                            .font(.system(size: 22, weight: .bold, design: .serif))
                            .kerning(4)
                            .foregroundColor(AppColors.primary)
                        Text("Discover the story behind every antique")
                            .font(.subheadline)
                            .foregroundColor(AppColors.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 64)
                    .padding(.bottom, 40)

                    // Form card
                    VStack(spacing: 16) {
                        AuthField(icon: "envelope", placeholder: "Email", text: $email, keyboard: .emailAddress)
                        AuthField(icon: "lock", placeholder: "Password", text: $password, isSecure: true)

                        if let err = errorMsg {
                            Text(err)
                                .font(.caption)
                                .foregroundColor(AppColors.fake)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }

                        Button(action: login) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 14)
                                    .fill(AppColors.primary)
                                    .frame(height: 52)
                                if isLoading {
                                    ProgressView().tint(.white)
                                } else {
                                    Text("Sign In").font(.headline).foregroundColor(.white)
                                }
                            }
                        }
                        .disabled(isLoading || email.isEmpty || password.isEmpty)
                        .opacity((isLoading || email.isEmpty || password.isEmpty) ? 0.6 : 1)
                        .padding(.top, 4)

                        HStack(spacing: 4) {
                            Text("Don't have an account?")
                                .foregroundColor(AppColors.textSecondary)
                                .font(.subheadline)
                            Button("Register") { showRegister = true }
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(AppColors.primary)
                        }
                        .padding(.top, 4)
                    }
                    .padding(24)
                    .background(AppColors.surface)
                    .cornerRadius(20)
                    .shadow(color: .black.opacity(0.06), radius: 12, y: 4)
                    .padding(.horizontal, 24)
                }
            }
        }
        .navigationBarHidden(true)
    }

    private func login() {
        isLoading = true
        errorMsg = nil
        Task {
            do {
                try await AuthService.signIn(email: email, password: password)
            } catch {
                await MainActor.run { errorMsg = error.localizedDescription }
            }
            await MainActor.run { isLoading = false }
        }
    }
}

// MARK: – Reusable text field
struct AuthField: View {
    let icon: String
    let placeholder: String
    @Binding var text: String
    var keyboard: UIKeyboardType = .default
    var isSecure = false

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(AppColors.primary)
                .frame(width: 20)
            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                        .keyboardType(keyboard)
                        .autocapitalization(.none)
                        .autocorrectionDisabled()
                }
            }
            .font(.body)
        }
        .padding(14)
        .background(AppColors.surfaceAlt)
        .cornerRadius(12)
    }
}
