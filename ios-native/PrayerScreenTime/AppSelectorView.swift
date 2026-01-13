import SwiftUI
import FamilyControls

/**
 * SwiftUI View for App Selection
 *
 * This presents Apple's native FamilyActivityPicker which allows users
 * to select which apps should be blocked during prayer times.
 */
struct AppSelectorView: View {

    @State private var selection = FamilyActivitySelection()
    @State private var isPresented = false

    var onSelectionComplete: (FamilyActivitySelection) -> Void

    var body: some View {
        VStack(spacing: 20) {
            Text("Select Apps to Block")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Choose which apps should be blocked during prayer times")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Button(action: {
                isPresented = true
            }) {
                HStack {
                    Image(systemName: "apps.iphone")
                    Text("Select Apps")
                }
                .font(.headline)
                .foregroundColor(.white)
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.blue)
                .cornerRadius(12)
            }
            .padding(.horizontal)

            if !selection.applicationTokens.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Selected Apps")
                        .font(.headline)

                    Text("\(selection.applicationTokens.count) apps selected")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    Button(action: {
                        onSelectionComplete(selection)
                    }) {
                        Text("Save Selection")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.green)
                            .cornerRadius(12)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)
            }

            Spacer()
        }
        .padding(.top, 40)
        .familyActivityPicker(isPresented: $isPresented, selection: $selection)
    }
}

/**
 * View Controller wrapper for React Native
 *
 * This allows us to present the SwiftUI view from React Native
 */
class AppSelectorViewController: UIViewController {

    var onSelectionComplete: ((FamilyActivitySelection) -> Void)?

    override func viewDidLoad() {
        super.viewDidLoad()

        let selectorView = AppSelectorView { [weak self] selection in
            self?.onSelectionComplete?(selection)
            self?.dismiss(animated: true)
        }

        let hostingController = UIHostingController(rootView: selectorView)
        addChild(hostingController)
        view.addSubview(hostingController.view)

        hostingController.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            hostingController.view.topAnchor.constraint(equalTo: view.topAnchor),
            hostingController.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            hostingController.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            hostingController.view.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])

        hostingController.didMove(toParent: self)
    }
}

/**
 * React Native Bridge Extension
 *
 * This adds a method to present the app selector from React Native
 */
extension PrayerScreenTimeModule {

    @objc
    func presentAppSelectorUI(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

        DispatchQueue.main.async {
            guard let rootViewController = UIApplication.shared.windows.first?.rootViewController else {
                reject("NO_ROOT_VC", "Could not find root view controller", nil)
                return
            }

            let selectorVC = AppSelectorViewController()

            selectorVC.onSelectionComplete = { [weak self] selection in
                // Store the selection
                self?.handleAppSelection(selection)
                resolve(true)
            }

            rootViewController.present(selectorVC, animated: true)
        }
    }

    private func handleAppSelection(_ selection: FamilyActivitySelection) {
        // Store selected apps
        let appTokens = selection.applicationTokens

        NSLog("✅ User selected \(appTokens.count) apps to block")

        // Store in UserDefaults for DeviceActivityMonitor to use
        if let encoded = try? JSONEncoder().encode(appTokens) {
            sharedDefaults?.set(encoded, forKey: "appsToBlock")
            sharedDefaults?.synchronize()
        }

        // Update the current store if needed
        // store.shield.applications = appTokens
    }
}
