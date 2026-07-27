# Final Testing Update

**Date:** 19 July 2026  
**Tester:** Liang Zihao  
**Student ID:** C3549669  
**Role:** Testing / Quality Assurance  
**Project:** ZeHaoShanGou Web Programming Group Project  

## 1. Testing Objective

For the final SCRUM stage, my responsibility was to verify the latest version of the web application from the user's point of view. The testing focused on whether a customer could browse products, search and filter content, manage the cart, sign in, proceed through checkout, complete a simulated payment, and view the correct order information.

Both manual interface checking and automated React tests were used. The automated tests were written with Jest and React Testing Library.

## 2. Testing Method

The tests render the React application and interact with visible interface elements such as buttons, input fields, forms, headings, menus, alerts, and status messages. `fireEvent` is used to simulate browser events including clicking, typing, changing form values, and submitting forms.

After each action, the test checks the result visible to the user. For example, after the same product is added twice, the test verifies that the quantity becomes two and that the total changes from `$19.99` to `$39.98`.

The latest test file also mocks backend requests for session checking, login, logout, library data, order retrieval, and order creation. This allows the frontend behaviour to be tested consistently without depending on a live database during every test run.

These automated tests simulate common browser interactions, but they do not completely replace real-user usability testing.

## 3. Testing Scope

| Area | Functions verified |
|---|---|
| Product discovery | Home page, categories, search, product detail |
| Shopping cart | Add to cart, duplicate quantity, subtotal and total, empty-cart state |
| Account | Login fields, successful login, invalid credentials, registration validation, logout |
| Protected pages | Wishlist, library, settings and checkout access |
| Settings | Local storage, library sort and reduced-motion preference |
| Checkout | New card fields, unauthenticated access control, Buy Now flow |
| Orders | Payment success, quantity and total preservation, order failure handling |
| Resilience | Demo products remain available when the product API is offline |

## 4. Initial Test Result

The previous test file was written for an earlier version of the application. When it was run against the latest project code, the result was:

```text
Test Suites: 1 failed, 1 total
Tests:       7 failed, 11 passed, 18 total
Snapshots:   0 total
```

The failures were mainly caused by changes in the application rather than all seven functions being broken. The latest application uses backend authentication, asynchronous login responses, revised account field labels, and updated checkout behaviour. Therefore, the existing tests needed to be updated to match the current prototype.

## 5. Test Updates Completed

The following changes were made to `App.test.js`:

- Updated the login selector to use **Email address or username**
- Added mock responses for session, login, logout, library and order requests
- Added asynchronous waiting for authentication and payment results
- Replaced the old frontend-only login assumption with invalid-credential testing
- Updated the Buy Now test so an unauthenticated user is sent to sign in
- Added cart quantity reduction and empty-cart verification
- Added payment failure and user-friendly StoreDB error verification
- Added logout and protected-page access testing
- Added reusable helper functions for product selection, cart actions and login
- Cleared local storage and mock state before each test to reduce cross-test interference

## 6. Final Automated Test Result

The updated test suite was run with:

```bash
npm test -- --watchAll=false
```

Verified result:

```text
Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        6.856 s
```

All 20 automated tests passed.

React also produced non-failing `act(...)` warnings related to asynchronous state updates when the application loads session and fallback product data. These warnings did not cause test failures, but they should be cleaned up in a future test-maintenance task by awaiting the initial asynchronous updates more consistently.

## 7. Production Build Verification

The production build was run with:

```bash
npm run build
```

Verified result:

```text
Creating an optimized production build...
Compiled successfully.

The build folder is ready to be deployed.
```

This confirms that the current frontend compiles successfully as an optimized production build.

## 8. Manual User-Flow Verification

The main customer journey was also reviewed manually:

```text
Home Page
→ Product Search or Category
→ Product Detail
→ Add to Cart
→ Cart Quantity and Total
→ Sign In
→ Checkout
→ Payment Result
→ Order Detail
```

The selected product, quantity and total were checked across the cart, checkout, payment-success and order-detail pages. The cart was also checked to ensure that adding the same product multiple times increases the quantity instead of creating duplicate rows.

## 9. Current Limitations

- Payment remains a prototype or simulated transaction flow.
- Full authentication and order persistence still depend on the configured backend and database environment.
- Automated tests verify functional behaviour but do not fully evaluate visual appearance, accessibility or usability.
- The passing test run still contains non-failing React `act(...)` warnings that should be addressed later.
- Real-user testing is still required to identify confusing wording, layout problems and user-experience issues.

## 10. Evidence for Final SCRUM

The following evidence should be prepared:

1. Updated `App.test.js`
2. Terminal screenshot showing **20 passed, 20 total**
3. Terminal screenshot showing **Compiled successfully**
4. Cart screenshot showing quantity and total calculation
5. Checkout or payment-success screenshot
6. Order-detail screenshot
7. GitHub commit-history screenshot
8. Final testing report

## 11. Reflection

This testing stage showed that automated tests must be maintained whenever the interface, backend integration or user flow changes. A failed test does not always mean that the feature is broken; it may mean that the test still expects an older version of the application.

I improved the test suite so that it now checks the current authentication, shopping-cart, checkout and order behaviour. I also learned how mocked backend responses make automated frontend testing repeatable, while manual verification remains necessary for usability and visual quality.

---

# Individual Contribution Summary

Since the previous SCRUM, I have focused on final testing and quality assurance for the latest ZeHaoShanGou web application. I reviewed the updated project code and tested the main customer journey, including product browsing, category navigation, search, product details, cart management, login, registration validation, wishlist and library access, settings, checkout, payment results and order details.

I updated `App.test.js` because the previous tests were designed for an earlier version of the prototype. The latest application introduced backend authentication, asynchronous session and login requests, updated field labels and revised checkout behaviour. I added mocked backend responses for session, login, logout, library and order requests, and used asynchronous checks to verify the results shown to users.

I also added tests for invalid login credentials, reducing the final cart item, Buy Now access control, payment failure and logout protection. The cart tests verify that adding the same product twice increases its quantity rather than creating duplicate rows, and that the total changes from $19.99 to $39.98.

After the updates, I ran the complete automated test suite. The verified result was 20 passed tests out of 20, and the production build compiled successfully. I also identified non-failing React `act(...)` warnings as a future test-maintenance issue.

My contribution is demonstrated through the updated automated test file, final testing report, terminal results, interface screenshots and GitHub commit history.
