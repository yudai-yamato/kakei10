const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = new sqlite3.Database('./kakei.db');

app.post('/transactions', (req, res) => {
    const { date, type, category, amount, note } = req.body;
    if (!date || !type || !category || !amount === undefined) return res.status(400).json({ error: '必須項目が不足しています' });
    if (type !== 'income' && type !== 'expense') return res.status(400).json({ error: 'typeは"income"または"expense"である必要があります' });
    if (isNaN(Number(amount))) return res.status(400).json({ error: 'amountは数値である必要があります' });

    const sql = `INSERT INTO transactions (date, type, category, amount, note) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [date, type, category || null,Math.floor(Number(amount)),note || null], function(err) {
        if (err) return res.status(500).json({ error: 'DBエラー' });
        res.json({ id: this.lastID });
    });
});

// 全ての取引を取得
app.get('/transactions', (req, res) => {
    const sql = 'SELECT * FROM transactions ORDER BY date DESC';
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'DBエラー' });
        res.json(rows);
    });
});

// 合計と集計を取得
app.get('/totals', (req, res) => {
    const promises = [
        // 総収入
        new Promise((resolve, reject) => {
            db.get('SELECT IFNULL(SUM(amount),0) AS total FROM transactions WHERE type = "income"', (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            });
        }),
        // 総支出
        new Promise((resolve, reject) => {
            db.get('SELECT IFNULL(SUM(amount),0) AS total FROM transactions WHERE type = "expense"', (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            });
        }),
        // カテゴリ別集計
        new Promise((resolve, reject) => {
            db.all('SELECT type, category, SUM(amount) as total FROM transactions GROUP BY type, category', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        })
    ];

    Promise.all(promises)
        .then(([income, expense, categories]) => {
            res.json({
                summary: {
                    income: income,
                    expense: expense,
                    balance: income - expense
                },
                categories: categories
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'DBエラー' });
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
