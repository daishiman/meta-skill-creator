# Google Drive連携リファレンス

Google Drive APIを使用したフォームのフォルダ管理・共有設定。

---

## 概要

Google Formsで作成したフォームはGoogle Driveに保存される。
Drive APIを使用して以下の操作が可能：

- フォルダへの移動
- 共有設定の変更
- ファイル情報の取得

---

## 認証スコープ

```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/drive'  // Drive操作に必要
];
```

---

## フォルダ移動

### files.update

```javascript
const { google } = require('googleapis');
const drive = google.drive({ version: 'v3', auth });

// フォームの現在の親フォルダを取得
const file = await drive.files.get({
  fileId: formId,
  fields: 'parents'
});

// 新しいフォルダに移動
await drive.files.update({
  fileId: formId,
  addParents: targetFolderId,
  removeParents: (file.data.parents || []).join(','),
  fields: 'id, parents'
});
```

### パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `fileId` | string | フォームID |
| `addParents` | string | 追加先フォルダID |
| `removeParents` | string | 削除元フォルダID（カンマ区切り） |
| `fields` | string | レスポンスに含めるフィールド |

---

## 共有設定

### permissions.create

```javascript
// 特定ユーザーに編集権限を付与
await drive.permissions.create({
  fileId: formId,
  requestBody: {
    type: 'user',
    role: 'writer',
    emailAddress: 'user@example.com'
  }
});

// リンクを知っている人に閲覧権限
await drive.permissions.create({
  fileId: formId,
  requestBody: {
    type: 'anyone',
    role: 'reader'
  }
});
```

### type（権限タイプ）

| 値 | 説明 |
|----|------|
| `user` | 特定ユーザー |
| `group` | Googleグループ |
| `domain` | ドメイン全体 |
| `anyone` | リンクを知っている人全員 |

### role（権限レベル）

| 値 | 説明 |
|----|------|
| `owner` | オーナー |
| `organizer` | 管理者（共有ドライブのみ） |
| `fileOrganizer` | コンテンツ管理者（共有ドライブのみ） |
| `writer` | 編集者 |
| `commenter` | コメント可 |
| `reader` | 閲覧者 |

---

## ファイル情報の取得

### files.get

```javascript
const file = await drive.files.get({
  fileId: formId,
  fields: 'id, name, mimeType, parents, webViewLink, createdTime, modifiedTime'
});

console.log(file.data);
// {
//   id: '1BxiMVs0XRA5...',
//   name: 'フォームタイトル',
//   mimeType: 'application/vnd.google-apps.form',
//   parents: ['0APxxx...'],
//   webViewLink: 'https://docs.google.com/forms/d/...',
//   createdTime: '2024-01-15T10:30:00.000Z',
//   modifiedTime: '2024-01-15T11:00:00.000Z'
// }
```

### フォームのMIMEタイプ

```
application/vnd.google-apps.form
```

---

## フォルダ一覧の取得

### files.list

```javascript
// 特定フォルダ内のフォーム一覧
const response = await drive.files.list({
  q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.form'`,
  fields: 'files(id, name, createdTime)',
  orderBy: 'createdTime desc'
});

console.log(response.data.files);
```

### クエリ例

```javascript
// マイドライブ直下のフォーム
q: "mimeType='application/vnd.google-apps.form' and 'root' in parents"

// 特定フォルダ内
q: "'FOLDER_ID' in parents and mimeType='application/vnd.google-apps.form'"

// 名前で検索
q: "name contains 'アンケート' and mimeType='application/vnd.google-apps.form'"
```

---

## フォルダの作成

### files.create

```javascript
const folder = await drive.files.create({
  requestBody: {
    name: 'フォーム保存フォルダ',
    mimeType: 'application/vnd.google-apps.folder',
    parents: ['root']  // マイドライブ直下に作成
  },
  fields: 'id, name'
});

console.log('Created folder:', folder.data.id);
```

---

## 完全なワークフロー例

### フォーム作成→フォルダ移動→共有設定

```javascript
const { google } = require('googleapis');

async function createFormInFolder(auth, formConfig, folderId, shareEmails) {
  const forms = google.forms({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });

  // 1. フォーム作成
  const form = await forms.forms.create({
    requestBody: { info: { title: formConfig.title } }
  });
  const formId = form.data.formId;

  // 2. 質問追加
  await forms.forms.batchUpdate({
    formId,
    requestBody: { requests: formConfig.requests }
  });

  // 3. フォルダ移動
  if (folderId) {
    const file = await drive.files.get({
      fileId: formId,
      fields: 'parents'
    });

    await drive.files.update({
      fileId: formId,
      addParents: folderId,
      removeParents: (file.data.parents || []).join(',')
    });
  }

  // 4. 共有設定
  for (const email of shareEmails) {
    await drive.permissions.create({
      fileId: formId,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: email
      },
      sendNotificationEmail: true
    });
  }

  return {
    formId,
    responderUri: form.data.responderUri,
    editUri: `https://docs.google.com/forms/d/${formId}/edit`
  };
}
```

---

## エラーハンドリング

| エラーコード | 説明 | 対処法 |
|-------------|------|--------|
| 403 | 権限不足 | Driveスコープを確認 |
| 404 | フォルダ/ファイルが存在しない | IDを確認 |
| 400 | 無効なリクエスト | パラメータを確認 |

---

## ベストプラクティス

### 1. フォルダIDの検証

```javascript
async function validateFolderId(drive, folderId) {
  try {
    const folder = await drive.files.get({
      fileId: folderId,
      fields: 'id, mimeType'
    });
    return folder.data.mimeType === 'application/vnd.google-apps.folder';
  } catch (error) {
    return false;
  }
}
```

### 2. 移動前の確認

```javascript
// 現在の位置を記録（ロールバック用）
const originalParents = (await drive.files.get({
  fileId: formId,
  fields: 'parents'
})).data.parents;
```

### 3. バッチ処理での共有

```javascript
// 複数ユーザーへの共有を効率的に
const batch = drive.newBatch();
shareEmails.forEach(email => {
  batch.add(drive.permissions.create({
    fileId: formId,
    requestBody: { type: 'user', role: 'writer', emailAddress: email }
  }));
});
await batch.execute();
```
