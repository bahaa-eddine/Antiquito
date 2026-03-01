import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var store: AppStore
    @State private var showCamera  = false
    @State private var showPaywall = false
    @State private var selectedTab = 0

    var body: some View {
        ZStack(alignment: .bottom) {
            TabView(selection: $selectedTab) {
                HistoryScreen(showPaywall: $showPaywall)
                    .tabItem { Label("History", systemImage: "clock") }
                    .tag(0)

                AccountScreen(showPaywall: $showPaywall)
                    .tabItem { Label("Account", systemImage: "person") }
                    .tag(1)
            }
            .tint(AppColors.primary)

            // Center FAB camera button
            Button {
                showCamera = true
            } label: {
                ZStack {
                    Circle()
                        .fill(AppColors.primary)
                        .frame(width: 64, height: 64)
                        .shadow(color: AppColors.primary.opacity(0.4), radius: 12, y: 4)
                    Image(systemName: "camera.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.white)
                }
            }
            .offset(y: -16)
        }
        .fullScreenCover(isPresented: $showCamera) {
            CameraScreen(showCamera: $showCamera, showPaywall: $showPaywall)
                .environmentObject(store)
        }
        .sheet(isPresented: $showPaywall) {
            PaywallScreen(showPaywall: $showPaywall)
                .environmentObject(store)
        }
    }
}
