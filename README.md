# NutriTrack

NutriTrack is an installable, offline-first nutrition and habit tracker built with React, TypeScript, and Vite.

## Run locally

```sh
npm install
npm run dev
```

## Build and verify

```sh
npm run check
npm test
npm run build
```

## Mobile and offline use

Deploy the production build over HTTPS, then install NutriTrack from the browser's install or add-to-home-screen option. The service worker caches the app shell and same-origin assets so the app can reopen without a network connection.

Profile, goals, food diary entries, water, favorites, and progress are stored on the device in IndexedDB. Existing data in the previous `localStorage` store is moved to IndexedDB on first load. No account or server sync is configured, so data stays in that browser on that device; use the backup tools in Settings before clearing browser storage or changing devices.

## Build an Android APK locally

The Android wrapper uses Capacitor. Android Studio is optional, but a JDK and Android SDK command-line tools are required. Install a JDK supported by Android Gradle Plugin 8.13, then install Android SDK Platform 36, Build-Tools 36, Platform-Tools, and the latest Command-line Tools. Set `JAVA_HOME` and `ANDROID_HOME` to their installation folders.

```sh
npm install
npm run android:apk
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. To install it on a connected Android device with ADB:

```sh
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

Run `npm run android:apk` again after changing the web app; it rebuilds the web assets and syncs them into Android before compiling. This creates a debug APK for testing, not a Play Store-signed release. The native app has its own on-device storage, separate from the browser PWA; export a backup in Settings before switching.

## Build an APK with GitHub Actions

Push the project to GitHub. The **Build Android APK** workflow runs on pushes, pull requests, and manual dispatches. Once a run completes, open it under the repository's **Actions** tab and download the `NutriTrack-debug-apk` artifact. It contains `app-debug.apk`, which can be installed on an Android device for testing. This is a debug build, not a Play Store-signed release.
