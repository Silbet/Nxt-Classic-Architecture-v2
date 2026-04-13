import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import trackRoutes from './routes/tracks';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use('/api/tracks', trackRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
