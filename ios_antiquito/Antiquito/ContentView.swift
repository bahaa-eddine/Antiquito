import SwiftUI

struct ContentView: View {
    @EnvironmentObject var store: AppStore

    var body: some View {
        Group {
            if !store.authReady {
                SplashView()
            } else if !store.isAuthenticated {
                AuthFlow()
            } else {
                MainTabView()
            }
        }
        .animation(.easeInOut(duration: 0.25), value: store.authReady)
        .animation(.easeInOut(duration: 0.25), value: store.isAuthenticated)
    }
}

// MARK: – Splash (shown while Firebase resolves auth state)
struct SplashView: View {
    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()
            VStack(spacing: 12) {
                Image(systemName: "magnifyingglass.circle.fill")
                    .font(.system(size: 64))
                    .foregroundColor(AppColors.primary)
                Text("ANTIQUITO")
                    .font(.system(size: 20, weight: .bold, design: .serif))
                    .kerning(4)
                    .foregroundColor(AppColors.primary)
            }
        }
    }
}

// MARK: – Auth flow wrapper
struct AuthFlow: View {
    @State private var showRegister = false

    var body: some View {
        NavigationStack {
            LoginScreen(showRegister: $showRegister)
                .navigationDestination(isPresented: $showRegister) {
                    RegisterScreen(showRegister: $showRegister)
                }
        }
    }
}
