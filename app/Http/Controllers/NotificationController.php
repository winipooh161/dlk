<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Retrieve notifications for current user
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getNotifications(Request $request)
    {
        $userId = $request->input('user_id', Auth::id());
        $since = $request->input('since', 0);
        $limit = $request->input('limit', 20);
        
        try {
            $user = User::findOrFail($userId);
            
            $notifications = Notification::where('user_id', $userId)
                ->where('created_at', '>', date('Y-m-d H:i:s', $since / 1000))
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();
            
            // Log for debugging
            Log::info('Fetched notifications', [
                'user_id' => $userId,
                'since' => $since,
                'count' => $notifications->count()
            ]);
            
            return response()->json([
                'success' => true,
                'notifications' => $notifications,
                'unread_count' => Notification::where('user_id', $userId)
                    ->where('read', false)
                    ->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching notifications: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => $userId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Mark notification as read
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(Request $request)
    {
        $notificationId = $request->input('notification_id');
        
        try {
            $notification = Notification::findOrFail($notificationId);
            
            // Check if the notification belongs to the current user
            if ($notification->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $notification->read = true;
            $notification->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);
        } catch (\Exception $e) {
            Log::error('Error marking notification as read: '.$e->getMessage(), [
                'exception' => $e,
                'notification_id' => $notificationId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error marking notification as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Mark all notifications as read for current user
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAllAsRead()
    {
        try {
            Notification::where('user_id', Auth::id())
                ->where('read', false)
                ->update(['read' => true]);
            
            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read'
            ]);
        } catch (\Exception $e) {
            Log::error('Error marking all notifications as read: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => Auth::id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error marking all notifications as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
