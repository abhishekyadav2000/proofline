# Proofline

**Turn real-world effort into shareable proof of skill.**

Proofline is an Expo React Native app for students and early-career people. Users select a short mission, document their action, reflect on the outcome, and create a personal Proof Card.

## What works now

- Three real-world missions
- Evidence and reflection capture with input validation
- Proof Card generation and Skill Trail
- RevenueCat paywall screen with Restore Purchases
- Real RevenueCat SDK integration (purchases only activate after a public SDK key and product configuration are supplied)
- Proof Cards and onboarding saved on the device with AsyncStorage (no account or cloud sync)

No fake purchase confirmation is used. Without a configured RevenueCat project, the app explains exactly what must be configured.

## Run locally

```bash
npm install
npx expo start
```

Use Expo Go for the core app flow. For a native RevenueCat purchase test, create an Expo development build because in-app purchase SDKs require native code.

## Configure RevenueCat

1. Create a RevenueCat project and add an Android or iOS app.
2. Add an entitlement with identifier `pro`.
3. Create a product and attach it to a current offering.
4. Copy `.env.example` to `.env` and set the public Android or iOS SDK key for the platform you build.
5. Build a development client or store build, then make a sandbox purchase.

## RevenueCat Test Store

1. In RevenueCat, create a Test Store for the Proofline project.
2. Create the product `proofline_plus_monthly` in the Test Store.
3. Attach `proofline_plus_monthly` to the entitlement `pro`.
4. Add it to the Current Offering.
5. Put the Test Store key (starts with `test_`) in `.env` as `EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY`. It is used only in debug/development builds; production builds ignore it and reject any `test_` key.
6. Never commit `.env`. It is listed in `.gitignore`.
7. Before any App Store or Google Play release, set the App Store / Google Play public SDK keys (`EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY`, `EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY`) and remove the Test Store key from release build environments.

## QA checklist

Record each result on a real run; leave unchecked until actually performed.

- [ ] Onboarding: three screens, Skip, and "Start building my trail" all reach Today; onboarding does not return after reload.
- [ ] Persistence: Proof Cards, streak, and free-plan usage remain after an app reload.
- [ ] Free limit: cards 1–3 save; attempting a 4th opens the Plus paywall.
- [ ] Test Store success: "Test valid purchase" closes the paywall and shows "Proofline Plus unlocked".
- [ ] Test Store cancel: cancelling shows "Purchase cancelled" and Plus stays locked.
- [ ] Test Store fail: "Test failed purchase" shows an error and Plus stays locked.
- [ ] Entitlement unlock: after success, RevenueCat shows `pro` active for the customer and a 4th Proof Card saves.
- [ ] Restore purchase: after reinstalling or clearing app data, Restore Purchases re-activates `pro`.

## Shipaton evidence checklist

- Record a device demo under two minutes: select mission → document evidence → create Proof Card → open Plus paywall.
- Add your public GitHub repository link to Devpost.
- Capture a 1179 × 2556 vertical screenshot without a device frame.
- Create a 1024 × 1024 icon and a live store listing unless submitting through Next Gen.

## Stack

Expo, React Native, TypeScript, RevenueCat

## License

MIT
