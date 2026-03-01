import SwiftUI

struct PreviewScreen: View {
    let image: UIImage
    @Binding var showPreview: Bool
    @Binding var showCamera: Bool
    @Binding var showPaywall: Bool
    @EnvironmentObject var store: AppStore
    @State private var showResult = false

    private var scansLeft: Int {
        max(0, IAPConfig.freeScanLimit - store.freeScansUsed)
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            Image(uiImage: image)
                .resizable()
                .scaledToFill()
                .ignoresSafeArea()

            // Gradient overlays
            VStack {
                LinearGradient(colors: [.black.opacity(0.55), .clear], startPoint: .top, endPoint: .bottom)
                    .frame(height: 140)
                Spacer()
                LinearGradient(colors: [.clear, .black.opacity(0.82)], startPoint: .top, endPoint: .bottom)
                    .frame(height: 320)
            }
            .ignoresSafeArea()
            .allowsHitTesting(false)

            VStack {
                // Top bar
                HStack {
                    Button { showPreview = false } label: {
                        Image(systemName: "arrow.left")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                            .background(Color.black.opacity(0.4))
                            .clipShape(Circle())
                    }
                    Spacer()
                    Text("Preview")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    Spacer()
                    Color.clear.frame(width: 44, height: 44)
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)

                Spacer()

                // Bottom CTA
                VStack(spacing: 10) {
                    Text("Ready to analyze?")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.white)

                    if !store.isPremium && store.freeScansUsed < IAPConfig.freeScanLimit {
                        Text("\(scansLeft) free scan\(scansLeft == 1 ? "" : "s") remaining")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(Color(hex: "FFD264").opacity(0.9))
                    }

                    Text("Our AI will examine this object and identify its authenticity, origin, and history.")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.65))
                        .multilineTextAlignment(.center)
                        .padding(.bottom, 4)

                    Button(action: handleAnalyze) {
                        HStack(spacing: 8) {
                            Image(systemName: "viewfinder.circle")
                            Text("Analyze Object")
                        }
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 54)
                        .background(AppColors.primary)
                        .cornerRadius(16)
                        .shadow(color: AppColors.primary.opacity(0.4), radius: 12, y: 4)
                    }

                    Button { showPreview = false } label: {
                        Text("Retake Photo")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                            .frame(height: 48)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 16)
            }
        }
        .fullScreenCover(isPresented: $showResult) {
            ResultScreen(showResult: $showResult, showCamera: $showCamera)
                .environmentObject(store)
        }
    }

    private func handleAnalyze() {
        if !store.isPremium {
            if store.freeScansUsed >= IAPConfig.freeScanLimit {
                showPreview = false
                showPaywall = true
                return
            }
            store.incrementFreeScans()
        }
        store.capturedImage  = image
        store.analysisResult = nil
        showResult = true
    }
}
