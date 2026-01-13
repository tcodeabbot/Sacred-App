#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

/**
 * React Native Bridge for PrayerScreenTimeModule
 *
 * This Objective-C file exposes the Swift module to React Native.
 */
@interface RCT_EXTERN_MODULE(PrayerScreenTimeModule, NSObject)

// Authorization methods
RCT_EXTERN_METHOD(checkAuthorization:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestAuthorization:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// App selection methods
RCT_EXTERN_METHOD(presentAppSelector:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(saveSelectedApps:(NSString *)appTokensJSON
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Prayer schedule methods
RCT_EXTERN_METHOD(schedulePrayerBlock:(NSDictionary *)config
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(cancelPrayerBlock:(NSString *)prayerName
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(cancelAllPrayerBlocks:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Manual shield control
RCT_EXTERN_METHOD(activateShieldNow:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(deactivateShield:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
