# Operations Dashboard

A dependency-light operations dashboard for managing invoices, customers, and orders. The frontend is built with native JavaScript modules and uses a local [`json-server`](https://github.com/typicode/json-server) API for persistent CRUD operations.

## Features

- Invoice, customer, and order CRUD workflows
- Search and status filters for every resource
- Invoice filtering by issue date or due date
- Sortable table columns and 25-row pagination
- Dashboard summaries for invoice revenue, overdue invoices, inactive customers, and cancelled orders
- Domain validation before records are persisted
- Generated IDs using `INV-###`, `CUS-###`, and `ORD-###` prefixes
- Independent initial loading of each resource with `Promise.allSettled`
- Loading, modal, and toast UI states

## Tech Stack

- HTML5 and CSS3
- Modern JavaScript (ES modules, Fetch API, private class fields, `structuredClone`)
- `json-server` 0.17
- Node.js and npm

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A static file server, such as Python's built-in HTTP server or the VS Code Live Server extension

### Install

```bash
npm install
```

### Run

Start the API in the first terminal:

```bash
npm run api
```

It is available at `http://localhost:3000`.

Serve the repository in a second terminal. For example, with Python:

```bash
python -m http.server 5500
```

Open `http://localhost:5500/html/mainpage.html`.

The frontend API base URL is currently configured in `script/api-and-service/api-client.js`. If the API runs on another host or port, update the `url` constant there.

> Do not open `mainpage.html` directly through a `file://` URL. Browsers restrict ES modules loaded from the local filesystem.

## API

`json-server` exposes REST endpoints backed by `db.json`:

| Resource | Collection endpoint | Single-record endpoint |
| --- | --- | --- |
| Invoices | `GET` / `POST` `/invoices` | `GET` / `PATCH` / `DELETE` `/invoices/:id` |
| Customers | `GET` / `POST` `/customers` | `GET` / `PATCH` / `DELETE` `/customers/:id` |
| Orders | `GET` / `POST` `/orders` | `GET` / `PATCH` / `DELETE` `/orders/:id` |

Changes made in the dashboard are persisted directly to `db.json`.

## Reset the Database

The source fixtures live in `data/data.js`. To overwrite `db.json` with those fixtures:

```bash
node generate-db.mjs
```

This discards CRUD changes previously written to `db.json`.

## Project Structure

```text
.
|-- bin/                         # Earlier command-line data exercises
|-- css/
|   `-- main.css                 # Dashboard styles
|-- data/
|   `-- data.js                  # Source fixtures
|-- html/
|   `-- mainpage.html            # Dashboard markup and forms
|-- script/
|   |-- api-and-service/         # Fetch client and REST operations
|   |-- controller/              # DOM events and feature orchestration
|   |-- manager/                 # State, validation, and domain operations
|   |-- ui/                      # Shared modal, loader, and pagination views
|   |-- app.js                   # Section navigation
|   |-- bootstrap.js             # Initial API loading and module setup
|   `-- helpers.js               # Shared data and rendering utilities
|-- db.json                      # Mutable json-server database
|-- generate-db.mjs              # Database reset script
`-- package.json
```

## Architecture

The application separates responsibilities into three layers:

1. **Service layer** builds HTTP requests and centralizes error handling.
2. **Manager layer** owns an isolated copy of each resource collection, validates domain records, generates IDs, and synchronizes successful API mutations into local state.
3. **Controller layer** reads user input, applies filtering/sorting/pagination, invokes managers, and renders the resulting view.

On startup, `bootstrap.js` fetches all three collections concurrently. `Promise.allSettled` lets a failed resource initialize with an empty collection without preventing the other dashboard sections from loading.

## Data Model

- **Invoice:** customer, status, amount, currency, issue date, and due date
- **Customer:** contact details, location, industry, status, credit limit, and creation date
- **Order:** customer, order status, payment status, dates, currency, line items, discount, and shipping

Refer to `data/data.js` or `db.json` for complete record examples.

## Development Notes

- There is currently no automated test suite; `npm test` is only the default placeholder.
- Pagination and filtering are performed client-side after collections are loaded.
- The API is intended for local development and has no authentication or authorization layer.
- Font Awesome is loaded from a CDN, so icons require an internet connection.

## License

ISC
