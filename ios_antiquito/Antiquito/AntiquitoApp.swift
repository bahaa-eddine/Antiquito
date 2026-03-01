import SwiftUI
import FirebaseCore

@main
struct AntiquitoApp: App {

    @StateObject private var store = AppStore()
    @StateObject private var iap   = IAPService.shared

    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .environmentObject(iap)
                .onAppear {
                    AuthService.startListening(store: store)
                    Task { await iap.checkEntitlements(store: store) }
                }
        }
    }
}
