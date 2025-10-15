import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import internService from '../services/internService';

const router = Router();

// Validation middleware
const validate = (req: Request, res: Response, next: Function) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// GET /api/interns - Get all interns
router.get('/', async (req: Request, res: Response) => {
    try {
        const interns = await internService.getAllInterns();
        res.json(interns);
    } catch (error) {
        console.error('Error fetching interns:', error);
        res.status(500).json({ error: 'Failed to fetch interns' });
    }
});

// GET /api/interns/:id - Get intern by ID
router.get('/:id', [
    param('id').isUUID().withMessage('Invalid intern ID')
], validate, async (req: Request, res: Response) => {
    try {
        const intern = await internService.getInternById(req.params.id);
        if (!intern) {
            return res.status(404).json({ error: 'Intern not found' });
        }
        res.json(intern);
    } catch (error) {
        console.error('Error fetching intern:', error);
        res.status(500).json({ error: 'Failed to fetch intern' });
    }
});

// POST /api/interns - Create new intern
router.post('/', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('notes').optional().trim()
], validate, async (req: Request, res: Response) => {
    try {
        const { name, notes } = req.body;
        const intern = await internService.createIntern(name, notes);
        res.status(201).json(intern);
    } catch (error) {
        console.error('Error creating intern:', error);
        res.status(500).json({ error: 'Failed to create intern' });
    }
});

// PUT /api/interns/:id - Update intern
router.put('/:id', [
    param('id').isUUID().withMessage('Invalid intern ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('notes').optional().trim()
], validate, async (req: Request, res: Response) => {
    try {
        const { name, notes } = req.body;
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (notes !== undefined) updates.notes = notes;

        const intern = await internService.updateIntern(req.params.id, updates);
        res.json(intern);
    } catch (error) {
        console.error('Error updating intern:', error);
        res.status(500).json({ error: 'Failed to update intern' });
    }
});

// DELETE /api/interns/:id - Delete intern
router.delete('/:id', [
    param('id').isUUID().withMessage('Invalid intern ID')
], validate, async (req: Request, res: Response) => {
    try {
        await internService.deleteIntern(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting intern:', error);
        res.status(500).json({ error: 'Failed to delete intern' });
    }
});

export default router;

