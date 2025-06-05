# 📈 Indices API & WebSocket Gateway

Hệ thống API và WebSocket Gateway để theo dõi và phân tích các chỉ số chứng khoán real-time.

## 🔗 Quick Links

### 🧪 Test Clients

- **🌐 API Test Client**: [https://netviet-production.up.railway.app/static/api.html](https://netviet-production.up.railway.app/static/api.html)
- **⚡ WebSocket Test Client**: [https://netviet-production.up.railway.app/static/socket.html](https://netviet-production.up.railway.app/static/socket.html)

### 📊 Live APIs

- **Base URL**: `https://netviet-production.up.railway.app`
- **WebSocket Namespace**: `/indices`

---

## 🚀 REST APIs

### 📋 Get All Indices

Lấy danh sách tất cả các chỉ số chứng khoán có sẵn.

```http
GET /api/indices?page=1&limit=10
// default value: page = 1, limit = 10
```

#### Response Example

```json
{
  "path": "/api/indices",
  "timestamp": "2025-06-05T12:01:48.123Z",
  "statusCode": 200,
  "message": "OK",
  "success": [
    {
      "_id": "68417f405cce7c9df88f228d",
      "symbol": "^IXIC",
      "name": "NASDAQ Composite",
      "currency": "USD",
      "currentPrice": 19460.488,
      "openPrice": 19434.9,
      "hightPrice": 20204.58,
      "lowPrice": 14784.03,
      "changePercent": 0.0031718845,
      "timestamp": "2025-06-04T21:15:59.000Z",
      "__v": 0,
      "createdAt": "2025-06-05T11:28:00.064Z",
      "updatedAt": "2025-06-05T11:28:00.064Z"
    },
    {
      "_id": "684180305cce7c9df88f2291",
      "symbol": "^IXIC",
      "name": "NASDAQ Composite",
      "currency": "USD",
      "currentPrice": 19460.488,
      "openPrice": 19434.9,
      "hightPrice": 20204.58,
      "lowPrice": 14784.03,
      "changePercent": 0.0031718845,
      "timestamp": "2025-06-04T21:15:59.000Z",
      "__v": 0,
      "createdAt": "2025-06-05T11:32:00.054Z",
      "updatedAt": "2025-06-05T11:32:00.054Z"
    }
  ]
}
```

### 🎯 Get Specific Index

Lấy thông tin chi tiết của một chỉ số cụ thể.

```http
GET /api/indices/:name?page=1&limit=10
// default value: page = 1, limit = 10
```

#### Parameters

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `name`    | string | Yes      | Symbol của chỉ số |

#### Valid Symbols

- `^DJI` - Dow Jones Industrial Average
- `^GSPC` - S&P 500
- `^IXIC` - NASDAQ Composite

#### Response Example

```json
{
  "path": "/api/indices/%5EDJI",
  "timestamp": "2025-06-05T12:02:53.440Z",
  "statusCode": 200,
  "message": "OK",
  "success": {
    "analysis": {
      "comparisonPercentage": 99.78,
      "recommendation": "Not recommended"
    },
    "indices": [
      {
        "_id": "68417f405cce7c9df88f228b",
        "symbol": "^DJI",
        "name": "Dow Jones Industrial Average",
        "currency": "USD",
        "currentPrice": 42427.74,
        "openPrice": 42574.1,
        "hightPrice": 45073.63,
        "lowPrice": 36611.78,
        "changePercent": -0.0021614092,
        "timestamp": "2025-06-04T20:57:23.000Z",
        "__v": 0,
        "createdAt": "2025-06-05T11:28:00.064Z",
        "updatedAt": "2025-06-05T11:28:00.064Z"
      },
      {
        "_id": "684180305cce7c9df88f228f",
        "symbol": "^DJI",
        "name": "Dow Jones Industrial Average",
        "currency": "USD",
        "currentPrice": 42427.74,
        "openPrice": 42574.1,
        "hightPrice": 45073.63,
        "lowPrice": 36611.78,
        "changePercent": -0.0021614092,
        "timestamp": "2025-06-04T20:57:23.000Z",
        "__v": 0,
        "createdAt": "2025-06-05T11:32:00.053Z",
        "updatedAt": "2025-06-05T11:32:00.053Z"
      }
    ]
  }
}
```

#### Error Response

```json
{
  "path": "/api/indices/%5EABC",
  "timestamp": "2025-06-05T12:04:10.157Z",
  "statusCode": 400,
  "message": "Symbol ^ABC is not supported.",
  "error": "Bad Request"
}
```

---

## ⚡ WebSocket Gateway

Real-time updates cho các chỉ số chứng khoán qua WebSocket connection, được crawler làm mới 4 phút 1 lần.

### 🔌 Connection

```javascript
const socket = io('https://netviet-production.up.railway.app/indices', {
  transports: ['websocket', 'polling'],
  timeout: 30000,
});
```

#### Configuration

- **Namespace**: `/indices`
- **CORS**: `origin: '*'` (cho development)
- **Transports**: WebSocket, Polling
- **Ping Timeout**: 30,000ms
- **Ping Interval**: 10,000ms

### 📤 Outgoing Events (Client → Server)

#### 1. Subscribe to Index Updates

Subscribe để nhận real-time updates cho một chỉ số cụ thể.

```javascript
socket.emit('subscribeToIndices', '^DJI');
```

**Parameters:**

- `symbol` (string): Symbol của chỉ số muốn theo dõi

#### 2. Unsubscribe from Index Updates

Hủy subscribe khỏi updates của một chỉ số.

```javascript
socket.emit('unsubscribeFromIndices', '^DJI');
```

**Parameters:**

- `symbol` (string): Symbol của chỉ số muốn hủy theo dõi

### 📥 Incoming Events (Server → Client)

#### 1. Indices Updates

Nhận real-time updates về chỉ số đã subscribe.

```javascript
socket.on('indicesUpdate', (data) => {
  console.log('Indices Update:', data);
});
```

**Example Data:**

```json
{
  "indices": {
    "name": "Dow Jones Industrial Average",
    "currentPrice": 42427.74
  },
  "analysis": {
    "comparisonPercentage": 99.78,
    "recommendation": "Not recommended"
  }
}
```

#### Error Message

```json
{
  "event": "subscribeToIndices",
  "message": "Index ^ABC is not supported. Valid indices: ^DJI, ^IXIC, ^GSPC}",
  "code": "INVALID_INDEX",
  "validIndices": ["^DJI", "^IXIC", "^GSPC"]
}
```
