# Customer Form - Address Field Handling

## Issue Fixed

The customer form was sending address data as separate fields (`street_address`, `barangay`, `city`, `province`, `region`, `postal_code`, `country`), but the database schema stores all address information in a single `address TEXT` field in the `customers` table.

## Solution

### Backend Processing

The backend now:
1. **Receives** all address components from the frontend form
2. **Combines** non-empty address parts with comma separators
3. **Stores** the combined address string in the `customers.address` column

**Example:**
```javascript
// Frontend sends:
{
  street_address: "lopez street",
  barangay: "",
  city: "manila",
  province: "",
  region: "",
  postal_code: "",
  country: "Philippines"
}

// Backend combines to:
"lopez street, manila, Philippines"

// Stored in database as:
customers.address = "lopez street, manila, Philippines"
```

### Code Changes

**createCustomer()** function:
```javascript
// Build address string from components
const addressParts = [street_address, barangay, city, province, region, postal_code, country]
  .filter(part => part && part.trim())  // Remove empty parts
  .join(', ');                           // Join with comma-space

// Insert with combined address
INSERT INTO customers (..., address, ...)
VALUES (..., addressParts || null, ...)
```

**updateCustomer()** function:
```javascript
// Same logic: combine address parts, then update
address = COALESCE($6, address)  // Only update if provided
```

## Benefits

✅ **Flexible Input**: Frontend can accept granular address fields for better UX
✅ **Simple Storage**: Database keeps single address field (no schema changes needed)
✅ **Backward Compatible**: Works with existing database structure
✅ **Clean Display**: Address displays as single readable string

## Frontend Form Structure

The customer form collects:
- `street_address` - Street name and number
- `barangay` - Barangay/subdivision name
- `city` - City/municipality
- `province` - Province (with 73-option dropdown)
- `region` - Region/state
- `postal_code` - ZIP/postal code
- `country` - Country (default: Philippines, disabled)

All fields are optional except `first_name` and `last_name`.

## Backend Processing Flow

```
1. Receive form data with 6-7 address fields
   ↓
2. Filter out empty/whitespace fields
   ↓
3. Join remaining fields with ", "
   ↓
4. Store in customers.address as single string
   ↓
5. Return to frontend as combined address
```

## Example Flow

**Create Customer**
```
Frontend Form Data:
{
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  phone: "+63912345678",
  street_address: "123 Main St",
  city: "Manila",
  province: "NCR",
  country: "Philippines"
}
       ↓
Backend combines address:
"123 Main St, Manila, NCR, Philippines"
       ↓
Database stores:
customers.address = "123 Main St, Manila, NCR, Philippines"
       ↓
API Response:
{
  success: true,
  customer: {
    id: "...",
    first_name: "John",
    last_name: "Doe",
    address: "123 Main St, Manila, NCR, Philippines",
    ...
  }
}
```

## Testing

To verify this works:

1. **Create Customer**
   - Fill in customer form with address fields
   - Submit → Should create successfully
   - Address should be combined in database

2. **Edit Customer**
   - Fetch existing customer
   - Modify address fields
   - Submit → Should update successfully
   - Address should be combined with new values

3. **View Customer**
   - Fetch customer data
   - Address displays as single string
   - Form can parse it back to separate fields

## Notes

- Empty address fields are skipped (not included in final string)
- Comma-space (", ") is used as separator
- Address is optional (if all address fields empty, address = NULL)
- This works with the existing database schema without migrations
