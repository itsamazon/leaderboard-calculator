import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import strategistService from '../services/strategistService';

const router = Router();

// Validation middleware
const validate = (req: Request, res: Response, next: Function) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// GET /api/strategists - Get all weekly strategist assignments
router.get('/', async (req: Request, res: Response) => {
    try {
        const strategists = await strategistService.getAllWeeklyStrategists();
        res.json(strategists);
    } catch (error) {
        console.error('Error fetching strategists:', error);
        res.status(500).json({ error: 'Failed to fetch strategists' });
    }
});

// GET /api/strategists/:week - Get strategists for a specific week
router.get('/:week', [
    param('week').trim().notEmpty().withMessage('Week is required')
], validate, async (req: Request, res: Response) => {
    try {
        const strategists = await strategistService.getStrategistsByWeek(req.params.week);
        if (!strategists) {
            return res.status(404).json({ error: 'Strategists not found for this week' });
        }
        res.json(strategists);
    } catch (error) {
        console.error('Error fetching strategists:', error);
        res.status(500).json({ error: 'Failed to fetch strategists' });
    }
});

// POST /api/strategists - Create weekly strategist assignment
router.post('/', [
    body('week').trim().notEmpty().withMessage('Week is required'),
    body('strategistIds').isArray({ min: 2, max: 2 }).withMessage('Exactly 2 strategist IDs required'),
    body('strategistIds.*').isUUID().withMessage('Invalid strategist ID')
], validate, async (req: Request, res: Response) => {
    try {
        const { week, strategistIds } = req.body;
        const strategists = await strategistService.createWeeklyStrategists(week, strategistIds);
        res.status(201).json(strategists);
    } catch (error: any) {
        console.error('Error creating strategists:', error);
        if (error.message?.includes('2 strategists')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create strategists' });
    }
});

// PUT /api/strategists/:week - Update strategists for a week
router.put('/:week', [
    param('week').trim().notEmpty().withMessage('Week is required'),
    body('strategistIds').isArray({ min: 2, max: 2 }).withMessage('Exactly 2 strategist IDs required'),
    body('strategistIds.*').isUUID().withMessage('Invalid strategist ID')
], validate, async (req: Request, res: Response) => {
    try {
        const { strategistIds } = req.body;
        const strategists = await strategistService.updateWeeklyStrategists(req.params.week, strategistIds);
        res.json(strategists);
    } catch (error: any) {
        console.error('Error updating strategists:', error);
        if (error.message?.includes('2 strategists')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update strategists' });
    }
});

// DELETE /api/strategists/:week - Delete strategist assignment and related metrics
router.delete('/:week', [
    param('week').trim().notEmpty().withMessage('Week is required')
], validate, async (req: Request, res: Response) => {
    try {
        await strategistService.deleteWeeklyStrategists(req.params.week);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting strategists:', error);
        res.status(500).json({ error: 'Failed to delete strategists' });
    }
});

export default router;

