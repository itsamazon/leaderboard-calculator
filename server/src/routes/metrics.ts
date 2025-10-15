import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import metricsService from '../services/metricsService';

const router = Router();

// Validation middleware
const validate = (req: Request, res: Response, next: Function) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// GET /api/metrics - Get all metrics (with optional filters)
router.get('/', [
    query('week').optional().trim(),
    query('internId').optional().isUUID().withMessage('Invalid intern ID')
], validate, async (req: Request, res: Response) => {
    try {
        const { week, internId } = req.query;

        if (week) {
            const metrics = await metricsService.getMetricsByWeek(week as string);
            return res.json(metrics);
        }

        if (internId) {
            const metrics = await metricsService.getMetricsByIntern(internId as string);
            return res.json(metrics);
        }

        const metrics = await metricsService.getAllMetrics();
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

// GET /api/metrics/:id - Get specific metric by ID
router.get('/:id', [
    param('id').isUUID().withMessage('Invalid metric ID')
], validate, async (req: Request, res: Response) => {
    try {
        const metric = await metricsService.getMetricById(req.params.id);
        if (!metric) {
            return res.status(404).json({ error: 'Metric not found' });
        }
        res.json(metric);
    } catch (error) {
        console.error('Error fetching metric:', error);
        res.status(500).json({ error: 'Failed to fetch metric' });
    }
});

// POST /api/metrics - Create new metric
router.post('/', [
    body('intern_id').isUUID().withMessage('Invalid intern ID'),
    body('week').trim().notEmpty().withMessage('Week is required'),
    body('role').isIn(['Strategist', 'Support']).withMessage('Invalid role'),
    body('ig_followers').isInt({ min: 0 }).withMessage('Invalid Instagram followers'),
    body('ig_views').isInt({ min: 0 }).withMessage('Invalid Instagram views'),
    body('ig_interactions').isInt({ min: 0 }).withMessage('Invalid Instagram interactions'),
    body('twitter_followers').isInt({ min: 0 }).withMessage('Invalid Twitter followers'),
    body('twitter_impressions').isInt({ min: 0 }).withMessage('Invalid Twitter impressions'),
    body('twitter_engagements').isInt({ min: 0 }).withMessage('Invalid Twitter engagements'),
    body('creativity').isInt({ min: 0 }).withMessage('Creativity must be a positive integer'),
    body('proactivity').isInt({ min: 0 }).withMessage('Proactivity must be a positive integer'),
    body('leadership').isInt({ min: 0 }).withMessage('Leadership must be a positive integer'),
    body('collaboration').isInt({ min: 0 }).withMessage('Collaboration must be a positive integer'),
    body('bonus_followers').isInt({ min: 0 }).withMessage('Invalid bonus followers'),
    body('based_on_strategist_growth').optional().isFloat({ min: 0 }).withMessage('Invalid strategist growth'),
    body('comments').optional().trim()
], validate, async (req: Request, res: Response) => {
    try {
        const metric = await metricsService.createMetrics(req.body);
        res.status(201).json(metric);
    } catch (error) {
        console.error('Error creating metric:', error);
        res.status(500).json({ error: 'Failed to create metric' });
    }
});

// PUT /api/metrics/:id - Update metric
router.put('/:id', [
    param('id').isUUID().withMessage('Invalid metric ID'),
    body('intern_id').optional().isUUID().withMessage('Invalid intern ID'),
    body('week').optional().trim().notEmpty().withMessage('Week cannot be empty'),
    body('role').optional().isIn(['Strategist', 'Support']).withMessage('Invalid role'),
    body('ig_followers').optional().isInt({ min: 0 }).withMessage('Invalid Instagram followers'),
    body('ig_views').optional().isInt({ min: 0 }).withMessage('Invalid Instagram views'),
    body('ig_interactions').optional().isInt({ min: 0 }).withMessage('Invalid Instagram interactions'),
    body('twitter_followers').optional().isInt({ min: 0 }).withMessage('Invalid Twitter followers'),
    body('twitter_impressions').optional().isInt({ min: 0 }).withMessage('Invalid Twitter impressions'),
    body('twitter_engagements').optional().isInt({ min: 0 }).withMessage('Invalid Twitter engagements'),
    body('creativity').optional().isInt({ min: 0 }).withMessage('Creativity must be a positive integer'),
    body('proactivity').optional().isInt({ min: 0 }).withMessage('Proactivity must be a positive integer'),
    body('leadership').optional().isInt({ min: 0 }).withMessage('Leadership must be a positive integer'),
    body('collaboration').optional().isInt({ min: 0 }).withMessage('Collaboration must be a positive integer'),
    body('bonus_followers').optional().isInt({ min: 0 }).withMessage('Invalid bonus followers'),
    body('based_on_strategist_growth').optional().isFloat({ min: 0 }).withMessage('Invalid strategist growth'),
    body('comments').optional().trim()
], validate, async (req: Request, res: Response) => {
    try {
        const metric = await metricsService.updateMetrics(req.params.id, req.body);
        res.json(metric);
    } catch (error) {
        console.error('Error updating metric:', error);
        res.status(500).json({ error: 'Failed to update metric' });
    }
});

// DELETE /api/metrics/:id - Delete metric
router.delete('/:id', [
    param('id').isUUID().withMessage('Invalid metric ID')
], validate, async (req: Request, res: Response) => {
    try {
        await metricsService.deleteMetrics(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting metric:', error);
        res.status(500).json({ error: 'Failed to delete metric' });
    }
});

export default router;

