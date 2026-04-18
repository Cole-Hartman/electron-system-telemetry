A small Electron desktop app with a React + Vite UI. 

The main node process polls CPU, memory, and disk usage and sends updates to the renderer over the IPC bus.

The UI can also request static machine info (CPU model, totals) via a handled channel.

## Electron topics I’m learning

- creating a build system with good dx
- main & renderer process
- preload scripts
  - IPC communication
  - designin contextBridge API for safe browser node.js exposure
- the browsers rendering engine and the window object
- electron type safety across IPC and contextBridge
- packaging safely across mac, win, and linux with electron builder

