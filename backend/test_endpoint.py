import requests
import json

# Test the student creation endpoint
url = "http://localhost:8000/api/students"

# Test data
data = {
    'name': 'Test Student',
    'class_name': '10',
    'section': 'A',
    'parent_id': 'parent1',
    'email': 'test@example.com',
    'phone': '1234567890',
    'address': 'Test Address',
    'date_of_birth': '2010-01-01'
}

headers = {
    'Authorization': 'Bearer mock-jwt-token',
    'X-School-Domain': 'stmarys'
}

try:
    response = requests.post(url, data=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}") 