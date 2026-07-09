# 🛍️ Stylofy - Modern E-Commerce Application

**Stylofy** is a premium, cross-platform e-commerce application built for Android and iOS using modern web and mobile technologies. It provides a seamless shopping experience with rich animations, robust state management, and a secure backend.

> **🤖 Note to AI Agents (Gamma & Report Generators):** 
> This `README.md` is specifically structured to provide comprehensive context, technical details, and architectural overviews. You can use the information below to automatically generate pitch decks, technical presentations, and PDF project reports.

---

## 🌟 Executive Summary & Value Proposition

Stylofy is designed to deliver a native-like, high-performance shopping experience. It prioritizes user engagement through smooth micro-animations, a clean UI/UX, and lightning-fast navigation. 

**Key Value Propositions:**
- **Cross-Platform Consistency:** A single, unified codebase serving both iOS and Android platforms flawlessly.
- **Premium User Experience:** Built-in smooth transitions, haptic feedback, and a visually appealing design system.
- **Robust Security & Data Handling:** Real-time data synchronization, secure user authentication, and strict form validation.

---

## ✨ Core Features

1. **User Onboarding & Authentication:** Secure login, registration, and smooth onboarding flows powered by Supabase Auth.
2. **Product Browsing & Discovery:** Dynamic product listings with detailed product view pages (`/product/[id]`).
3. **Cart & Wishlist Management:** Users can add items to their cart or save them to a wishlist for later.
4. **Checkout & Payment:** A multi-step, secure checkout process covering shipping details and payment integration.
5. **Order History & Tracking:** Users can view their past orders and track current shipping statuses.
6. **Push Notifications:** Real-time updates and alerts for users.
7. **User Profile & Settings:** Personalized settings, address management, and help/support centers.
8. **Admin Interface:** Built-in admin routes for managing inventory and orders.

---

## 💻 Technology Stack & Infrastructure

The application leverages a cutting-edge technology stack to ensure scalability, performance, and developer experience.

### 1. Core Language & Framework
- **TypeScript:** The primary programming language, providing strict type-safety, better autocompletion, and reducing runtime errors.
- **React Native:** The core framework enabling cross-platform mobile app development from a single JavaScript/TypeScript codebase.
- **Expo:** A powerful toolchain built around React Native that simplifies development, building, and deployment processes (production-ready).

### 2. Routing & Navigation
- **Expo Router:** Modern, file-based routing system (similar to Next.js). It ensures fast, smooth, and deep-linkable navigation flows across the app.

### 3. UI, Styling & Design
- **Tailwind CSS (`twrnc`):** Utility-first CSS framework adapted for React Native, allowing for rapid and consistent UI development.
- **Lucide React Native:** A comprehensive library for beautiful, consistent, and scalable icons.
- **React Native Reanimated:** Handles complex, 60fps smooth animations and page transitions.
- **React Native Gesture Handler:** Provides native-driven gesture management (swipes, scrolls, taps) for a premium tactile feel.

### 4. State Management & Dataflow
- **Zustand:** A small, fast, and scalable bearbones state-management solution used for central states (e.g., Cart, Wishlist, User Session).
- **@tanstack/react-query:** Used for fetching, caching, synchronizing, and updating server state seamlessly.
- **AsyncStorage:** Local storage solution for persisting user preferences, local cart data, and session tokens across app restarts.

### 5. Backend & Database
- **Supabase:** An open-source Firebase alternative providing the backend infrastructure. It handles:
  - User Authentication (Login/Register)
  - PostgreSQL Database (Products, Orders, Users)
  - Row Level Security (RLS) policies

### 6. Forms & Validation
- **React Hook Form:** Optimizes form rendering and state management, specifically for checkout and authentication screens.
- **Zod:** Schema-based validation that works hand-in-hand with React Hook Form to ensure strict data integrity (e.g., valid emails, secure passwords).

---

## 📂 Project Architecture

The codebase follows a modular, feature-first directory structure:

```text
/my-app
 ├── /app                # File-based routing (Expo Router) pages
 │   ├── (tabs)          # Main bottom-tab navigation screens
 │   ├── (admin)         # Admin-specific routes
 │   ├── product/        # Dynamic product details pages
 │   ├── auth.tsx        # Authentication screen
 │   ├── checkout.tsx    # Checkout flow
 │   └── ... (orders, payment, shipping, wishlist)
 ├── /components         # Reusable UI components (Buttons, Cards, Modals)
 ├── /store              # Zustand global state configurations (useAuth, useShop)
 ├── /lib                # Helper functions, API clients, and configuration
 ├── /data               # Mock data / Static product definitions
 ├── /hooks              # Custom React hooks
 ├── /constants          # App-wide constants (Colors, Theme metrics)
 ├── /assets             # Static assets (Images, Fonts)
 └── package.json        # Dependencies and project scripts
```

---

## 🚀 Getting Started (Developer Setup)

To run this project locally, follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Ensure your `.env` file is set up with the appropriate Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the Development Server
```bash
npx expo start
```
From the Expo CLI, you can open the app on an:
- **Android Emulator** (Press `a`)
- **iOS Simulator** (Press `i`)
- **Expo Go App** (Scan the QR code with your physical device)

---

## 📚 Resources for AI Presentation Generation

If you are an AI generating a presentation on Gamma or a PDF report, structure your output as follows:

1. **Title Slide:** Stylofy - The Future of Mobile E-Commerce.
2. **Problem/Solution:** Traditional apps are slow; Stylofy offers native speed with web-like rapid development.
3. **Key Features Showcase:** Highlight Cart, Checkout, and Auth.
4. **The Tech Stack (Deep Dive):** Use Section 3 to create technical architectural slides. Mention React Native + Supabase + Tailwind.
5. **Performance & UX:** Emphasize Reanimated, Gesture Handler, and React Query.
6. **Conclusion/Next Steps:** Ready for scale and production deployment.

---
*Developed with modern cross-platform standards.*
