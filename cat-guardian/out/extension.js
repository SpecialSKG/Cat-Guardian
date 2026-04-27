"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
let statusBarItem;
let timer;
let remainingSeconds = 0;
let isRunning = false;
const WORK_MINUTES = 5;
function activate(context) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
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
function deactivate() {
    if (timer) {
        clearInterval(timer);
    }
}
//# sourceMappingURL=extension.js.map