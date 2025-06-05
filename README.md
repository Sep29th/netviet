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
GET /api/indices
```

### 🎯 Get Specific Index

Lấy thông tin chi tiết của một chỉ số cụ thể.

```http
GET /api/indices/:name
```

#### Parameters

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `name`    | string | Yes      | Symbol của chỉ số |

#### Valid Symbols

- `^DJI` - Dow Jones Industrial Average
- `^GSPC` - S&P 500
- `^IXIC` - NASDAQ Composite

---

## ⚡ WebSocket Gateway

Real-time updates cho các chỉ số chứng khoán qua WebSocket connection.

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