const express = require('express');
const path = require('path');
const open = require('open');

const app = express();
const PORT = 8085;

// Serve static files from dist (relative to __dirname for executables)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const server = app.listen(PORT, async () => {
  console.log(`\n🎮 Word Puzzle Solver running at http://localhost:${PORT}\n`);
  console.log('💡 Tip: Use Ctrl+C to stop the server\n');
  
  // Open browser automatically
  try {
    await open(`http://localhost:${PORT}`);
  } catch (err) {
    console.log('Browser could not be opened automatically. Visit http://localhost:' + PORT);
  }
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Closing Word Puzzle Solver...\n');
  server.close(() => {
    process.exit(0);
  });
});
