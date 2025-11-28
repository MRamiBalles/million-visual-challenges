# Deployment Checklist - Million Visual Challenges

## 🚀 Pre-Deployment Checklist

### Environment Configuration

- [ ] **OPENAI_API_KEY configured**
  - [ ] Obtained from platform.openai.com
  - [ ] Tested with `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`
  - [ ] Added to Supabase Dashboard secrets
  - [ ] Added to local `.env.local` for development

- [ ] **Supabase Configuration**
  - [ ] Project ID verified: `vjskpckixgukiffaxypl`
  - [ ] Database migrations applied
  - [ ] `rate_limits` table exists and is accessible
  - [ ] RLS policies configured

### Code Review

- [ ] **Rate Limit Fix**
  - [ ] `rateLimit.ts` uses `count` instead of `data?.length`
  - [ ] `RateLimitError` class exported
  - [ ] Logging includes structured data
  - [ ] Privacy: User IDs truncated in logs

- [ ] **Edge Functions**
  - [ ] OPENAI_API_KEY validation on startup
  - [ ] RateLimitError handling with 429 responses
  - [ ] Rate limit info included in responses
  - [ ] Retry-After header set correctly

- [ ] **Documentation**
  - [ ] SECRETS.md created and complete
  - [ ] README.md updated with funding info
  - [ ] CONTRIBUTING.md updated with contact details
  - [ ] Contact email verified: ramiballes96@gmail.com

### Testing (Local)

- [ ] **Rate Limit Tests**
  ```bash
  # Start functions
  supabase functions serve
  
  # Test rate limiting
 # (run 6+ requests to trigger limit)
  ```
  - [ ] First N requests succeed (N = limit)
  - [ ] (N+1)th request returns 429
  - [ ] Error message includes wait time
  - [ ] Retry-After header present

- [ ] **Function Tests**
  - [ ] paper-summarizer: Returns summary + rate limit info
  - [ ] research-qa: Returns answer + rate limit info
  - [ ] Both: Log initialization message on startup
  - [ ] Both: Return 429 with proper error structure

- [ ] **Log Validation**
  - [ ] Logs use consistent prefixes: `[function-name]`
  - [ ] Success logs include relevant metadata
  - [ ] Error logs include error details
  - [ ] User IDs are truncated for privacy

---

## 📦 Deployment Steps

### 1. Backup Current State

```bash
# Export current database schema
supabase db dump -f backup-$(date +%Y%m%d).sql

# List current function versions
supabase functions list > functions-backup-$(date +%Y%m%d).txt
```

- [ ] Database backup created
- [ ] Functions list saved

### 2. Configure Secrets (Production)

Navigate to: https://supabase.com/dashboard/project/vjskpckixgukiffaxypl/settings/functions

- [ ] Add secret: `OPENAI_API_KEY` = `sk-your-production-key`
- [ ] Verify secret appears in list
- [ ] (Optional) Add `SEMANTIC_SCHOLAR_API_KEY`
- [ ] (Optional) Add `CROSSREF_API_EMAIL`

### 3. Deploy Functions

```bash
# Deploy in correct order (dependencies first)

# 1. Deploy shared utilities
supabase functions deploy _shared

# 2. Deploy AI functions
supabase functions deploy paper-summarizer
supabase functions deploy research-qa

# 3. Verify all functions listed
supabase functions list
```

- [ ] `_shared` deployed successfully
- [ ] `paper-summarizer` deployed successfully
- [ ] `research-qa` deployed successfully
- [ ] All functions show "Active" status

### 4. Verify Deployment

```bash
# Check initialization logs
supabase functions logs paper-summarizer --tail
supabase functions logs research-qa --tail
```

**Expected Output**:
```
[paper-summarizer] Initialized successfully
[research-qa] Initialized successfully
```

- [ ] paper-summarizer initialized
- [ ] research-qa initialized
- [ ] No fatal errors in logs

---

## ✅ Post-Deployment Validation

### Immediate (0-1 hour)

- [ ] **Smoke Tests**
  ```bash
  # Test paper-summarizer in production
  curl -X POST https://vjskpckixgukiffaxypl.supabase.co/functions/v1/paper-summarizer \
    -H "Authorization: Bearer YOUR_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"paperId":"test","title":"Test","abstract":"Test abstract"}'
  ```
  - [ ] Returns 200 with summary
  - [ ] Includes rateLimit object
  - [ ] Multiple rapid requests trigger 429

- [ ] **Check Rate Limits in Database**
  ```sql
  SELECT COUNT(*) FROM rate_limits 
  WHERE created_at > NOW() - INTERVAL '1 hour';
  ```
  - [ ] Records are being created
  - [ ] User IDs and action types are correct

- [ ] **Monitor Logs**
  - [ ] No error logs for valid requests
  - [ ] Rate limit exceeded logs show correct format
  - [ ] All logs have proper prefixes

### Short Term (24 hours)

- [ ] **Cost Monitoring**
  - [ ] OpenAI dashboard shows reasonable usage
  - [ ] No unexpected cost spikes
  - [ ] Usage aligns with request counts in `rate_limits` table

- [ ] **Performance Monitoring**
  ```sql
  -- Check rate limit distribution
  SELECT 
    action_type,
    COUNT(*) as total_requests,
    COUNT(DISTINCT user_id) as unique_users,
    MAX(created_at) as last_request
  FROM rate_limits
  WHERE created_at > NOW() - INTERVAL '24 hours'
  GROUP BY action_type;
  ```
  - [ ] Request counts are reasonable
  - [ ] No single user dominating requests
  - [ ] Rate limits are being enforced

- [ ] **Error Analysis**
  ```bash
  supabase functions logs paper-summarizer | grep ERROR
  supabase functions logs research-qa | grep ERROR
  ```
  - [ ] No unexpected errors
  - [ ] All errors are handled gracefully

### Medium Term (1 week)

- [ ] **Cost Analysis**
  - [ ] Weekly OpenAI cost within budget ($25-50)
  - [ ] Cost per request is reasonable
  - [ ] No waste from failed/duplicate requests

- [ ] **User Feedback**
  - [ ] Users can see rate limit status
  - [ ] Error messages are helpful
  - [ ] No complaints about rate limiting

- [ ] **Database Cleanup**
  ```sql
  -- Verify cleanup function runs
  SELECT * FROM rate_limits 
  WHERE created_at < NOW() - INTERVAL '2 hours';
  -- Should be empty or very few records
  ```
  - [ ] Old rate limit records are being cleaned up
  - [ ] Table size is stable

---

## 🚨 Rollback Plan

### If Critical Issues Occur

1. **Immediate Rollback** (< 5 minutes):
   ```bash
   # Redeploy previous version
   git checkout previous-commit
   supabase functions deploy paper-summarizer
   supabase functions deploy research-qa
   ```

2. **Verify Rollback**:
   ```bash
   supabase functions logs paper-summarizer --tail
   ```

3. **Notify**:
   - [ ] Team/stakeholders notified
   - [ ] Issue documented
   - [ ] Post-mortem scheduled

### Rollback Triggers

Rollback immediately if:
- ❌ Functions fail to initialize
- ❌ All requests return 500 errors
- ❌ OpenAI costs spike unexpectedly (>$10/hour)
- ❌ Database errors prevent rate limit checks
- ❌ Rate limiting blocks all legitimate users

---

## 📊 Success Criteria

### Must Have

- [x] Critical bug fixed (rate limiting works)
- [x] Professional error handling implemented
- [x] Documentation updated
- [ ] OPENAI_API_KEY configured in production
- [ ] Functions deployed and running
- [ ] No critical errors in first 24 hours

### Should Have

- [x] Structured logging implemented
- [x] Rate limit info in responses
- [x] Contact/funding info added
- [ ] Cost monitoring set up
- [ ] Usage alerts configured

### Nice to Have

- [ ] Unit tests written
- [ ] Integration tests passing
- [ ] Monitoring dashboard live
- [ ] Cost projections documented

---

## 📞 Support & Escalation

### If Issues Arise

1. **Check Logs First**:
   ```bash
   supabase functions logs function-name --tail
   ```

2. **Check Database**:
   ```sql
   SELECT * FROM rate_limits ORDER BY created_at DESC LIMIT 10;
   ```

3. **Check OpenAI Status**:
   https://status.openai.com/

4. **Contact**:
   - Email: ramiballes96@gmail.com
   - GitHub Issues: [Create Issue](https://github.com/MRamiBalles/million-visual-challenges/issues)

---

## 📝 Post-Deployment Notes

**Deployment Date**: _____________

**Deployed By**: _____________

**Issues Encountered**:
- None
- (List any issues and resolutions)

**Performance Notes**:
- Average response time: _____________
- Rate limit hits in first hour: _____________
- OpenAI cost in first 24h: _____________

**Follow-up Actions**:
- [ ] Schedule 1-week review
- [ ] Document any issues for retrospective
- [ ] Update cost projections based on actual usage

---

**Sign-off**:

Deployment Lead: _________________ Date: _______

Technical Reviewer: _________________ Date: _______

---

## 🎯 Next Deployment

For future deployments, repeat this checklist and add:
- Previous deployment date
- Lessons learned
- Process improvements
