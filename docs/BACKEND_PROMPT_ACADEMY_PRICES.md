# Backend prompt: Academy prices endpoint

Use this prompt in your backend project to implement the academy prices API. Prices are stored in a **subcollection named `prices`** under the academy’s document in the **users** collection (same pattern as the schedule).

---

## Prompt for backend

**Implement the academy prices API with the following contract.**

### Data model

- **Collection:** `users` (existing; academy users are documents in this collection).
- **Subcollection:** `prices` under the academy user document.
- **Storage:** Store the list of price options in the `prices` subcollection. Recommended: a single document (e.g. id `options` or `default`) that contains an array of price objects. Alternatively, one document per price with an array field.

**Price item shape:**

Each price has:

- `id` (string): unique identifier (e.g. UUID). Frontend generates this when creating.
- `type` (string): one of `"individual"`, `"couples"`, `"private"`.
- `monthlyPrice` (number): monthly price in dollars (e.g. 50, 90.5).
- `classesPerWeek` (number): number of lessons included per week (1–7).

Example body the frontend sends on **PUT**:

```json
{
  "prices": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "individual",
      "monthlyPrice": 50,
      "classesPerWeek": 2
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "type": "couples",
      "monthlyPrice": 90,
      "classesPerWeek": 2
    },
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "type": "private",
      "monthlyPrice": 120,
      "classesPerWeek": 1
    }
  ]
}
```

So the prices must be **recorded in the academy document in the users collection**, using a **subcollection called `prices`** (e.g. `users/{academyId}/prices/options` with an array field, or one doc per price in `users/{academyId}/prices/{priceId}`).

### Endpoints

1. **GET `/api/users/:userId/prices`**
   - **Auth:** Required (e.g. Bearer token). Caller must be allowed to read this academy (e.g. the academy user themselves).
   - **Params:** `userId` = academy user document id (the academy’s id in `users`).
   - **Response:** Return the stored prices array.
     - `200`: `{ "prices": [ { "id", "type", "monthlyPrice", "classesPerWeek" }, ... ] }`
     - If no prices exist yet, return `404` or `200` with `prices: []`; the frontend treats both as an empty list.

2. **PUT `/api/users/:userId/prices`**
   - **Auth:** Required. Caller must be allowed to update this academy (e.g. the academy user themselves).
   - **Params:** `userId` = academy user document id.
   - **Body:** `{ "prices": [ { "id", "type", "monthlyPrice", "classesPerWeek" }, ... ] }`.
   - **Validation:**
     - `prices` must be an array.
     - Each item must have `id` (string), `type` (one of `"individual"`, `"couples"`, `"private"`), `monthlyPrice` (number ≥ 0), `classesPerWeek` (integer 1–7). Normalize or reject invalid entries.
   - **Persistence:** Write the full `prices` array into the **subcollection `prices`** of the academy’s document in the **users** collection (e.g. create or overwrite a document like `users/{userId}/prices/options` with `{ prices: [...] }`, or replace all documents in `users/{userId}/prices` to match the new list).
   - **Response:** `200` with the saved list, e.g. `{ "prices": [ ... ] }`. On validation or auth failure return appropriate 4xx and error message.

### Summary

- **Collection:** `users`.
- **Subcollection:** `prices` under the academy user document.
- **GET** `/api/users/:userId/prices` → read prices from `users/{userId}/prices`.
- **PUT** `/api/users/:userId/prices` with body `{ "prices": [ { id, type, monthlyPrice, classesPerWeek }, ... ] }` → write into `users/{userId}/prices`.
- Auth: only the academy (or allowed roles) can read/update their own prices.
