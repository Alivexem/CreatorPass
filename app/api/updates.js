// pages/api/updates.js
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
  
    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
  
    // Mock function to simulate new data coming in
    setInterval(() => {
      const data = {
        id: Math.random().toString(36).substr(2, 9),
        note: 'New creates update!',
        createdAt: new Date().toISOString(),
      };
      sendEvent(data);
    }, 100000); // Send new updates every 10 seconds
  
    // Keep connection open
    req.on('close', () => {
      res.end();
    });
  }
  