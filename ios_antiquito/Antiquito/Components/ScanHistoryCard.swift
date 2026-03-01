import SwiftUI

struct ScanHistoryCard: View {
    let record: ScanRecord

    private var authenticityColor: Color {
        switch record.result.authenticity {
        case .authentic:    return AppColors.real
        case .reproduction: return AppColors.fake
        case .inconclusive: return AppColors.uncertain
        }
    }

    var body: some View {
        HStack(spacing: 14) {
            // Thumbnail
            if let img = UIImage(data: record.imageData) {
                Image(uiImage: img)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 64, height: 64)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            } else {
                RoundedRectangle(cornerRadius: 12)
                    .fill(AppColors.surfaceAlt)
                    .frame(width: 64, height: 64)
                    .overlay(Image(systemName: "photo").foregroundColor(AppColors.textSecondary))
            }

            // Info
            VStack(alignment: .leading, spacing: 4) {
                Text(record.result.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(AppColors.text)
                    .lineLimit(1)

                Text(record.result.confidenceLabel)
                    .font(.caption.weight(.medium))
                    .foregroundColor(authenticityColor)

                Text(record.formattedDate)
                    .font(.caption)
                    .foregroundColor(AppColors.textSecondary)
            }

            Spacer()

            // Confidence circle
            ZStack {
                Circle()
                    .stroke(authenticityColor.opacity(0.2), lineWidth: 3)
                    .frame(width: 40, height: 40)
                Circle()
                    .trim(from: 0, to: CGFloat(record.result.confidence) / 100)
                    .stroke(authenticityColor, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .frame(width: 40, height: 40)
                Text("\(record.result.confidence)")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(authenticityColor)
            }

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundColor(AppColors.textSecondary)
        }
        .padding(14)
        .background(AppColors.surface)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 6, y: 2)
    }
}
