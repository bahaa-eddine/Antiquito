import SwiftUI

struct RegisterScreen: View {
    @Binding var showRegister: Bool
    @State private var email     = ""
    @State private var password  = ""
    @State private var confirm   = ""
    @State private var isLoading = false
    @State private var errorMsg: String?
    @State private var success   = false

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()

            if success {
                VStack(spacing: 20) {
                    Image(systemName: "envelope.badge.checkmark")
                        .font(.system(size: 56))
                        .foregroundColor(AppColors.real)
                    Text("Check your email")
                        .font(.title2.bold())
                        .foregroundColor(AppColors.text)
                    Text("We sent a verification link to \(email). Tap it then sign in.")
                        .font(.body)
                        .foregroundColor(AppColors.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                    Button("Back to Sign In") { showRegister = false }
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(AppColors.primary)
                        .cornerRadius(14)
                        .padding(.horizontal, 32)
                        .padding(.top, 8)
                }
            } else {
                ScrollView {
                    VStack(spacing: 24) {
                        Text("Create Account")
                            .font(.system(size: 26, weight: .bold, design: .serif))
                            .foregroundColor(AppColors.text)
                            .padding(.top, 48)

                        VStack(spacing: 14) {
                            AuthField(icon: "envelope", placeholder: "Email", text: $email, keyboard: .emailAddress)
                            AuthField(icon: "lock", placeholder: "Password (min 6 chars)", text: $password, isSecure: true)
                            AuthField(icon: "lock.fill", placeholder: "Confirm Password", text: $confirm, isSecure: true)

                            if let err = errorMsg {
                                Text(err)
                                    .font(.caption)
                                    .foregroundColor(AppColors.fake)
                                    .multilineTextAlignment(.center)
                            }

                            Button(action: register) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: 14)
                                        .fill(AppColors.primary)
                                        .frame(height: 52)
                                    if isLoading {
                                        ProgressView().tint(.white)
                                    } else {
                                        Text("Create Account").font(.headline).foregroundColor(.white)
                                    }
                                }
                            }
                            .disabled(isLoading || email.isEmpty || password.isEmpty || confirm.isEmpty)
                            .opacity(isLoading || email.isEmpty || password.isEmpty || confirm.isEmpty ? 0.6 : 1)

                            Button("Already have an account? Sign In") { showRegister = false }
                                .font(.subheadline)
                                .foregroundColor(AppColors.primary)
                        }
                        .padding(24)
                        .background(AppColors.surface)
                        .cornerRadius(20)
                        .shadow(color: .black.opacity(0.06), radius: 12, y: 4)
                        .padding(.horizontal, 24)
                    }
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
    }

    private func register() {
        guard password == confirm else { errorMsg = "Passwords do not match."; return }
        guard password.count >= 6  else { errorMsg = "Password must be at least 6 characters."; return }
        isLoading = true
        errorMsg = nil
        Task {
            do {
                try await AuthService.register(email: email, password: password)
                await MainActor.run { success = true }
            } catch {
                await MainActor.run { errorMsg = error.localizedDescription }
            }
            await MainActor.run { isLoading = false }
        }
    }
}
