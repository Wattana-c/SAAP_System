require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { poolPromise } = require('../src/configs/db');
const axios = require('axios');

async function validateEnv() {
    console.log('--- 1. Validating Configurations ---');
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found. Please copy .env.example to .env');
        return false;
    }

    const requiredKeys = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_NAME', 'FRONTEND_URL'];
    let valid = true;
    for (const key of requiredKeys) {
        if (!process.env[key] || process.env[key].includes('your_')) {
            console.error(`❌ Missing or invalid configuration for: ${key}`);
            valid = false;
        }
    }

    if (valid) console.log('✅ Configuration looks good.');
    return valid;
}

async function testDatabase() {
    console.log('\n--- 2. Testing Database Connection ---');
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT 1 as test');
        if (result.recordset[0].test === 1) {
            console.log('✅ Database connected successfully.');
            return true;
        }
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

async function testFacebookAPI() {
    console.log('\n--- 3. Testing Facebook Graph API ---');
    const pageId = process.env.FB_PAGE_ID;
    const token = process.env.FB_PAGE_ACCESS_TOKEN;

    if (!pageId || !token || pageId.includes('your_') || token.includes('your_')) {
        console.warn('⚠️ Facebook credentials not properly configured. Skipping API test. (Multi-page DB config will be relied upon instead)');
        return true; // Soft pass since we can use DB pages
    }

    try {
        const url = `https://graph.facebook.com/v19.0/${pageId}?access_token=${token}`;
        const res = await axios.get(url);
        if (res.data.id) {
            console.log('✅ Facebook API connected successfully. Page Name:', res.data.name);
            return true;
        }
    } catch (error) {
        console.error('❌ Facebook API connection failed:', error.response?.data?.error?.message || error.message);
        return false;
    }
}

async function run() {
    console.log('====================================');
    console.log('   Shopee Affiliate Auto Setup      ');
    console.log('====================================\n');

    const envValid = await validateEnv();
    if (!envValid) process.exit(1);

    const dbValid = await testDatabase();
    if (!dbValid) process.exit(1);

    const fbValid = await testFacebookAPI();

    console.log('\n🎉 Setup validation completed!');
    console.log('👉 Run `npm start` to boot the application.');
    process.exit(0);
}

run();
