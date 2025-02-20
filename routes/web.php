<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\BrifsController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CommonController;
use App\Http\Controllers\CommercialController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\SmetsController;
use App\Http\Controllers\DealsController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AdminController;

use Chatify\ChatifyMessenger;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;

// Главная страница
Route::get('/', function () {
    return redirect('login/password');
});

// Стандартные маршруты аутентификации
Auth::routes();

// Группа маршрутов с префиксом и middleware для аутентификации
Route::middleware('auth')->group(function () {
    // Маршрут для домашней страницы
    Route::get('/home', [HomeController::class, 'index'])->name('home');

    // Маршрут для создания нового тикета
    Route::get('/support', [SupportController::class, 'index'])->name('support.index');
    Route::post('/support/reply/{ticket}', [SupportController::class, 'reply'])->name('support.reply');
    Route::post('/support/create', [SupportController::class, 'create'])->name('support.create');

    Route::middleware(['auth', 'status:support'])->group(function () {
        Route::get('/support/chats', [SupportController::class, 'chats'])->name('support.chats');
        Route::get('/support/chat/{id}', [SupportController::class, 'chat'])->name('support.chat');
        Route::post('/support/chat/{id}/reply', [SupportController::class, 'reply'])->name('support.chat.reply');
    });

    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    // Просмотр профиля другого пользователя
    Route::get('/profile/view/{id}', [ProfileController::class, 'viewProfile'])->name('profile.view');

    // Обновление аватара
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.update_avatar');

    // Отправка и подтверждение кода для смены телефона
    Route::post('/profile/send-code', [ProfileController::class, 'sendVerificationCode'])->name('profile.send-code');
    Route::post('/profile/verify-code', [ProfileController::class, 'verifyCode'])->name('profile.verify-code');

    // Удаление аккаунта
    Route::post('/delete-account', [ProfileController::class, 'deleteAccount'])->name('delete_account');

    // Обновление профиля (старый метод)
    Route::post('/profile/update', [ProfileController::class, 'updateProfile'])->name('profile.update');

    // Обновление профиля (новый метод: имя, email, пароль)
    Route::post('/profile/update-all', [ProfileController::class, 'updateProfileAll'])->name('profile.update_all');

    // Изменение пароля (старый метод)
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // Маршрут для брифов
    Route::get('/brifs', [BrifsController::class, 'index'])->name('brifs.index');
    Route::post('/brifs/store', [BrifsController::class, 'store'])->name('brifs.store');
    Route::delete('/brifs/{brif}', [App\Http\Controllers\BrifsController::class, 'destroy'])->name('brifs.destroy');

    // Маршрут для брифов ОБЩИЙ
    Route::get('/common/questions/{id}/{page}', [CommonController::class, 'questions'])
        ->name('common.questions');
    Route::post('/common/questions/{id}/{page}', [CommonController::class, 'saveAnswers'])
        ->name('common.saveAnswers');

    Route::get('/common/create', [BrifsController::class, 'common_create'])->name('common.create');
    Route::post('/common', [BrifsController::class, 'common_store'])->name('common.store');
    Route::get('/common/{id}', [BrifsController::class, 'common_show'])->name('common.show');

    Route::get('/commercial/questions/{id}/{page}', [CommercialController::class, 'questions'])->name('commercial.questions');
    Route::post('/commercial/questions/{id}/{page}', [CommercialController::class, 'saveAnswers'])->name('commercial.saveAnswers');

    Route::get('/commercial/create', [BrifsController::class, 'commercial_create'])->name('commercial.create');
    Route::post('/commercial', [BrifsController::class, 'commercial_store'])->name('commercial.store');
    Route::get('/commercial/{id}', [BrifsController::class, 'commercial_show'])->name('commercial.show');
    Route::get('/refresh-csrf', function () {
        session()->regenerateToken(); // Генерируем новый токен
        return response()->json(['token' => csrf_token()]);
    })->name('csrf.refresh');
    
    // Сделка для пользователя
    Route::get('/deal-user', [DealsController::class, 'dealUser'])->name('deal.user');
});

Route::middleware(['auth', 'status:partner'])->group(function () {
    Route::get('/estimate', [SmetsController::class, 'estimate'])->name('estimate');
    Route::get('/estimate/service', [SmetsController::class, 'allService'])->name('estimate.service');
    Route::get('/estimate/default', [SmetsController::class, 'defaultValueBD'])->name('estimate.default');
    Route::get('/estimate/create/{id?}', [SmetsController::class, 'createEstimate'])->name('estimate.create');
    Route::post('/estimate/createcoefs', [SmetsController::class, 'addCoefs'])->name('estimate.createcoefs');
    Route::post('/estimate/save/{id?}', [SmetsController::class, 'saveEstimate'])->name('estimate.save');
    Route::post('/estimate/pdf/{id?}', [SmetsController::class, 'savePdf'])->name('estimate.pdf');
    Route::post('/estimate/del/{id}', [SmetsController::class, 'delEstimate'])->name('estimate.del');
    Route::post('/estimate/chenge/{id}/{slot}/{value}/{type}/{stage}', [SmetsController::class, 'changeService'])->name('estimate.change');
    Route::get('/estimate/preview', [SmetsController::class, 'previewEstimate'])->name('estimate.preview');
    Route::get('/estimate/defaultServices', [SmetsController::class, 'defaultServices'])->name('estimate.defaultServices');
    Route::get('/estimate/copy/{id?}', [SmetsController::class, 'copyEstimate'])->name('estimate.copy');
    Route::get('/estimate/change-estimate/{id?}', [SmetsController::class, 'changeEstimate'])->name('estimate.changeEstimate');
});

Route::middleware(['auth', 'status:coordinator,admin,partner'])->group(function () {
    Route::get('/deal-cardinator', [DealsController::class, 'dealCardinator'])->name('deal.cardinator');
    Route::get('/deals/create', [DealsController::class, 'createDeal'])->name('deals.create');
    Route::post('/deal/store', [DealsController::class, 'storeDeal'])->name('deals.store');

    Route::put('/deal/update/{id}', [DealsController::class, 'updateDeal'])->name('deal.update');
    // ...

// ...

});
// ...
Route::middleware(['auth', 'status:coordinator,admin'])->group(function () {
    // Прочие маршруты админа/координатора...
    Route::get('/deal/change-logs', [DealsController::class, 'changeLogs'])->name('deal.change_logs');
    // Новый маршрут для логов конкретной сделки:
    Route::get('/deal/{deal}/change-logs', [DealsController::class, 'changeLogsForDeal'])->name('deal.change_logs.deal');
});
// ...

Route::middleware(['auth'])->group(function () {
    Route::get('/chats', [ChatController::class, 'index'])->name('chats.index');

    Route::prefix('/chats/{type}/{id}')->group(function () {
        Route::get('/messages', [ChatController::class, 'chatMessages'])->name('chats.messages');
        Route::post('/messages', [ChatController::class, 'sendMessage'])->name('chats.sendMessage');
        Route::post('/new-messages', [ChatController::class, 'getNewMessages'])->name('chats.getNewMessages');
        Route::post('/mark-read', [ChatController::class, 'markMessagesAsRead'])->name('chats.markRead');
        Route::post('/search', [ChatController::class, 'searchMessages'])->name('chats.searchMessages');
        Route::post('/typing', [ChatController::class, 'typingIndicator'])->name('chats.typingIndicator');
    });

    Route::get('/chats/unread-counts', [ChatController::class, 'getUnreadCounts'])->name('chats.unreadCounts');
});

Route::middleware(['auth', 'status:admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index'])->name('admin');
    Route::get('/admin/users', [AdminController::class, 'user_admin'])->name('admin.users');
    Route::put('/admin/users/{id}', [AdminController::class, 'update']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'destroy']);
    Route::get('/admin/users/{id}/briefs', [AdminController::class, 'userBriefs'])->name('user.briefs');
    Route::get('/admin/briefs/{id}', [AdminController::class, 'edit'])->name('admin.brief.edit');
    Route::put('/admin/briefs/{id}', [AdminController::class, 'update_brif'])->name('admin.brief.update_brif');
    Route::get('/admin/brief/editCommon/{id}', [AdminController::class, 'editCommonBrief'])->name('admin.brief.editCommon');
    Route::post('/admin/brief/updateCommon/{id}', [AdminController::class, 'updateCommonBrief'])->name('admin.brief.updateCommon');
    Route::get('admin/brief/commercial/{id}/edit', [AdminController::class, 'editCommercialBrief'])->name('admin.brief.editCommercial');
    Route::put('admin/brief/commercial/{id}', [AdminController::class, 'updateCommercialBrief'])->name('admin.brief.updateCommercial');
});

Route::get('/register_by_deal/{token}', [AuthController::class, 'registerByDealLink'])->name('register_by_deal');
Route::post('/complete-registration-by-deal/{token}', [AuthController::class, 'completeRegistrationByDeal'])->name('auth.complete_registration_by_deal');
Route::get('', [AuthController::class, 'showLoginFormByPassword'])->name('login.password');
Route::post('login/password', [AuthController::class, 'loginByPassword'])->name('login.password.post');
Route::get('login/code', [AuthController::class, 'showLoginFormByCode'])->name('login.code');
Route::post('login/code', [AuthController::class, 'loginByCode'])->name('login.code.post');
Route::post('/send-code', [AuthController::class, 'sendCode'])->name('send.code');
Route::get('register', [AuthController::class, 'showRegistrationForm'])->name('register');
Route::post('register', [AuthController::class, 'register'])->name('register.post');
Route::match(['GET', 'POST'], '/logout', [AuthController::class, 'logout'])->name('logout');

if (app()->environment('production')) {
    URL::forceScheme('https');
}
