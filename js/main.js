//要素の取得
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('entryForm');
    const btnExpense = document.getElementById('btn-expense');
    const btnIncome = document.getElementById('btn-income');
    const typeInput = document.getElementById('type');

    //初期状態を支出に設定
    setType('expense');

    //クリックイベント
    btnExpense.addEventListener('click', () => setType('expense'));
    btnIncome.addEventListener('click', () => setType('income'));

    //タイプ設定
    function setType(t) {
        typeInput.value = t;
        if (t === 'income') {
            btnExpense.classList.add('active');
            btnIncome.classList.remove('active');
        } else {
            btnIncome.classList.add('active');
            btnExpense.classList.remove('active');
        }
    }

    //フォーム送信
    form.addEventListener('submit', (e) => {
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

        //カテゴリの判定
        const type = formData.get('type') || 'expense';
        let category = '';
        if (type === 'income') {
            category = formData.get('category2') || formData.get('category') || 'その他';
        } else {
            category = formData.get('category') || formData.get('category2') || 'その他';
        }

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





