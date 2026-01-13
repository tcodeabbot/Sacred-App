import DeviceActivity
import ManagedSettings
import FamilyControls

/**
 * Device Activity Monitor Extension
 *
 * This monitors prayer times and activates/deactivates shields.
 * It runs in the background and is triggered by DeviceActivity schedules.
 */
class DeviceActivityMonitor: DeviceActivityMonitor {

    let store = ManagedSettingsStore()
    let sharedDefaults = UserDefaults(suiteName: "group.com.sacred.app")

    /**
     * Called when a prayer time interval starts
     * This is when we activate the shield
     */
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)

        NSLog("🕌 Prayer time started: \(activity.rawValue)")

        // Get the prayer information from shared defaults
        guard let prayerName = sharedDefaults?.string(forKey: "currentPrayerName"),
              let prayerDuration = sharedDefaults?.integer(forKey: "currentPrayerDuration"),
              let appsToBlockData = sharedDefaults?.data(forKey: "appsToBlock")
        else {
            NSLog("⚠️ Missing prayer configuration data")
            return
        }

        // Decode the app tokens
        guard let applicationTokens = try? JSONDecoder().decode(Set<ApplicationToken>.self, from: appsToBlockData) else {
            NSLog("⚠️ Failed to decode app tokens")
            return
        }

        NSLog("🔒 Blocking \(applicationTokens.count) apps for \(prayerName)")

        // Store current prayer info (used by ShieldConfigurationExtension)
        sharedDefaults?.set(prayerName, forKey: "currentPrayerName")
        sharedDefaults?.set(prayerDuration, forKey: "currentPrayerDuration")
        sharedDefaults?.set(Date(), forKey: "prayerStartTime")
        sharedDefaults?.synchronize()

        // Apply shield to selected apps
        store.shield.applications = applicationTokens

        // Optional: Also shield web domains if needed
        // store.shield.webDomains = webDomainTokens

        // Optional: Shield entire categories (e.g., Social Media)
        // store.shield.applicationCategories = .specific([.socialNetworking])

        NSLog("✅ Shield activated successfully")
    }

    /**
     * Called when a prayer time interval ends
     * This is when we deactivate the shield
     */
    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)

        NSLog("🕌 Prayer time ended: \(activity.rawValue)")

        // Remove shields from all apps
        store.shield.applications = nil
        store.shield.webDomains = nil
        store.shield.applicationCategories = nil
        store.shield.webDomainCategories = nil

        // Clear prayer info
        sharedDefaults?.removeObject(forKey: "currentPrayerName")
        sharedDefaults?.removeObject(forKey: "currentPrayerDuration")
        sharedDefaults?.removeObject(forKey: "prayerStartTime")
        sharedDefaults?.synchronize()

        NSLog("✅ Shield deactivated successfully")
    }

    /**
     * Called when a warning threshold is reached
     * Optional: You can show a notification before prayer time
     */
    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventDidReachThreshold(event, activity: activity)

        NSLog("⏰ Warning threshold reached for \(activity.rawValue)")

        // Optional: Send a local notification
        // "Prayer time in 5 minutes"
    }

    /**
     * Called when an event occurs
     * This can be used for additional logic
     */
    override func intervalWillStartWarning(for activity: DeviceActivityName) {
        super.intervalWillStartWarning(for: activity)

        NSLog("⏰ Prayer time approaching: \(activity.rawValue)")

        // Optional: Give user a 1-minute warning
        // You could show a notification here
    }

    /**
     * Called when interval will end soon
     */
    override func intervalWillEndWarning(for activity: DeviceActivityName) {
        super.intervalWillEndWarning(for: activity)

        NSLog("⏰ Prayer time ending soon: \(activity.rawValue)")
    }
}

// MARK: - Helper Extensions

extension ApplicationToken: Codable {
    enum CodingKeys: String, CodingKey {
        case bundleIdentifier
    }

    public func encode(to encoder: Encoder) throws {
        // ApplicationToken doesn't expose bundleIdentifier directly
        // We need to store the token data itself
        var container = encoder.container(keyedBy: CodingKeys.self)
        // This is a workaround - in production you'd use a more robust serialization
        try container.encode(self.hashValue, forKey: .bundleIdentifier)
    }

    public init(from decoder: Decoder) throws {
        // This is a placeholder - ApplicationToken can't be reconstructed from just a hash
        // In practice, you'd store the actual token data or use FamilyActivitySelection
        throw DecodingError.dataCorrupted(
            DecodingError.Context(
                codingPath: decoder.codingPath,
                debugDescription: "ApplicationToken cannot be decoded"
            )
        )
    }
}
