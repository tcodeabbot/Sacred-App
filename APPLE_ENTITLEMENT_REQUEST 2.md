# Family Controls Entitlement Request - Sacred

## Request Form Template

Use this when filling out the Family Controls Distribution Request form at:
https://developer.apple.com/contact/request/family-controls-distribution

---

## App Information

**App Name**: Sacred  
**Bundle ID**: com.sacred.app (update with your actual bundle ID)  
**Developer**: [Your Name/Company]  
**Category**: Health & Fitness / Lifestyle  
**Target Audience**: Adults seeking to maintain focus during prayer and spiritual practices

---

## Primary Use Case Explanation

### What is Sacred?

Sacred is a digital wellness application designed to help users maintain uninterrupted prayer and spiritual practice times by temporarily blocking distracting apps during their scheduled prayer periods.

### Why We Need Family Controls

Our app requires the Family Controls entitlement to implement automatic app restrictions that help users create distraction-free prayer environments. Specifically:

1. **Time-Based App Blocking**: Users schedule prayer times (e.g., 7:00 AM for 15 minutes), and Sacred automatically shields selected distracting apps (social media, games, entertainment) during these periods.

2. **User-Defined Restrictions**: Users explicitly choose which apps to block and when, giving them full control over their digital wellness journey.

3. **Authentic Need**: Without Family Controls, we can only send notifications that users may ignore. True app shielding is essential for helping users who struggle with digital distractions during spiritual practices.

### How We Use the API

**FamilyControls Framework**:
- Request user authorization for app management
- Allow users to select which apps to block via FamilyActivityPicker
- Respect user choices and consent at every step

**ManagedSettings Framework**:
- Apply app shields during scheduled prayer times
- Automatically remove shields after the prayer duration ends
- Never apply restrictions without explicit user configuration

**DeviceActivity Framework**:
- Monitor time-based prayer schedules
- Trigger app shields at user-specified times
- Provide warnings before prayer times begin
- Ensure shields are removed precisely when scheduled

### User Benefits

1. **Improved Focus**: Users report difficulty maintaining focus during prayer due to notification temptations. App shielding creates a distraction-free environment.

2. **Behavioral Support**: Helps build consistent prayer habits by removing digital temptations during dedicated spiritual time.

3. **User Autonomy**: Unlike parental control apps, Sacred is designed FOR adults, BY their own choice, respecting their agency and goals.

4. **Mental Health**: Supports digital wellness by creating intentional breaks from addictive social media and entertainment apps.

### Privacy & Security Commitment

- **No Data Collection**: We do NOT collect, transmit, or store any information about which apps users select or when they use them
- **Local Processing**: All app restriction logic runs entirely on-device
- **User Control**: Users can disable features, modify schedules, or remove the app entirely at any time
- **Transparent Permissions**: Clear explanation of why we request Family Controls authorization
- **No Third-Party Access**: No data sharing with advertisers or third parties

### Similar Apps in the Ecosystem

Apps with similar use cases already approved for Family Controls:
- **One Sec**: Mindful social media usage
- **Opal**: Focus and screen time management
- **ClearSpace**: Intentional app usage
- **Freedom**: Website and app blocker

Sacred serves a similar legitimate use case but specifically for spiritual and prayer practices.

### Target Use Case Example

**Typical User**: Sarah, a 28-year-old professional who wants to maintain a consistent morning prayer routine.

**Problem**: Sarah sets aside 7:00-7:15 AM for prayer but finds herself checking Instagram and emails, breaking her focus.

**Solution with Sacred**:
1. Sarah schedules "Morning Prayer" for 7:00-7:15 AM daily
2. She uses FamilyActivityPicker to select Instagram, TikTok, and Gmail
3. At 7:00 AM, iOS automatically shields these apps
4. Sarah receives a notification: "Time for Morning Prayer"
5. She can focus on prayer without digital temptations
6. At 7:15 AM, shields automatically remove

**Result**: Sarah successfully maintains her prayer practice without distraction.

---

## Technical Implementation

### Frameworks Used

```swift
import FamilyControls      // User authorization & app selection
import ManagedSettings     // Apply/remove app shields
import DeviceActivity      // Time-based schedule monitoring
```

### Architecture

1. **User Authorization**: `AuthorizationCenter.shared.requestAuthorization(for: .individual)`
2. **App Selection**: Users pick apps via native `FamilyActivityPicker`
3. **Schedule Creation**: `DeviceActivitySchedule` for prayer times
4. **Automatic Shielding**: `ManagedSettingsStore.shield.applications` applies shields
5. **Automatic Removal**: Shields removed at interval end

### Privacy Compliance

- ✅ Complies with App Store Review Guidelines
- ✅ Privacy Policy clearly explains Family Controls use
- ✅ On-device processing only
- ✅ No analytics on restricted apps
- ✅ No data monetization

---

## Why This Is a Legitimate Use Case

### 1. User-Initiated & Consensual
Users explicitly:
- Download and install Sacred
- Grant Family Controls authorization
- Choose which apps to restrict
- Set their own schedules
- Can disable at any time

### 2. Personal Wellness Tool
Sacred empowers individuals to:
- Build healthy digital habits
- Maintain spiritual practices
- Support mental well-being
- Exercise personal agency

### 3. Not Surveillance or Control
Sacred is:
- ❌ NOT for monitoring others
- ❌ NOT for parental control
- ❌ NOT for employer monitoring
- ✅ FOR personal self-improvement
- ✅ FOR individual wellness goals

### 4. Clear User Value
Helps users who:
- Struggle with digital distractions during prayer
- Want to build consistent spiritual habits
- Seek intentional technology use
- Value focused, uninterrupted prayer time

---

## Supporting Materials

### App Screenshots
(Attach screenshots showing):
1. Prayer schedule configuration screen
2. FamilyActivityPicker integration
3. Prayer time notification
4. Privacy settings and user controls

### Privacy Policy
Link to privacy policy explaining:
- What data is collected (none related to app usage)
- How Family Controls is used
- User rights and controls
- No third-party data sharing

### User Testimonials
(If you have beta testers):
- Quotes about how app shielding helps maintain prayer focus
- Feedback on digital wellness improvements
- Stories of successful habit formation

---

## Commitment to Responsible Use

We commit to:

1. **Transparency**: Clear user communication about Family Controls use
2. **Privacy**: No collection or transmission of app usage data
3. **User Control**: Easy opt-out and schedule modification
4. **Guidelines Compliance**: Adherence to all App Store Review Guidelines
5. **Support**: Responsive user support for permission issues
6. **Updates**: Promptly addressing any Apple feedback or concerns

---

## Contact Information

**Developer Email**: [your-email@example.com]  
**Support Website**: [your-support-url]  
**App Store Connect Team ID**: [your-team-id]

We are happy to provide additional information, demonstrations, or answer any questions about our implementation.

Thank you for considering our Family Controls entitlement request.

---

## Quick Copy-Paste Version

**For the form's text box, use this condensed version:**

Sacred is a digital wellness app that helps users maintain focused, uninterrupted prayer times by temporarily blocking distracting apps during scheduled prayer periods.

We need Family Controls to enable automatic app shielding at user-scheduled prayer times. Users explicitly select which apps to block (e.g., social media, games) and when (e.g., 7:00-7:15 AM for morning prayer). 

Without Family Controls, we can only send notifications that users may ignore, defeating the purpose of creating a distraction-free prayer environment.

We use FamilyControls for authorization and app selection (via FamilyActivityPicker), ManagedSettings to apply/remove shields, and DeviceActivity to monitor prayer schedules. All processing is on-device with zero data collection or transmission about app usage.

Sacred serves adult users who voluntarily choose to block their own apps during self-defined prayer times. This is similar to approved apps like One Sec, Opal, and Freedom, but specifically for spiritual practices.

Users maintain full control: they choose apps to block, set their schedules, and can disable features anytime. We commit to privacy, transparency, and responsible use of Family Controls solely for user-initiated personal wellness.

We have implemented all privacy safeguards and comply with App Store Review Guidelines. Happy to provide additional details or demonstrations.

---

**Last Updated**: January 13, 2026
