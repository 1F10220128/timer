let count = 0;
const countDisplay = document.getElementById('count');
const appContainer = document.getElementById('app-container');
let timerId = null; // setIntervalのIDを保持するための変数 (nullの場合は停止中)

// AudioContextとOscillatorの準備をグローバルで行う
// iPhoneで音を鳴らすには、最初のユーザー操作時にAudioContextを初期化するのが確実
let audioContext;
let oscillator;

// アラーム音を再生する関数
function playAlarm() {
    // AudioContextがまだ作成されていなければ、ここで作成する
    // (ユーザーの最初のタップ後に呼び出されると、iPhoneでも音が出やすくなる)
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // 既存のオシレーターがあれば停止して破棄
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
    }

    // 新しいオシレーターを作成
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // 正弦波 (sine, square, sawtooth, triangle など)
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // 周波数 (Hz)。例: 440 (ラ), 880 (高いラ)
    oscillator.connect(audioContext.destination);

    // 音を再生
    oscillator.start();
    // 0.3秒後に音を停止 (短くしてiPhoneでの再生をより確実に)
    oscillator.stop(audioContext.currentTime + 0.3);

    // 音が停止した後にオシレーターをリセット
    oscillator.onended = () => {
        oscillator = null;
    };
}

function updateCountDisplay() {
    countDisplay.textContent = count;
}

function incrementCount() {
    count++;
    updateCountDisplay();

    if (count === 90) {
        playAlarm(); // 90になったらアラームを鳴らす
        console.log("90カウントです！アラーム音を鳴らします。");
    }

    if (count === 100) {
        stopCounting(); // 100になったらタイマーを停止
        count = 0; // 0にリセット
        updateCountDisplay(); // 表示を更新
        console.log("100カウントに達したためリセットされ、停止しました。");
    }
}

function startCounting() {
    if (timerId === null) { // タイマーが停止中の場合のみ開始
        count = 1; // 1からスタート
        updateCountDisplay();
        timerId = setInterval(incrementCount, 1000); // 1秒ごとにカウントアップを開始

        // iPhoneでAudioContextを有効にするためのダミー再生 (初回タップ時のみ)
        if (!audioContext) { // AudioContextがまだ作成されていなければ
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const buffer = audioContext.createBuffer(1, 1, 22050);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
            source.stop(0.001); // 非常に短い音を再生してAudioContextをアクティブにする
            console.log("AudioContextをアクティブにしました。");
        }
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
    if (count === 0 && timerId === null) {
        // カウントが0で停止中の場合、カウントを開始する
        startCounting();
    } else {
        // カウントが1以上で自動カウントアップ中の場合、ページをリロードする
        // または100カウントで0になって停止しているが、まだクリックされていない状態
        window.location.reload();
    }
});

// 初期表示を設定
updateCountDisplay();