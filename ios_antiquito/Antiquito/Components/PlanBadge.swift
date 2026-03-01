import SwiftUI

// Mirrors src/components/PlanBadge.tsx
struct PlanBadge: View {
    @EnvironmentObject var store: AppStore
    var dark: Bool = false
    var onPress: (() -> Void)? = nil

    private var scansLeft: Int { max(0, IAPConfig.freeScanLimit - store.freeScansUsed) }
    private var exhausted: Bool { !store.isPremium && scansLeft == 0 }

    private var bg: Color {
        if dark {
            return store.isPremium ? Color(hex: "8B6914").opacity(0.55)
                 : exhausted       ? Color(hex: "C0392B").opacity(0.45)
                 :                   Color.black.opacity(0.45)
        } else {
            return store.isPremium ? Color(hex: "FBF5E8")
                 : exhausted       ? AppColors.fakeLight
                 :                   AppColors.surfaceAlt
        }
    }

    private var border: Color {
        if dark {
            return store.isPremium ? AppColors.primary
                 : exhausted       ? AppColors.fake
                 :                   Color.white.opacity(0.2)
        } else {
            return store.isPremium ? AppColors.primary
                 : exhausted       ? AppColors.fake
                 :                   AppColors.border
        }
    }

    private var textColor: Color {
        if dark {
            return store.isPremium ? AppColors.primary
                 : exhausted       ? Color(hex: "FF6B5B")
                 :                   Color.white.opacity(0.85)
        } else {
            return store.isPremium ? AppColors.primary
                 : exhausted       ? AppColors.fake
                 :                   AppColors.textSecondary
        }
    }

    private var label: String {
        store.isPremium ? "PREMIUM"
        : exhausted     ? "UPGRADE"
        : "\(scansLeft)/\(IAPConfig.freeScanLimit) FREE"
    }

    var body: some View {
        Group {
            if let onPress {
                Button(action: onPress) { content }
                    .buttonStyle(.plain)
            } else {
                content
            }
        }
    }

    private var content: some View {
        HStack(spacing: 4) {
            if store.isPremium {
                Image(systemName: "trophy.fill")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(textColor)
            } else if exhausted {
                Image(systemName: "lock.fill")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(textColor)
            }
            Text(label)
                .font(.system(size: 10, weight: .bold))
                .kerning(0.8)
                .foregroundColor(textColor)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(bg)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(border, lineWidth: 1))
    }
}
