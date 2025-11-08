const sqlite3 = require('sqlite3').verbose();

//データベースファイルを作成して接続
const db = new sqlite3.Database('./kakei.db', (err) => {
    if (err) {
        console.error('データベースへの接続でエラーが発生しました', err);
        return;
    }
    console.log('データベースに接続しました');
});

//テーブル作成
const createTable = `
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    amount INTEGER NOT NULL,
    note TEXT
)`; 

db.run(createTable, (err) => {
    if (err) {
        console.error('テーブルの作成でエラーが発生しました', err);
        return;
    }
    console.log('transactionテーブルが正常に作成されました');

    //データベース接続を閉じる
    db.close((err) => {
        if (err) {
            console.error('データベースの切断でエラーが発生しました', err);
            return;
        }
        console.log('データベース接続が閉じられました');
    });
});

