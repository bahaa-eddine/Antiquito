import SwiftUI
import StoreKit

struct PaywallScreen: View {
    @Binding var showPaywall: Bool
    @EnvironmentObject var store: AppStore
    @StateObject private var iap = IAPService.shared
    @State private var selectedID = IAPConfig.monthlyProductID
    @State private var showWelcome = false

    private var monthly: Product? { iap.products.first { $0.id == IAPConfig.monthlyProductID } }
    private var weekly:  Product? { iap.products.first { $0.id == IAPConfig.weeklyProductID } }

    private let benefits = [
        ("viewfinder.circle", "Unlimited scans"),
        ("bolt.fill",         "Priority AI analysis"),
        ("clock.fill",        "Full scan history"),
        ("checkmark.shield",  "Detailed reports"),
        ("star.fill",         "Support development"),
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Hero
                        VStack(spacing: 10) {
                            Image(systemName: "trophy.fill")
                                .font(.system(size: 48))
                                .foregroundColor(AppColors.primary)
                            Text("Antiquito Premium")
                                .font(.system(size: 26, weight: .bold, design: .serif))
                                .foregroundColor(AppColors.text)
                            Text("Unlock unlimited AI antique analysis")
                                .font(.subheadline)
                                .foregroundColor(AppColors.textSecondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.top, 8)

                        // Benefits
                        VStack(spacing: 0) {
                            ForEach(Array(benefits.enumerated()), id: \.0) { idx, item in
                                HStack(spacing: 14) {
                                    Image(systemName: item.0)
                                        .foregroundColor(AppColors.primary)
                                        .frame(width: 22)
                                    Text(item.1)
                                        .font(.subheadline)
                                        .foregroundColor(AppColors.text)
                                    Spacer()
                                    Image(systemName: "checkmark")
                                        .font(.caption.weight(.bold))
                                        .foregroundColor(AppColors.real)
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 13)
                                if idx < benefits.count - 1 {
                                    Divider().padding(.horizontal, 16)
                                }
                            }
                        }
                        .background(AppColors.surface)
                        .cornerRadius(16)

                        // Plans
                        if iap.products.isEmpty {
                            ProgressView("Loading plans…")
                                .tint(AppColors.primary)
                                .padding(24)
                        } else {
                            VStack(spacing: 10) {
                                if let m = monthly { PlanCard(product: m, badge: "BEST VALUE", selected: $selectedID) }
                                if let w = weekly  { PlanCard(product: w, badge: nil,         selected: $selectedID) }
                            }
                        }

                        // Error
                        if let err = iap.errorMessage {
                            Text(err)
                                .font(.caption)
                                .foregroundColor(AppColors.fake)
                                .multilineTextAlignment(.center)
                        }

                        // Subscribe
                        Button {
                            Task {
                                guard let product = iap.products.first(where: { $0.id == selectedID }) else { return }
                                let success = await iap.purchase(product, store: store)
                                if success { showWelcome = true }
                            }
                        } label: {
                            ZStack {
                                RoundedRectangle(cornerRadius: 14)
                                    .fill(AppColors.primary)
                                    .frame(height: 54)
                                if iap.isLoading {
                                    ProgressView().tint(.white)
                                } else {
                                    Text("Subscribe Now")
                                        .font(.headline)
                                        .foregroundColor(.white)
                                }
                            }
                        }
                        .disabled(iap.isLoading || iap.products.isEmpty)
                        .opacity(iap.isLoading || iap.products.isEmpty ? 0.6 : 1)

                        // Restore
                        Button {
                            Task {
                                let ok = await iap.restore(store: store)
                                if ok { showWelcome = true }
                            }
                        } label: {
                            Text("Restore Purchases")
                                .font(.subheadline)
                                .foregroundColor(AppColors.primary)
                        }

                        Text("Cancel anytime. Subscription auto-renews. Manage in Settings.")
                            .font(.caption2)
                            .foregroundColor(AppColors.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.bottom, 8)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 16)
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { showPaywall = false } label: {
                        Image(systemName: "xmark")
                            .foregroundColor(AppColors.textSecondary)
                    }
                }
            }
        }
        .alert("Welcome to Premium!", isPresented: $showWelcome) {
            Button("Get Started") { showPaywall = false }
        } message: {
            Text("You now have unlimited scans. Enjoy!")
        }
        .task { await iap.loadProducts() }
    }
}

// MARK: – Plan card
struct PlanCard: View {
    let product: Product
    let badge: String?
    @Binding var selected: String

    private var isSelected: Bool { selected == product.id }

    var body: some View {
        Button { selected = product.id } label: {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text(product.displayName)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(AppColors.text)
                        if let badge {
                            Text(badge)
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(AppColors.primary)
                                .cornerRadius(4)
                        }
                    }
                    Text(product.displayPrice + (product.id.contains("weekly") ? "/week" : "/month"))
                        .font(.subheadline)
                        .foregroundColor(AppColors.textSecondary)
                }
                Spacer()
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundColor(isSelected ? AppColors.primary : AppColors.border)
            }
            .padding(16)
            .background(AppColors.surface)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? AppColors.primary : AppColors.border, lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }
}
