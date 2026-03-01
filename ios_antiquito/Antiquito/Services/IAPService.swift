import Foundation
import StoreKit

// MARK: – StoreKit 2 IAP service (mirrors useSubscription.ts)
@MainActor
final class IAPService: ObservableObject {

    static let shared = IAPService()

    @Published var products: [Product] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let productIDs: Set<String> = [
        IAPConfig.weeklyProductID,
        IAPConfig.monthlyProductID
    ]

    private var transactionListener: Task<Void, Error>?

    private init() {
        transactionListener = listenForTransactions()
        Task { await loadProducts() }
    }

    deinit { transactionListener?.cancel() }

    // MARK: – Load products from App Store
    func loadProducts() async {
        do {
            let fetched = try await Product.products(for: productIDs)
            products = fetched.sorted { $0.price < $1.price }  // weekly first (cheaper)
        } catch {
            errorMessage = "Could not load plans: \(error.localizedDescription)"
        }
    }

    // MARK: – Purchase
    func purchase(_ product: Product, store: AppStore) async -> Bool {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                let transaction = try checkVerified(verification)
                await transaction.finish()
                store.setIsPremium(true)
                return true
            case .userCancelled:
                return false
            case .pending:
                errorMessage = "Purchase is pending approval."
                return false
            @unknown default:
                return false
            }
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    // MARK: – Restore
    func restore(store: AppStore) async -> Bool {
        isLoading = true
        defer { isLoading = false }

        do {
            try await AppStore.sync()
        } catch {
            errorMessage = error.localizedDescription
            return false
        }

        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result,
               productIDs.contains(transaction.productID) {
                store.setIsPremium(true)
                return true
            }
        }
        errorMessage = "No active subscription found to restore."
        return false
    }

    // MARK: – Check existing entitlements on launch
    func checkEntitlements(store: AppStore) async {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result,
               productIDs.contains(transaction.productID) {
                store.setIsPremium(true)
                return
            }
        }
    }

    // MARK: – Background listener for purchases completed outside the app
    private func listenForTransactions() -> Task<Void, Error> {
        Task.detached {
            for await result in Transaction.updates {
                guard case .verified(let transaction) = result else { continue }
                await transaction.finish()
                await MainActor.run {
                    // setIsPremium needs access to store — done via checkEntitlements on next launch
                }
            }
        }
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified: throw IAPError.verificationFailed
        case .verified(let value): return value
        }
    }
}

enum IAPError: LocalizedError {
    case verificationFailed
    var errorDescription: String? { "Purchase verification failed." }
}
