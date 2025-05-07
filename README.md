# Escape_Infinite_Labyrinth
植中雄斗の個人開発ゲーム（ChatGPT利用）です．

## 使用技術
- Python
  - pygame

---

## ゲームの実行方法

### 1. リポジトリのクローン

1. GitHubの本リポジトリページにアクセス
2. `<> Code`ボタンをクリックし，`Local`タブの`HTTPS`URLをコピー
3. 任意のディレクトリで以下を実行

```bash
cd /path/to/your/directory
git clone <コピーしたリポジトリのURL>
cd Escape_Infinite_Labyrinth
```

### 2. 仮想環境のセットアップ
  - MacOS / Linuxの場合

  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

  - Windowsの場合 (PowerShell)

  ```bash
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```

  ※ Activate.ps1の実行がブロックされた場合，管理者権限でPowerShellを開き，以下を実行してください
  ```bash
  Set-ExecutionPolicy RemoteSigned
  ```
### 必要なライブラリをインストール
- pygame単体をインストール

```bash
pip install pygame
```

- または requirements.txt から一括インストール
```bash
pip install -r requirements.txt
```

### 3. ゲームの実行
  - リポジトリに移動し，仮想環境をアクティベートした状態で，以下のコマンドを実行
  ```bash
  python main.py
  ```

## ルール，遊び方
- なるべく多くのマップを素早くクリアすることを目指す．
- 矢印キー（上下左右）で移動．
- マップ内の鍵を取得し，ゴール地点に到達するとマップクリア．
- 敵に触れるとゲームオーバー．
- ブロックは通り抜け不可．