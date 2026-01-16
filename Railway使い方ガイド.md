# Railway デプロイ完全ガイド

次回の開発で使えるRailwayデプロイの完全マニュアル

---

## 📋 目次

1. [事前準備](#事前準備)
2. [コードの準備](#コードの準備)
3. [Railwayでのデプロイ](#railwayでのデプロイ)
4. [トラブルシューティング](#トラブルシューティング)
5. [料金・制限](#料金制限)

---

## 事前準備

### 必要なアカウント

- ✅ GitHubアカウント
- ✅ Railwayアカウント（GitHubで認証）

### 必要な知識

- Git の基本操作（add, commit, push）
- 環境変数の概念
- 基本的なデータベース知識

---

## コードの準備

### 1. バックエンド（ASP.NET Core）の準備

#### ① `Program.cs` の修正

**重要ポイント：**
- 環境変数でデータベース接続を管理
- CORS設定を環境変数化
- 自動マイグレーション機能を追加

```csharp
using Microsoft.EntityFrameworkCore; 
using YourApp.Models; 

var builder = WebApplication.CreateBuilder(args);

// ===== データベース接続設定 =====
string connectionString;
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

if (!string.IsNullOrEmpty(databaseUrl))
{
    // RailwayのDATABASE_URLをNpgsql形式に変換
    var uri = new Uri(databaseUrl);
    var host = uri.Host;
    var port = uri.Port;
    var database = uri.AbsolutePath.TrimStart('/');
    var userInfo = uri.UserInfo.Split(':');
    var username = userInfo[0];
    var password = userInfo.Length > 1 ? userInfo[1] : "";

    connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}
else
{
    // ローカル開発環境用
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();

// ===== CORS設定 =====
var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
    ?? "http://localhost:3000";
var origins = allowedOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ===== 自動マイグレーション =====
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
        Console.WriteLine("データベーステーブルの確認・作成が完了しました。");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"データベースの初期化中にエラーが発生しました: {ex.Message}");
    }
}

// ===== 実行 =====
app.UseStaticFiles();
app.UseCors("AllowReact");
app.MapControllers();
app.Run();
```

#### ② `.gitignore` の確認

機密情報を含むファイルが除外されているか確認：

```
appsettings.Development.json
appsettings.Production.json
bin/
obj/
```

#### ③ GitHubにpush

```bash
cd your-api-project
git add .
git commit -m "Railway対応の設定を追加"
git push origin main
```

---

### 2. フロントエンド（React）の準備

#### ① API URL設定ファイルの作成

**`src/config.js`** を新規作成：

```javascript
// API接続先の設定
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5182';

export default API_URL;
```

#### ② コンポーネントの修正

すべてのfetch呼び出しを修正：

```javascript
// 修正前
fetch('http://localhost:5182/api/employees')

// 修正後
import API_URL from '../config';
fetch(`${API_URL}/api/employees`)
```

#### ③ `package.json` の確認

必要な依存関係がすべて含まれているか確認。

#### ④ GitHubにpush

```bash
cd your-react-project
git add .
git commit -m "Railway対応：環境変数でAPI URLを管理"
git push origin main
```

---

## Railwayでのデプロイ

### ステップ1: バックエンドAPIのデプロイ

#### 1-1. 新規プロジェクト作成

1. https://railway.app/ にアクセス
2. 「New Project」をクリック
3. 「GitHub Repository」を選択
4. **バックエンドのリポジトリ**を選択

#### 1-2. PostgreSQLデータベースの追加

1. プロジェクト画面で「Create」（または「New」）をクリック
2. 「Database」を選択
3. 「PostgreSQL」を選択
4. 自動的に `DATABASE_URL` が設定される

#### 1-3. バックエンドの公開URL取得

1. APIサービスをクリック
2. 「Settings」→「Networking」
3. 「Generate Domain」をクリック
4. 生成されたURLをメモ（例：`https://your-api-production-xxxx.up.railway.app`）

---

### ステップ2: フロントエンドのデプロイ

#### 2-1. 新規プロジェクト作成

1. ダッシュボードに戻る
2. 「New Project」をクリック
3. 「GitHub Repository」を選択
4. **フロントエンドのリポジトリ**を選択

#### 2-2. 環境変数の設定

1. フロントエンドサービスをクリック
2. 「Variables」タブを開く
3. 「+ New Variable」をクリック
4. 以下を追加：
   - Variable Name: `REACT_APP_API_URL`
   - Value: `https://your-api-production-xxxx.up.railway.app`（バックエンドのURL）

#### 2-3. ビルド設定（エラーが出た場合のみ）

「Settings」→「Deploy」で以下を設定：

- **Build Command**: `npm run build`
- **Start Command**: `npx serve -s build -l 3000`

#### 2-4. フロントエンドの公開URL取得

1. 「Settings」→「Networking」
2. 「Generate Domain」をクリック
3. ポート番号：`3000`
4. 生成されたURLをメモ（例：`https://your-app-production-xxxx.up.railway.app`）

---

### ステップ3: CORS設定の完了

#### 3-1. バックエンドに環境変数を追加

1. バックエンドプロジェクトを開く
2. APIサービスの「Variables」タブを開く
3. 「+ New Variable」をクリック
4. 以下を追加：
   - Variable Name: `ALLOWED_ORIGINS`
   - Value: `https://your-app-production-xxxx.up.railway.app`（フロントエンドのURL）

5. 保存すると自動的に再デプロイされる

---

### ステップ4: 動作確認

1. フロントエンドのURLにアクセス
2. アプリが正常に表示されるか確認
3. データの取得・追加・更新・削除が動作するか確認

---

## トラブルシューティング

### エラー1: `yaml@2.8.2` が見つからない

**原因**: `package-lock.json` と `package.json` が同期していない

**解決方法**:
```bash
cd your-react-project
npm install yaml@2.8.2
git add .
git commit -m "yamlパッケージを追加"
git push
```

---

### エラー2: `relation "table_name" does not exist`

**原因**: データベースにテーブルが作成されていない

**解決方法**:
- `Program.cs` に自動マイグレーション機能が含まれているか確認
- `context.Database.EnsureCreated();` が実行されているか確認
- Deploy Logsで「データベーステーブルの確認・作成が完了しました。」が表示されているか確認

---

### エラー3: CORSエラー

**症状**:
```
Access to fetch at '...' has been blocked by CORS policy
```

**解決方法**:
1. バックエンドの環境変数 `ALLOWED_ORIGINS` が正しく設定されているか確認
2. フロントエンドのURLが正確に含まれているか確認
3. バックエンドを再デプロイ

---

### エラー4: `Failed to connect to 127.0.0.1:5432`

**原因**: `DATABASE_URL` 環境変数が設定されていない

**解決方法**:
1. APIサービスの「Variables」タブを開く
2. 「8 variables added by Railway」を展開
3. `DATABASE_URL` が存在するか確認
4. なければ、「Add Variable」でPostgreSQLサービスから `DATABASE_URL` を追加

---

### エラー5: ビルドは成功するが起動しない（React）

**原因**: Start Commandが設定されていない

**解決方法**:
1. フロントエンドサービスの「Settings」→「Deploy」
2. 「Start Command」に以下を設定：
   ```
   npx serve -s build -l 3000
   ```

---

### エラー6: `Format of the initialization string does not conform to specification`

**原因**: PostgreSQL接続文字列の形式が間違っている

**解決方法**:
- `Program.cs` で `DATABASE_URL` を正しくNpgsql形式に変換しているか確認
- 上記の `Program.cs` サンプルコードを使用

---

## 料金・制限

### 無料プラン（Hobby）

- ✅ 月500実行時間（約20日分）
- ✅ 1GB RAM
- ✅ 非アクティブ時スリープ
- ✅ PostgreSQL 1GB ストレージ
- ❌ カスタムドメイン不可

**用途**: デモ、ポートフォリオ、学習用

---

### 有料プラン（Developer）

- 月 $5〜
- より多くのリソース
- カスタムドメイン対応
- スリープなし

**用途**: 小規模な本番環境、個人プロジェクト

---

### Pro/Team プラン

- 月 $20〜
- 本格的な商用利用
- チーム機能
- 優先サポート

**用途**: クライアント案件、商用サービス

---

## ベストプラクティス

### 1. 環境変数の管理

- ❌ ハードコードされたURL、パスワード
- ✅ すべて環境変数で管理

### 2. セキュリティ

- `.gitignore` で機密情報を除外
- `appsettings.Development.json` をGitHubにpushしない
- 本番環境では強力なパスワードを使用

### 3. デプロイフロー

```
ローカル開発 → GitHubにpush → Railway自動デプロイ
```

この流れを習慣化する

### 4. ログの確認

- デプロイ後は必ず「Deploy Logs」を確認
- エラーが出たらログを読んで原因を特定

### 5. バックアップ

- 本番データは定期的にバックアップ
- Railwayの「Backups」機能を活用

---

## チェックリスト

### デプロイ前

- [ ] `.gitignore` が正しく設定されている
- [ ] 機密情報がコードに含まれていない
- [ ] 環境変数で設定を管理している
- [ ] ローカルで正常に動作している
- [ ] GitHubに最新版がpushされている

### デプロイ中

- [ ] バックエンドが「Online」になった
- [ ] PostgreSQLが「Online」になった
- [ ] フロントエンドが「Online」になった
- [ ] 環境変数がすべて設定されている
- [ ] Deploy Logsでエラーがない

### デプロイ後

- [ ] フロントエンドURLでアプリが開く
- [ ] データの取得ができる
- [ ] データの追加ができる
- [ ] データの更新ができる
- [ ] データの削除ができる

---

## 参考リンク

- Railway公式ドキュメント: https://docs.railway.app/
- Railway公式サイト: https://railway.app/
- トラブルシューティング: https://docs.railway.app/troubleshoot/fixing-common-errors

---

## まとめ

Railwayは以下のような特徴があります：

**メリット**:
- 簡単にデプロイできる
- GitHubと連携して自動デプロイ
- 無料プランがある
- PostgreSQL、MySQLなど主要DBに対応

**デメリット**:
- 無料プランは制限がある
- カスタムドメインは有料
- 日本語ドキュメントが少ない

**最適な用途**:
- ポートフォリオ用アプリ
- デモアプリ
- 学習・実験用
- 小規模な個人プロジェクト

---

**このドキュメントを次回の開発時に参照してください！**

作成日: 2026年1月
最終更新: 2026年1月
