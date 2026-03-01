import SwiftUI

struct ResultScreen: View {
    @Binding var showResult: Bool
    @Binding var showCamera: Bool
    @EnvironmentObject var store: AppStore
    @State private var hasAnalyzed = false

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()

                if store.isLoading {
                    LoadingView()
                } else if let result = store.analysisResult {
                    ResultDetailView(result: result, image: store.capturedImage) {
                        // Scan Another
                        store.reset()
                        showResult = false
                        showCamera = false
                    }
                } else if let err = store.scanError {
                    ErrorView(message: err) {
                        store.scanError = nil
                        showResult = false
                    }
                }
            }
            .navigationBarHidden(true)
        }
        .onAppear {
            guard !hasAnalyzed else { return }
            hasAnalyzed = true
            analyze()
        }
    }

    private func analyze() {
        guard let image = store.capturedImage else { return }
        store.isLoading = true
        store.scanError = nil
        Task {
            do {
                let result = try await AIService.analyzeImage(image)
                await MainActor.run {
                    store.analysisResult = result
                    store.isLoading = false
                    // Save to history
                    if let data = image.jpegData(compressionQuality: 0.7) {
                        let record = ScanRecord(
                            id: UUID().uuidString,
                            imageData: data,
                            result: result,
                            createdAt: Date()
                        )
                        store.addScanRecord(record)
                    }
                }
            } catch {
                await MainActor.run {
                    store.scanError = error.localizedDescription
                    store.isLoading = false
                }
            }
        }
    }
}

// MARK: – Result detail
struct ResultDetailView: View {
    let result: AnalysisResult
    let image: UIImage?
    let onScanAnother: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Image header
                if let img = image {
                    Image(uiImage: img)
                        .resizable()
                        .scaledToFill()
                        .frame(height: 260)
                        .clipped()
                        .overlay(alignment: .topLeading) {
                            AuthenticityBadge(authenticity: result.authenticity)
                                .padding(16)
                        }
                }

                VStack(spacing: 20) {
                    // Title & confidence
                    VStack(spacing: 6) {
                        Text(result.title)
                            .font(.system(size: 22, weight: .bold, design: .serif))
                            .foregroundColor(AppColors.text)
                            .multilineTextAlignment(.center)
                        Text(result.confidenceLabel)
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(authenticityColor(result.authenticity))
                    }

                    // Confidence bar
                    ConfidenceBarView(confidence: result.confidence)

                    // Details
                    InfoCard(items: [
                        ("clock", "Period",      result.estimatedPeriod),
                        ("mappin", "Origin",     result.origin),
                    ])

                    // Description
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Expert Analysis", systemImage: "text.magnifyingglass")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(AppColors.text)
                        Text(result.description)
                            .font(.body)
                            .foregroundColor(AppColors.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(16)
                    .background(AppColors.surface)
                    .cornerRadius(16)

                    // Pricing
                    if let price = result.estimatedPrice {
                        PriceCard(
                            label: result.authenticity == .reproduction ? "Replica Value" : "Estimated Value",
                            price: price,
                            color: authenticityColor(result.authenticity)
                        )
                    }
                    if let auth = result.authenticPrice {
                        PriceCard(label: "Genuine Original Worth", price: auth, color: AppColors.real)
                    }

                    // Scan another
                    Button(action: onScanAnother) {
                        Label("Scan Another Object", systemImage: "camera")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(AppColors.primary)
                            .cornerRadius(14)
                    }
                    .padding(.top, 8)
                }
                .padding(20)
            }
        }
    }

    private func authenticityColor(_ a: AuthenticityLabel) -> Color {
        switch a {
        case .authentic:    return AppColors.real
        case .reproduction: return AppColors.fake
        case .inconclusive: return AppColors.uncertain
        }
    }
}

// MARK: – Sub-views
struct ConfidenceBarView: View {
    let confidence: Int
    var body: some View {
        VStack(spacing: 6) {
            HStack {
                Text("Confidence score")
                    .font(.caption.weight(.semibold))
                    .foregroundColor(AppColors.textSecondary)
                Spacer()
                Text("\(confidence)%")
                    .font(.caption.bold())
                    .foregroundColor(AppColors.primary)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4).fill(AppColors.surfaceAlt).frame(height: 8)
                    RoundedRectangle(cornerRadius: 4)
                        .fill(AppColors.primary)
                        .frame(width: geo.size.width * CGFloat(confidence) / 100, height: 8)
                }
            }
            .frame(height: 8)
        }
        .padding(14)
        .background(AppColors.surface)
        .cornerRadius(12)
    }
}

struct InfoCard: View {
    let items: [(String, String, String)] // (icon, label, value)
    var body: some View {
        VStack(spacing: 0) {
            ForEach(Array(items.enumerated()), id: \.0) { idx, item in
                HStack(spacing: 12) {
                    Image(systemName: item.0)
                        .foregroundColor(AppColors.primary)
                        .frame(width: 20)
                    Text(item.1)
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(AppColors.textSecondary)
                    Spacer()
                    Text(item.2)
                        .font(.subheadline)
                        .foregroundColor(AppColors.text)
                        .multilineTextAlignment(.trailing)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                if idx < items.count - 1 {
                    Divider().padding(.horizontal, 16)
                }
            }
        }
        .background(AppColors.surface)
        .cornerRadius(16)
    }
}

struct PriceCard: View {
    let label: String
    let price: String
    let color: Color
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption.weight(.semibold))
                    .foregroundColor(AppColors.textSecondary)
                Text(price)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(color)
            }
            Spacer()
            Image(systemName: "tag.fill")
                .foregroundColor(color.opacity(0.5))
                .font(.title2)
        }
        .padding(16)
        .background(color.opacity(0.08))
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(color.opacity(0.2), lineWidth: 1))
    }
}

struct LoadingView: View {
    @State private var dots = ""
    var body: some View {
        VStack(spacing: 24) {
            ProgressView()
                .scaleEffect(1.5)
                .tint(AppColors.primary)
            Text("Analyzing antique\(dots)")
                .font(.headline)
                .foregroundColor(AppColors.textSecondary)
        }
        .onAppear {
            Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { t in
                dots = dots.count >= 3 ? "" : dots + "."
            }
        }
    }
}

struct ErrorView: View {
    let message: String
    let onDismiss: () -> Void
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(AppColors.fake)
            Text("Analysis Failed")
                .font(.title2.bold())
                .foregroundColor(AppColors.text)
            Text(message)
                .font(.body)
                .foregroundColor(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Button("Go Back", action: onDismiss)
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(AppColors.primary)
                .cornerRadius(14)
                .padding(.horizontal, 32)
        }
    }
}
