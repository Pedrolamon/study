import { Router } from 'express';
import {
  getBlockedSites,
  addBlockedSite,
  updateBlockedSite,
  deleteBlockedSite,
  initializeDefaultBlockedSites,
  checkSiteBlockStatus
} from '../controllers/focusToolsController';
import { auth } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(auth);

// Blocked Sites Management
router.get('/blocked-sites', getBlockedSites);
router.post('/blocked-sites', addBlockedSite);
router.put('/blocked-sites/:id', updateBlockedSite);
router.delete('/blocked-sites/:id', deleteBlockedSite);
router.post('/blocked-sites/initialize-default', initializeDefaultBlockedSites);

// Utility Routes
router.get('/check-site', checkSiteBlockStatus);

export default router;
