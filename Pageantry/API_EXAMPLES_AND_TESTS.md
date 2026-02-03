# API Response Examples & Test Cases

## API Response Examples

### 1. Successful Vote (No Fraud Indicators)

**Request:**
```json
POST /event/1/vote/10/
Content-Type: application/json

{
  "number_of_votes": 5,
  "voter_email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "5 votes recorded successfully. Awaiting payment confirmation.",
  "data": {
    "id": 42,
    "contestant": {
      "id": 10,
      "name": "Alice Johnson"
    },
    "event": 1,
    "voter_email": "john@example.com",
    "number_of_votes": 5,
    "vote_amount": 500.00,
    "payment_status": "pending",
    "created_at": "2024-01-28T14:30:00Z",
    "total_cost": 500.00,
    "cost_per_vote": 100.00,
    "vote_id": 42,
    "risk_score": 0,
    "requires_review": false
  }
}
```

### 2. Flagged Vote (Elevated Risk Score)

**Request:**
```json
POST /event/1/vote/10/
Content-Type: application/json

{
  "number_of_votes": 20,
  "voter_email": "temp@tempmail.com"
}
```

**Response (201 Created - But Flagged):**
```json
{
  "status": "success",
  "message": "20 votes recorded successfully. Awaiting payment confirmation.",
  "data": {
    "id": 43,
    "contestant": {
      "id": 10,
      "name": "Alice Johnson"
    },
    "event": 1,
    "voter_email": "temp@tempmail.com",
    "number_of_votes": 20,
    "vote_amount": 2000.00,
    "payment_status": "pending",
    "created_at": "2024-01-28T14:31:00Z",
    "total_cost": 2000.00,
    "cost_per_vote": 100.00,
    "vote_id": 43,
    "risk_score": 25,
    "requires_review": true
  }
}
```

### 3. Quarantined Vote (Fraud Detected)

**Request:**
```json
POST /event/1/vote/10/
Content-Type: application/json

{
  "number_of_votes": 100,
  "voter_email": "attacker@example.com"
}
```

**Response (400 Bad Request - Quarantined):**
```json
{
  "status": "error",
  "message": "Vote flagged as suspicious and quarantined (Risk Score: 65). Please contact support.",
  "data": {
    "vote_id": 44,
    "risk_score": 65,
    "fraud_flags": [
      "rate_limit_ip_day:450",
      "velocity_check:15",
      "abnormal_voting_volume:100",
      "concentrated_voting:200",
      "high_abuse_ip:82"
    ],
    "status": "quarantined"
  }
}
```

### 4. Invalid Vote Count

**Request:**
```json
POST /event/1/vote/10/
Content-Type: application/json

{
  "number_of_votes": "invalid",
  "voter_email": "user@example.com"
}
```

**Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Invalid number of votes"
}
```

### 5. Vote Quantity Out of Range

**Request:**
```json
POST /event/1/vote/10/
Content-Type: application/json

{
  "number_of_votes": 50000,
  "voter_email": "user@example.com"
}
```

**Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Number of votes must be between 1 and 10000"
}
```

### 6. Update Payment Status - Success

**Request:**
```json
POST /vote/42/payment/
Content-Type: application/json

{
  "payment_status": "completed",
  "payment_reference": "MTN_TXN_20240128_001"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Vote payment status updated to completed",
  "data": {
    "vote_id": 42,
    "payment_status": "completed",
    "payment_reference": "MTN_TXN_20240128_001"
  }
}
```

### 7. Update Payment Status - Failed Payment

**Request:**
```json
POST /vote/43/payment/
Content-Type: application/json

{
  "payment_status": "failed",
  "payment_reference": null
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Vote payment status updated to failed",
  "data": {
    "vote_id": 43,
    "payment_status": "failed",
    "payment_reference": null
  }
}
```

### 8. Refund Vote

**Request:**
```json
POST /vote/42/payment/
Content-Type: application/json

{
  "payment_status": "refunded",
  "payment_reference": "REFUND_TXN_20240128_001"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Vote payment status updated to refunded",
  "data": {
    "vote_id": 42,
    "payment_status": "refunded",
    "payment_reference": "REFUND_TXN_20240128_001"
  }
}
```

## Frontend Response Handling Examples

### JavaScript Code for Handling Responses

```javascript
// Handling successful vote submission
const response = await fetch(BASE_URL(`event/${eventId}/vote/${contestantId}/`), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    voter_email: voterEmail,
    number_of_votes: numberOfVotes
  })
});

const data = await response.json();

if (response.ok && data.status === 'success') {
  const voteId = data.data.vote_id;
  const riskScore = data.data.risk_score;
  const requiresReview = data.data.requires_review;
  
  // Store for payment system
  localStorage.setItem(`pending_vote_${voteId}`, JSON.stringify({
    voteId,
    numberOfVotes,
    totalCost: data.data.total_cost,
    riskScore,
    requiresReview,
    timestamp: new Date().toISOString()
  }));
  
  if (requiresReview) {
    alert(`Vote flagged for review. Risk Score: ${riskScore}`);
  } else {
    alert('Vote submitted successfully!');
  }
} else if (response.status === 400 && data.data?.status === 'quarantined') {
  // Handle quarantined vote
  alert(`Vote rejected. Risk Score: ${data.data.risk_score}. Fraud flags: ${data.data.fraud_flags.join(', ')}`);
} else {
  alert(`Error: ${data.message}`);
}
```

## Test Cases

### Test Case 1: Normal User (Should Pass)

```
Input:
- IP: 192.168.1.100 (first vote from this IP)
- Email: user@gmail.com (valid free email)
- Number of Votes: 3
- User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
- Request Headers: All present

Expected Output:
- Risk Score: 0-2
- Status: Success
- Payment Status: Pending
- Message: "Votes recorded successfully"
```

### Test Case 2: Suspicious Pattern (Should Flag)

```
Input:
- IP: 192.168.1.101
- Email: temp@tempmail.com (disposable)
- Number of Votes: 50 (consecutive 3 times in 5 minutes)
- User-Agent: curl/7.68.0
- Request Headers: Minimal

Expected Output:
- Risk Score: 45-55
- Status: Error (Quarantined)
- Fraud Flags: [disposable_email, bot_user_agent, rapid_sequential_voting]
- Message: "Vote flagged as suspicious"
```

### Test Case 3: Rate Limit Violation (Should Reject)

```
Input:
- IP: 192.168.1.102
- Email: attacker@malicious.com
- Number of Votes: 200 (already voted 400 times this hour)
- User-Agent: Mozilla/5.0
- Recent Votes: 400 in last hour

Expected Output:
- Risk Score: 60+
- Status: Error (Quarantined)
- Fraud Flags: [rate_limit_ip_hour:400, velocity_check:X]
- Message: "Rate limit exceeded"
```

### Test Case 4: Impossible Travel (Should Flag)

```
Input:
- Previous Vote: Lagos, Nigeria (5 mins ago)
- Current Vote: Los Angeles, USA (now)
- Distance: ~8500 km
- Time: 5 minutes
- Required Speed: 102,000 km/h (impossible)

Expected Output:
- Risk Score: 40+
- Status: Error (Quarantined)
- Fraud Flags: [impossible_travel:8500km]
- Message: "Geographic anomaly detected"
```

### Test Case 5: Payment Processing

```
Scenario 1: Successful Payment
1. Vote created with risk_score=0, payment_status='pending'
2. User processes payment
3. Payment gateway calls: POST /vote/42/payment/
   {
     "payment_status": "completed",
     "payment_reference": "MTN_TXN_123"
   }
4. Vote updated: payment_status='completed'
5. Vote counted in results
6. Audit log created: action='payment_completed'

Scenario 2: Failed Payment
1. Vote created with risk_score=0, payment_status='pending'
2. User payment fails
3. Payment gateway calls: POST /vote/42/payment/
   {
     "payment_status": "failed",
     "payment_reference": null
   }
4. Vote updated: payment_status='failed'
5. Vote NOT counted in results
6. Audit log created: action='payment_failed'

Scenario 3: Refund
1. Previous: Vote.payment_status='completed'
2. Refund initiated: POST /vote/42/payment/
   {
     "payment_status": "refunded",
     "payment_reference": "REFUND_123"
   }
3. Vote updated: payment_status='refunded'
4. Vote removed from results (if needed)
5. Audit log created: action='payment_refunded'
```

### Test Case 6: Audit Trail Verification

```
Expected Audit Logs for a Single Vote:

Log 1:
- action: vote_created
- description: "Vote created with 5 votes. Risk Score: 0"
- timestamp: 2024-01-28T14:30:00Z

Log 2 (if flagged):
- action: vote_flagged
- description: "Vote flagged for review - Risk Score: 15"
- timestamp: 2024-01-28T14:30:01Z

Log 3:
- action: payment_completed
- description: "Payment status updated from pending to completed"
- timestamp: 2024-01-28T14:35:00Z

All logs immutable and timestamped
```

## Load Testing Scenarios

### Scenario 1: Normal Load

```
- 1000 votes/minute
- Average risk_score: 5-10
- Quarantine rate: 2-3%
- Response time: <200ms
- Database: Normal operations
```

### Scenario 2: Attack Simulation

```
- 10,000 votes/minute from 5 IPs
- Rapid successive submissions
- Bot-like user agents
- All should be rate-limited/quarantined
- Expected: >80% quarantine rate
- Response time: <500ms (cached checks)
```

### Scenario 3: Geographic Anomaly

```
- 100 votes from same email
- Voting locations: Lagos, London, Tokyo (within minutes)
- Expected: All flagged/quarantined
- Risk scores: 40-70
- Fraud flags: impossible_travel
```

## Debugging Guide

### Check Fraud Detection Records

```python
from Event.models import VoteFraudDetection
from django.db.models import Avg

# High-risk votes
high_risk = VoteFraudDetection.objects.filter(risk_score__gte=50)

# Average risk score
avg_risk = VoteFraudDetection.objects.aggregate(Avg('risk_score'))

# Suspicious votes
suspicious = VoteFraudDetection.objects.filter(is_suspicious=True)

# Quarantined votes
quarantined = VoteFraudDetection.objects.filter(is_quarantined=True)
```

### Check Audit Trail

```python
from Event.models import VoteAuditLog

# Get all logs for specific vote
vote_id = 42
logs = VoteAuditLog.objects.filter(vote_id=vote_id).order_by('created_at')

# Get all fraud detections
fraud_logs = VoteAuditLog.objects.filter(action='fraud_detected')

# Get payment updates
payment_logs = VoteAuditLog.objects.filter(action__startswith='payment_')
```

## Performance Metrics to Monitor

1. **Vote Processing Time**: <200ms for low-risk, <500ms for flagged
2. **Fraud Detection Latency**: <100ms for security checks
3. **Database Query Time**: <50ms for rate limit lookups
4. **Cache Hit Rate**: >95% for IP/Email reputation
5. **Quarantine Rate**: 2-5% normal, 70%+ under attack
6. **Payment Success Rate**: >95%
7. **Audit Log Write Time**: <10ms (append-only)
