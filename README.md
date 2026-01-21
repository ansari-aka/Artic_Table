# Assignment – Artwork Data Table

This project is a React + TypeScript application built using **Vite**.  
It displays artwork data from the **Art Institute of Chicago API** using **PrimeReact DataTable** with **server-side pagination** and **persistent row selection**.

---

## 🚀 Tech Stack

- **React** (Vite)
- **TypeScript**
- **PrimeReact**
- **PrimeIcons**
- **CSS**
- **Art Institute of Chicago API**

---

## 📦 Project Setup

```bash
npm install
npm run dev
```
## ✨ Features

- **Server-side Pagination (Lazy Loading)**
  - Loads artworks page-by-page from the API.
  - Uses PrimeReact `DataTable` with `paginator` + `lazy` + `onPage`.

- **Loading & Error States**
  - Shows a loading indicator while fetching data.
  - Displays API/network errors gracefully.

- **Checkbox Row Selection**
  - Select individual rows using checkboxes.
  - Supports select-all for the **current page** (PrimeReact behavior).

- **Persistent Selection Across Pages (Visited Pages)**
  - Keeps selected items even when the user navigates to different pages.
  - Stores selection as a global `Set<number>` of IDs (`selectedIds`) for performance.
  - Reconstructs current page selected row objects using:
    - `currentPageSelection = pageRows.filter(row => selectedIds.has(row.id))`

- **"Select N (This Page)" Custom Action**
  - Opens an OverlayPanel to input a number `N`.
  - Selects the first `N` rows **only from the currently loaded page**.
  - Does **not** trigger extra API calls.

- **Performance Optimizations**
  - Uses `useMemo` to compute selection for the current page efficiently.
  - Uses `Set.has()` for O(1) membership checks.

- **Clean & Typed Code (TypeScript)**
  - Typed API response and row model (`Artwork`, `ApiResponse`).
  - Typed PrimeReact events (`DataTablePageEvent`, `DataTableSelectionMultipleChangeEvent`).
