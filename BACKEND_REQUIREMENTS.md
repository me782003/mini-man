# Backend requirements — Mini Man storefront test round

The storefront (website) side of the test PDF is done. This file lists what the **API and dashboard** still need so those changes work end to end.

Numbers in brackets (#n) refer to items in the test PDF (`miniman test.pdf`).

All paths are under `/api`. The site sends a `locale: en | ar` header on every request, plus `Authorization: Bearer <token>` when the user is logged in. Errors should keep the usual shape `{ data, message, error, errors }`. The site shows `message` to the customer.

---

## 1. Addresses (#2, #7)

The address form changed:
- One **title** field ("Home", "Work"…) replaces first/last name.
- Fields are now in this order: country → governorate → city → street → landmark.

### `POST /user/addresses` and `PUT /user/addresses/:id`

New fields in the request body:

| Field | Type | Notes |
|---|---|---|
| `title` | string, required, max 255 | The address label. Store it and return it. |
| `governorate` | string \| null | **Egypt:** the Bosta governorate name (the same value as `bosta_city_name`). **Other countries:** free text typed by the customer. |

Unchanged fields, with their new meaning:

| Field | Meaning now |
|---|---|
| `first_name`, `last_name` | Still sent. They are filled from the **account name** (the courier needs a person's name), not typed in the form. Keep accepting them. |
| `apartment` | Now holds the **landmark** (علامة مميزة). Optional. |
| `city` | **Egypt:** the governorate name, as before. **Other countries:** the city typed by the customer. |
| `bosta_city_id` / `bosta_city_name` | Egypt: the governorate. |
| `bosta_district_id` / `bosta_district_name` | Egypt: the city (it depends on the governorate). Empty for other countries. |
| `phone` | Can now be **any country**: `01XXXXXXXXX` for Egypt, `+<dial code><number>` otherwise (e.g. `+971501234567`). |

### `GET /user/addresses`, profile `all_addresses` / `main_address`, and order `shipping_address`
- Return `title` and `governorate` on every address.
- Old addresses without a title are fine: the site shows the recipient name instead.

### Countries
- `GET /user/auth/countries` should keep returning **only the countries activated in the dashboard**. The site uses this list only for the address's **shipping country**.
- The phone dial-code picker no longer uses this endpoint. It has its own list of all countries, because the client wants any country code for phones while shipping stays limited to active countries.
- Non-Egyptian addresses can be saved. Shipping outside Egypt is controlled by deactivating countries in the dashboard. If an inactive country is ever sent, reject it with a clear `message`.

### ⚠ To check
Egyptian addresses may now have a **foreign phone number**. Confirm that Bosta accepts these when the shipment is created. If it doesn't, return a clear error at checkout.

---

## 2. Coupons (#5, #6)

### Error messages — `POST /user/orders/validate-coupon`
The site maps the error `message` to a translated text using keywords. Please keep these phrases, in English, in `message`:

| Case | Status | `message` must contain |
|---|---|---|
| Code doesn't exist | 404 | `invalid` or `not found` |
| Expired | 400 | `expired` (without the word "invalid") |
| Not started yet | 400 | `not active` or `not started` |
| Usage limit reached | 400 | `usage limit` or `used` |
| Below the minimum order | 400 | `minimum`, ending with the amount, e.g. `Minimum order amount for this coupon is 500.00` |

Never return HTML or a stack trace. The site shows a generic error for any 5xx.

### Free-shipping coupon (new)
- **Dashboard:** add a coupon type **"Free shipping"**. It keeps the usual minimum amount, dates and usage limit.
- **API:** return it from validate-coupon as:
  ```json
  { "id": 9, "code": "SHIPFREE", "type": "free_shipping", "value": "0", "max_discount": null }
  ```
  `"free_shipping": true` on a normal percentage or fixed coupon is also understood.
- **Checkout** (`POST /user/orders/checkout` with `coupon_code`):
  - Set `shipping_amount` to 0.
  - Set `coupon_discount` to 0 (items are not discounted).
  - Paymob and Bosta must charge or collect the total **without shipping**.
- Optional but recommended: when `GET /user/cart` and `GET /user/addresses?cart_amount=` receive a free-shipping coupon, return `free_shipping: true`.

---

## 3. Order details (#9, #10, #14)

### `GET /user/orders/:id`
- **#9** `tracking_history[]` already exists and is now shown as "Order updates". Every status change made in the dashboard must create an entry with the **note written by the admin** in `notes`:
  ```json
  { "id": 1, "status": "shipped", "notes": "Handed to Bosta", "created_at": "2026-11-03 14:20:00" }
  ```
  Bug from the test: a note entered with a status change didn't appear. Please confirm the dashboard saves the note into `tracking_history`.
- New fields:
  - `items[].is_reviewed: boolean` — true once the customer has rated that product for this order.
  - `return_request: { id, status, created_at } | null` — `status` is one of `pending | approved | rejected | completed`.

### Return request (#10) — new endpoint
`POST /user/orders/:id/return-request`

```json
{
  "reason": "wrong_size",
  "details": "optional free text, max 500 chars",
  "items": [{ "order_item_id": 123, "quantity": 1 }]
}
```

- `reason` is one of: `wrong_size`, `damaged`, `not_as_described`, `wrong_item`, `changed_mind`, `other`.
- Allow it only when the order status is `delivered`, the order belongs to the user, and there's no request yet. Return 400 with a clear `message` otherwise.
- Success: 201 with the created request. After that, `return_request` appears on the order.
- **Dashboard:** add a returns list where admins can approve, reject or complete a request.
- Until this endpoint exists, the site falls back to opening WhatsApp with the request text. That fallback triggers on 404, 405 or 501.

### Product review (#14) — new endpoint
`POST /user/reviews`

```json
{ "order_id": 55, "product_id": 2267, "rating": 5, "comment": "optional, max 500 chars" }
```

- `rating` is a whole number from 1 to 5.
- Allow it only if the order belongs to the user, its status is `delivered`, the product is in the order, and that product hasn't been reviewed for this order yet.
- **Dashboard:** add review moderation. Approved reviews show in `GET /user/pages/home` → `reviews` (which already exists).
- Until this endpoint exists, the site shows "Reviews can't be sent right now".

---

## 4. Phone number for Google accounts (#15) — screen currently turned off

The "Add your phone number" screen is built but **disabled** on the site, at the client's request. When it's turned back on, it needs:

1. `PUT /user/auth/profile` (multipart) must accept `phone` for accounts that **don't have one yet** (Google sign-ups). Once the phone is verified, refuse changes to it.
2. `POST /user/auth/resend-otp { phone }` must send an OTP to that new number.
3. `POST /user/auth/verify-otp { phone, otp }` must mark the account verified (`is_verified: 1`). Returning a new `token` is optional; the site keeps the current one if none is returned.
4. `GET /user/auth/profile` must return `phone` (empty or null when missing) and `is_verified` (0/1) for Google users.
5. Recommended: `POST /user/orders/checkout` should return 403 with a clear `message` when the account has no verified phone.

---

## 5. Contact form (#22)
`POST /user/pages/contact-us`: **email is now optional**. The site doesn't send `email` when it's left empty. The API currently answers "All fields are required", so make `email` optional. Validate the format only when it's present.

---

## 6. Settings and tickers (#20, #21, #28)
- `GET /user/pages/settings` → `tickers.items` must return **all active tickers**, translated to the `locale` header.
  - Test result: only one item came back after a second one was added.
  - Deactivated tickers must disappear, and `tickers: null` should be returned when the ticker bar is turned off.
  - The on/off switch in the dashboard didn't work in the test (#28).
- The site now also sends `?locale=en|ar` on this URL. You can ignore it; it only keeps the site's cache separate per language.
- The site refreshes settings every ~60 seconds, so dashboard changes show up within a minute.

---

## 7. Product code (#1)
The site shows **"Product code: #<id>"** and the selected variant's `sku`. If the client wants a separate code (not the database ID), add a `code` field to the product in the dashboard and return it from `GET /user/catalog/products/:id`. The site can switch to it.

---

## 8. Payments (#3, #4)
- **#3** Cash on delivery is already offered on the site. Keep `cash_on_delivery` enabled in checkout.
- **#4** Hide **Apple Pay**: the site never shows it; it appears on Paymob's payment page. Remove the Apple Pay integration ID from the Paymob intention/payment-key request (or turn it off in the Paymob dashboard) until the account is ready.

---

## 9. Section titles (#30)
The site now always shows "أحدث المنتجات / Latest Products" for the latest-products section. Optionally change `last_week_added.title` in `GET /user/pages/home` to match, so the API and site agree.

---

## 10. Dashboard-only items (not in the storefront repo)

| # | Needed |
|---|---|
| 7 | Country activation must control **shipping countries only**. It must not limit phone dial codes, and customers can register with non-Egyptian numbers. |
| 8 | New-order notification in the dashboard, plus a WhatsApp message (through **wawp**, like the OTP) to an admin number set in the dashboard, with the order details. Also send a WhatsApp message to the **customer** whenever their order status changes. |
| 12 | Orders page filters: by product, governorate and city. |
| 13 | Orders page search by order number. |
| 24 | Contact-message reply over WhatsApp fails ("فشل إرسال الرد"). |
| 26 | Home dashboard "recent customers": the arrow always opens the admin's own profile. It should open that customer. |
| 27 | "Add user" only opens the users page. Needs: create admin users with per-section permissions. |
| 28 | Tickers: a new ticker doesn't show, deactivating doesn't hide it, and the on/off switch doesn't work (see section 6). |
| 33 | Orders "Export to Excel" produces an empty sheet. |
| 34 | Products Excel export misses some product images. |
| 35 | Add "Export to Excel" to the users page. |
| 10 / 14 | Returns list and review moderation (see section 3). |
