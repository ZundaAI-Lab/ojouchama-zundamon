お嬢ちゃまずんだもんと夢みる豆の王国
====================================================

HTML / CSS / JavaScript（ES Modules）で構成した、メルヘン横スクロール探索アクションです。
ゲーム画面は Canvas を中心に描画し、HUD・メニュー・会話・設定画面などの UI は DOM ビューとして重ねて表示します。

最終確認日: 2026-05-16
現行バージョン: 1.0.0-alpha.4


■ 起動HTML
- index.html        : ゲーム本体
- stage-editor.html : ステージエディタ
- sound-editor.html : サウンドエディタ


■ 実装済みゲームフロー
- タイトル画面
- オープニングシーン
- お嬢ちゃまガーデン
- ステージ選択
- 通常ステージ
- ボスステージ
- リザルト画面
- 強化ショップ
- オプション画面
- キーコンフィグ
- タッチ操作設定
- チュートリアル
- ポーズメニュー
- デバッグ画面
- エンディング
- localStorage セーブ / ロード


■ ワールド構成
6ワールド構成です。各ワールドは3エリア＋ボスステージのルート構成です。

- ワールド1 お菓子の森
- ワールド2 ティーカップ城
- ワールド3 リボン庭園
- ワールド4 ぬいぐるみ雲の空
- ワールド5 まよなか絵本館
- ワールド6 夢みる豆の木

通常ステージは以下の形で分割定義します。

- src/data/stages/<world>/area_1.js
- src/data/stages/<world>/area_2.js
- src/data/stages/<world>/area_3.js
- src/data/stages/<world>/boss.js
- src/data/stages/<world>/route.js

ワールド別ルートの集約は `src/data/stages/routes/index.js` で行います。
検証用ステージ `switch_test_lab` は通常のワールド進行とは別扱いです。


■ プレイヤー操作・アクション
- 左右移動
- ジャンプ
- 豆の魔法
- おじぎ
- ティータイム
- なのちゃんアクション
- ポーズ / 戻る
- 会話送り / 決定 / キャンセル

ゲーム内のキーコンフィグで、主要アクションのキー割り当てを変更できます。
キー設定とタッチ操作設定は localStorage の settings 配下に保存されます。
魔法・なのちゃんなどの発射系アクションは、上下左右の短時間入力猶予と、マウス割り当て時の発射専用フリック方向に対応します。


■ 初期キー設定
- ← → / A D : 左右移動
- ↑ / W : 上方向
- ↓ / S : 下方向
- X / Space : ジャンプ
- Z / J : 豆の魔法
- C / K : おじぎ
- V / L : ティータイム
- 左Shift / H : なのちゃん
- P : ポーズ
- Enter / Space / Z : 決定 / 会話送り
- Esc : キャンセル / 戻る

キーコンフィグでは、主要アクションへ最大2入力を割り当てます。
マウス左 / 右 / ホイールクリックは押下入力、ホイールスクロールは短いパルス入力として扱います。

タッチ操作が有効な場合は、方向パッドと5列×2段の機能ボタンで操作します。
既定配置は、右利き配置で上段4=茶、上段5=なの、下段6=ポーズ、下段8=礼、下段9=魔法、下段10=飛です。
未割り当てスロットはゲーム画面に表示しません。
左右配置はゲーム内設定から変更でき、左利き配置では保存値を壊さず表示・描画用スロットだけを左右反転します。
タッチ操作の有効/無効、左右配置、方向パッドサイズ、ボタンサイズ、透明度、デッドゾーンはゲーム内設定から変更できます。


■ 収集・進行・ショップ
- 豆コイン
- 大きな豆コイン
- ずんだもち
- 招待状
- ティーカップ
- 夢のしずく
- ステージクリア記録
- ベストタイム / ベストコイン / ベストティーカップ / ベストランク
- 難易度設定
- 強化ショップ
- なのちゃん加入後に解放される強化

ショップ項目:
- ティーカップ
- ハートのブローチ
- 枝豆のステッキ
- レースの手袋
- ロイヤルティーセット
- まほうのリボン
- ずんだシュガー
- なのだパウダー

難易度:
- ふんわり
- おでかけ
- ロイヤル

夢のしずくはステージID単位で取得状況を保存します。
取得だけでは保存せず、ゴール時に記録します。


■ なのちゃん関連
- なのちゃん救出イベント
- なのちゃん加入フラグ
- なのちゃん同行
- なのちゃん援護
- なのちゃんライド支援
- なのちゃん用ショップ強化

物語進行フラグは `storyFlags` 配下に保存します。


■ ステージギミック
実装済みの主なステージ要素です。

- 通常足場
- 蔓の足場
- 風足場
- ぷるぷるゼリー台
- 崩れるビスケット床
- 雲足場
- 眠り雲
- ページ足場
- 願いの葉
- ティーカップ回転足場
- リボンブリッジ
- 待ち花
- バルーンゴール雲
- 豆の芽 / 蔓系ギミック
- 風船ライド
- 横スクロール風船ライド
- 上昇風船ライド
- バブルリフト
- 中継ポイント
- 落下復帰
- ステージ境界
- ボスカメラ
- ボス遭遇管理
- クリア処理
- 報酬コインドロップ


■ 扉・スイッチ系ギミック
- スイッチ扉
- おじぎ扉
- にんじん時計扉
- お茶会ベル
- ガラスのローズ
- 虹色シャボン
- 魔法燭台
- リボンスイッチ
- スイッチ対象テーブル
- スイッチ対象椅子

スイッチ参照は、実行時側で `switchId` / `setId` / `groupId` / `id` を候補として扱います。
エディタ側の保存前検証もこの実行時ルールに合わせています。


■ 住民・敵・ボス
住民は `src/data/residentDefs.js` に種別ごとの初期パラメータを持ち、行動は `behaviorId` と `behaviorParams` で指定します。
行動ロジックは `src/actors/resident/behavior/` 配下に分離しています。

主な仕組み:
- 地上パトロール
- ホップ移動
- 突進
- 浮遊
- 弾発射
- 弾反射
- グループ制御
- 住民増援イベント
- 魔法ヒット時の短いヒットストップ
- 魔法ヒット対象の控えめなフラッシュ
- 魔法ヒット対象のリアクション速度によるノックバック

魔法ヒットリアクションは `src/stage/MagicHitReactionService.js` が命中確定後の演出値を渡し、対象Actor側が実座標・速度へ反映します。
ボス関連は `src/actors/boss/` と `src/stage/Boss*` 系で管理します。


■ 会話システム
- 開始時会話
- ボス開始時会話
- ボス撃破時会話
- クリア時会話
- エリアクリア時会話
- 会話ウィンドウ表示
- 立ち絵 / ポートレート表示
- ステージエディタ内の会話編集ダイアログ

ステージ定義上の会話配列:
- introDialogue
- bossDialogue
- bossDefeatDialogue
- clearDialogue
- areaClearDialogue


■ 音声仕様
BGM / SE は WebAudio による簡易生成音です。
曲データや効果音レシピは JS 定義として保持します。

BGM:
- src/data/audio/bgmTrackDefs.js がBGM IDと既定曲を集約
- 実際の曲イベントは `src/data/audio/bgm/tracks/` 配下
- タイトル、ステージ選択、各ワールド、通常ボス、最終ボス、なのちゃんテーマを定義
- ステージ定義にはBGMトラックIDのみを保持

SE:
- `src/data/audio/sfxDefs.js` がカテゴリ別SE定義を結合
- 個別SEは `src/data/audio/sfx/` 配下へ用途別に分割
- UI / プレイヤー / アイテム / 住民 / ボス / ステージ / ギミック / なのちゃん / ライド / ショップ のカテゴリを持つ

音量設定:
- BGM音量
- SE音量
- ミュート

HUD表示設定:
- HUD背景色
- HUD背景の濃さ

これらは localStorage の settings 配下に保存します。
HUD表示設定は保存前にプレビュー反映し、キャンセル時は保存済み設定へ戻します。


■ ステージエディタ
`stage-editor.html` から起動します。

主な機能:
- 既存ステージ選択
- 新規ステージ作成
- ステージ複製
- Undo / Redo
- カテゴリ別配置タブ
- 追加プリセット選択
- オブジェクト追加
- オブジェクト複製
- オブジェクト削除
- 配置一覧
- 基本設定フォーム
- プロパティフォーム
- 保存前検証
- 会話編集ダイアログ
- プレビュー起動
- JS生成
- JSON生成
- JSON読込
- JS保存
- JSON保存
- 生成結果コピー

キャンバス操作:
- クリックで選択
- Shift / Ctrl / Meta + クリックで複数選択
- 空白ドラッグで範囲選択
- ドラッグで一括移動
- 右下ハンドルでリサイズ可能オブジェクトをリサイズ
- マウスホイールでズーム
- Deleteで選択オブジェクト削除
- ステージ範囲外配置にも対応

編集カテゴリ:
- 開始/ゴール
- 足場
- アイテム
- 住民
- 中継
- エリア
- ボス
- 扉
- スイッチ
- スイッチ対象
- 風船ライド
- 特殊イベント
- 装飾

エディタの保存前検証では、矩形、参照ID、スイッチ参照、エリア範囲、gap、終端不足、既知kindなどを確認します。
JSON入力欄は、入力中のJSONが壊れている場合に既存データを破壊せず、入力エラー表示に留めます。

ステージJS出力時は、`src/data/stages/<world>/<area>.js` 形式に合わせたステージ定義を生成します。
ステージID変更時は古いroute由来の出力先を優先しない仕様です。


■ サウンドエディタ
`sound-editor.html` から起動します。

主な機能:
- BGM / 効果音タブ切り替え
- 新規作成
- 複製
- 削除
- 試聴
- 停止
- 保存前検証
- BGM JS生成
- SE JS生成
- JS保存
- 生成結果コピー

BGM編集:
- トラックID / タイトル / テンポなどの基本情報
- セクション
- イベント
- 音色
- 試聴
- JSモジュール出力

SE編集:
- SE ID / 名前
- voice type
- waveform
- envelope
- frequency
- noise / sweep / chord / sequence などのレシピ
- カテゴリ別JS出力

SEの出力先カテゴリ:
- src/data/audio/sfx/uiSfxDefs.js
- src/data/audio/sfx/playerSfxDefs.js
- src/data/audio/sfx/itemSfxDefs.js
- src/data/audio/sfx/residentSfxDefs.js
- src/data/audio/sfx/bossSfxDefs.js
- src/data/audio/sfx/stageSfxDefs.js
- src/data/audio/sfx/gimmickSfxDefs.js
- src/data/audio/sfx/nanoSfxDefs.js
- src/data/audio/sfx/rideSfxDefs.js
- src/data/audio/sfx/shopSfxDefs.js

サウンドエディタは、分割済みSE定義の責務を保つため、単一の `sfxDefs.js` ではなくカテゴリ別ファイルを出力します。


■ デバッグ / テスト
- デバッグ画面
- デバッグ表示
- デバッグ設定
- 自動テストランナー
- core tests
- system tests
- stage tests
- stage editor tests
- data validation tests

現行の同梱デバッグテストは80件です。
テスト実行時は localStorage を一時退避・復元し、通常プレイのセーブデータを汚さない方針です。


■ 実行方法
ES Modules を使用しているため、ローカルファイルを直接開かず、ローカルサーバー経由で起動してください。

例:
  cd ojouchama_zundamon_game
  python -m http.server 8000

その後、ブラウザで以下を開いてください。

ゲーム本体:
  http://localhost:8000/

ステージエディタ:
  http://localhost:8000/stage-editor.html

サウンドエディタ:
  http://localhost:8000/sound-editor.html


■ ディレクトリ構成
- index.html : ゲーム本体の起動HTML
- stage-editor.html : ステージエディタの起動HTML
- sound-editor.html : サウンドエディタの起動HTML
- assets/images : 生成済み画像アセット
- styles/index.css : ゲーム本体CSSの読み込み口
- styles/base.css : 基本スタイル
- styles/layout.css : 画面レイアウト
- styles/hud.css : HUD
- styles/components : 汎用UI部品CSS
- styles/screens : 画面別CSS
- styles/editor.css : ステージエディタCSS
- styles/audio-editor.css : サウンドエディタCSS
- styles/mobile-viewport.css : スマホ実表示領域とタッチ端末向けUI補正
- src/main.js : ゲーム本体のアプリ起動エントリ
- src/core : アプリ本体、ゲームループ、カメラ、シーン管理
- src/scenes : Title / Opening / Garden / Option / KeyConfig / TouchControl / Shop / Stage / Result / Debug
- src/stage : ステージ実行、生成、進行、ギミック、衝突後処理、クリア、リトライ、ポーズ、報酬処理、魔法ヒットリアクション
- src/stage/runtime : StageRuntimeから分離したHUD、ポーズ、プレイヤー行動、弾、更新フロー、初期化処理
- src/stage/balloonRide : 風船ライド専用の状態、接触解決、在庫、演出、結果処理
- src/stage/projectiles : ステージ内弾処理
- src/stage/residents : ステージ内住民処理
- src/systems : 入力、発射方向解釈、保存、アセット、物理、衝突判定
- src/render : Canvas描画
- src/render/platforms : 足場描画補助
- src/audio : BGM/SEとWebAudio制御
- src/audio/bgm : BGMトラック再生
- src/audio/sfx : SEレシピ再生
- src/audio/utils : 音声系ユーティリティ
- src/actors : Actor基底、ゴール、弾など
- src/actors/player : プレイヤー本体、操作、状態、豆の魔法、おじぎ、ティータイム、ライド動作
- src/actors/nano : なのちゃん本体、制御、ライド支援
- src/actors/resident : 住民本体、生成、グループ制御、行動システム
- src/actors/boss : ボス本体、生成、攻撃、移動、パターン
- src/actors/item : アイテム
- src/actors/projectile : 弾カタログ、生成、移動
- src/data : ワールド、ステージ、アセット、住民、アイテム、ボス、足場、扉、ゴール定義
- src/data/audio : BGM/SE定義
- src/data/stages : ステージ定義
- src/config : 表示、入力、タッチ操作、HUD外観、プレイヤー、ワールド、強化、難易度、チュートリアル、風/蔓/足場スタイル定義
- src/ui : HUD、会話ウィンドウ、メニュー操作、DOMビュー、スマホ表示補正
- src/ui/dialogs : ダイアログ系UI
- src/ui/views : DOMビュー
- src/debug : デバッグ表示、設定、テストランナー
- src/debug/tests : 自動テスト
- src/editor : ステージエディタ
- src/editor/audio : サウンドエディタ
- src/utils : 汎用関数


■ データ責務メモ
- ステージ定義の正規化は `src/data/stageSchema.js` が担当します。
- ステージ実行時の補完責務を StageFactory / Runtime 側へ持ち込まない方針です。
- キーコンフィグとタッチ操作設定の標準値・正規化は `src/config/controlSettings.js` が担当します。
- タッチ操作の左利き配置は保存値を変更せず、表示・描画用スロット変換で扱います。
- HUD外観設定の標準値・正規化は `src/config/hudSettings.js` が担当します。
- エディタの編集用スキーマは `src/editor/stageEditorSchema.js` が担当します。
- ステージエディタの配置パレットとフィールド定義は `src/editor/stageEditorCatalog.js` が担当します。
- BGMは `src/data/audio/bgmTrackDefs.js` と `src/data/audio/bgm/tracks/` が担当します。
- SEは `src/data/audio/sfxDefs.js` と `src/data/audio/sfx/` 配下のカテゴリ別ファイルが担当します。
- プレイヤー、なのちゃん、住民、ボス、アイテムは Actor 種別ごとに分割されています。
- 魔法・なのちゃんの発射方向解釈は `src/systems/ActionLaunchDirectionResolver.js` が担当し、弾生成や状態遷移は各Actor側へ残します。
- 魔法命中リアクションは `src/stage/MagicHitReactionService.js` が担当し、命中判定やダメージ量は扱いません。
- StageRuntime 本体は実行フローを束ね、細かい処理は `src/stage/runtime/` や各Systemへ分離します。
- スマホ表示の実ビューポート追従は `src/ui/MobileViewportController.js` が担当し、入力処理やゲーム進行には持ち込みません。
- UIはCanvas描画へ混ぜず、DOMビューとして `src/ui/` と `styles/` に分離します。


■ 備考
- ブラウザ上で最後まで遊べる一通りのゲームフローを実装しています。
- アニメーションはスプライトシート連番ではなく、生成済みポーズ画像の状態切り替えで表現します。
- 画像アセットは `assets/images` 配下に配置します。
- スマホ向け表示補正は `styles/mobile-viewport.css` を最後に読み込み、PC表示への影響を避けます。
- ステージデータはJSモジュールとして管理します。
- ステージBGMは曲データではなくBGMトラックIDで参照します。
- 後方互換用の旧スキーマ維持は行わず、現行スキーマを正本とします。
