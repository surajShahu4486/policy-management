
## Task 1

# 1. Upload XLSX/CSV using Worker Thread
Endpoint:


POST http://localhost:3000/api/upload 
 
# 2. Search policy by username
Endpoint:
GET http://localhost:3000/api/policies/search?username=Suraj

# 3. Aggregate policies by user
Endpoint:
GET http://localhost:3000/api/policies/aggregate

## Task 2

# 1. CPU monitoring

# 2. Scheduled message service

Endpoint:
POST /api/schedule
http://localhost:3000/api/schedule
Body → raw → JSON 
like:-{
  "message": "Policy renewal reminder",
  "day": "2026-12-25",
  "time": "10:30"
}



