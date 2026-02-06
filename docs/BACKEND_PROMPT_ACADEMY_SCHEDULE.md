# Backend prompt: Academy schedule endpoint

Use this prompt in your backend project to implement the academy schedule API. The schedule is stored in a **subcollection named `schedule`** under the academy’s document in the **users** collection.

---

## Prompt for backend

**Implement the academy schedule API with the following contract.**

### Data model

- **Collection:** `users` (existing; academy users are documents in this collection).
- **Subcollection:** `schedule` under the academy user document.
- **Storage:** Store the weekly schedule in the `schedule` subcollection. Recommended: a single document (e.g. id `weekly` or `default`) whose fields represent the schedule.

**Schedule payload shape (per day):**

- Days: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`.
- Each day has:
  - `open` (boolean): whether the academy is open that day.
  - `openTime` (string): time the academy opens, e.g. `"09:00"`.
  - `closeTime` (string): time the academy closes, e.g. `"18:00"`.

Example body the frontend sends on **PUT**:

```json
{
  "schedule": {
    "mon": { "open": true, "openTime": "09:00", "closeTime": "18:00" },
    "tue": { "open": true, "openTime": "09:00", "closeTime": "18:00" },
    "wed": { "open": true, "openTime": "09:00", "closeTime": "18:00" },
    "thu": { "open": true, "openTime": "09:00", "closeTime": "18:00" },
    "fri": { "open": true, "openTime": "09:00", "closeTime": "18:00" },
    "sat": { "open": false, "openTime": "09:00", "closeTime": "18:00" },
    "sun": { "open": false, "openTime": "09:00", "closeTime": "18:00" }
  }
}
```

So the schedule must be **recorded in the document of the academy in the database in a subcollection called `schedule`** (e.g. `users/{academyId}/schedule/weekly` or one doc per academy that holds this object).

### Endpoints

1. **GET `/api/users/:userId/schedule`**
   - **Auth:** Required (e.g. Bearer token). Caller must be allowed to read this academy (e.g. the academy user themselves).
   - **Params:** `userId` = academy user document id (the academy’s id in `users`).
   - **Response:** Return the stored schedule in a shape the frontend can use, e.g.:
     - `200`: `{ "schedule": { "mon": { "open": true, "openTime": "09:00", "closeTime": "18:00" }, ... } }`
     - If no schedule exists yet, return `404` or `200` with `schedule: null` or `{}`; the frontend treats both as “use defaults”.

2. **PUT `/api/users/:userId/schedule`**
   - **Auth:** Required. Caller must be allowed to update this academy (e.g. the academy user themselves).
   - **Params:** `userId` = academy user document id.
   - **Body:** `{ "schedule": { "mon": { "open", "openTime", "closeTime" }, "tue": ..., "wed": ..., "thu": ..., "fri": ..., "sat": ..., "sun": ... } }`.
   - **Validation:** Ensure `schedule` is an object; each day key is one of `mon,tue,wed,thu,fri,sat,sun` and each value has `open` (boolean) and optionally `openTime`, `closeTime` (strings). Normalize or reject invalid data.
   - **Persistence:** Write this `schedule` object into the **subcollection `schedule`** of the academy’s document in the **users** collection (e.g. create or overwrite a document like `users/{userId}/schedule/weekly` with the schedule data).
   - **Response:** `200` with the saved schedule, e.g. `{ "schedule": { ... } }`. On validation or auth failure return appropriate 4xx and error message.

### Summary

- **Collection:** `users`.
- **Subcollection:** `schedule` under the academy user document.
- **GET** `/api/users/:userId/schedule` → read schedule from `users/{userId}/schedule`.
- **PUT** `/api/users/:userId/schedule` with body `{ "schedule": { mon, tue, ... } }` → write into `users/{userId}/schedule`.
- Auth: only the academy (or allowed roles) can read/update their own schedule.
