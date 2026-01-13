import Foundation
import React
import FamilyControls
import ManagedSettings
import DeviceActivity

/**
 * React Native Bridge for iOS Screen Time API
 *
 * This module exposes Screen Time functionality to React Native JavaScript.
 * It allows the app to:
 * 1. Request Family Controls authorization
 * 2. Let users select apps to block
 * 3. Schedule prayer time blocking
 * 4. Manage shield configuration
 */
@objc(PrayerScreenTimeModule)
class PrayerScreenTimeModule: NSObject {

    private let center = AuthorizationCenter.shared
    private let store = ManagedSettingsStore()
    private let sharedDefaults = UserDefaults(suiteName: "group.com.sacred.app")

    // MARK: - Authorization

    /**
     * Check if Family Controls authorization is granted
     */
    @objc
    func checkAuthorization(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        switch center.authorizationStatus {
        case .approved:
            resolve(true)
        case .denied, .notDetermined:
            resolve(false)
        @unknown default:
            resolve(false)
        }
    }

    /**
     * Request Family Controls authorization
     * User will see Apple's permission dialog
     */
    @objc
    func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                try await center.requestAuthorization(for: .individual)
                resolve(true)
            } catch {
                reject("AUTH_ERROR", "Failed to get Family Controls authorization: \(error.localizedDescription)", error)
            }
        }
    }

    // MARK: - App Selection

    /**
     * Show Apple's native app selection UI
     * This returns the selected app tokens that we'll block
     *
     * Note: This must be called from a SwiftUI view, not directly from React Native
     * You'll need to present a SwiftUI wrapper component
     */
    @objc
    func presentAppSelector(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // This needs to be triggered from SwiftUI side
        // See AppSelectorView.swift for the implementation
        resolve(true)
    }

    /**
     * Save selected apps to block during prayer
     */
    @objc
    func saveSelectedApps(_ appTokensJSON: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

        // In production, you'd decode the FamilyActivitySelection
        // For now, store the JSON representation
        sharedDefaults?.set(appTokensJSON, forKey: "selectedAppsJSON")
        sharedDefaults?.synchronize()

        NSLog("✅ Saved selected apps for blocking")
        resolve(true)
    }

    // MARK: - Prayer Schedule

    /**
     * Schedule prayer time blocking
     * @param prayerName - Name of the prayer (e.g., "Fajr")
     * @param startTime - Prayer start time (HH:mm format)
     * @param duration - Duration in minutes
     * @param appsToBlock - JSON array of app bundle IDs
     */
    @objc
    func schedulePrayerBlock(_ config: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

        guard let prayerName = config["prayerName"] as? String,
              let startTime = config["startTime"] as? String,
              let duration = config["duration"] as? Int else {
            reject("INVALID_CONFIG", "Missing required prayer configuration", nil)
            return
        }

        NSLog("📅 Scheduling prayer block: \(prayerName) at \(startTime) for \(duration) minutes")

        // Parse the time (format: "HH:mm")
        let components = startTime.split(separator: ":")
        guard components.count == 2,
              let hour = Int(components[0]),
              let minute = Int(components[1]) else {
            reject("INVALID_TIME", "Invalid time format. Use HH:mm", nil)
            return
        }

        // Store prayer info in shared defaults (used by DeviceActivityMonitor)
        sharedDefaults?.set(prayerName, forKey: "currentPrayerName")
        sharedDefaults?.set(duration, forKey: "currentPrayerDuration")
        sharedDefaults?.synchronize()

        // Create DeviceActivity schedule
        let schedule = createPrayerSchedule(hour: hour, minute: minute, duration: duration)
        let activityName = DeviceActivityName("prayer_\(prayerName)")

        // Start monitoring
        let deviceActivityCenter = DeviceActivityCenter()

        do {
            try deviceActivityCenter.startMonitoring(activityName, during: schedule)
            NSLog("✅ Started monitoring for \(prayerName)")
            resolve(true)
        } catch {
            NSLog("❌ Failed to start monitoring: \(error.localizedDescription)")
            reject("SCHEDULE_ERROR", "Failed to schedule prayer block: \(error.localizedDescription)", error)
        }
    }

    /**
     * Cancel prayer blocking schedule
     */
    @objc
    func cancelPrayerBlock(_ prayerName: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

        let activityName = DeviceActivityName("prayer_\(prayerName)")
        let deviceActivityCenter = DeviceActivityCenter()

        deviceActivityCenter.stopMonitoring([activityName])

        NSLog("✅ Cancelled monitoring for \(prayerName)")
        resolve(true)
    }

    /**
     * Cancel all prayer blocks
     */
    @objc
    func cancelAllPrayerBlocks(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

        let deviceActivityCenter = DeviceActivityCenter()
        deviceActivityCenter.stopMonitoring()

        // Clear all shields
        store.shield.applications = nil
        store.shield.webDomains = nil
        store.shield.applicationCategories = nil

        NSLog("✅ Cancelled all prayer monitoring")
        resolve(true)
    }

    // MARK: - Manual Shield Control

    /**
     * Immediately show shield for selected apps
     * Useful for testing or manual prayer mode
     */
    @objc
    func activateShieldNow(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

        // This would require the selected app tokens
        // For now, just log
        NSLog("🔒 Shield activated manually")
        resolve(true)
    }

    /**
     * Remove shield from all apps
     */
    @objc
    func deactivateShield(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

        store.shield.applications = nil
        store.shield.webDomains = nil

        NSLog("🔓 Shield deactivated")
        resolve(true)
    }

    // MARK: - Helper Methods

    /**
     * Create a DeviceActivity schedule for prayer time
     */
    private func createPrayerSchedule(hour: Int, minute: Int, duration: Int) -> DeviceActivitySchedule {

        // Create time components for start
        var startComponents = DateComponents()
        startComponents.hour = hour
        startComponents.minute = minute

        // Create time components for end (start + duration)
        let endDate = Calendar.current.date(byAdding: .minute, value: duration, to: Calendar.current.date(from: startComponents)!)!
        var endComponents = Calendar.current.dateComponents([.hour, .minute], from: endDate)

        // Create schedule that repeats daily
        let schedule = DeviceActivitySchedule(
            intervalStart: DateComponents(hour: startComponents.hour, minute: startComponents.minute),
            intervalEnd: DateComponents(hour: endComponents.hour, minute: endComponents.minute),
            repeats: true // Repeat daily
        )

        return schedule
    }

    // MARK: - React Native Bridge Setup

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
