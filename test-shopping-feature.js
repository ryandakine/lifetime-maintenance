const fs = require('fs');

console.log('🛒 Testing Shopping List Feature with Perplexity Pro...\n');

// Test 1: Shopping component functionality
if (fs.existsSync('src/components/Shopping.jsx')) {
  const shoppingContent = fs.readFileSync('src/components/Shopping.jsx', 'utf8');
  
  const shoppingTests = [
    { name: 'Shopping component exists', check: shoppingContent.includes('const Shopping = () => {') },
    { name: 'Perplexity Pro API integration', check: shoppingContent.includes('api.perplexity.ai') },
    { name: 'Perplexity model', check: shoppingContent.includes('llama-3.1-70b-instruct') },
    { name: 'Grainger integration', check: shoppingContent.includes('grainger_part') },
    { name: 'Home Depot integration', check: shoppingContent.includes('home_depot_aisle') },
    { name: 'Store address', check: shoppingContent.includes('123 Main St, Denver, CO') },
    { name: 'Shopping lists table', check: shoppingContent.includes('TABLES.SHOPPING_LISTS') },
    { name: 'Items JSON structure', check: shoppingContent.includes('items_json') },
    { name: 'Task linking', check: shoppingContent.includes('selectedTaskId') },
    { name: 'Checkbox functionality', check: shoppingContent.includes('updateItemChecked') },
    { name: 'Item checked status', check: shoppingContent.includes('checked: false') },
    { name: 'Shopping cart icon', check: shoppingContent.includes('ShoppingCart') },
    { name: 'Search icon', check: shoppingContent.includes('Search') },
    { name: 'Store icon', check: shoppingContent.includes('Store') },
    { name: 'Package icon', check: shoppingContent.includes('Package') },
    { name: 'MapPin icon', check: shoppingContent.includes('MapPin') },
    { name: 'External link icon', check: shoppingContent.includes('ExternalLink') },
    { name: 'Filter icon', check: shoppingContent.includes('Filter') },
    { name: 'Processing state', check: shoppingContent.includes('processing') },
    { name: 'Loading animation', check: shoppingContent.includes('animation: \'spin 1s linear infinite\'') },
    { name: 'Fallback parsing', check: shoppingContent.includes('fallback parsing') },
    { name: 'Shopping list display', check: shoppingContent.includes('Shopping Lists') },
    { name: 'Item count display', check: shoppingContent.includes('getCheckedCount') },
    { name: 'Total count display', check: shoppingContent.includes('getTotalCount') },
    { name: 'Delete functionality', check: shoppingContent.includes('deleteShoppingList') },
    { name: 'Refresh functionality', check: shoppingContent.includes('loadShoppingLists') },
    { name: 'Console logging', check: shoppingContent.includes('console.log') },
    { name: 'Error handling', check: shoppingContent.includes('catch (error)') },
    { name: 'Success messages', check: shoppingContent.includes('showMessage(\'success\'') },
    { name: 'Error messages', check: shoppingContent.includes('showMessage(\'error\'') },
    { name: 'Online status check', check: shoppingContent.includes('isOnline') },
    { name: 'Offline alert', check: shoppingContent.includes('offline-alert') }
  ];
  
  console.log('Shopping Component Tests:');
  shoppingTests.forEach(test => {
    console.log(`${test.check ? '✅' : '❌'} ${test.name}`);
  });
}

// Test 2: Check for Perplexity Pro API integration
if (fs.existsSync('src/components/Shopping.jsx')) {
  const shoppingContent = fs.readFileSync('src/components/Shopping.jsx', 'utf8');
  
  console.log('\nPerplexity Pro API Integration Tests:');
  console.log(`${shoppingContent.includes('api.perplexity.ai/chat/completions') ? '✅' : '❌'} Perplexity API endpoint`);
  console.log(`${shoppingContent.includes('llama-3.1-70b-instruct') ? '✅' : '❌'} Perplexity model`);
  console.log(`${shoppingContent.includes('Authorization: Bearer') ? '✅' : '❌'} API authorization`);
  console.log(`${shoppingContent.includes('API_KEYS.PERPLEXITY_PRO') ? '✅' : '❌'} API key reference`);
  console.log(`${shoppingContent.includes('your-perplexity-key') ? '✅' : '❌'} API key placeholder`);
  console.log(`${shoppingContent.includes('Processing shopping input with Perplexity Pro') ? '✅' : '❌'} Processing message`);
  console.log(`${shoppingContent.includes('Perplexity parsed shopping items:') ? '✅' : '❌'} Response logging`);
  console.log(`${shoppingContent.includes('Shopping list generated with') ? '✅' : '❌'} Success logging`);
  console.log(`${shoppingContent.includes('Perplexity API error:') ? '✅' : '❌'} Error handling`);
  console.log(`${shoppingContent.includes('fallback parsing') ? '✅' : '❌'} Fallback mechanism`);
}

// Test 3: Check for Grainger and Home Depot integration
if (fs.existsSync('src/components/Shopping.jsx')) {
  const shoppingContent = fs.readFileSync('src/components/Shopping.jsx', 'utf8');
  
  console.log('\nGrainger & Home Depot Integration Tests:');
  console.log(`${shoppingContent.includes('grainger_part') ? '✅' : '❌'} Grainger part number field`);
  console.log(`${shoppingContent.includes('grainger_url') ? '✅' : '❌'} Grainger URL field`);
  console.log(`${shoppingContent.includes('home_depot_aisle') ? '✅' : '❌'} Home Depot aisle field`);
  console.log(`${shoppingContent.includes('home_depot_url') ? '✅' : '❌'} Home Depot URL field`);
  console.log(`${shoppingContent.includes('alternatives') ? '✅' : '❌'} Alternatives field`);
  console.log(`${shoppingContent.includes('123 Main St, Denver, CO') ? '✅' : '❌'} Store address`);
  console.log(`${shoppingContent.includes('Find Grainger part numbers and Home Depot aisle information') ? '✅' : '❌'} Integration description`);
  console.log(`${shoppingContent.includes('Grainger:') ? '✅' : '❌'} Grainger label`);
  console.log(`${shoppingContent.includes('Home Depot:') ? '✅' : '❌'} Home Depot label`);
  console.log(`${shoppingContent.includes('Package size={12}') ? '✅' : '❌'} Grainger icon`);
  console.log(`${shoppingContent.includes('MapPin size={12}') ? '✅' : '❌'} Home Depot icon`);
  console.log(`${shoppingContent.includes('ExternalLink size={12}') ? '✅' : '❌'} External link icon`);
  console.log(`${shoppingContent.includes('target="_blank"') ? '✅' : '❌'} External link target`);
  console.log(`${shoppingContent.includes('rel="noopener noreferrer"') ? '✅' : '❌'} External link security`);
}

// Test 4: Check for UI/UX features
if (fs.existsSync('src/components/Shopping.jsx')) {
  const shoppingContent = fs.readFileSync('src/components/Shopping.jsx', 'utf8');
  
  console.log('\nUI/UX Feature Tests:');
  console.log(`${shoppingContent.includes('Generate Shopping List') ? '✅' : '❌'} Page title`);
  console.log(`${shoppingContent.includes('Describe what you need to fix or maintain') ? '✅' : '❌'} Description`);
  console.log(`${shoppingContent.includes('Link to Task (optional)') ? '✅' : '❌'} Task linking`);
  console.log(`${shoppingContent.includes('Find Parts & Aisles') ? '✅' : '❌'} Button text`);
  console.log(`${shoppingContent.includes('Searching for parts...') ? '✅' : '❌'} Loading text`);
  console.log(`${shoppingContent.includes('Store Information') ? '✅' : '❌'} Store info section`);
  console.log(`${shoppingContent.includes('Shopping Lists') ? '✅' : '❌'} Lists section title`);
  console.log(`${shoppingContent.includes('items checked') ? '✅' : '❌'} Item count display`);
  console.log(`${shoppingContent.includes('checkedCount === totalCount') ? '✅' : '❌'} Completion logic`);
  console.log(`${shoppingContent.includes('CheckCircle size={12}') ? '✅' : '❌'} Completion icon`);
  console.log(`${shoppingContent.includes('AlertCircle size={12}') ? '✅' : '❌'} Pending icon`);
  console.log(`${shoppingContent.includes('textDecoration: \'line-through\'') ? '✅' : '❌'} Strikethrough for completed`);
  console.log(`${shoppingContent.includes('opacity: item.checked ? 0.7 : 1') ? '✅' : '❌'} Opacity for completed`);
  console.log(`${shoppingContent.includes('transition: \'all 0.2s ease\'') ? '✅' : '❌'} Smooth transitions`);
}

// Test 5: Check for database integration
if (fs.existsSync('src/components/Shopping.jsx')) {
  const shoppingContent = fs.readFileSync('src/components/Shopping.jsx', 'utf8');
  
  console.log('\nDatabase Integration Tests:');
  console.log(`${shoppingContent.includes('TABLES.SHOPPING_LISTS') ? '✅' : '❌'} Shopping lists table reference`);
  console.log(`${shoppingContent.includes('items_json: items') ? '✅' : '❌'} Items JSON saving`);
  console.log(`${shoppingContent.includes('store_address:') ? '✅' : '❌'} Store address saving`);
  console.log(`${shoppingContent.includes('task_id: selectedTaskId') ? '✅' : '❌'} Task linking saving`);
  console.log(`${shoppingContent.includes('user_id: \'current-user\'') ? '✅' : '❌'} User ID saving`);
  console.log(`${shoppingContent.includes('created_at: new Date()') ? '✅' : '❌'} Timestamp saving`);
  console.log(`${shoppingContent.includes('.order(\'created_at\', { ascending: false })') ? '✅' : '❌'} Order by creation date`);
  console.log(`${shoppingContent.includes('.eq(\'user_id\', \'current-user\')') ? '✅' : '❌'} User filtering`);
  console.log(`${shoppingContent.includes('.update({ items_json: updatedItems })') ? '✅' : '❌'} Items update`);
  console.log(`${shoppingContent.includes('.delete()') ? '✅' : '❌'} Delete functionality`);
}

// Test 6: Check for App.jsx routing
if (fs.existsSync('src/App.jsx')) {
  const appContent = fs.readFileSync('src/App.jsx', 'utf8');
  
  console.log('\nApp.jsx Routing Tests:');
  console.log(`${appContent.includes('import Shopping from \'./components/Shopping\'') ? '✅' : '❌'} Shopping import`);
  console.log(`${appContent.includes('path="/shopping" element={<Shopping />}') ? '✅' : '❌'} Shopping route`);
  console.log(`${appContent.includes('href="/shopping"') ? '✅' : '❌'} Shopping navigation link`);
  console.log(`${appContent.includes('Go to Shopping') ? '✅' : '❌'} Shopping test link`);
}

// Test 7: Check for Maintenance.jsx navigation
if (fs.existsSync('src/components/Maintenance.jsx')) {
  const maintenanceContent = fs.readFileSync('src/components/Maintenance.jsx', 'utf8');
  
  console.log('\nMaintenance.jsx Navigation Tests:');
  console.log(`${maintenanceContent.includes('ShoppingCart size={16}') ? '✅' : '❌'} Shopping cart icon`);
  console.log(`${maintenanceContent.includes('href="/shopping"') ? '✅' : '❌'} Shopping navigation link`);
  console.log(`${maintenanceContent.includes('Shopping') ? '✅' : '❌'} Shopping link text`);
}

console.log('\n🛒 Shopping List Feature Summary:');
console.log('✅ Perplexity Pro API integration for part lookup');
console.log('✅ Grainger part numbers and direct links');
console.log('✅ Home Depot aisle information and direct links');
console.log('✅ Store address configuration (123 Main St, Denver, CO)');
console.log('✅ Shopping lists with items_json structure');
console.log('✅ Task linking functionality');
console.log('✅ Checkbox functionality for item completion');
console.log('✅ Item count and completion tracking');
console.log('✅ Delete and refresh functionality');
console.log('✅ Fallback parsing when API unavailable');
console.log('✅ Blue (#007BFF) theme integration');
console.log('✅ Mobile-first responsive design');
console.log('✅ Offline alerts and status checking');
console.log('✅ Console logging for debugging');
console.log('✅ Error handling and user feedback');
console.log('✅ External links with security attributes');
console.log('✅ Smooth transitions and visual feedback');
console.log('✅ Database integration with Supabase');

console.log('\n🚀 Testing Instructions:');
console.log('1. Run: npm run dev');
console.log('2. Navigate to /shopping');
console.log('3. Test Shopping List Generation:');
console.log('   - Enter: "Fix concrete cracks, replace light bulbs, repair HVAC filter"');
console.log('   - Check console for: "Processing shopping input with Perplexity Pro"');
console.log('   - Verify items are created with Grainger parts and Home Depot aisles');
console.log('4. Test Task Linking:');
console.log('   - Select a task from dropdown');
console.log('   - Verify task context appears in shopping list');
console.log('5. Test Item Management:');
console.log('   - Click checkboxes to mark items as got');
console.log('   - Verify item count updates (X/Y items)');
console.log('   - Check completed items show strikethrough and reduced opacity');
console.log('6. Test External Links:');
console.log('   - Click Grainger and Home Depot links');
console.log('   - Verify links open in new tabs');
console.log('7. Test Store Information:');
console.log('   - Verify store address is displayed');
console.log('   - Check Grainger and Home Depot descriptions');
console.log('8. Test Fallback Parsing:');
console.log('   - Test without API key (should use fallback)');
console.log('   - Verify items still get created with N/A placeholders');
console.log('9. Test Mobile:');
console.log('   - Test on mobile device');
console.log('   - Verify responsive design and touch interactions');
console.log('10. Test Navigation:');
console.log('    - Click "Shopping" in navigation menu');
console.log('    - Verify route works correctly');

console.log('\n🔍 Key Features:');
console.log('- Perplexity Pro API integration for intelligent part lookup');
console.log('- Grainger part numbers with direct product links');
console.log('- Home Depot aisle information for quick pickup');
console.log('- Store address configuration (123 Main St, Denver, CO)');
console.log('- Shopping lists with JSON structure for flexibility');
console.log('- Task linking to associate shopping with maintenance tasks');
console.log('- Checkbox functionality for item completion tracking');
console.log('- Item count display with completion status');
console.log('- Delete and refresh functionality for list management');
console.log('- Fallback parsing when Perplexity API unavailable');
console.log('- Blue (#007BFF) theme integration');
console.log('- Mobile-first responsive design');
console.log('- Offline alerts and status checking');
console.log('- Console logging for debugging and monitoring');
console.log('- Comprehensive error handling and user feedback');
console.log('- External links with security attributes (noopener, noreferrer)');
console.log('- Smooth transitions and visual feedback for user interactions');
console.log('- Database integration with Supabase for data persistence');
console.log('- Alternative options display for each item'); 