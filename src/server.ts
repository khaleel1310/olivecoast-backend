import dotenv from 'dotenv';
// Load environment variables before importing app to ensure they are available
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` 🍽️  Olive Coast Mediterranean Kitchen API Active`);
  console.log(` 🚀 Server is running smoothly on port: ${PORT}`);
  console.log(`===================================================`);
});