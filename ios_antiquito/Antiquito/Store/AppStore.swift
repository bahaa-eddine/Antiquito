import Foundation
import Combine

// Central state container – mirrors useStore.ts (Zustand)
final class AppStore: ObservableObject {

    // MARK: – Auth
    @Published var user: AppUser?
    @Published var isAuthenticated = false
    @Published var authReady = false

    // MARK: – Current scan session
    @Published var capturedImage: UIImage?
    @Published var analysisResult: AnalysisResult?
    @Published var isLoading = false
    @Published var scanError: String?

    // MARK: – Scan history (persisted)
    @Published var scanHistory: [ScanRecord] = []

    // MARK: – Subscription (persisted)
    @Published var isPremium: Bool = false
    @Published var freeScansUsed: Int = 0

    // MARK: – Viewing a past scan
    @Published var viewingScan: ScanRecord?

    // MARK: – Persistence
    private let defaults = UserDefaults.standard
    private let historyKey  = "scanHistory_v2"
    private let premiumKey  = "isPremium"
    private let scansKey    = "freeScansUsed"

    init() { load() }

    // MARK: – Auth actions
    func login(_ user: AppUser) {
        self.user = user
        isAuthenticated = true
    }

    func logout() {
        user = nil
        isAuthenticated = false
        resetSession()
    }

    // MARK: – Session actions
    func resetSession() {
        capturedImage  = nil
        analysisResult = nil
        isLoading      = false
        scanError      = nil
    }

    // MARK: – Subscription actions
    func setIsPremium(_ value: Bool) {
        isPremium = value
        defaults.set(value, forKey: premiumKey)
    }

    func incrementFreeScans() {
        freeScansUsed += 1
        defaults.set(freeScansUsed, forKey: scansKey)
    }

    func resetFreeScans() {
        freeScansUsed = 0
        defaults.set(0, forKey: scansKey)
    }

    // MARK: – History actions
    func addScanRecord(_ record: ScanRecord) {
        scanHistory.insert(record, at: 0)
        persist()
    }

    func deleteScanRecords(at offsets: IndexSet) {
        scanHistory.remove(atOffsets: offsets)
        persist()
    }

    // MARK: – Private helpers
    private func load() {
        isPremium     = defaults.bool(forKey: premiumKey)
        freeScansUsed = defaults.integer(forKey: scansKey)
        if let data = defaults.data(forKey: historyKey),
           let history = try? JSONDecoder().decode([ScanRecord].self, from: data) {
            scanHistory = history
        }
    }

    private func persist() {
        if let data = try? JSONEncoder().encode(scanHistory) {
            defaults.set(data, forKey: historyKey)
        }
    }
}
