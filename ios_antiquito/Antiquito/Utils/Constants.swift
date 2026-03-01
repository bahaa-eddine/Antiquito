import SwiftUI

// MARK: - Hex Color initializer
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:  (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:  (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:  (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Design tokens (mirrors src/utils/constants.ts)
enum AppColors {
    static let primary        = Color(hex: "8B6914")
    static let primaryLight   = Color(hex: "C8A441")
    static let background     = Color(hex: "F7F3EE")
    static let surface        = Color.white
    static let surfaceAlt     = Color(hex: "EDE8E0")
    static let text           = Color(hex: "1C1A18")
    static let textSecondary  = Color(hex: "6B6560")
    static let border         = Color(hex: "E8E0D5")
    static let separator      = Color(hex: "F0EBE3")
    static let real           = Color(hex: "1A7340")
    static let realLight      = Color(hex: "E8F5EE")
    static let fake           = Color(hex: "C0392B")
    static let fakeLight      = Color(hex: "FDECEA")
    static let uncertain      = Color(hex: "B7770D")
    static let uncertainLight = Color(hex: "FEF6E4")
}

// MARK: - IAP constants (read from Info.plist so project.yml controls them)
enum IAPConfig {
    static let weeklyProductID  = "com.antiquito.premium.weekly"
    static let monthlyProductID = "com.antiquito.premium.monthly"

    static var freeScanLimit: Int {
        if let raw = Bundle.main.object(forInfoDictionaryKey: "FREE_SCAN_LIMIT") as? String,
           let val = Int(raw) { return val }
        return 3
    }
}

// MARK: - API config
enum APIConfig {
    static var groqKey: String {
        (Bundle.main.object(forInfoDictionaryKey: "GROQ_API_KEY") as? String) ?? ""
    }
    static let groqURL   = URL(string: "https://api.groq.com/openai/v1/chat/completions")!
    static let groqModel = "meta-llama/llama-4-scout-17b-16e-instruct"
}
