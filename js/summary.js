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
                        // カテゴリ名と金額をインラインで表示
                        const textSpan = document.createElement('span');
                        textSpan.textContent = `${cat}： ${tot}`;
                        li.appendChild(textSpan);

                        // memos があれば、最初の数件をインラインで表示
                        if (Array.isArray(it.memos) && it.memos.length > 0) {
                            const previewSpan = document.createElement('span');
                            previewSpan.style.marginLeft = '10px';
                            previewSpan.style.fontSize = '0.9em';
                            previewSpan.style.color = '#666';

                            const first = it.memos.slice(0, 3);
                            // 空文字メモもそのまま要素にする（表示は空欄として見える）
                            previewSpan.textContent = first.join(', ');
                            li.appendChild(previewSpan);

                            // 多ければ「さらに N 件」ボタンで全件表示（展開）
                            if (it.memos.length > 3) {
                                const more = document.createElement('button');
                                more.textContent = `さらに ${it.memos.length - 3} 件`;
                                more.style.marginLeft = '8px';
                                more.style.fontSize = '0.8em';
                                more.addEventListener('click', () => {
                                    // 展開用の下位リストを作成
                                    const memoUl = document.createElement('ul');
                                    memoUl.style.margin = '6px 0 0 12px';
                                    it.memos.forEach(memoText => {
                                        const memoLi = document.createElement('li');
                                        memoLi.textContent = `メモ: ${memoText}`;
                                        memoLi.style.fontSize = '0.9em';
                                        memoLi.style.color = '#666';
                                        memoUl.appendChild(memoLi);
                                    });
                                    // ボタンを消して下に追加
                                    more.remove();
                                    li.appendChild(document.createElement('br'));
                                    li.appendChild(memoUl);
                                });
                                li.appendChild(more);
                            }
                        }

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