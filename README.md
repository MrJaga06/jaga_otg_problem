# OTG Guardian

OTG Guardian is a project for monitoring USB OTG activity on Android, with a separate browser based dashboard for exploring the design. The dashboard's device behavior is simulated; it does not control a connected phone.

## Android APK

[View APK build status and available build artifacts](https://github.com/MrJaga06/jaga_otg_problem/actions/workflows/android-apk.yml) · [All releases](https://github.com/MrJaga06/jaga_otg_problem/releases)

GitHub Actions is configured to build the native Android app on changes to `main`. Successful runs publish a temporary APK artifact; pushing a version tag such as `v1.0.0` also attaches the APK to a GitHub Release. The current `v1.0.0` run failed before producing an APK, so no release download is available yet. Debug builds are unsigned for Play Store distribution and are intended for testing.

## What is in this repository?

- `android/` — Native Kotlin Android app using Jetpack Compose. It includes USB device enumeration, OTG state detection attempts, a foreground monitoring service, notification recovery, an optional accessibility assist, and a Quick Settings tile.
- `src/` — React and Vite web dashboard with a phone simulator, hardware lab, OxygenOS audit, code explorer, and ADB guide. Hardware and recovery actions shown in the dashboard are simulations.

## Limits and device support

The Android source contains implementations that attempt to read OEM settings and sysfs state, write settings when the user grants the privileged permission through ADB, and navigate OxygenOS settings with Accessibility. Android and OEM restrictions vary by device and software version. These code paths have not been verified here on physical hardware, so automatic OTG control or recovery is not guaranteed. The dashboard itself is a simulation and makes no connection to a phone.

The Android app currently targets Android API 34, requires Android 8.0 (API 26) or newer, and names OnePlus CPH2381 / OxygenOS 14 in its UI. Treat this as an experimental project and verify behavior carefully on your own device.

## Build locally

Install JDK 17 and Android SDK Platform 34, then run from the `android/` directory with Gradle 8.4 installed:

```sh
gradle assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

To build the browser dashboard, install Bun and run:

```sh
bun install --frozen-lockfile
bun run build
```

## License

No license is currently declared. Contact the repository owner before reusing or redistributing this project.
