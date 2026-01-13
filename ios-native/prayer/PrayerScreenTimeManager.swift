import Foundation
import FamilyControls
import ManagedSettings
import DeviceActivity
import React

@objc(PrayerScreenTimeManager)
class PrayerScreenTimeManager: NSObject {
  
  private let store = ManagedSettingsStore()
  private let center = AuthorizationCenter.shared
  
  // MARK: - Authorization
  
  @objc
  func requestScreenTimeAuthorization(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        try await center.requestAuthorization(for: .individual)
        resolve(true)
      } catch {
        reject("AUTH_ERROR", "Failed to authorize Screen Time", error)
      }
    }
  }
  
  @objc
  func checkScreenTimeAuthorization(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let authStatus = center.authorizationStatus
    
    switch authStatus {
    case .notDetermined:
      resolve("notDetermined")
    case .denied:
      resolve("denied")
    case .approved:
      resolve("approved")
    @unknown default:
      resolve("unknown")
    }
  }
  
  // MARK: - App Selection
  
  @objc
  func selectAppsToBlock(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      // Present FamilyActivityPicker for app selection
      // This is handled by presenting a modal in React Native
      // and using the native view component
      resolve(true)
    }
  }
  
  // MARK: - Shield Management
  
  @objc
  func applyShield(
    _ appTokens: [String],
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // Convert token strings to ApplicationToken objects
    // Note: In production, you'd store and retrieve actual ApplicationToken objects
    
    // For now, shield all selected apps
    store.shield.applications = .all()
    
    resolve(true)
  }
  
  @objc
  func removeShield(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // Remove all shields
    store.shield.applications = nil
    store.shield.applicationCategories = nil
    store.shield.webDomains = nil
    
    resolve(true)
  }
  
  // MARK: - Prayer Schedule Monitoring
  
  @objc
  func schedulePrayerShields(
    _ prayerSchedule: [[String: Any]],
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // Schedule DeviceActivity monitors for each prayer time
    for prayer in prayerSchedule {
      guard let prayerId = prayer["id"] as? String,
            let timeString = prayer["time"] as? String,
            let duration = prayer["duration"] as? Int,
            let enabled = prayer["enabled"] as? Bool,
            enabled else {
        continue
      }
      
      // Parse time string (HH:mm format)
      let components = timeString.split(separator: ":")
      guard components.count == 2,
            let hour = Int(components[0]),
            let minute = Int(components[1]) else {
        continue
      }
      
      // Create schedule for this prayer
      schedulePrayerMonitor(
        id: prayerId,
        hour: hour,
        minute: minute,
        duration: duration
      )
    }
    
    resolve(true)
  }
  
  private func schedulePrayerMonitor(id: String, hour: Int, minute: Int, duration: Int) {
    let schedule = DeviceActivitySchedule(
      intervalStart: DateComponents(hour: hour, minute: minute),
      intervalEnd: DateComponents(hour: hour, minute: minute + duration),
      repeats: true
    )
    
    let activityName = DeviceActivityName("prayer_\(id)")
    
    do {
      try DeviceActivityCenter().startMonitoring(activityName, during: schedule)
      print("✅ Scheduled prayer shield for \(hour):\(minute)")
    } catch {
      print("❌ Failed to schedule prayer shield: \(error)")
    }
  }
  
  @objc
  func stopAllPrayerMonitoring(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DeviceActivityCenter().stopMonitoring()
    resolve(true)
  }
  
  // MARK: - React Native Bridge
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
