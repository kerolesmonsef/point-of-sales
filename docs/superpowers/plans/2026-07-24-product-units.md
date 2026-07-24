# Product Units Implementation Plan

**Goal:** Add multi-unit support to the product creation form

**Architecture:** New React component `UnitsSection` with inline collapsible rows, backend validation + pivot sync in `ProductController@store`

**Tech Stack:** React 18, Tailwind CSS 3, Laravel 12, Inertia 2.0

---

### Task 1: Create UnitsSection component

**Files:** Create `resources/js/Components/Products/UnitsSection.jsx`

### Task 2: Wire into Create page

**Files:** Modify `resources/js/Pages/Dashboard/Products/Create.jsx`, pass units from controller

### Task 3: Backend validation + save

**Files:** Modify `app/Http/Controllers/Apps/ProductController.php`

### Task 4: Verify

Run `vendor/bin/pint` and manual test
