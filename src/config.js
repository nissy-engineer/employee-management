// API接続先の設定
// 環境変数 REACT_APP_API_URL があればそれを使用、なければローカル開発用
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5182';

export default API_URL;