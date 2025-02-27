#!/usr/bin/env node

/**
 * このスクリプトは、Next.jsアプリケーションをHTTPSで起動するためのものです。
 * WebRTCはHTTPSが必要なため、ローカル開発環境でもHTTPSを使用する必要があります。
 */

const { execSync } = require('child_process');
const os = require('os');

console.log('🔒 HTTPSでNext.jsを起動します（WebRTC用）...');

try {
  // 自己署名証明書を使用してNext.jsを起動
  const command = 'NODE_TLS_REJECT_UNAUTHORIZED=0 next dev --experimental-https';
  
  console.log(`実行コマンド: ${command}`);
  console.log('');
  console.log('注意: ブラウザで証明書の警告が表示されますが、「詳細設定」→「安全でないサイトにアクセスする」を選択してください。');
  console.log('');
  
  // コマンドを実行
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('エラーが発生しました:', error.message);
  process.exit(1);
}
