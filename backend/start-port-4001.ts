import { Express, Request, Response } from 'express';
require('dotenv').config();
import app from './src/index';

const port = 4001;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
