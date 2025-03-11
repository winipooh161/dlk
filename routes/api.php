<?php
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Notification routes
Route::middleware('auth:sanctum')->group(function() {
    Route::get('/notifications', [NotificationController::class, 'getNotifications']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
});

// Fallback route for auth-protected API resources
Route::get('/notifications', [NotificationController::class, 'getNotifications']);
