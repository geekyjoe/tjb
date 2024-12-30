import requests

# Base URL of the API
BASE_URL = "gs://tjb-24.firebasestorage.app/products"

def test_get_products():
    """Test GET request to fetch products."""
    print("Testing GET request...")
    try:
        response = requests.get(BASE_URL)
        if response.status_code == 200:
            print("GET request successful!")
            print("Response data:", response.json())
        else:
            print(f"GET request failed with status code {response.status_code}: {response.text}")
    except Exception as e:
        print("An error occurred during GET request:", e)

def test_post_product():
    """Test POST request to add a new product."""
    print("Testing POST request...")
    # Sample product data
    product_data = {
        "name": "Sample Product",
        "price": 9.99,
        "stock": 50
    }
    try:
        response = requests.post(BASE_URL, json=product_data)
        if response.status_code in [200, 201]:
            print("POST request successful!")
            print("Response data:", response.json())
        else:
            print(f"POST request failed with status code {response.status_code}: {response.text}")
    except Exception as e:
        print("An error occurred during POST request:", e)

if __name__ == "__main__":
    print("Starting API tests...")
    test_get_products()
    test_post_product()
