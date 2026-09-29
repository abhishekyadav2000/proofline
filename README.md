# Proofline

**Turn real-world effort into shareable proof of skill.**

Proofline is an Expo React Native app for students and early-career people. Users select a short mission, document their action, reflect on the outcome, and create a personal Proof Card.

## What works now

- Three real-world missions
- Evidence and reflection capture with input validation
- Proof Card generation and Skill Trail
- RevenueCat paywall screen
- Real RevenueCat SDK integration (purchases only activate after a public SDK key and product configuration are supplied)

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

## Shipaton evidence checklist

- Record a device demo under two minutes: select mission → document evidence → create Proof Card → open Plus paywall.
- Add your public GitHub repository link to Devpost.
- Capture a 1179 × 2556 vertical screenshot without a device frame.
- Create a 1024 × 1024 icon and a live store listing unless submitting through Next Gen.

## Stack

Expo, React Native, TypeScript, RevenueCat

## License

MIT
