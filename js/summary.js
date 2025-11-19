document.addEventListener('DOMContentLoaded', () => {
    const elIncome = document.getElementById('totalIncome');
    const elExpense = document.getElementById('totalExpense');
    const elCategories = document.getElementById('categories');
    const elError = document.getElementById('error');
    const elRaw = document.getElementById('rawResponse');

    //収入・支出・カテゴリ別集計　画面反映
    async function loadTotals() {
        elError.style.display = 'none';
        elCategories.textContent = '読み込み中…';
        try {
            const res = await fetch('/totals', { cache: 'no-store' });
            if (!res.ok) throw new Error('サーバーエラー: ' + res.status);
            const data = await res.json();

            const income = Number((data && data.summary && data.summary.income) || 0);
            const expense = Number((data && data.summary && data.summary.expense) || 0);

            elIncome.textContent = income.toLocaleString();
            elExpense.textContent = expense.toLocaleString();

            const rows = Array.isArray(data.categories) ? data.categories : [];
            if (rows.length === 0) {
                elCategories.textContent = 'カテゴリ集計データがありません';
            } else {
                const byType = rows.reduce((acc, r) => {
                    const t = r.type || 'unknown';
                    acc[t] = acc[t] || [];
                    acc[t].push(r);
                    return acc;
                }, {});

                //カテゴリ別集計を画面に表示するための UI 更新処理
                elCategories.innerHTML = '';
                Object.keys(byType).forEach(type => {
                    const title = document.createElement('h3');
                    title.textContent = (type === 'income' ? '収入' : (type === 'expense' ? '支出' : type));
                    elCategories.appendChild(title);

                    //カテゴリごとの合計金額をリスト表示
                    const ul = document.createElement('ul');
                    byType[type].forEach(it => {
                        const li = document.createElement('li');
                        const cat = it.category || '未分類';
                        const tot = Number(it.total || 0).toLocaleString();
                        li.textContent = `${cat}： ${tot}`;
                        ul.appendChild(li);
                    });
                    elCategories.appendChild(ul);
                });
            }

            //エラー処理 & デバッグ表示 & 初期ロード
            if (elRaw) {
                elRaw.style.display = 'none';
                elRaw.textContent = JSON.stringify(data, null, 2);
            }
        } catch (err) {
            console.error(err);
            console.error(err);
            elIncome.textContent = '-';
            elExpense.textContent = '-';
            elCategories.textContent = '';
            elError.style.display = '';
            elError.textContent = 'データの取得に失敗しました。サーバーが起動しているか確認してください。';
        }
    }

    
    loadTotals();
});