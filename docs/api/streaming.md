# 📡 Streaming API Reference

Complete API reference for the Radio Streaming Platform backend services.

## 🌐 Base URL

- **Development**: `http://localhost:6870`
- **Production**: `https://wave.adoo.one`

## 🔐 Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 🎵 Health Check

### Health Check
Check the health status of the API server.

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🎛️ RTMP Server Management

### Start RTMP Server
Start the Docker-based RTMP server.

```http
POST /api/stream/rtmp/start
```

**Response:**
```json
{
  "success": true,
  "message": "RTMP server started successfully"
}
```

### Stop RTMP Server
Stop the RTMP server.

```http
POST /api/stream/rtmp/stop
```

**Response:**
```json
{
  "success": true,
  "message": "RTMP server stopped successfully"
}
```

### Restart RTMP Server
Restart the RTMP server.

```http
POST /api/stream/rtmp/restart
```

**Response:**
```json
{
  "success": true,
  "message": "RTMP server restarted successfully"
}
```

### Get RTMP Configuration
Get the current RTMP server configuration.

```http
GET /api/stream/rtmp/config
```

**Response:**
```json
{
  "success": true,
  "config": {
    "rtmpUrl": "rtmp://localhost:1935/live",
    "hlsUrl": "http://localhost:8069/hls/",
    "streamKey": "your-stream-key"
  }
}
```

### Update RTMP Configuration
Update the RTMP server configuration.

```http
PUT /api/stream/rtmp/config
```

**Request Body:**
```json
{
  "rtmpUrl": "rtmp://localhost:1935/live",
  "hlsUrl": "http://localhost:8069/hls/",
  "streamKey": "new-stream-key"
}
```

**Response:**
```json
{
  "success": true,
  "message": "RTMP configuration updated successfully"
}
```

## 📊 Monitoring Endpoints

### Get All Monitoring Data
Get comprehensive monitoring data for all services.

```http
GET /api/monitoring/
```

**Response:**
```json
{
  "success": true,
  "data": {
    "system": {
      "uptime": 3600,
      "memory": { "used": 512, "total": 1024 },
      "cpu": { "usage": 25.5 }
    },
    "rtmp": {
      "status": "running",
      "uptime": 3600,
      "connections": 5
    }
  }
}
```

### Get System Health
Get system health overview.

```http
GET /api/monitoring/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600,
    "memory": { "used": 512, "total": 1024 },
    "cpu": { "usage": 25.5 }
  }
}
```

### Get RTMP Service Statistics
Get detailed statistics for the RTMP service.

```http
GET /api/monitoring/rtmp
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "running",
    "uptime": 3600,
    "connections": 5,
    "lastError": null
  }
}
```

### Get Metrics for Specific Service
Get metrics for a specific service.

```http
GET /api/monitoring/metrics/{service}
```

**Parameters:**
- `service`: `rtmp`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "running",
    "uptime": 1800,
    "lastError": null
  }
}
```

### Get System Logs
Get system logs from all services.

```http
GET /api/monitoring/logs?source=all&lines=100
```

**Query Parameters:**
- `source`: Log source (`all`, `rtmp`, `wave`)
- `lines`: Number of lines to return (default: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2024-01-01T12:00:00.000Z",
        "level": "info",
        "service": "wave",
        "message": "Server started successfully"
      }
    ]
  }
}
```

### Get Service-Specific Logs
Get logs for a specific service.

```http
GET /api/monitoring/logs/{service}?lines=100
```

**Parameters:**
- `service`: Service name (`rtmp`, `wave`)

**Query Parameters:**
- `lines`: Number of lines to return (default: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2024-01-01T12:00:00.000Z",
        "level": "info",
        "message": "Service started successfully"
      }
    ]
  }
}
```

## 🔄 WebSocket Events

The WebSocket server runs on port 6871 (dev) / 6971 (production).

### Connection
```javascript
const ws = new WebSocket('ws://localhost:6871');
```

### Event Types
- **status_update**: Service status changes
- **error**: Error notifications
- **log**: New log entries

### Example Usage
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'status_update':
      console.log('Status update:', data.payload);
      break;
    case 'error':
      console.error('Error:', data.payload);
      break;
    case 'log':
      console.log('Log:', data.payload);
      break;
  }
};
```

## 🚨 Error Handling

### Common Error Codes
- `SERVICE_NOT_FOUND`: Service not found
- `CONFIGURATION_ERROR`: Configuration error
- `SERVICE_ERROR`: Service-specific error
- `VALIDATION_ERROR`: Request validation error

### Error Response Format
```json
{
  "success": false,
  "error": "Service not found",
  "code": "SERVICE_NOT_FOUND"
}
```

## 🔧 Usage Examples

### cURL Examples

#### Start RTMP Server
```bash
curl -X POST http://localhost:6870/api/stream/rtmp/start
```

#### Get Monitoring Data
```bash
curl http://localhost:6870/api/monitoring/
```

#### Get System Health
```bash
curl http://localhost:6870/api/monitoring/health
```

### JavaScript/TypeScript Example
```typescript
class StreamingAPI {
  constructor(baseURL = 'http://localhost:6870') {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // RTMP operations
  async startRtmpServer() {
    return this.request('/api/stream/rtmp/start', { method: 'POST' });
  }

  async stopRtmpServer() {
    return this.request('/api/stream/rtmp/stop', { method: 'POST' });
  }

  async getRtmpConfig() {
    return this.request('/api/stream/rtmp/config');
  }

  // Monitoring operations
  async getMonitoringData() {
    return this.request('/api/monitoring/');
  }

  async getSystemHealth() {
    return this.request('/api/monitoring/health');
  }
}
```

---

**Next**: [WebSocket API](#websocket-events) | [Status Endpoints](#monitoring-endpoints)
