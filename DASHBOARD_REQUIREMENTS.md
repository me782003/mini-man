# Dashboard requirements — Mini Man test round

This is what the **admin dashboard** needs, from the client's test PDF (`miniman test.pdf`, items #n) and from the new website features.

The API contracts behind these screens are in [BACKEND_REQUIREMENTS.md](BACKEND_REQUIREMENTS.md). Section numbers like "Backend §3" point there.

Everything in the dashboard must be translated (Arabic/English) and work right-to-left in Arabic.

---

## 1. Orders

### 1.1 Order notifications (#8)
- **In-dashboard notification** when a new order arrives: a bell with an unread count, a toast, and a link to the order.
- **Settings → Notifications:** a field for the **admin WhatsApp number** (any country code).
  - Every new order sends a WhatsApp message to this number through **wawp** (the same provider as the OTP).
  - The message includes: order #, customer name and phone, items (name, size, colour, qty), total, payment method, and the shipping address or branch.
- **Customer WhatsApp on status change:** whenever an admin changes an order's status, the customer gets a WhatsApp message through wawp.
  - The message contains the new status and the note, if one was written.
  - Templates should be editable in Arabic and English.

### 1.2 Status change with a note (#9)
- The "change status" form already has a note field. That note must be **saved with the status change** and show on the website under the order's "Order updates" (Backend §3).
- In the test, a note written with a status change didn't appear on the site.
- Show the same history (status, note, date, admin name) inside the order page in the dashboard.

### 1.3 Filters and search (#12, #13)
On the orders list, add:
- **Search by order number** (exact match on the ID, e.g. `1024` or `#1024`).
- **Filter by product**: a searchable multi-select. It shows orders that contain any of the chosen products.
- **Filter by governorate**, then **filter by city**. The city list depends on the chosen governorate, using the same Bosta list as the website.
- Filters combine with each other and with the existing status/date filters, and they're kept in the URL.

### 1.4 Export to Excel (#33)
- The "Export to Excel" button currently produces an **empty sheet**.
- It must export the orders matching the current filters, with: order #, date, customer, phone, governorate, city, address, items, quantities, subtotal, discount, coupon, shipping, total, payment method, payment status, and order status.

---

## 2. Returns (#10) — new page

The website now has a "Request a return" button on delivered orders (Backend §3).

**Returns list:**
- Columns: request #, order #, customer, items with quantities, reason, details, date, and status (`pending`, `approved`, `rejected`, `completed`).
- Filter by status and search by order #.

**Return detail:**
- Admins can **approve**, **reject** (with a reason shown to the customer) or mark it **completed**.
- Each change notifies the customer on WhatsApp.

Also show a badge on the order page when it has a return request.

**Reason labels:**

| Value | Arabic | English |
|---|---|---|
| wrong_size | المقاس غير مناسب | Size doesn't fit |
| damaged | المنتج تالف أو به عيب | Damaged or defective |
| not_as_described | المنتج مختلف عن الوصف | Not as described |
| wrong_item | استلمت منتجًا خاطئًا | Received the wrong item |
| changed_mind | غيرت رأيي | Changed my mind |
| other | سبب آخر | Other |

---

## 3. Reviews (#14) — new page

Customers can now rate products from a delivered order (Backend §3).

- **Reviews list:**
  - Columns: product, customer, order #, stars, comment, date, and status (`pending`, `approved`, `hidden`).
  - Filter by status, by product, and by rating.
- **Actions:** approve, hide, delete.
- Only approved reviews appear on the website's home page ("Product Reviews").

---

## 4. Coupons (#5, #6)

- **New coupon type: "Free shipping"** (شحن مجاني).
  - When it's selected, hide the value and max-discount fields.
  - Keep code, minimum order amount, start/end dates, usage limit and active switch.
- Show the type in the coupons list.
- Coupon errors on the website now show clear messages (expired, not active yet, usage limit reached, minimum amount). Make sure the dashboard's start date, end date, usage limit and minimum are saved and enforced (Backend §2).

---

## 5. Countries (#7)

- The active / inactive switch controls **only the countries customers can ship to** (the address country on the website).
- It does **not** limit phone numbers: customers can register with a number from any country. Many buyers aren't Egyptian.
- For now the client will keep **only Egypt active** to stop shipping abroad.
- Add a short hint next to the switch: "Controls shipping countries only".

---

## 6. Customer addresses (#2)

Wherever addresses appear (order page, customer page, exports, filters):
- Show the new **address title** ("Home", "Work"…). Old addresses have no title; show the recipient name instead.
- Show the fields in the new order: country, governorate, city, street, **landmark**.
- The landmark is stored in the old `apartment` field, so rename the label to "Landmark / علامة مميزة".
- For non-Egyptian addresses, governorate and city are free text.

---

## 7. Users and admins

### 7.1 Admins with permissions (#27)
- The "Add new user" button currently just opens the users page.
- It should open a form to **create an admin**: name, email, phone, password, active switch.
- Each admin gets a **role** or a set of **permissions per section**, each section with view / create / edit / delete:
  - Orders, Returns, Reviews, Products, Categories, Coupons, Customers, Banners, Tickers, Pages, Branches, Settings, Countries, Admins.
- The sidebar and buttons hide anything the admin can't access. The API must also block it.

### 7.2 Export users (#35)
Add an "Export to Excel" button on the users/customers page, using the current filters. Columns: name, phone, email, verified, sign-up method (phone/Google), number of orders, total spent, sign-up date.

### 7.3 Recent customers widget (#26)
On the dashboard home, "Recent customers" (أحدث المشتركين): clicking a row's arrow always opens **the logged-in admin's own profile**. It must open **that customer's** page.

---

## 8. Products

### 8.1 Product code (#1)
The website now shows **"Product code: #<id>"** and the variant SKU.
- Show the product ID clearly on the product list and edit page, and make it searchable.
- If the client wants their own codes, add a "Product code" field (Backend §7).

### 8.2 Excel export (#34)
The products export **misses some images**: some products come out with images and some without. It must include every image URL of each product (main image plus gallery, and per-colour images). Use one column with the URLs separated by commas, or numbered columns.

---

## 9. Home page content

### 9.1 News tickers (#28)
In the test:
- Adding a **second ticker** didn't show it on the site.
- **Deactivating** a ticker didn't hide it.
- The **on/off switch** for the whole bar did nothing.

Fix all three:
- Every active ticker shows on the site.
- Inactive ones are hidden.
- The global switch hides or shows the whole bar.
- Save each ticker's text in Arabic and English.

The website picks up changes within about one minute.

### 9.2 Banners
Nothing needed in the dashboard: the website now hides the arrows when there's only one banner (#18). Recommended banner size: wide (e.g. 1920×800).

### 9.3 Section titles (#30)
The latest-products section is now always titled "أحدث المنتجات / Latest Products" on the site. If its title is editable in the dashboard, set it to the same text.

---

## 10. Contact messages (#22, #24)

- **Email is now optional** on the website's contact form. The messages list and detail must handle an empty email (show "—").
- **#24:** replying to a contact message over WhatsApp fails with "فشل إرسال الرد" (sending the reply failed).
  - Fix the wawp send.
  - Show the real error reason when it fails.
  - Keep the reply text in the box so it isn't lost.

---

## 11. Settings

- **Contact numbers (#36):** the website already reads the phone and WhatsApp numbers from settings. Make sure they're editable in the dashboard, with any country code.
- **Payments (#4):** if there's a payment-settings page, add a switch to hide **Apple Pay** until the client's Apple account is ready. Otherwise turn it off in Paymob (Backend §8).
- **Admin WhatsApp number** for new-order alerts (see 1.1).

---

## Checklist

| # | Item | Section |
|---|---|---|
| 1 | Show product code / ID | 8.1 |
| 2 | Address title, landmark, new field order | 6 |
| 4 | Hide Apple Pay | 11 |
| 5, 6 | Coupon rules + free-shipping coupon type | 4 |
| 7 | Countries = shipping only | 5 |
| 8 | New-order notification + WhatsApp (admin and customer) | 1.1 |
| 9 | Status note saved and shown on site | 1.2 |
| 10 | Returns page | 2 |
| 12, 13 | Order filters (product, governorate, city) + search by # | 1.3 |
| 14 | Reviews moderation | 3 |
| 22 | Contact email optional | 10 |
| 24 | WhatsApp reply to contact messages failing | 10 |
| 26 | Recent customers arrow opens the wrong profile | 7.3 |
| 27 | Create admins with permissions | 7.1 |
| 28 | Tickers: add / deactivate / on-off | 9.1 |
| 33 | Orders Excel export empty | 1.4 |
| 34 | Products Excel export missing images | 8.2 |
| 35 | Users Excel export | 7.2 |
| 36 | Phone / WhatsApp numbers editable | 11 |
