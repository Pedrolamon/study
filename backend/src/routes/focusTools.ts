import { Router } from 'express';
import {
  getBlockedSites,
  addBlockedSite,
  updateBlockedSite,
  deleteBlockedSite,
  initializeDefaultBlockedSites,
  createFocusSession,
  startFocusSession,
  endFocusSession,
  getFocusSessions,
  getActiveFocusSession,
  createFocusProfile,
  getFocusProfiles,
  logDistraction,
  getFocusAnalytics,
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

// Focus Sessions Management
router.post('/sessions', createFocusSession);
router.put('/sessions/:id/start', startFocusSession);
router.put('/sessions/:id/end', endFocusSession);
router.get('/sessions', getFocusSessions);
router.get('/sessions/active', getActiveFocusSession);

// Focus Profiles Management
router.post('/profiles', createFocusProfile);
router.get('/profiles', getFocusProfiles);

// Distraction Logging
router.post('/distractions', logDistraction);

// Analytics
router.get('/analytics', getFocusAnalytics);

// Utility Routes
router.get('/check-site', checkSiteBlockStatus);

export default router;
