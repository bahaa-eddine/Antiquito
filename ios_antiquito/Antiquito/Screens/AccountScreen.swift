import SwiftUI

struct AccountScreen: View {
    @EnvironmentObject var store: AppStore
    @Binding var showPaywall: Bool
    @State private var showLogoutConfirm = false

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        // Avatar card
                        VStack(spacing: 12) {
                            ZStack {
                                Circle().fill(AppColors.surfaceAlt).frame(width: 80, height: 80)
                                Text(store.user.map { String($0.name.prefix(1).uppercased()) } ?? "?")
                                    .font(.system(size: 32, weight: .bold))
                                    .foregroundColor(AppColors.primary)
                            }
                            if let user = store.user {
                                Text(user.name)
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(AppColors.text)
                                Text(user.email)
                                    .font(.subheadline)
                                    .foregroundColor(AppColors.textSecondary)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(24)
                        .background(AppColors.surface)
                        .cornerRadius(20)

                        // Subscription card
                        VStack(alignment: .leading, spacing: 14) {
                            Label("Subscription", systemImage: "creditcard")
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(AppColors.textSecondary)

                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(store.isPremium ? "Premium" : "Free Plan")
                                        .font(.headline)
                                        .foregroundColor(AppColors.text)
                                    if !store.isPremium {
                                        Text("\(max(0, IAPConfig.freeScanLimit - store.freeScansUsed)) scans remaining")
                                            .font(.caption)
                                            .foregroundColor(AppColors.textSecondary)
                                    }
                                }
                                Spacer()
                                PlanBadge(dark: false) { if !store.isPremium { showPaywall = true } }
                                    .environmentObject(store)
                            }

                            if !store.isPremium {
                                Button("Upgrade to Premium") { showPaywall = true }
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 42)
                                    .background(AppColors.primary)
                                    .cornerRadius(12)
                            }
                        }
                        .padding(20)
                        .background(AppColors.surface)
                        .cornerRadius(20)

                        // Stats
                        HStack(spacing: 12) {
                            StatCell(value: "\(store.scanHistory.count)", label: "Total Scans")
                            StatCell(
                                value: "\(store.scanHistory.filter { $0.result.authenticity == .authentic }.count)",
                                label: "Authentic"
                            )
                            StatCell(
                                value: "\(store.scanHistory.filter { $0.result.authenticity == .reproduction }.count)",
                                label: "Reproductions"
                            )
                        }

                        // Test mode card (DEBUG only)
                        #if DEBUG
                        VStack(alignment: .leading, spacing: 12) {
                            Label("Test Mode", systemImage: "wrench.and.screwdriver")
                                .font(.subheadline.weight(.semibold))
                                .foregroundColor(AppColors.uncertain)
                            Text(store.isPremium ? "Status: Premium (simulated)" : "Status: Free — \(max(0, IAPConfig.freeScanLimit - store.freeScansUsed)) scans left")
                                .font(.caption)
                                .foregroundColor(AppColors.textSecondary)
                            HStack(spacing: 10) {
                                Button("Reset to Free") {
                                    store.setIsPremium(false)
                                    store.resetFreeScans()
                                }
                                .font(.caption.weight(.semibold))
                                .foregroundColor(AppColors.fake)
                                .frame(maxWidth: .infinity, minHeight: 36)
                                .background(AppColors.fakeLight)
                                .cornerRadius(8)

                                Button("Open Paywall") { showPaywall = true }
                                    .font(.caption.weight(.semibold))
                                    .foregroundColor(AppColors.primary)
                                    .frame(maxWidth: .infinity, minHeight: 36)
                                    .background(AppColors.surfaceAlt)
                                    .cornerRadius(8)
                            }
                        }
                        .padding(16)
                        .background(AppColors.uncertainLight)
                        .cornerRadius(16)
                        .overlay(RoundedRectangle(cornerRadius: 16).stroke(AppColors.uncertain.opacity(0.3), lineWidth: 1))
                        #endif

                        // Logout
                        Button { showLogoutConfirm = true } label: {
                            Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                                .font(.headline)
                                .foregroundColor(AppColors.fake)
                                .frame(maxWidth: .infinity)
                                .frame(height: 52)
                                .background(AppColors.fakeLight)
                                .cornerRadius(14)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 16)
                    .padding(.bottom, 80)
                }
            }
            .navigationTitle("Account")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    PlanBadge(dark: false) { if !store.isPremium { showPaywall = true } }
                        .environmentObject(store)
                }
            }
            .confirmationDialog("Sign out of Antiquito?", isPresented: $showLogoutConfirm, titleVisibility: .visible) {
                Button("Sign Out", role: .destructive) {
                    try? AuthService.signOut()
                }
                Button("Cancel", role: .cancel) {}
            }
        }
    }
}

struct StatCell: View {
    let value: String
    let label: String
    var body: some View {
        VStack(spacing: 4) {
            Text(value).font(.system(size: 22, weight: .bold)).foregroundColor(AppColors.primary)
            Text(label).font(.caption).foregroundColor(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(AppColors.surface)
        .cornerRadius(14)
    }
}
