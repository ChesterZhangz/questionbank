#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(process.cwd(), '.env') });

console.log('🔍 环境变量检查报告');
console.log('====================');

// 检查关键环境变量
const criticalVars = [
  'NODE_ENV',
  'PORT',
  'FRONTEND_URL',
  'MONGODB_URI',
  'JWT_SECRET',
  'QQ_EMAIL_USER',
  'QQ_EMAIL_PASS'
];

console.log('\n📋 关键环境变量:');
criticalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? value : '未设置';
  console.log(`  ${status} ${varName}: ${displayValue}`);
});

// 检查邮箱相关配置
console.log('\n📧 邮箱配置:');
const emailVars = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS'
];

emailVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? value : '未设置';
  console.log(`  ${status} ${varName}: ${displayValue}`);
});

// 检查前端URL配置
console.log('\n🌐 前端URL配置:');
const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl) {
  console.log(`  ✅ FRONTEND_URL: ${frontendUrl}`);
  
  // 测试URL格式
  try {
    const url = new URL(frontendUrl);
    console.log(`  ✅ URL格式正确: ${url.protocol}//${url.host}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`  ❌ URL格式错误: ${errorMessage}`);
  }
} else {
  console.log('  ❌ FRONTEND_URL 未设置');
}

// 检查当前工作目录
console.log('\n📁 路径信息:');
console.log(`  当前工作目录: ${process.cwd()}`);
console.log(`  .env文件路径: ${path.join(process.cwd(), '.env')}`);

// 检查.env文件是否存在
import fs from 'fs';
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('  ✅ .env文件存在');
  
  // 读取.env文件内容（不显示敏感信息）
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  console.log(`  📄 .env文件包含 ${lines.length} 个配置项`);
} else {
  console.log('  ❌ .env文件不存在');
}

console.log('\n🔧 建议:');
if (!process.env.FRONTEND_URL) {
  console.log('  - 设置 FRONTEND_URL=http://43.160.253.32');
}
if (!process.env.NODE_ENV) {
  console.log('  - 设置 NODE_ENV=production');
}

console.log('\n✨ 检查完成');
