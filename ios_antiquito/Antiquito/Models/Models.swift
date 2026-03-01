import Foundation

// MARK: - Authenticity
enum AuthenticityLabel: String, Codable {
    case authentic    = "Authentic"
    case reproduction = "Reproduction"
    case inconclusive = "Inconclusive"
}

// MARK: - Analysis result (mirrors src/types/index.ts)
struct AnalysisResult: Codable {
    let authenticity: AuthenticityLabel
    let confidence: Int          // 0–100
    let confidenceLabel: String
    let title: String
    let estimatedPeriod: String
    let origin: String
    let description: String
    var estimatedPrice: String?
    var authenticPrice: String?
}

// MARK: - User
struct AppUser: Codable {
    let id: String
    let email: String
    let name: String
}

// MARK: - Scan record
struct ScanRecord: Identifiable, Codable {
    let id: String
    let imageData: Data          // stored as raw bytes (no URI in Swift)
    let result: AnalysisResult
    let createdAt: Date

    var formattedDate: String {
        let f = DateFormatter()
        f.dateStyle = .medium
        f.timeStyle = .short
        return f.string(from: createdAt)
    }
}
