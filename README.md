# 社員情報管理システム

## プロジェクト構成

- **employee-management**: フロントエンド（React）
- **employee-management-api**: バックエンド（ASP.NET Core Web API）

## 起動方法

### バックエンド
```bash
cd employee-management-api
dotnet watch run
```

### フロントエンド
```bash
cd employee-management
npm start
```

## アクセスURL

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:5182

## ツリー図: 
```
employee-management/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── EmployeeDetailModal.css
│   │   ├── EmployeeDetailModal.js
│   │   ├── EmployeeDetailModal.tsx
│   │   ├── EmployeeList.css
│   │   ├── EmployeeList.js
│   │   └── EmployeeList.tsx
│   ├── App.css
│   ├── App.tsx
│   ├── config.ts
│   ├── index.js
│   └── types.ts
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```
