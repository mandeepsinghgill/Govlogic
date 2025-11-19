# Fixes: Async/Await Error with SAM.gov Service

## Issue
Error: `Failed to generate brief: object dict can't be used in 'await' expression`

## Root Cause
The `samgov_service.get_opportunity_by_id()` method is a **synchronous** function (uses `requests` library), but it was being called with `await` in async contexts, causing the error.

## Files Fixed

### 1. `backend/app/api/briefs.py`
**Fixed 2 instances:**
- Line 43: `generate_brief` endpoint
- Line 84: `get_brief` endpoint

**Change:**
```python
# Before (INCORRECT):
opportunity_data = await samgov_service.get_opportunity_by_id(opportunity_id)

# After (CORRECT):
opportunity_data = samgov_service.get_opportunity_by_id(opportunity_id)
```

### 2. `backend/app/api/proposals.py`
**Fixed 1 instance:**
- Line 220: `generate_proposal_content` endpoint

**Change:**
```python
# Before (INCORRECT):
contract_data = await samgov_service.get_opportunity_by_id(contract_id)

# After (CORRECT):
contract_data = samgov_service.get_opportunity_by_id(contract_id)
```

## SAM.gov API Key Configuration

### Current Status
When `SAM_GOV_API_KEY` is not configured, the system:
- ✅ Returns mock data for opportunities
- ✅ Displays warning: "This is mock data. Configure SAM_GOV_API_KEY for real opportunity details."
- ✅ Continues to function with demo/mock data

### To Configure SAM.gov API Key

1. **Get API Key:**
   - Visit: https://open.gsa.gov/api/opportunities-api/
   - Sign in or create a SAM.gov account
   - Generate an API key

2. **Set Environment Variable:**
   ```bash
   # Option 1: Set in .env file
   echo "SAM_GOV_API_KEY=your-api-key-here" >> backend/.env
   
   # Option 2: Set as environment variable
   export SAM_GOV_API_KEY=your-api-key-here
   
   # Option 3: Set in docker-compose.yml (under backend service)
   environment:
     - SAM_GOV_API_KEY=your-api-key-here
   ```

3. **Verify Configuration:**
   - Restart the backend service
   - Check logs for: `✅ SAM.gov API key configured: [first 8 chars]...`
   - Without key, you'll see: `⚠️  SAM_GOV_API_KEY not configured or using demo key`

## Testing

### Test Brief Generation
```bash
# Should now work without "await" error
curl -X POST http://localhost:8000/api/v1/briefs/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"opportunityId": "test-opp-001"}'
```

### Test SAM.gov Integration
- Without API key: Should return mock data with `"mockGenerated": true`
- With API key: Should return real SAM.gov opportunities

## Status
✅ **FIXED** - All async/await issues resolved
✅ Brief generation now works correctly
✅ Mock data fallback working properly
✅ SAM.gov integration ready (just needs API key)

