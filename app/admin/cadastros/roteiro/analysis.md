# Analysis of /admin/cadastros/roteiro Page

## Components Used
- **Button**: A customizable button component that supports different styles and sizes. It uses the `cn` utility for class name management.
- **Input**: A customizable input field that also uses the `cn` utility for consistent styling.
- **Card**: A component that provides a structured layout for displaying content, including headers, titles, descriptions, and content areas.
- **Select**: A dropdown component that allows users to select options. It includes validation for required fields and integrates with Radix UI's Select primitives.

## Functionality
- The page allows users to manage routes by selecting promoters and stores, visualizing them on a Google Map, and calculating routes between selected locations.
- It fetches data from the Supabase database, specifically from the `usuario` and `loja` tables, to populate the dropdowns and lists.
- The page includes drag-and-drop functionality for reordering locations and dynamically updates the route based on user interactions.

## Database Interactions
- **Fetching Promoters**: The `fetchPromoters` function retrieves promoter data from the `usuario` table in Supabase.
- **Fetching Stores**: The `fetchStoresForPromoter` function retrieves store data associated with a selected promoter from the `loja` table.
- **Geocoding Addresses**: The page uses Google Maps API to geocode addresses based on user input and updates the store coordinates in the database.

## Relationships
- The `usuario` table likely contains information about promoters, while the `loja` table contains information about stores, including their association with promoters through a foreign key (`promotor_id`).
