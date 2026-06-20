# Week 6 Manual Test Report

Date: 20 June 2026  
Tester: Liang Zihao  
Role: Testing / Quality Assurance  
Status: In Progress

Automated verification: 7 of 7 React tests passed.  
Production build: Passed.

| Test ID | Feature | Test steps | Expected result | Actual result | Status |
|---|---|---|---|---|---|
| T01 | Home navigation | Click the logo and Home button | The Home page is displayed | Home navigation works | Pass |
| T02 | Category navigation | Click Games, E-books, and Movies & TV | The selected category listing is displayed | Category filtering works with available products | Pass |
| T03 | Search | Search for `Nebula` and press Enter | Matching products are displayed | `Nebula Protocol` is displayed | Pass |
| T04 | Product details | Click a product image, title, or View details | The selected product detail page opens | Product details are displayed | Pass |
| T05 | Add-to-cart feedback | Click Add to cart | A success message is displayed | A temporary toast message is displayed | Pass |
| T06 | Cart icon | Click the cart icon in the header | A cart page or cart panel opens | The cart icon has no action yet | Fail / Open |
| T07 | Login validation | Submit empty fields, an invalid email, and a password shorter than 8 characters | The browser blocks invalid submission | Required, email, and minimum-length validation were added | Fixed / Retest Pass |
| T08 | Register validation | Leave fields empty, enter an invalid email, use a short password, and enter different passwords | Invalid submission is blocked and mismatched passwords show a clear message | Client-side validation and password matching were added | Fixed / Retest Pass |
| T09 | Role-based access | Try Customer, Employee, and Admin access | Each role sees only its permitted dashboard and functions | Role authentication and dashboards are not implemented in this frontend | In Progress |
| T10 | API fallback | Run the frontend without the backend API | Demo products remain available | The app displays local demo products and an API fallback notice | Pass |

## Week 6 QA change

During testing, I found that the account forms allowed incomplete input. I added required-field validation, email validation, a minimum password length of eight characters, and a matching Confirm Password check. I then added React tests for the login validation attributes and the registration password mismatch message.

## Known limitations

- Login and registration are currently frontend demonstrations; they do not authenticate against the database or save a new account.
- Customer, Employee, and Admin role permissions cannot be fully tested until the authentication and dashboard functions are implemented.
- The cart icon, wishlist button, pagination buttons, newsletter form, and several footer links are still placeholders.
- Browser screenshots should be saved with the Week 6 submission evidence after local manual retesting.

## Screenshot checklist

Save these screenshots after running `npm start`:

1. Home page with products visible.
2. Search results for `Nebula`.
3. `Nebula Protocol` product detail page.
4. Add-to-cart toast message.
5. Login form blocking an empty or short-password submission.
6. Register form showing the password mismatch message.
7. Terminal showing all 7 React tests passed.
