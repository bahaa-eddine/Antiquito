import Foundation
import UIKit

// MARK: – Groq vision API (mirrors src/services/aiService.ts)
enum AIService {

    private static let systemMessage = """
        You are an expert antique appraiser with 30 years of experience. \
        You ALWAYS give a decisive score. You NEVER hedge with a score of 46–55 \
        unless the image is literally too blurry or dark to see anything. \
        When you are unsure, you pick the most likely side — that is your professional duty.
        """

    private static let analysisPrompt = """
        Examine the image and return ONLY a raw JSON object — no markdown, no code fences, no explanation before or after.

        Required fields:
        {
          "confidence": <integer 0–100>,
          "title": "<specific object name>",
          "estimatedPeriod": "<date range e.g. 1860–1880, or 'Modern reproduction'>",
          "origin": "<country or region of manufacture>",
          "description": "<2-3 sentences explaining what you see and WHY you scored it this way>",
          "estimatedPrice": "<USD market value range>",
          "authenticPrice": "<USD range for genuine original — ONLY include when confidence is 0–45>"
        }

        Scoring guide — pick the most accurate score, AVOID 46–55:
          0–15  = Almost Certainly a Reproduction
         16–35  = Likely a Reproduction
         36–45  = Probably a Reproduction
         46–55  = Inconclusive — USE ONLY when image is too blurry/dark to evaluate
         56–70  = Probably Authentic
         71–85  = Likely Authentic
         86–100 = Highly Authentic

        Pricing:
        - Include "estimatedPrice" for confidence 0–45 (replica/resale) and 56–100 (antique value)
        - Include "authenticPrice" for confidence 0–45 only
        - OMIT both price fields for confidence 46–55
        """

    // MARK: – Public API
    static func analyzeImage(_ image: UIImage) async throws -> AnalysisResult {
        guard !APIConfig.groqKey.isEmpty else {
            throw AIError.missingAPIKey
        }

        guard let base64 = imageToBase64(image) else {
            throw AIError.imageEncodingFailed
        }

        let body: [String: Any] = [
            "model": APIConfig.groqModel,
            "max_tokens": 1024,
            "temperature": 0.4,
            "messages": [
                ["role": "system", "content": systemMessage],
                ["role": "user", "content": [
                    ["type": "image_url", "image_url": ["url": "data:image/jpeg;base64,\(base64)"]],
                    ["type": "text", "text": analysisPrompt]
                ]]
            ]
        ]

        var request = URLRequest(url: APIConfig.groqURL)
        request.httpMethod = "POST"
        request.setValue("Bearer \(APIConfig.groqKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            let msg = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw AIError.apiError(msg)
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        guard let content = (json?["choices"] as? [[String: Any]])?.first?["message"] as? [String: Any],
              let text = content["content"] as? String else {
            throw AIError.emptyResponse
        }

        return try parseResponse(text)
    }

    // MARK: – Helpers
    private static func imageToBase64(_ image: UIImage) -> String? {
        image.jpegData(compressionQuality: 0.8)?.base64EncodedString()
    }

    private static func parseResponse(_ text: String) throws -> AnalysisResult {
        var cleaned = text
            .replacingOccurrences(of: "^```json\\s*", with: "", options: .regularExpression)
            .replacingOccurrences(of: "^```\\s*",     with: "", options: .regularExpression)
            .replacingOccurrences(of: "```\\s*$",     with: "", options: .regularExpression)
            .trimmingCharacters(in: .whitespacesAndNewlines)

        guard let jsonData = cleaned.data(using: .utf8),
              let parsed = try JSONSerialization.jsonObject(with: jsonData) as? [String: Any] else {
            throw AIError.parseError
        }

        let confidence = min(100, max(0, (parsed["confidence"] as? Int) ?? 50))

        var result = AnalysisResult(
            authenticity:    getAuthenticity(confidence),
            confidence:      confidence,
            confidenceLabel: getConfidenceLabel(confidence),
            title:           (parsed["title"] as? String) ?? "Unknown Object",
            estimatedPeriod: (parsed["estimatedPeriod"] as? String) ?? "Unknown",
            origin:          (parsed["origin"] as? String) ?? "Unknown",
            description:     (parsed["description"] as? String) ?? ""
        )

        if confidence <= 45 || confidence >= 56 {
            result.estimatedPrice = parsed["estimatedPrice"] as? String
            if confidence <= 45 {
                result.authenticPrice = parsed["authenticPrice"] as? String
            }
        }

        return result
    }

    private static func getAuthenticity(_ c: Int) -> AuthenticityLabel {
        if c <= 45 { return .reproduction }
        if c <= 55 { return .inconclusive }
        return .authentic
    }

    private static func getConfidenceLabel(_ c: Int) -> String {
        switch c {
        case 0...15:  return "Almost Certainly a Reproduction"
        case 16...35: return "Likely a Reproduction"
        case 36...45: return "Probably a Reproduction"
        case 46...55: return "Inconclusive"
        case 56...70: return "Probably Authentic"
        case 71...85: return "Likely Authentic"
        default:      return "Highly Authentic"
        }
    }
}

// MARK: – Errors
enum AIError: LocalizedError {
    case missingAPIKey, imageEncodingFailed, apiError(String), emptyResponse, parseError

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:         return "Groq API key not configured in Info.plist."
        case .imageEncodingFailed:   return "Failed to encode the image."
        case .apiError(let msg):     return "API error: \(msg)"
        case .emptyResponse:         return "Empty response from AI."
        case .parseError:            return "Could not parse AI response."
        }
    }
}
