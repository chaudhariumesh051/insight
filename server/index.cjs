const express = require('express');
const cors = require('cors');
const path = require('path');
const experienceRoutes = require('./routes/experience');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', experienceRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
