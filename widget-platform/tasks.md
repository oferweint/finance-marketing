# Widget Platform - Pending Tasks

## Known Issues (2025-12-02)

### Hydration Issues
- [ ] Some widgets may still have hydration warnings/errors
- [ ] Need to audit all widgets for remaining `Math.random()` or `new Date()` calls in render path
- [ ] Check for any components using mock data fallbacks that cause SSR/client mismatch

### Data Retrieval Issues
- [ ] Partial data only being returned in some widgets
- [ ] Need to verify API response structure matches component expectations for all widgets
- [ ] Investigate "data, data, data" display issue reported in UI
- [ ] Check if all field mappings are correct between API and components

### Widgets to Audit
- [ ] Influencer Radar - fixed API fields but may have other issues
- [ ] Quality Index - fixed hourlyBreakdown and topBotAccounts structure
- [ ] Sentiment DeepDive - fixed samplePosts category field
- [ ] Other widgets may have similar API/component data mismatches

## Completed (2025-12-02)
- [x] Fixed Influencer Radar: added `influenceScore`, `engagement`, `recentPosts`, `name` fields
- [x] Fixed Quality Index: changed `time` to `hour`, fixed `topBotAccounts` structure
- [x] Fixed Sentiment DeepDive: added `category` field to samplePosts
- [x] Removed `generateMockData()` fallback from 14 widgets to prevent hydration errors
- [x] Optimized Portfolio Aggregator with dropdown selector and fast `countTweets` API
