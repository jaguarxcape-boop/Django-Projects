# QUICK START GUIDE - Advanced Voting Security System

## TL;DR - 5 Minute Setup

### 1. Backend Setup (Python/Django)

```bash
# Apply migrations
cd PageantryVoting
python manage.py makemigrations Event
python manage.py migrate Event
```

### 2. Test Vote Submission

```bash
# Create test event first (if not exists)
python manage.py shell

from Event.models import Event, EventCategory, EventCategoryContestant
# Create event, category, contestant...

# Exit shell and test API
```

### 3. Submit Test Vote

```bash
curl -X POST http://localhost:8000/event/1/vote/1/ \
  -H "Content-Type: application/json" \
  -d '{
    "number_of_votes": 5,
    "voter_email": "test@example.com"
  }'
```

Expected Response:
```json
{
  "status": "success",
  "data": {
    "vote_id": 1,
    "risk_score": 0,
    "total_cost": 500,
    "payment_status": "pending"
  }
}
```

### 4. Simulate Payment

```bash
curl -X POST http://localhost:8000/vote/1/payment/ \
  -H "Content-Type: application/json" \
  -d '{
    "payment_status": "completed",
    "payment_reference": "TEST_TXN_001"
  }'
```

### 5. Verify in Admin

```
Visit: http://localhost:8000/admin
Login with superuser
Navigate to Event > Votes
View the vote record
Check Event > Fraud Detections
Check Event > Audit Logs
```

---

## What Changed

### Before
- Simple 1 vote per person per contestant
- No fraud detection
- No audit trail
- No payment support
- No risk assessment

### After
- Multiple votes per submission (1-10,000)
- 10+ fraud detection vectors
- Complete audit trail
- Full payment workflow
- Dynamic risk scoring (0-100)
- 4 new database models
- Cryptographic security
- Device fingerprinting
- Behavioral analysis
- Geographic anomaly detection

---

## Key Features Explained

### Feature 1: Multiple Votes
```javascript
// Frontend - User enters number of votes
<input type="number" min="1" value={voteQuantities[contestantId]} />

// Backend - Accepts 1-10,000 votes
{
  "number_of_votes": 50,
  "voter_email": "user@example.com"
}

// Database - Records total cost
vote_amount = 50 * event.amount_per_vote = 5000
```

### Feature 2: Fraud Detection
```python
# Automatically checks:
1. Rate limits (per-IP, per-email)
2. Voting velocity (bot patterns)
3. Device fingerprint (tracking)
4. Behavioral patterns (historical)
5. Geographic anomalies (impossible travel)
6. IP reputation (blacklist/abuse)
7. Email validation (disposable)
8. Request validation (headers)
9. Voting patterns (concentrated)
10. Suspicious markers (bots)
```

### Feature 3: Risk Scoring
```
Low Risk (0-4):      ✅ Accept (normal voting)
Flagged (5-99):      ⚠️  Quarantine (review needed)
High Risk (50+):     ❌ Reject (clear fraud)
```

### Feature 4: Payment Integration
```
1. User votes → payment_status='pending'
2. Payment gateway confirms → POST /vote/{id}/payment/
3. Backend updates → payment_status='completed'
4. Vote counts in results
```

### Feature 5: Audit Trail
```
Every vote action logged:
- vote_created
- payment_pending
- payment_completed
- fraud_detected
- vote_flagged
- vote_quarantined
- vote_approved
- vote_rejected
```

---

## Common Tasks

### Check Vote Status

```python
from Event.models import Vote

vote = Vote.objects.get(id=1)
print(f"Status: {vote.payment_status}")
print(f"Cost: GHS {vote.calculate_total_cost()}")
print(f"Risk Score: {vote.fraud_detection.risk_score}")
```

### Check Fraud Detection

```python
from Event.models import VoteFraudDetection

fraud = VoteFraudDetection.objects.get(vote_id=1)
print(f"Risk Score: {fraud.risk_score}")
print(f"Flags: {fraud.fraud_flags}")
print(f"Quarantined: {fraud.is_quarantined}")
```

### View Audit Trail

```python
from Event.models import VoteAuditLog

logs = VoteAuditLog.objects.filter(vote_id=1).order_by('created_at')
for log in logs:
    print(f"{log.action} at {log.created_at} by {log.actor}")
    print(f"  {log.description}")
```

### List Suspicious Votes

```python
from Event.models import VoteFraudDetection

suspicious = VoteFraudDetection.objects.filter(is_suspicious=True)
for fraud in suspicious:
    print(f"Vote {fraud.vote_id}: Risk={fraud.risk_score}, Flags={fraud.fraud_flags}")
```

### Update Vote Status

```python
from Event.models import Vote, VoteAuditLog

vote = Vote.objects.get(id=1)
vote.payment_status = 'completed'
vote.payment_reference = 'MTN_TXN_001'
vote.save()

# Audit log created automatically in UpdateVotePaymentView
# Or create manually:
VoteAuditLog.objects.create(
    vote=vote,
    action='payment_completed',
    description='Payment confirmed',
    actor='system'
)
```

---

## Frontend Integration

### 1. Install Dependencies
```bash
# Already installed:
# - react
# - react-router-dom
# - fetch API (built-in)
```

### 2. Component State
```javascript
const [voteQuantities, setVoteQuantities] = useState({});
```

### 3. Handle Vote Submission
```javascript
const handleVote = async (contestantId) => {
  const numberOfVotes = parseInt(voteQuantities[contestantId]);
  
  // Send to backend
  const response = await fetch(`/event/${eventId}/vote/${contestantId}/`, {
    method: 'POST',
    body: JSON.stringify({
      number_of_votes: numberOfVotes,
      voter_email: voterEmail
    })
  });
  
  const data = await response.json();
  
  // Handle response
  if (data.status === 'success') {
    // Store vote_id for payment
    localStorage.setItem(`vote_${data.data.vote_id}`, JSON.stringify(data.data));
    
    if (data.data.risk_score > 0) {
      alert(`Vote flagged. Risk: ${data.data.risk_score}`);
    }
  }
};
```

### 4. Show Cost in Real-Time
```javascript
{voteQuantities[contestant.id] && (
  <p>Total: GHS {parseInt(voteQuantities[contestant.id]) * event.amount_per_vote}</p>
)}
```

---

## Testing Guide

### Test 1: Normal Vote
```
Input: 1-5 votes, valid email, new user
Expected: Risk score 0-2, success message
```

### Test 2: Flagged Vote
```
Input: 50 votes, disposable email, consecutive
Expected: Risk score 20-30, warning message
```

### Test 3: Quarantined Vote
```
Input: 100+ votes, bot user agent, rapid fire
Expected: Risk score 50+, error message
```

### Test 4: Payment Flow
```
1. Submit vote → pending
2. Call payment endpoint → completed
3. Check vote in results → counted
```

### Test 5: Audit Trail
```
1. Submit vote → check audit log
2. Update payment → check new entry
3. Verify chain of records
```

---

## Admin Interface

### Access Admin
```
URL: http://localhost:8000/admin
Username: (superuser)
Password: (superuser password)
```

### Key Admin Actions
1. **View Votes**: Event > Votes (see all votes, status, email)
2. **View Fraud**: Event > Fraud Detections (see risk scores, flags)
3. **View Audit**: Event > Audit Logs (see complete history)
4. **Export Data**: Select votes → Export to CSV
5. **Filter**: By payment status, risk score, suspicious flag
6. **Search**: By email, IP, contestant name

### Admin Filters Available
- Payment Status (pending/completed/failed/refunded)
- Risk Score (0-100)
- Is Suspicious (True/False)
- Is Quarantined (True/False)
- Action Type (11 types)
- Date Range

---

## Database Queries

### Count Votes by Status
```python
from Event.models import Vote
from django.db.models import Count

Vote.objects.values('payment_status').annotate(
    count=Count('id')
).order_by('-count')
```

### Count Suspicious Votes
```python
from Event.models import VoteFraudDetection

VoteFraudDetection.objects.filter(
    is_suspicious=True
).count()
```

### Get Revenue from Completed Votes
```python
from Event.models import Vote
from django.db.models import Sum

completed_votes = Vote.objects.filter(
    payment_status='completed'
).aggregate(
    total=Sum('vote_amount')
)
```

### Find Votes by IP
```python
from Event.models import Vote

Vote.objects.filter(voter_ip='192.168.1.1')
```

### Find Votes by Email
```python
from Event.models import Vote

Vote.objects.filter(voter_email='user@example.com')
```

---

## Troubleshooting

### Issue: Vote returns error "Invalid number of votes"
**Solution**: Check that number_of_votes is an integer 1-10000

### Issue: All votes getting quarantined
**Solution**: Check thresholds in VoteSecurityManager. May be too strict for your use case.

### Issue: Payment update not working
**Solution**: Verify vote exists and payment_status is valid (completed/failed/refunded)

### Issue: No fraud detection record created
**Solution**: Check that VoteFraudDetection table exists (run migrations)

### Issue: Audit logs not appearing
**Solution**: Check that VoteAuditLog table exists and vote_id is correct

### Issue: Memory issues with large vote counts
**Solution**: Implement pagination for audit logs, cache IP/Email reputation

---

## Performance Tips

1. **Cache IP Reputation**: Implement Redis caching
2. **Async Tasks**: Use Celery for heavy fraud checks
3. **Database Indexes**: Already created on high-query fields
4. **Rate Limit Cache**: Use Redis instead of Django cache
5. **Batch Audit Logs**: For very high volume, consider batching

---

## Security Tips

1. **Use HTTPS**: Always in production
2. **Rate Limit API**: Implement DRF throttling
3. **CORS Settings**: Restrict to your domain
4. **Secret Key**: Keep SECRET_KEY safe (used for HMAC)
5. **Database**: Use strong passwords
6. **Backups**: Regular backups of audit logs
7. **Logs**: Monitor for suspicious patterns

---

## Next Steps

1. ✅ Apply migrations
2. ✅ Test vote submission
3. ✅ Test payment workflow
4. ✅ Verify audit logs
5. ⏭️  Integrate payment gateway (MTN Momo, etc.)
6. ⏭️  Set up monitoring/alerts
7. ⏭️  Deploy to staging
8. ⏭️  Load test (1000+ votes/min)
9. ⏭️  Deploy to production
10. ⏭️  Monitor metrics

---

## Support Files

Read these for more details:
- `ADVANCED_SECURITY_DOCUMENTATION.md` - Technical deep dive
- `API_EXAMPLES_AND_TESTS.md` - API examples and test cases
- `MIGRATION_GUIDE.md` - Database migration details
- `COMPLETE_ARCHITECTURE.md` - Full system architecture

---

**Ready to go!** 🚀

For questions, check the documentation files or review the code in:
- `Event/security.py` - Fraud detection logic
- `Event/views.py` - Vote API endpoints
- `Event/models.py` - Database schema
