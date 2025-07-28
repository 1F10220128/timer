let internalCount = 0; // 内部で進むカウント (0から増加)
const countDisplay = document.getElementById('count');
const appContainer = document.getElementById('app-container');
let timerId = null; // setIntervalのIDを保持するための変数 (nullの場合は停止中)

// アラーム音用のAudioContextとOscillatorを作成
let audioContext;
let oscillator;

function playAlarm() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
    }
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // 正弦波
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // 440Hz
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
    oscillator.onended = () => {
        oscillator = null;
    };
}

// 画面表示を更新する関数
function updateDisplayCount() {
    // 内部カウントが0の場合は100と表示
    // 内部カウントが1～100の場合は、100から内部カウントを引いた値を表示
    // 例: internalCountが1なら99、internalCountが90なら10、internalCountが99なら1
    // internalCountが100の時に0にリセットされるため、この計算で問題なし
    let displayValue = 100 - internalCount;
    if (internalCount === 0) { // 初期状態または100でリセットされた直後
        displayValue = 100;
    }
    countDisplay.textContent = displayValue;
}

function incrementInternalCount() {
    internalCount++; // 内部カウントを1増やす
    updateDisplayCount(); // 画面表示を更新

    if (internalCount === 90) {
        playAlarm(); // 90になったらアラームを鳴らす
        console.log("内部カウントが90です！アラーム音を鳴らします。");
    }

    if (internalCount === 100) {
        stopCounting(); // 100になったらタイマーを停止
        internalCount = 0; // 内部カウントを0にリセット
        updateDisplayCount(); // 画面表示を更新 (100に戻る)
        console.log("内部カウントが100に達したためリセットされ、停止しました。");
    }
}

function startCounting() {
    if (timerId === null) { // タイマーが停止中の場合のみ開始
        internalCount = 1; // 内部カウントを1からスタート
        updateDisplayCount(); // 画面表示を更新
        timerId = setInterval(incrementInternalCount, 1000); // 1秒ごとにカウントアップを開始
    }
}

function stopCounting() {
    if (timerId !== null) {
        clearInterval(timerId); // タイマーを停止
        timerId = null; // IDをクリア
    }
}

// 画面のどこかをタップしたときのイベントリスナー
appContainer.addEventListener('click', () => {
    // 現在の状況が「カウントが0で停止中」かどうかで処理を分岐
    if (internalCount === 0 && timerId === null) {
        // カウントが0で停止中の場合、カウントを開始する
        startCounting();
    } else {
        // カウントが1以上で自動カウントアップ中の場合、ページをリロードする
        // または100カウントで0になって停止しているが、まだクリックされていない状態
        window.location.reload();
    }
});

// 初期表示を設定
updateDisplayCount(); // アプリ起動時は100と表示されます