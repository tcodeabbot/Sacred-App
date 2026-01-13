import Foundation
import DeviceActivity
import FamilyControls
import ManagedSettings

// DeviceActivity Monitor Extension
// This extension runs when prayer times start/end to apply/remove shields

class PrayerActivityMonitor: DeviceActivityMonitor {
  
  let store = ManagedSettingsStore()
  
  override func intervalDidStart(for activity: DeviceActivityName) {
    super.intervalDidStart(for: activity)
    
    // Prayer time started - apply shield
    print("🙏 Prayer time started: \(activity)")
    
    // Shield all blocked apps
    store.shield.applications = .all()
    
    // Post notification to main app
    NotificationCenter.default.post(
      name: NSNotification.Name("PrayerTimeStarted"),
      object: nil,
      userInfo: ["activityName": activity.rawValue]
    )
  }
  
  override func intervalDidEnd(for activity: DeviceActivityName) {
    super.intervalDidEnd(for: activity)
    
    // Prayer time ended - remove shield
    print("✅ Prayer time ended: \(activity)")
    
    // Remove shields
    store.shield.applications = nil
    
    // Post notification to main app
    NotificationCenter.default.post(
      name: NSNotification.Name("PrayerTimeEnded"),
      object: nil,
      userInfo: ["activityName": activity.rawValue]
    )
  }
  
  override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
    super.eventDidReachThreshold(event, activity: activity)
    print("⚠️ Prayer activity event: \(event) for \(activity)")
  }
  
  override func intervalWillStartWarning(for activity: DeviceActivityName) {
    super.intervalWillStartWarning(for: activity)
    
    // 5 minutes before prayer time
    print("⏰ Prayer time approaching in 5 minutes: \(activity)")
    
    // Post notification to main app for warning
    NotificationCenter.default.post(
      name: NSNotification.Name("PrayerTimeWarning"),
      object: nil,
      userInfo: ["activityName": activity.rawValue]
    )
  }
  
  override func intervalWillEndWarning(for activity: DeviceActivityName) {
    super.intervalWillEndWarning(for: activity)
    
    // 5 minutes before prayer time ends
    print("⏰ Prayer time ending soon: \(activity)")
  }
}
