import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let timer: ReturnType<typeof setInterval> | undefined;
let remainingSeconds = 0;
let isRunning = false;
let isWindowFocused = true;

export function activate(context: vscode.ExtensionContext) {
	statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		100
	);

	statusBarItem.text = '🐱 Cat Guardian';
	statusBarItem.tooltip = 'Iniciar temporizador de Cat Guardian';
	statusBarItem.command = 'cat-guardian.startTimer';
	statusBarItem.show();

	const disposable = vscode.commands.registerCommand('cat-guardian.startTimer', () => {
		if (isRunning) {
			stopTimer();
			vscode.window.showInformationMessage('Cat Guardian detenido 🐱');
			return;
		}

		startTimer(context);
	});

	const windowStateDisposable = vscode.window.onDidChangeWindowState((state) => {
		isWindowFocused = state.focused;

		if (isRunning) {
			updateStatusBar();
		}
	});

	context.subscriptions.push(statusBarItem);
	context.subscriptions.push(disposable);
	context.subscriptions.push(windowStateDisposable);

	const config = vscode.workspace.getConfiguration('catGuardian');
	const autoStart = config.get<boolean>('autoStart', false);

	if (autoStart) {
		startTimer(context);
	}
}

function startTimer(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration('catGuardian');
	const workMinutes = config.get<number>('workMinutes', 5);

	remainingSeconds = Math.round(workMinutes * 60);

	updateStatusBar();

	timer = setInterval(() => {
		if (!isWindowFocused) {
			return;
		}

		remainingSeconds--;

		updateStatusBar();

		if (remainingSeconds <= 0) {
			finishTimer(context);
		}
	}, 1000);

	vscode.window.showInformationMessage('Cat Guardian iniciado 🐱');
}

function stopTimer() {
	isRunning = false;

	if (timer) {
		clearInterval(timer);
		timer = undefined;
	}

	statusBarItem.text = '🐱 Cat Guardian';
	statusBarItem.tooltip = 'Iniciar temporizador de Cat Guardian';
}

function finishTimer(context: vscode.ExtensionContext) {
	stopTimer();

	vscode.window.showInformationMessage('Tiempo terminado. Hora de descansar 🐱');

	openBreakScreen(context);
}

function updateStatusBar() {
	const minutes = Math.floor(remainingSeconds / 60);
	const seconds = remainingSeconds % 60;

	const formattedMinutes = String(minutes).padStart(2, '0');
	const formattedSeconds = String(seconds).padStart(2, '0');

	if (!isWindowFocused && isRunning) {
		statusBarItem.text = `🐱 Pausado ${formattedMinutes}:${formattedSeconds}`;
		statusBarItem.tooltip = 'Cat Guardian está pausado porque VS Code no está enfocado.';
		return;
	}

	statusBarItem.text = `🐱 ${formattedMinutes}:${formattedSeconds}`;
	statusBarItem.tooltip = 'Cat Guardian está contando. Haz clic para detenerlo.';
}

function openBreakScreen(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration('catGuardian');
	const breakSeconds = config.get<number>('breakSeconds', 30);
	const panel = vscode.window.createWebviewPanel(
		'catGuardianBreak',
		'Cat Guardian Break',
		vscode.ViewColumn.One,
		{
			enableScripts: true
		}
	);

	panel.webview.html = getBreakHtml(breakSeconds);

	panel.webview.onDidReceiveMessage((message) => {
		if (message.command === 'breakFinished') {
			panel.dispose();

			vscode.window.showInformationMessage('Descanso terminado. Nuevo ciclo iniciado 🐱');

			startTimer(context);
		}
	});
}

function getBreakHtml(breakSeconds: number): string {
	return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Cat Guardian Break</title>
      <style>
        body {
          margin: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111827;
          color: #ffffff;
          font-family: Arial, sans-serif;
        }

        .card {
          text-align: center;
          padding: 40px;
          border-radius: 24px;
          background: #1f2937;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
          max-width: 520px;
        }

        .cat {
          font-size: 90px;
          margin-bottom: 20px;
        }

        h1 {
          font-size: 32px;
          margin: 0 0 12px;
        }

        p {
          font-size: 16px;
          opacity: 0.85;
          margin: 0;
        }

        .timer {
          font-size: 52px;
          font-weight: bold;
          margin-top: 28px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="cat">🐱</div>
        <h1>Hora de descansar</h1>
        <p>El gato guardián recomienda una pausa breve.</p>
        <div class="timer" id="timer">00:30</div>
      </div>

      <script>
        const vscode = acquireVsCodeApi();
        let remaining = ${breakSeconds};

        function updateTimer() {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;

          document.getElementById('timer').textContent =
            String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

          if (remaining <= 0) {
            vscode.postMessage({
              command: 'breakFinished'
            });
            return;
          }

          remaining--;
          setTimeout(updateTimer, 1000);
        }

        updateTimer();
      </script>
    </body>
    </html>
  `;
}

export function deactivate() {
	if (timer) {
		clearInterval(timer);
	}
}