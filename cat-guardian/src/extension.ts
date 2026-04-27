import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let timer: ReturnType<typeof setInterval> | undefined;
let remainingSeconds = 0;
let isRunning = false;

const WORK_MINUTES = 5;

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

    startTimer();
  });

  context.subscriptions.push(statusBarItem);
  context.subscriptions.push(disposable);
}

function startTimer() {
  remainingSeconds = WORK_MINUTES * 60;
  isRunning = true;

  updateStatusBar();

  timer = setInterval(() => {
    remainingSeconds--;

    updateStatusBar();

    if (remainingSeconds <= 0) {
      finishTimer();
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

function finishTimer() {
  stopTimer();

  vscode.window.showInformationMessage('Tiempo terminado. Hora de descansar 🐱');
}

function updateStatusBar() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  statusBarItem.text = `🐱 ${formattedMinutes}:${formattedSeconds}`;
  statusBarItem.tooltip = 'Cat Guardian está contando. Haz clic para detenerlo.';
}

export function deactivate() {
  if (timer) {
    clearInterval(timer);
  }
}