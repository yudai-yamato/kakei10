//要素の取得
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('entryForm');
    const btnExpense = document.getElementById('btn-expense');
    const btnIncome = document.getElementById('btn-income');
    const typeInput = document.getElementById('type');
    const categorySelect = document.getElementById('category-select');

    // カテゴリ候補（支出/収入）
    const expenseCategories = [
        '食費', '日用品', '交通費', '趣味・娯楽', '美容', '医療・健康', '教育・教養', '光熱費', '通信費', '家賃', 'その他'
    ];
    const incomeCategories = ['給料', '副業', 'お小遣い'];

    // 初期状態を支出に設定（カテゴリを埋める）
    setType('expense');

    //クリックイベント
    btnExpense.addEventListener('click', () => setType('expense'));
    btnIncome.addEventListener('click', () => setType('income'));

    // カテゴリを select に反映するヘルパー
    function populateCategories(list) {
        if (!categorySelect) return;
        categorySelect.innerHTML = '';
        list.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            categorySelect.appendChild(opt);
        });
        categorySelect.required = true;
    }

    // タイプ設定
    function setType(t) {
        typeInput.value = t;
        if (t === 'income') {
            btnIncome.classList.add('active');
            btnExpense.classList.remove('active');
            populateCategories(incomeCategories);
        } else {
            btnExpense.classList.add('active');
            btnIncome.classList.remove('active');
            populateCategories(expenseCategories);
        }
    }

    //フォーム送信
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        //入力内容の取得
        const formData = new FormData(form);
        const date = formData.get('dateISO') || new Date().toISOString().slice(0, 10);
        const rawAmount = (formData.get('amount') || '').toString().replace(/,/g, '').trim();
        const amount = Number(rawAmount);

        //入力チェック（バリデーション）
        if (!date) {
            alert('日付を入力してください');
            return;
        }
        if (!rawAmount || isNaN(amount) || amount <= 0) {
            alert('金額は正の数で入力してください');
            return;
        }

        //カテゴリの判定（単一 select から取得）
        const type = formData.get('type') || 'expense';
        const category = formData.get('category') || 'その他';

        //メモの取得
        const note = formData.get('memo') || '';

        //サーバーに送るデータをまとめる
        const payload = {
            date,
            type,
            category,
            amount: Math.floor(amount),
            note
        }

        //データをサーバーに送信
        try {
            const res = await fetch('/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            //結果の処理
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `サーバーエラー(${res.status})`);
            }

            const data = await res.json();
            alert('登録しました (ID: ' + (data.id || '-') + ')');
            form.reset();
            setType('expense');//フォーム状態をリセット
            //合計ページに遷移
            window.location.href = '/summary.html';
        } catch (error) {
            console.error(error);
            alert('登録に失敗しました: ' + error.message);
        }
    });
});





