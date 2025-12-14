# API Documentation

## Overview
Complete REST API for the e-commerce filtering system.

---

## Endpoints

### Categories API

#### Get All Categories
```
GET /api/categories
```

**Parameters**: None

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Men",
      "slug": "men",
      "description": "Men's clothing",
      "parent_id": null,
      "image_url": "https://...",
      "display_order": 0,
      "productCount": 150
    },
    {
      "id": 2,
      "name": "Women",
      "slug": "women",
      "description": "Women's clothing",
      "parent_id": null,
      "image_url": "https://...",
      "display_order": 1,
      "productCount": 200
    }
  ],
  "hierarchical": [
    {
      "id": 1,
      "name": "Men",
      "slug": "men",
      "children": [
        {
          "id": 3,
          "name": "Shirts",
          "slug": "men-shirts",
          "children": []
        }
      ]
    }
  ],
  "meta": {
    "total": 15
  }
}
```

**Error** (500):
```json
{
  "success": false,
  "error": "Error message",
  "code": "error_code"
}
```

---

### Products API

#### Get Products (with filtering)
```
GET /api/products?page=1&limit=24&search=&category=&minPrice=&maxPrice=&sizes=&colors=&brands=&sortBy=newest
```

**Query Parameters**:

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Page number (1-indexed) |
| `limit` | integer | 24 | 100 | Items per page |
| `search` | string | - | - | Search in name/description |
| `category` | string | all | - | Category slug (e.g., 'men') |
| `minPrice` | number | - | - | Minimum price in cents |
| `maxPrice` | number | - | - | Maximum price in cents |
| `sizes` | string | - | - | CSV of sizes (e.g., 'S,M,L') |
| `colors` | string | - | - | CSV of colors (e.g., 'red,blue') |
| `brands` | string | - | - | CSV of brands (e.g., 'Nike,Adidas') |
| `sortBy` | enum | newest | - | Sort order |

**Sort Options**:
- `newest` - Most recently added
- `price_asc` - Price: Low to High
- `price_desc` - Price: High to Low
- `rating` - Highest rated
- `name` - Alphabetical A to Z

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Classic T-Shirt",
      "price": 2999,
      "discount_price": 1999,
      "description": "Comfortable cotton t-shirt",
      "image_urls": [
        "https://cdn.example.com/image1.jpg",
        "https://cdn.example.com/image2.jpg"
      ],
      "video_urls": [
        "https://cdn.example.com/video1.mp4"
      ],
      "stock_quantity": 150,
      "rating": 4.5,
      "brand": "Nike",
      "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
      "colors": ["Black", "White", "Red", "Blue"],
      "gender_target": "men",
      "is_featured": true,
      "is_active": true,
      "categories": [
        {
          "id": 1,
          "name": "Men",
          "slug": "men"
        },
        {
          "id": 3,
          "name": "Shirts",
          "slug": "men-shirts"
        }
      ]
    }
  ],
  "meta": {
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 240,
      "itemsPerPage": 24,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "startItem": 1,
      "endItem": 24,
      "pageNumbers": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    "filters": {
      "category": "men",
      "minPrice": "50",
      "maxPrice": "200",
      "sortBy": "newest",
      "search": "shirt",
      "sizes": ["M", "L"],
      "colors": ["black"],
      "brands": ["Nike"]
    },
    "links": {
      "self": "/api/products?page=1&limit=24&...",
      "first": "/api/products?page=1&limit=24&...",
      "last": "/api/products?page=10&limit=24&...",
      "prev": null,
      "next": "/api/products?page=2&limit=24&..."
    }
  }
}
```

**Error** (500):
```json
{
  "success": false,
  "error": "Error message",
  "code": "error_code"
}
```

---

### Product Detail API

#### Get Single Product
```
GET /api/products/{id}
```

**Parameters**:
- `id` (URL param) - Product ID

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "name": "Classic T-Shirt",
    "price": 2999,
    "discount_price": 1999,
    "description": "High-quality cotton t-shirt perfect for everyday wear. Comfortable fit, durable fabric.",
    "stock_quantity": 150,
    "gender_target": "men",
    "image_urls": [
      "https://cdn.example.com/shirt-1.jpg",
      "https://cdn.example.com/shirt-2.jpg",
      "https://cdn.example.com/shirt-3.jpg"
    ],
    "video_urls": [
      "https://cdn.example.com/shirt-demo.mp4"
    ],
    "is_featured": true,
    "is_active": true,
    "rating": 4.5,
    "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
    "colors": ["Black", "White", "Red", "Blue", "Green"],
    "brand": "Nike",
    "categories": [
      {
        "id": 1,
        "name": "Men",
        "slug": "men"
      },
      {
        "id": 3,
        "name": "Shirts",
        "slug": "men-shirts"
      }
    ]
  }
}
```

**Response** (404):
```json
{
  "success": false,
  "error": "Product not found"
}
```

**Error** (500):
```json
{
  "success": false,
  "error": "Error message",
  "code": "error_code"
}
```

---

## Request Examples

### cURL Examples

#### Get all products
```bash
curl "http://localhost:3003/api/products"
```

#### Search for products
```bash
curl "http://localhost:3003/api/products?search=shirt&limit=10"
```

#### Filter by category
```bash
curl "http://localhost:3003/api/products?category=men&page=1"
```

#### Filter by price range
```bash
curl "http://localhost:3003/api/products?minPrice=5000&maxPrice=15000"
```

#### Multiple filters
```bash
curl "http://localhost:3003/api/products?category=men&minPrice=5000&maxPrice=15000&sizes=M,L&sortBy=price_asc&page=1"
```

#### Get product details
```bash
curl "http://localhost:3003/api/products/1"
```

#### Get all categories
```bash
curl "http://localhost:3003/api/categories"
```

### JavaScript/Fetch Examples

#### Basic fetch
```javascript
const response = await fetch('/api/products');
const data = await response.json();
console.log(data);
```

#### With filters
```javascript
const params = new URLSearchParams({
  search: 'shirt',
  category: 'men',
  minPrice: 50,
  maxPrice: 200,
  sizes: 'M,L',
  sortBy: 'price_asc',
  page: 1,
  limit: 24
});

const response = await fetch(`/api/products?${params.toString()}`);
const data = await response.json();
console.log(data);
```

#### Get product details
```javascript
const productId = 123;
const response = await fetch(`/api/products/${productId}`);
const data = await response.json();
console.log(data);
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Best Practices

### Pagination
- Always use pagination to avoid large responses
- Default limit (24) is optimized for UI grids
- Max limit is 100 for safety

### Filtering
- Combine multiple filters for better results
- Empty arrays for sizes/colors/brands mean no filter
- Use CSV format for array parameters

### Caching
- Categories change rarely - safe to cache (5-10 minutes)
- Products change more frequently - cache shorter (1-2 minutes)
- Individual product detail pages - cache 5 minutes

### Error Handling
- Always check `success` field in response
- Use `error` field for user-facing messages
- Log `code` for debugging/analytics

### Performance
- Debounce search requests (recommended 400ms)
- Use pagination limits wisely
- Lazy load images in product lists

---

## Rate Limiting

Currently no rate limiting. Recommended implementation:
- 100 requests per minute per IP
- 10,000 requests per hour per IP

---

## CORS

API is available at same origin. For cross-origin requests, ensure proper CORS headers are set.

---

## Authentication

Currently no authentication required. For production, implement:
- JWT tokens
- Session-based auth
- API keys for client apps

---

## Versioning

Current API version: v1 (not in URL)

Future versions will use: `/api/v2/products`, etc.

---

## Webhooks (Future)

Planned webhook events:
- `product.created`
- `product.updated`
- `product.deleted`
- `category.created`
- `category.updated`

---

## GraphQL Alternative (Future)

Considering GraphQL implementation for complex queries and better caching.

---

**Last Updated**: December 10, 2024
