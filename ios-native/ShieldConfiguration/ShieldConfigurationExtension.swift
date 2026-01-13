import ManagedSettings
import ManagedSettingsUI
import SwiftUI

/**
 * Shield Configuration Extension
 *
 * This defines what the user sees when they try to open a blocked app.
 * Apple calls this the "Shield" - it's the full-screen overlay that appears.
 */
class ShieldConfigurationExtension: ShieldConfigurationDataSource {

    /**
     * Configuration for application shields
     * This is called when a blocked app is launched
     */
    override func configuration(shielding application: Application) -> ShieldConfiguration {
        // Get prayer information from shared UserDefaults
        let sharedDefaults = UserDefaults(suiteName: "group.com.sacred.app")
        let prayerName = sharedDefaults?.string(forKey: "currentPrayerName") ?? "Prayer Time"
        let prayerDuration = sharedDefaults?.integer(forKey: "currentPrayerDuration") ?? 5

        return ShieldConfiguration(
            backgroundBlurStyle: .systemThickMaterial,
            backgroundColor: UIColor(red: 0.1, green: 0.1, blue: 0.3, alpha: 0.95),
            icon: UIImage(systemName: "moon.stars.fill"),
            title: ShieldConfiguration.Label(
                text: prayerName,
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: "It's time to pause and pray 🙏",
                color: .white.withAlphaComponent(0.8)
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Begin Prayer",
                color: .white
            ),
            primaryButtonBackgroundColor: UIColor(red: 0.3, green: 0.5, blue: 0.9, alpha: 1.0),
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Not Now",
                color: .white.withAlphaComponent(0.7)
            )
        )
    }

    /**
     * Configuration for website shields
     * Optional: If you want to block websites too
     */
    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemThickMaterial,
            backgroundColor: UIColor(red: 0.1, green: 0.1, blue: 0.3, alpha: 0.95),
            icon: UIImage(systemName: "moon.stars.fill"),
            title: ShieldConfiguration.Label(
                text: "Prayer Time",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: "Take a moment to connect with your faith 🙏",
                color: .white.withAlphaComponent(0.8)
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Begin Prayer",
                color: .white
            ),
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Not Now",
                color: .white.withAlphaComponent(0.7)
            )
        )
    }

    /**
     * Configuration for app category shields
     * Called when an entire category is blocked (e.g., all social media apps)
     */
    override func configuration(shielding applicationCategory: ActivityCategory) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemThickMaterial,
            backgroundColor: UIColor(red: 0.1, green: 0.1, blue: 0.3, alpha: 0.95),
            icon: UIImage(systemName: "moon.stars.fill"),
            title: ShieldConfiguration.Label(
                text: "Prayer Time",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: "This category is blocked during prayer time 🙏",
                color: .white.withAlphaComponent(0.8)
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Begin Prayer",
                color: .white
            ),
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Not Now",
                color: .white.withAlphaComponent(0.7)
            )
        )
    }

    /**
     * Configuration for web category shields
     */
    override func configuration(shielding webDomainCategory: ActivityCategory) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemThickMaterial,
            backgroundColor: UIColor(red: 0.1, green: 0.1, blue: 0.3, alpha: 0.95),
            icon: UIImage(systemName: "moon.stars.fill"),
            title: ShieldConfiguration.Label(
                text: "Prayer Time",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: "This content is blocked during prayer time 🙏",
                color: .white.withAlphaComponent(0.8)
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Begin Prayer",
                color: .white
            ),
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Not Now",
                color: .white.withAlphaComponent(0.7)
            )
        )
    }
}
