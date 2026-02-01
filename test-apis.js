/**
 * TalentFlow API测试脚本
 * 测试Gemini AI和OpenAI API连接
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🚀 TalentFlow API测试开始\n');
console.log('=' .repeat(60));

// 测试1: Gemini AI连接
async function testGeminiAI() {
  console.log('\n📝 测试1: Gemini AI连接');
  console.log('-'.repeat(60));
  
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('未找到GEMINI_API_KEY');
    }
    
    console.log('✓ API密钥已配置');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('✓ Gemini客户端初始化成功');
    
    const prompt = '请用一句话介绍TalentFlow人才管理系统的核心价值。';
    console.log(`\n发送测试提示: "${prompt}"`);
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('\n✅ Gemini AI响应成功:');
    console.log(`   ${response}`);
    
    return { success: true, response };
  } catch (error) {
    console.error('\n❌ Gemini AI测试失败:');
    console.error(`   错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 测试2: OpenAI API连接
async function testOpenAI() {
  console.log('\n\n📝 测试2: OpenAI API连接');
  console.log('-'.repeat(60));
  
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('未找到OPENAI_API_KEY');
    }
    
    console.log('✓ API密钥已配置');
    
    // 测试简单的API调用
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const whisperModels = data.data.filter(m => m.id.includes('whisper'));
    
    console.log('✓ OpenAI客户端连接成功');
    console.log(`✓ 找到 ${whisperModels.length} 个Whisper模型`);
    
    if (whisperModels.length > 0) {
      console.log('\n✅ OpenAI Whisper可用模型:');
      whisperModels.forEach(m => {
        console.log(`   - ${m.id}`);
      });
    }
    
    return { success: true, models: whisperModels };
  } catch (error) {
    console.error('\n❌ OpenAI API测试失败:');
    console.error(`   错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 测试3: 项目结构检查
async function testProjectStructure() {
  console.log('\n\n📝 测试3: 项目结构检查');
  console.log('-'.repeat(60));
  
  const fs = await import('fs');
  const path = await import('path');
  
  const requiredFiles = [
    'package.json',
    'App.tsx',
    'types.ts',
    'constants.ts',
    'services/geminiService.ts',
    'services/supabaseService-enhanced.ts',
    'services/voiceService.ts',
    'services/paymentService.ts',
    'lib/supabase.ts',
    'db/schema-enhanced.sql',
    'docs/DATABASE_SETUP.md',
    'docs/API_ROUTES.md',
    'docs/DEPLOYMENT_GUIDE.md'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    const status = exists ? '✓' : '✗';
    console.log(`${status} ${file}`);
    if (!exists) allFilesExist = false;
  }
  
  if (allFilesExist) {
    console.log('\n✅ 所有必需文件都存在');
    return { success: true };
  } else {
    console.log('\n⚠️  部分文件缺失');
    return { success: false };
  }
}

// 主测试函数
async function runTests() {
  const results = {
    gemini: null,
    openai: null,
    structure: null
  };
  
  // 运行所有测试
  results.structure = await testProjectStructure();
  results.gemini = await testGeminiAI();
  results.openai = await testOpenAI();
  
  // 生成测试报告
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));
  
  const tests = [
    { name: '项目结构', result: results.structure },
    { name: 'Gemini AI', result: results.gemini },
    { name: 'OpenAI API', result: results.openai }
  ];
  
  tests.forEach(test => {
    const status = test.result.success ? '✅ 通过' : '❌ 失败';
    console.log(`${status} - ${test.name}`);
  });
  
  const passedTests = tests.filter(t => t.result.success).length;
  const totalTests = tests.length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`测试完成: ${passedTests}/${totalTests} 通过`);
  console.log('='.repeat(60));
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！项目配置正确。');
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置。');
  }
  
  console.log('\n💡 提示: 要测试完整功能，请配置Supabase并启动开发服务器。');
}

// 运行测试
runTests().catch(error => {
  console.error('\n💥 测试过程中发生错误:');
  console.error(error);
  process.exit(1);
});
