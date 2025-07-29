#!/usr/bin/env python3
"""
Test script to check FastAPI/Pydantic compatibility
"""

import sys

def test_compatibility():
    """Test if FastAPI and Pydantic are compatible"""
    print("🧪 Testing FastAPI/Pydantic Compatibility...\n")
    
    try:
        # Test Pydantic import
        print("1️⃣ Testing Pydantic import...")
        from pydantic import BaseModel
        print("   ✅ Pydantic imported successfully")
        
        # Test Pydantic version
        import pydantic
        print(f"   📦 Pydantic version: {pydantic.__version__}")
        
        # Test Pydantic v2 syntax
        print("\n2️⃣ Testing Pydantic v2 syntax...")
        class TestModel(BaseModel):
            name: str
            age: int
        
        test_data = {"name": "Test", "age": 25}
        model = TestModel(**test_data)
        print(f"   ✅ Pydantic v2 syntax works: {model}")
        
        # Test FastAPI import
        print("\n3️⃣ Testing FastAPI import...")
        from fastapi import FastAPI
        print("   ✅ FastAPI imported successfully")
        
        # Test FastAPI version
        import fastapi
        print(f"   📦 FastAPI version: {fastapi.__version__}")
        
        # Test FastAPI app creation
        print("\n4️⃣ Testing FastAPI app creation...")
        app = FastAPI(title="Test API")
        print("   ✅ FastAPI app created successfully")
        
        # Test FastAPI with Pydantic model
        print("\n5️⃣ Testing FastAPI with Pydantic model...")
        from fastapi import APIRouter
        
        router = APIRouter()
        
        @router.post("/test")
        async def test_endpoint(data: TestModel):
            return {"message": f"Hello {data.name}!"}
        
        app.include_router(router)
        print("   ✅ FastAPI with Pydantic model works")
        
        print("\n🎉 COMPATIBILITY TEST PASSED!")
        print("✅ FastAPI and Pydantic are compatible!")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("💡 Solution: Install missing dependencies")
        return False
        
    except Exception as e:
        print(f"❌ Compatibility Error: {e}")
        print("💡 This indicates a version compatibility issue")
        return False

def show_version_info():
    """Show current version information"""
    print("\n📋 Current Version Information:")
    print("=" * 40)
    
    try:
        import pydantic
        print(f"Pydantic: {pydantic.__version__}")
    except ImportError:
        print("Pydantic: Not installed")
    
    try:
        import fastapi
        print(f"FastAPI: {fastapi.__version__}")
    except ImportError:
        print("FastAPI: Not installed")
    
    print("=" * 40)

if __name__ == "__main__":
    show_version_info()
    success = test_compatibility()
    
    if not success:
        print("\n🔧 To fix compatibility issues:")
        print("1. Upgrade to compatible versions:")
        print("   py -m pip install --upgrade pydantic==2.5.0 fastapi==0.104.1")
        print("\n2. Or use Flask alternative (no Pydantic issues):")
        print("   py -m pip install flask flask-cors")
    
    sys.exit(0 if success else 1) 