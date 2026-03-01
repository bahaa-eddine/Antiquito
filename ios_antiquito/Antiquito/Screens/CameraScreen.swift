import SwiftUI
import AVFoundation

struct CameraScreen: View {
    @Binding var showCamera: Bool
    @Binding var showPaywall: Bool
    @EnvironmentObject var store: AppStore
    @StateObject private var camera = CameraController()
    @State private var capturedImage: UIImage?
    @State private var showPreview = false
    @State private var flashOpacity = 0.0

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            // Camera preview
            CameraPreview(controller: camera)
                .ignoresSafeArea()

            // Shutter flash overlay
            Color.white
                .opacity(flashOpacity)
                .ignoresSafeArea()
                .allowsHitTesting(false)

            // Top bar
            VStack {
                HStack {
                    // Flash toggle
                    Button {
                        camera.toggleFlash()
                    } label: {
                        Image(systemName: camera.flashMode == .on ? "bolt.fill" : "bolt.slash.fill")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(camera.flashMode == .on ? .yellow : .white)
                            .frame(width: 44, height: 44)
                            .background(Color.black.opacity(0.35))
                            .clipShape(Circle())
                    }

                    Spacer()
                    Text("ANTIQUITO")
                        .font(.system(size: 14, weight: .bold))
                        .kerning(3)
                        .foregroundColor(.white)
                    Spacer()

                    // Plan badge / close
                    PlanBadge(dark: true) { showCamera = false }
                        .environmentObject(store)
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)

                Spacer()

                Text("Point camera at any antique object")
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.6))
                    .padding(.bottom, 12)

                // Bottom controls
                HStack {
                    // Flip camera
                    Button { camera.toggleCamera() } label: {
                        Image(systemName: "camera.rotate.fill")
                            .font(.system(size: 22))
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                            .background(Color.white.opacity(0.15))
                            .clipShape(Circle())
                    }

                    Spacer()

                    // Shutter
                    Button { capture() } label: {
                        ZStack {
                            Circle().stroke(Color.white, lineWidth: 4).frame(width: 76, height: 76)
                            Circle().fill(Color.white).frame(width: 62, height: 62)
                        }
                    }
                    .disabled(camera.isTaking)

                    Spacer()
                    // Mirror spacer
                    Color.clear.frame(width: 44, height: 44)
                }
                .padding(.horizontal, 36)
                .padding(.bottom, 16)
            }
            .background(
                LinearGradient(
                    colors: [Color.black.opacity(0.55), Color.clear, Color.clear, Color.black.opacity(0.72)],
                    startPoint: .top, endPoint: .bottom
                )
                .ignoresSafeArea()
            )
        }
        .safeAreaInset(edge: .top) { Color.clear.frame(height: 0) }
        .onAppear { camera.start() }
        .onDisappear { camera.stop() }
        .fullScreenCover(isPresented: $showPreview) {
            if let img = capturedImage {
                PreviewScreen(image: img, showPreview: $showPreview, showCamera: $showCamera, showPaywall: $showPaywall)
                    .environmentObject(store)
            }
        }
    }

    private func capture() {
        camera.takePhoto { image in
            guard let image else { return }
            // Flash animation
            withAnimation(.easeOut(duration: 0.06)) { flashOpacity = 1 }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.06) {
                withAnimation(.easeIn(duration: 0.18)) { flashOpacity = 0 }
            }
            capturedImage = image
            showPreview   = true
        }
    }
}

// MARK: – AVFoundation controller
final class CameraController: NSObject, ObservableObject, AVCapturePhotoCaptureDelegate {
    @Published var flashMode: AVCaptureDevice.FlashMode = .off
    @Published var isTaking = false

    let session = AVCaptureSession()
    private var output = AVCapturePhotoOutput()
    private var position: AVCaptureDevice.Position = .back
    private var completion: ((UIImage?) -> Void)?

    func start() {
        guard AVCaptureDevice.authorizationStatus(for: .video) != .denied else { return }
        Task(priority: .userInitiated) {
            if AVCaptureDevice.authorizationStatus(for: .video) == .notDetermined {
                await AVCaptureDevice.requestAccess(for: .video)
            }
            configureSession()
            session.startRunning()
        }
    }

    func stop() { session.stopRunning() }

    func toggleFlash() {
        flashMode = flashMode == .off ? .on : .off
    }

    func toggleCamera() {
        position = position == .back ? .front : .back
        configureSession()
    }

    func takePhoto(completion: @escaping (UIImage?) -> Void) {
        guard !isTaking else { return }
        isTaking = true
        self.completion = completion
        let settings = AVCapturePhotoSettings()
        settings.flashMode = flashMode
        output.capturePhoto(with: settings, delegate: self)
    }

    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        isTaking = false
        guard error == nil, let data = photo.fileDataRepresentation(),
              let image = UIImage(data: data) else {
            completion?(nil); return
        }
        completion?(image)
    }

    private func configureSession() {
        session.beginConfiguration()
        session.inputs.forEach { session.removeInput($0) }
        if let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position),
           let input = try? AVCaptureDeviceInput(device: device) {
            if session.canAddInput(input)  { session.addInput(input) }
            if session.canAddOutput(output){ session.addOutput(output) }
        }
        session.commitConfiguration()
    }
}

// MARK: – SwiftUI camera preview bridge
struct CameraPreview: UIViewRepresentable {
    let controller: CameraController

    func makeUIView(context: Context) -> PreviewView {
        let view = PreviewView()
        view.videoPreviewLayer.session = controller.session
        view.videoPreviewLayer.videoGravity = .resizeAspectFill
        return view
    }

    func updateUIView(_ uiView: PreviewView, context: Context) {}
}

class PreviewView: UIView {
    override class var layerClass: AnyClass { AVCaptureVideoPreviewLayer.self }
    var videoPreviewLayer: AVCaptureVideoPreviewLayer { layer as! AVCaptureVideoPreviewLayer }
}
