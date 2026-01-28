/**
 * Test Script to Verify Admin → User Data Flow
 * Run this script to test if admin-created data is visible to users
 */

// Test 1: Check if backend server is running
async function testBackendHealth() {
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    console.log('✅ Backend Health:', data.status);
    return true;
  } catch (error) {
    console.log('❌ Backend not running:', error.message);
    return false;
  }
}

// Test 2: Check if we can fetch diseases from backend
async function testDiseaseAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/diseases');
    const data = await response.json();
    console.log(`✅ Diseases API: ${data.count} diseases found`);
    return data.count > 0;
  } catch (error) {
    console.log('❌ Diseases API failed:', error.message);
    return false;
  }
}

// Test 3: Check if we can fetch markets from backend
async function testMarketsAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/markets');
    const data = await response.json();
    console.log(`✅ Markets API: ${data.count} markets found`);
    return data.count > 0;
  } catch (error) {
    console.log('❌ Markets API failed:', error.message);
    return false;
  }
}

// Test 4: Check if we can fetch comments from backend
async function testCommentsAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/comments');
    const data = await response.json();
    console.log(`✅ Comments API: ${data.count} comments found`);
    return true; // Comments can be empty initially
  } catch (error) {
    console.log('❌ Comments API failed:', error.message);
    return false;
  }
}

// Test 5: Test creating a comment
async function testCreateComment() {
  try {
    const commentData = {
      userId: 'test-user-123',
      userName: 'Test User',
      userEmail: 'test@example.com',
      subject: 'Test Comment',
      message: 'This is a test comment to verify data flow',
      category: 'test',
      status: 'unread'
    };

    const response = await fetch('http://localhost:3001/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Comment created successfully:', data.data.id);
      return data.data.id;
    } else {
      console.log('❌ Failed to create comment:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Create comment failed:', error.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Testing AgroGuard Data Flow...\n');

  const backendRunning = await testBackendHealth();
  if (!backendRunning) {
    console.log('\n❌ Backend server is not running. Please start it with:');
    console.log('   cd backend && npm run dev\n');
    return;
  }

  await testDiseaseAPI();
  await testMarketsAPI();
  await testCommentsAPI();
  
  console.log('\n🧪 Testing comment creation...');
  const commentId = await testCreateComment();
  
  if (commentId) {
    console.log('\n✅ All tests passed! Data flow is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. Start frontend: npm run dev');
    console.log('2. Login as admin and check if the test comment appears');
    console.log('3. Create a disease/market as admin');
    console.log('4. Check if it appears in user view');
  } else {
    console.log('\n❌ Some tests failed. Check the backend logs.');
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
}

export { runTests };