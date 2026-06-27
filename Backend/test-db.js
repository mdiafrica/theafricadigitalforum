const mysql = require('mysql2');

console.log('🔍 Testing connection to Hostinger MySQL...');

const config = {
  host: 'srv976.hstgr.io',
  user: 'u409128813_adf_user',
  password: 'Zikvu2-fynmik-qyqwam',
  database: 'u409128813_adf',
  port: 3306,
  connectTimeout: 15000,
};

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed!');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 The username or password is wrong.');
      console.error('   Check the exact username in Hostinger MySQL section.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('\n💡 Cannot reach the server. Check:');
      console.error('   - Is the hostname correct? (srv976.hstgr.io)');
      console.error('   - Did you add Remote MySQL with "%" or your IP?');
      console.error('   - Did you wait a few minutes for changes to apply?');
    } else if (err.code === 'ER_HOST_IS_BLOCKED') {
      console.error('\n💡 Your IP is not whitelisted.');
      console.error('   Add "%" or your IP to Remote MySQL in Hostinger panel.');
    }
    return;
  }
  
  console.log('✅ Connected successfully!');
  console.log('📊 Checking for existing tables...');
  
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error listing tables:', err.message);
    } else if (results.length === 0) {
      console.log('📊 No tables found. Strapi will create them on first run.');
    } else {
      console.log(`📊 Found ${results.length} tables:`);
      results.forEach(row => {
        const tableName = Object.values(row)[0];
        console.log(`  - ${tableName}`);
      });
    }
    connection.end();
  });
});