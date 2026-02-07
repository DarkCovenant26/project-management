import requests
import json
import random
import string

# Test configuration
BASE_URL = 'http://localhost:8000/api'
USERNAME = 'testuser'
PASSWORD = 'password123'
EMAIL = 'testuser@example.com'

def get_auth_token():
    # Try to login first
    login_url = f"{BASE_URL}/auth/login/"
    print(f"DEBUG: POST {login_url}")
    response = requests.post(login_url, json={'username': USERNAME, 'password': PASSWORD})
    print(f"DEBUG: Login Status: {response.status_code}")
    
    if response.status_code == 200:
        return response.json()['access']
    
    # If login fails, try to register
    register_url = f"{BASE_URL}/auth/register/"
    # Generate a random username to avoid collisions if we rerun
    rand_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    username = f"{USERNAME}_{rand_suffix}"
    
    print(f"DEBUG: POST {register_url} with user {username}")
    
    response = requests.post(register_url, json={
        'username': username,
        'email': f"{username}@example.com",
        'password': PASSWORD
    })
    print(f"DEBUG: Register Status: {response.status_code}")
    
    if response.status_code == 201:
        # Now login
        response = requests.post(login_url, json={'username': username, 'password': PASSWORD})
        return response.json()['access']
        
    print(f"Failed to auth: {response.text[:200]}...") # Truncate output
    return None

def test_quick_capture():
    token = get_auth_token()
    if not token:
        print("Could not get auth token. Skipping test.")
        return

    headers = {'Authorization': f'Bearer {token}'}

    # 1. Create a Quick Note
    print("\n1. Creating a Quick Note...")
    note_content = "Remember to buy milk"
    response = requests.post(
        f"{BASE_URL}/quick-capture/", 
        json={'content': note_content},
        headers=headers
    )
    if response.status_code == 201:
        note = response.json()
        print(f"SUCCESS: Created note {note['id']}")
    else:
        print(f"FAIL: {response.text}")
        return

    # 2. List Notes
    print("\n2. Listing Quick Notes...")
    response = requests.get(f"{BASE_URL}/quick-capture/", headers=headers)
    if response.status_code == 200:
        notes = response.json().get('results', [])
        print(f"SUCCESS: Found {len(notes)} notes")
        found = any(n['content'] == note_content for n in notes)
        if found:
            print("SUCCESS: Verified new note is in list")
        else:
            print("FAIL: New note not found in list")
    else:
        print(f"FAIL: {response.text}")

    # 3. Convert to Task
    print("\n3. Converting to Task...")
    note_id = note['id']
    response = requests.post(
        f"{BASE_URL}/quick-capture/{note_id}/convert_to_task/",
        json={'priority': 'High', 'title': 'Buy Milk Now'},
        headers=headers
    )
    if response.status_code == 200:
        data = response.json()
        print(f"SUCCESS: Converted to task. Task ID: {data['convertedTask']}")
        if data['isArchived']:
            print("SUCCESS: Note is marked as archived")
        else:
            print("FAIL: Note is NOT marked as archived")
            
        if data['convertedTaskDetails']['title'] == 'Buy Milk Now':
             print("SUCCESS: Task title correct")
        else:
             print(f"FAIL: Task title mismatch. Got {data['convertedTaskDetails']['title']}")

    else:
        print(f"FAIL: {response.text}")

if __name__ == "__main__":
    test_quick_capture()
