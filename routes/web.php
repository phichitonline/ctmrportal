<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\AgencyDocumentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SocWebboardController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TwoFactorAuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SSOLoginController;
use Illuminate\Support\Facades\Route;

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');

    // 2FA Challenge during login
    Route::get('/two-factor-challenge', [TwoFactorAuthController::class, 'showChallenge'])->name('two-factor.challenge');
    Route::post('/two-factor-challenge', [TwoFactorAuthController::class, 'verifyChallenge'])->name('two-factor.verify');
    Route::post('/two-factor-cancel', [TwoFactorAuthController::class, 'cancelChallenge'])->name('two-factor.cancel');

    #Route::match(['get', 'post'], '/sso/callback', [SSOLoginController::class, 'handle'])->name('sso.callback');
    // MOPH Provider ID Callback
    Route::match(['get', 'post'], '/auth/moph/callback', [SSOLoginController::class, 'handle'])->name('auth.moph.callback');
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/sync', [DashboardController::class, 'syncLive'])->name('dashboard.sync');
    Route::get('/about', [AboutController::class, 'index'])->name('about');
    Route::get('/team', [TeamController::class, 'index'])->name('team');

    // SOC Webboard & Operations Log
    Route::prefix('webboard')->name('webboard.')->group(function () {
        Route::get('/', [SocWebboardController::class, 'index'])->name('index');
        Route::post('/', [SocWebboardController::class, 'store'])->name('store');
        Route::get('/{topic}', [SocWebboardController::class, 'show'])->name('show');
        Route::put('/{topic}', [SocWebboardController::class, 'update'])->name('update');
        Route::delete('/{topic}', [SocWebboardController::class, 'destroy'])->name('destroy');
        Route::patch('/{topic}/status', [SocWebboardController::class, 'updateStatus'])->name('status');
        Route::patch('/{topic}/pin', [SocWebboardController::class, 'togglePin'])->name('pin');
        Route::post('/{topic}/comments', [SocWebboardController::class, 'storeComment'])->name('comments.store');
        Route::delete('/comments/{comment}', [SocWebboardController::class, 'destroyComment'])->name('comments.destroy');
        Route::patch('/comments/{comment}/solution', [SocWebboardController::class, 'toggleSolution'])->name('comments.solution');
    });

    // Agency Document & Step Timeline Management
    Route::prefix('agency-docs')->name('agency-docs.')->group(function () {
        Route::get('/', [AgencyDocumentController::class, 'index'])->name('index');
        Route::post('/', [AgencyDocumentController::class, 'store'])->name('store');
        Route::get('/{task}', [AgencyDocumentController::class, 'show'])->name('show');
        Route::put('/{task}', [AgencyDocumentController::class, 'update'])->name('update');
        Route::delete('/{task}', [AgencyDocumentController::class, 'destroy'])->name('destroy');

        // Steps
        Route::post('/{task}/steps', [AgencyDocumentController::class, 'storeStep'])->name('steps.store');
        Route::put('/steps/{step}', [AgencyDocumentController::class, 'updateStep'])->name('steps.update');
        Route::delete('/steps/{step}', [AgencyDocumentController::class, 'destroyStep'])->name('steps.destroy');

        // Attachments (Upload, Download, Delete)
        Route::post('/steps/{step}/attachments', [AgencyDocumentController::class, 'uploadStepAttachment'])->name('attachments.upload');
        Route::get('/attachments/{attachment}/download', [AgencyDocumentController::class, 'downloadAttachment'])->name('attachments.download');
        Route::delete('/attachments/{attachment}', [AgencyDocumentController::class, 'destroyAttachment'])->name('attachments.destroy');
    });

    // 2FA Security Settings for Authenticated User
    Route::get('/security/two-factor', [TwoFactorAuthController::class, 'showSettings'])->name('two-factor.settings');
    Route::post('/security/two-factor/confirm', [TwoFactorAuthController::class, 'confirm'])->name('two-factor.confirm');
    Route::delete('/security/two-factor', [TwoFactorAuthController::class, 'disable'])->name('two-factor.disable');
    Route::post('/security/two-factor/recovery-codes', [TwoFactorAuthController::class, 'regenerateRecoveryCodes'])->name('two-factor.recovery-codes');

    // Admin-only User Management
    Route::middleware('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::patch('/users/{user}/toggle', [UserController::class, 'toggleStatus'])->name('users.toggle');
        Route::post('/users/{user}/reset-2fa', [UserController::class, 'resetTwoFactor'])->name('users.reset-2fa');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});
