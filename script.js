let internalCount = 0; // 内部で進むカウント (0から増加)
const countDisplay = document.getElementById('count');
const appContainer = document.getElementById('app-container');
let timerId = null; // setIntervalのIDを保持するための変数 (nullの場合は停止中)

// AudioContextとOscillatorを準備。ユーザー操作時に初期化する
let audioContext = null;
let oscillator = null;

// AudioContextを初期化し、音を鳴らせる状態にする関数
// ユーザーの最初のタップ時に呼び出す
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // iPhoneでAudioContextをアクティブにするための非常に短いダミー再生
        // これがないと、以降の自動再生がブロックされる場合がある
        const buffer = audioContext.createBuffer(1, 1, 22050); // 短いバッファ
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        source.stop(0.001); // 0.001秒後に停止（ほぼ聞こえない）
        console.log("AudioContextをアクティブにしました。");
    }
}

// アラーム音を再生する関数
function playAlarm() {
    // AudioContextが確実に初期化されていることを確認
    if (!audioContext) {
        // 万が一初期化されていなければ、ここで初期化を試みる
        initializeAudioContext();
        if (!audioContext) { // ここでも初期化されていなければ、音は鳴らせない
            console.warn("AudioContextが初期化されていません。アラーム音を再生できません。");
            return;
        }
    }

    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
    }
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // 正弦波 (sine, square, sawtooth, triangle など)
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // 周波数 (Hz)。今回は880Hzに設定
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.5); // 0.3秒後に停止（短くして安定性を高める）

    oscillator.onended = () => {
        oscillator = null;
    };
}

// 画面表示を更新する関数
function updateDisplayCount() {
    let displayValue = 100 - internalCount;
    if (internalCount === 0) {
        displayValue = 100;
    }
    countDisplay.textContent = displayValue;
}

function incrementInternalCount() {
    internalCount++;
    updateDisplayCount();

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
        initializeAudioContext(); // AudioContextを初期化
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
