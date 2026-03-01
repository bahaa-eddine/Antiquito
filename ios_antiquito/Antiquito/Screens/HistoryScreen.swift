import SwiftUI

struct HistoryScreen: View {
    @EnvironmentObject var store: AppStore
    @Binding var showPaywall: Bool
    @State private var viewingScan: ScanRecord?

    var body: some View {
        NavigationStack {
            ZStack {
                AppColors.background.ignoresSafeArea()

                if store.scanHistory.isEmpty {
                    EmptyHistoryView()
                } else {
                    List {
                        ForEach(store.scanHistory) { record in
                            ScanHistoryCard(record: record)
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                                .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                                .onTapGesture { viewingScan = record }
                        }
                        .onDelete { store.deleteScanRecords(at: $0) }
                    }
                    .listStyle(.plain)
                    .background(AppColors.background)
                    .scrollContentBackground(.hidden)
                }
            }
            .navigationTitle("My Scans")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    PlanBadge(dark: false) { if !store.isPremium { showPaywall = true } }
                        .environmentObject(store)
                }
            }
            .sheet(item: $viewingScan) { record in
                ScanDetailSheet(record: record)
            }
        }
    }
}

// MARK: – Scan detail sheet (re-uses ResultDetailView without the CTA)
struct ScanDetailSheet: View {
    let record: ScanRecord
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                ResultDetailView(
                    result: record.result,
                    image: UIImage(data: record.imageData),
                    onScanAnother: { dismiss() }
                )
            }
            .navigationTitle(record.result.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") { dismiss() }
                        .foregroundColor(AppColors.primary)
                }
            }
        }
    }
}

// MARK: – Empty state
struct EmptyHistoryView: View {
    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle().fill(AppColors.surfaceAlt).frame(width: 96, height: 96)
                Image(systemName: "camera")
                    .font(.system(size: 40))
                    .foregroundColor(AppColors.primary)
            }
            Text("No Scans Yet")
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(AppColors.text)
            Text("Tap the camera button below to photograph your first antique.")
                .font(.body)
                .foregroundColor(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            HStack(spacing: 6) {
                Image(systemName: "arrow.down")
                    .foregroundColor(AppColors.primary)
                Text("Use the camera button")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(AppColors.primary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(AppColors.surfaceAlt)
            .cornerRadius(99)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.bottom, 80)
    }
}
