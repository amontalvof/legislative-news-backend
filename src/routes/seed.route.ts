const { Router } = require('express');
import { populateArticles } from '../controllers/seed.controller';

const router = Router();

router.post('/', populateArticles);

export default router;
