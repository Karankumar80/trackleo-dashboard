import React from 'react';
import AdafruitCustomDashboardLive from './components/AdafruitCustomDashboardLive.jsx';

export default function App() {
  return (
    <AdafruitCustomDashboardLive
      // leave wsUrl empty to auto-use same host via Vite proxy
      wsUrl=""
      feeds={{
        mpu6050: "mpu-data",
        tmp117: "temp-data",
        max30102: "max-data",
        gps: "gps-data"
      }}
    />
  );
}
