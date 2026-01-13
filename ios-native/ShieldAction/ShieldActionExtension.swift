import ManagedSettings
import ManagedSettingsUI
import DeviceActivity

/**
 * Shield Action Extension
 *
 * This handles what happens when the user taps buttons on the shield.
 * - Primary Button: "Begin Prayer" - Opens the app
 * - Secondary Button: "Not Now" - Dismisses the shield temporarily
 */
class ShieldActionExtension: ShieldActionDelegate {

    /**
     * Called when user taps "Begin Prayer" (primary button)
     */
    override func handle(action: ShieldAction, for application: ApplicationToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {

        switch action {
        case .primaryButtonPressed:
            // User wants to pray - open the Sacred app to lock screen
            handleBeginPrayer(completionHandler: completionHandler)

        case .secondaryButtonPressed:
            // User dismissed - allow them to continue temporarily
            handleDismissPrayer(completionHandler: completionHandler)

        @unknown default:
            completionHandler(.close)
        }
    }

    /**
     * Called when user taps button on website shield
     */
    override func handle(action: ShieldAction, for webDomain: WebDomainToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {

        switch action {
        case .primaryButtonPressed:
            handleBeginPrayer(completionHandler: completionHandler)

        case .secondaryButtonPressed:
            handleDismissPrayer(completionHandler: completionHandler)

        @unknown default:
            completionHandler(.close)
        }
    }

    /**
     * Called when user taps button on category shield
     */
    override func handle(action: ShieldAction, for category: ActivityCategoryToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {

        switch action {
        case .primaryButtonPressed:
            handleBeginPrayer(completionHandler: completionHandler)

        case .secondaryButtonPressed:
            handleDismissPrayer(completionHandler: completionHandler)

        @unknown default:
            completionHandler(.close)
        }
    }

    // MARK: - Action Handlers

    /**
     * Handle "Begin Prayer" button tap
     */
    private func handleBeginPrayer(completionHandler: @escaping (ShieldActionResponse) -> Void) {
        // Log the action
        NSLog("🙏 User tapped Begin Prayer")

        // Store that user wants to pray in shared defaults
        let sharedDefaults = UserDefaults(suiteName: "group.com.sacred.app")
        sharedDefaults?.set(true, forKey: "userWantsToPray")
        sharedDefaults?.set(Date(), forKey: "lastPrayerAction")
        sharedDefaults?.synchronize()

        // Deep link into the Sacred app to show lock screen
        // The URL scheme is defined in app.json: sacred://
        if let url = URL(string: "sacred://prayer-lock") {
            completionHandler(.defer)

            // Open the app
            // Note: We can't directly call UIApplication.shared.open in an extension
            // Instead, we use .defer which tells iOS to open the app
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                NSLog("✅ Opening Sacred app for prayer")
            }
        } else {
            // Fallback: just close the shield
            completionHandler(.close)
        }
    }

    /**
     * Handle "Not Now" button tap
     */
    private func handleDismissPrayer(completionHandler: @escaping (ShieldActionResponse) -> Void) {
        // Log the dismissal
        NSLog("❌ User dismissed prayer")

        // Store dismissal in shared defaults
        let sharedDefaults = UserDefaults(suiteName: "group.com.sacred.app")
        sharedDefaults?.set(false, forKey: "userWantsToPray")
        sharedDefaults?.set(Date(), forKey: "lastPrayerDismissal")
        sharedDefaults?.synchronize()

        // Option 1: Keep the shield (user must pray)
        // completionHandler(.none)

        // Option 2: Temporarily allow access (5 minutes)
        // This requires more complex logic with DeviceActivity schedules

        // For now: Just close the shield
        // You can customize this behavior based on your requirements
        completionHandler(.close)

        // Note: If you want to re-show the shield after X minutes,
        // you would need to reschedule a DeviceActivity event
    }
}
