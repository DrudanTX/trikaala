import class GeolocationPlugin.GeolocationPlugin
import class LocalNotificationsPlugin.LocalNotificationsPlugin

/// Keep Capacitor plugin classes in the linked binary.
/// Capacitor iOS looks them up with NSClassFromString(packageClassList);
/// SPM static linking otherwise strips types that are never referenced in Swift.
@_cdecl("trikaala_retain_capacitor_plugins")
public func retainCapacitorPlugins() {
    _ = GeolocationPlugin.self
    _ = LocalNotificationsPlugin.self
}

public let isCapacitorApp = true
