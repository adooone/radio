# 📡 Streaming Setup Guide

Complete guide for setting up OBS streaming to the RTMP server.

## 🎯 Overview

This guide covers:
1. **OBS Configuration** - Setting up OBS to stream to the RTMP server
2. **Service Management** - Starting and monitoring all services
3. **Troubleshooting** - Common issues and solutions

## 🎥 OBS Configuration

### 1. Install OBS Studio
Download and install OBS Studio from [https://obsproject.com/](https://obsproject.com/)

### 2. Configure Stream Settings

#### Stream Settings
1. Open OBS Studio
2. Go to **Settings** → **Stream**
3. Configure the following:
   - **Service**: Custom...
   - **Server**: `rtmp://localhost:1935/live`
   - **Stream Key**: `test`

#### Output Settings
1. Go to **Settings** → **Output**
2. Set **Output Mode** to **Advanced**
3. Configure **Streaming** tab:
   - **Audio Bitrate**: 128 kbps (recommended)
   - **Encoder**: Use Hardware Encoder if available
   - **Rate Control**: CBR (Constant Bitrate)
   - **Bitrate**: 1000-2500 kbps (for audio streaming, lower is fine)

#### Audio Settings
1. Go to **Settings** → **Audio**
2. Configure:
   - **Sample Rate**: 44.1 kHz
   - **Channels**: Stereo
   - **Desktop Audio Device**: Default
   - **Mic/Auxiliary Audio Device**: Configure as needed

### 3. Add Audio Sources
1. In the **Sources** panel, click **+**
2. Add **Audio Input Capture** for microphone
3. Add **Audio Output Capture** for desktop audio
4. Add **Media Source** for music files/playlists

## 🚀 Service Management

### 1. Start Services in Order

#### Start RTMP Server
```bash
# Using Docker directly
cd apps/wave
./scripts/start-rtmp.sh

# Or via API
curl -X POST http://localhost:6870/api/stream/rtmp/start
```

#### Start Wave Backend
```bash
pnpm wave:dev
# Or for production
pnpm wave:start
```

### 2. Verify Services

#### Check Service Status
```bash
# Check all PM2 processes
pm2 status

# Check Docker containers
docker ps --filter "name=rtmp-server"

# Check API health
curl http://localhost:6870/health
```

#### Expected Output
```bash
# PM2 Status
┌────┬────────────────────┬─────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode    │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼─────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ radio.wave         │ fork    │ 0    │ online    │ 0%       │ 4.3mb    │
└────┴────────────────────┴─────────┴──────┴───────────┴──────────┴──────────┘

# Docker Status
NAMES         STATUS                 PORTS
rtmp-server   Up 3 hours (healthy)   0.0.0.0:1935->1935/tcp, 0.0.0.0:8069->8069/tcp
```

## 🎬 Streaming Workflow

### 1. Complete Streaming Setup
```bash
# 1. Start RTMP server
curl -X POST http://localhost:6870/api/stream/rtmp/start

# 2. Wait for server to be ready (check Docker logs)
docker logs rtmp-server

# 3. Start OBS streaming
# Click "Start Streaming" in OBS Studio
```

### 2. Monitor Streaming
```bash
# Check RTMP server logs
docker logs rtmp-server --tail 20

# Check Wave backend logs
pm2 logs radio.wave --lines 20
```

### 3. Stream Status Indicators

#### Connection Issues
```bash
# Error indicators:
❌ Connection refused
❌ Network is unreachable
❌ Input/output error
```

## 🛠️ Admin Panel

### Access Admin Interface
1. Open browser: `http://localhost:3001`
2. Navigate to streaming controls
3. Monitor real-time status
4. Control services via web interface

### Available Controls
- **RTMP Server**: Start/Stop/Restart
- **Configuration**: Update RTMP settings
- **Monitoring**: Real-time status and logs

## 🚨 Troubleshooting

### Common Issues

#### FFmpeg Not Found
**Error**: `ENOENT: no such file or directory, posix_spawn 'ffmpeg'`

**Solution**:
```bash
# Install FFmpeg
sudo apt install ffmpeg  # Ubuntu/Debian
brew install ffmpeg      # macOS

# Verify installation
ffmpeg -version
which ffmpeg
```

#### OBS Connection Failed
**Error**: OBS shows "Failed to connect to server"

**Solution**:
```bash
# Check if RTMP server is running
docker ps --filter "name=rtmp-server"

# Check RTMP server logs
docker logs rtmp-server

# Restart RTMP server if needed
curl -X POST http://localhost:6870/api/stream/rtmp/restart
```

#### Port Already in Use
**Error**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find process using the port
sudo lsof -i :1935  # RTMP
sudo lsof -i :6970  # Wave API
sudo lsof -i :6971  # WebSocket

# Kill the process
sudo kill -9 <PID>
```

### Debug Commands

#### Service Status
```bash
# Check all services
pm2 status
docker ps
netstat -tulpn | grep -E ':(1935|6870|6871|3001|8069)'

# Test connectivity
curl http://localhost:6870/health
curl http://localhost:3001/health
```

#### Stream Testing
```bash
# Test RTMP server with FFmpeg
ffmpeg -f lavfi -i testsrc=duration=10:size=320x240:rate=1 \
       -f lavfi -i sine=frequency=1000:duration=10 \
       -c:v libx264 -c:a aac -f flv rtmp://localhost:1935/live/test

# Check HLS output
curl http://localhost:8069/hls/stream.m3u8
```

#### Log Analysis
```bash
# Follow logs in real-time
pm2 logs radio.wave --lines 0 --raw
docker logs -f rtmp-server

# Search for errors
pm2 logs radio.wave | grep -i error
docker logs rtmp-server 2>&1 | grep -i error
```

## 📊 Performance Monitoring

### Resource Usage
```bash
# Check system resources
htop
docker stats rtmp-server
pm2 monit
```

### Stream Quality
- **Audio Quality**: Monitor bitrate in logs
- **Connection Stability**: Check for reconnection attempts
- **Latency**: Monitor stream delay
- **Error Rate**: Watch for connection errors

### Optimization Tips
1. **Use Hardware Encoding** in OBS when available
2. **Optimize Audio Bitrate** based on content (voice vs music)
3. **Monitor System Resources** to prevent overload
4. **Use Ethernet Connection** for stability
5. **Close Unnecessary Applications** during streaming

---

**🎵 Happy Streaming!** 

For additional support, check the main [README](../README.md) and [troubleshooting section](../README.md#-troubleshooting).
