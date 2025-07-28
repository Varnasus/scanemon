# Scanemon Project Roadmap

## Overview
This document outlines the 3-phase development plan for the Scanemon Pokémon card scanning application.

## Phase 1: Core Functionality & Stability

### 1. ML System Upgrade (Critical Path)

#### 🧠 ml_service.py
**Priority: CRITICAL**
- Implement `identify_card(image: bytes) -> CardPrediction`
- Integrate OpenAI CLIP or pre-trained model
- Preprocess: resize to 224x224, RGB conversion, normalization
- Return: card name, set, number, rarity, confidence

**Implementation Steps:**
1. Create ML service structure
2. Implement image preprocessing pipeline
3. Integrate CLIP model for card identification
4. Add confidence scoring
5. Create CardPrediction schema

#### 📦 model_loader.py
**Priority: HIGH**
- Add support for loading local/custom models
- Add version tracking and dynamic switching via config
- Implement model caching
- Add fallback mechanisms

#### 🔍 card_detector.py (Optional)
**Priority: MEDIUM**
- Use YOLOv8 or basic contour-based detection
- Output bounding box for crop before passing to identifier
- Improve scan accuracy for multiple cards in image

#### 🧪 Tests
**Priority: HIGH**
- Unit tests for image preprocessing
- Mock model predictions to test scan flow
- Integration tests for ML pipeline
- Performance tests for model inference

### 2. PostgreSQL Migration

#### 🧱 persistent.py
**Priority: HIGH**
- Swap SQLite for PostgreSQL
- Update .env with new DB connection string
- Run initial alembic migration or ORM schema setup
- Implement connection pooling

#### 🔄 Migration Utility
**Priority: MEDIUM**
- Script to export/import from SQLite (if data exists)
- Validate schema, indexes, and constraints
- Data integrity checks

#### 🧪 Tests
**Priority: HIGH**
- Connection test to verify schema integrity
- Migration rollback tests
- Performance tests for database operations

### 3. Comprehensive Testing Framework

#### Backend Tests
**Priority: HIGH**
- ✅ `tests/test_scan.py` — Mock image input, validate identify_card
- ✅ `tests/test_feedback.py` — Ensure correct storage of feedback reports
- ✅ `tests/test_api_routes.py` — Validate status codes and error handling
- ✅ `tests/test_ml_service.py` — Test ML pipeline end-to-end
- ✅ `tests/test_database.py` — Test database operations and migrations

#### Frontend Tests
**Priority: HIGH**
- ✅ `tests/components/ScanCard.test.tsx` — Unit test scan result components
- ✅ `tests/integration/ScanFlow.test.tsx` — Simulate full scan + feedback flow
- ✅ `tests/components/Layout.test.tsx` — Test navigation and layout
- ✅ `tests/pages/*.test.tsx` — Test all page components

#### CI/CD
**Priority: HIGH**
- GitHub Actions: run pytest, react-scripts test, and E2E Playwright suite
- Automated testing on pull requests
- Coverage reporting

### 4. Security Hardening

#### 🧰 Backend
**Priority: HIGH**
- Add input validation with pydantic models
- Add rate limiting (FastAPI middleware)
- Set HTTP security headers (CORS, CSP, etc.)
- Enable audit logging
- Implement proper authentication middleware

#### 🔐 Auth Review
**Priority: MEDIUM**
- Evaluate Firebase Admin SDK, plan for provider abstraction
- Support guest auth with upgrade path (JWT fallback logic)
- Implement role-based access control

#### 🔒 Frontend
**Priority: MEDIUM**
- Sanitize inputs (forms, query params)
- Obfuscate tokens in localStorage/sessionStorage
- Add basic 2FA stub UI (Google Authenticator path)
- Implement proper CORS handling

### 5. Performance Optimization

#### 🧊 Backend
**Priority: MEDIUM**
- Implement Redis or in-memory caching for expensive queries
- Add cache-control headers
- Consider CDN proxy (e.g., Cloudflare) for /media or images
- Optimize database queries with proper indexing

#### ⚙️ Frontend
**Priority: MEDIUM**
- Lazy-load image assets and scan results
- Use Lighthouse to optimize bundle size
- Add skeleton loaders for scans and card lists
- Implement virtual scrolling for large lists

## Phase 2: Product Enhancement

### 1. Enhanced Collection System

#### 📁 collection_service.py
**Priority: HIGH**
- Add smart folders with filter logic (e.g., rarity = "Rare")
- Support tag-based organization
- Implement advanced search and filtering

#### 🎛️ UI Work
**Priority: HIGH**
- Add filters: variant, condition, artist, set
- "Don't Own" toggle
- Add holo visual overlay effect
- Implement drag-and-drop organization

### 2. Advanced AI Features

#### 📸 condition_assessor.py
**Priority: MEDIUM**
- Add edge detection / blur / color balance scoring
- Output rough centering % and print quality indicator
- Implement condition grading system

#### 📹 video_scan_service.py
**Priority: LOW**
- Accept MP4 input
- Extract frames
- Run detection + classification
- Return list of predicted cards

### 3. Social Features

#### 🤝 Friend System
**Priority: MEDIUM**
- Simple friend list model
- API to follow/unfollow users
- View public collections
- Social feed of recent scans

#### 💬 Wishlist / Trade Binder
**Priority: MEDIUM**
- Per-card flags for "Want", "Trade"
- API endpoints and collection filters for social view
- Trade matching system

### 4. Marketplace & Price Integration

#### 📉 market_service.py
**Priority: LOW**
- TCGPlayer API integration
- eBay + Yuyutei + Clabo scraping stubs
- Price comparison features

#### 📈 price_tracker.py
**Priority: LOW**
- Historical price data storage (daily update cron)
- Hot deal detector (alert if price < rolling avg - 20%)
- Price trend analysis

## Phase 3: Monetization & Growth

### 1. Freemium Limits
**Priority: MEDIUM**
- Track scans/collection size per user
- Gate premium features (API-level enforcement)
- Implement usage analytics

### 2. Stripe Integration
**Priority: MEDIUM**
- Add Stripe Checkout for monthly/yearly plans
- Webhook to activate premium features
- UI: "Upgrade to Pro" modal + compare plans

### 3. Monitoring & Analytics
**Priority: HIGH**
- Integrate Sentry (frontend + backend)
- Setup PostHog or Supabase analytics
- Performance monitoring dashboard

### 4. ML Training Loop
**Priority: LOW**
- Store user-flagged scan images
- CLI retrain tool to update and version models
- Auto-version bump and deploy new model

## Cross-Cutting Features

### Mobile PWA Optimization
**Priority: MEDIUM**
- Audit for display: standalone, full caching
- Service Worker: background sync + fallback page
- Add pull-to-refresh and swipe nav

### Scan Flow UX
**Priority: HIGH**
- Add live feedback: bounding box + confidence meter
- Offline queue: store scans locally and retry when online
- Batch scan carousel UI

### Visual Theming
**Priority: LOW**
- Theme selector (light, dark, Pokémon)
- Animated scan reveal (rarity sparks, badge slide-ins)
- XP system tracker and celebration overlays

## Success Metrics

### Phase 1 Success Criteria
- [ ] ML system achieves >90% accuracy on test dataset
- [ ] PostgreSQL migration completed with zero data loss
- [ ] Test coverage >80% for backend, >70% for frontend
- [ ] Security audit passed with no critical vulnerabilities
- [ ] API response times <200ms for 95% of requests

### Phase 2 Success Criteria
- [ ] Collection system supports 10k+ cards per user
- [ ] Social features have >50% user engagement
- [ ] Advanced AI features improve scan accuracy by >10%

### Phase 3 Success Criteria
- [ ] Freemium conversion rate >5%
- [ ] Monthly recurring revenue >$1k
- [ ] User retention >60% after 30 days

## Timeline

### Phase 1: 4-6 weeks
- Week 1-2: ML System Upgrade
- Week 3: PostgreSQL Migration
- Week 4: Testing Framework
- Week 5: Security Hardening
- Week 6: Performance Optimization

### Phase 2: 6-8 weeks
- Week 1-2: Enhanced Collection System
- Week 3-4: Advanced AI Features
- Week 5-6: Social Features
- Week 7-8: Marketplace Integration

### Phase 3: 4-6 weeks
- Week 1-2: Freemium & Stripe
- Week 3-4: Monitoring & Analytics
- Week 5-6: ML Training Loop

## Risk Mitigation

### Technical Risks
- **ML Model Performance**: Implement fallback models and confidence thresholds
- **Database Migration**: Comprehensive backup strategy and rollback plan
- **Security Vulnerabilities**: Regular security audits and penetration testing

### Business Risks
- **User Adoption**: Focus on core functionality first, iterate based on feedback
- **Competition**: Build unique features and strong user community
- **Scalability**: Design for horizontal scaling from day one

## Next Steps

1. **Start with Phase 1, ML System Upgrade** - This is the critical path
2. **Set up development environment** with all required dependencies
3. **Create test datasets** for ML model validation
4. **Implement CI/CD pipeline** for automated testing
5. **Begin PostgreSQL migration planning**

---

*This roadmap is a living document and will be updated as we progress through the phases.* 