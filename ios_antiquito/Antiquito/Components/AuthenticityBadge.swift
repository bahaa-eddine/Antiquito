import SwiftUI

struct AuthenticityBadge: View {
    let authenticity: AuthenticityLabel

    private var color: Color {
        switch authenticity {
        case .authentic:    return AppColors.real
        case .reproduction: return AppColors.fake
        case .inconclusive: return AppColors.uncertain
        }
    }

    private var icon: String {
        switch authenticity {
        case .authentic:    return "checkmark.seal.fill"
        case .reproduction: return "xmark.seal.fill"
        case .inconclusive: return "questionmark.circle.fill"
        }
    }

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 14))
            Text(authenticity.rawValue.uppercased())
                .font(.system(size: 11, weight: .bold))
                .kerning(0.5)
        }
        .foregroundColor(color)
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(color.opacity(0.15))
        .overlay(RoundedRectangle(cornerRadius: 99).stroke(color.opacity(0.35), lineWidth: 1))
        .cornerRadius(99)
        .background(Color.black.opacity(0.25).cornerRadius(99))
    }
}
