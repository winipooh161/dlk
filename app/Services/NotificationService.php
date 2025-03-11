<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send a notification to a user
     *
     * @param int|User $user User ID or User model
     * @param string $title Notification title
     * @param string $body Notification body
     * @param string $type Notification type
     * @param array $data Additional data
     * @param string|null $url URL to open when notification is clicked
     * @return Notification|bool
     */
    public static function send($user, string $title, string $body, string $type = 'general', array $data = [], ?string $url = null)
    {
        try {
            // Get user ID
            $userId = $user instanceof User ? $user->id : $user;
            
            // Create notification record
            $notification = Notification::create_notification(
                $userId,
                $title,
                $body,
                $type,
                $data,
                $url
            );
            
            // Log for debugging
            Log::info('Notification created', [
                'user_id' => $userId,
                'title' => $title,
                'type' => $type
            ]);
            
            return $notification;
        } catch (\Exception $e) {
            Log::error('Error sending notification: ' . $e->getMessage(), [
                'exception' => $e,
                'user' => $user instanceof User ? $user->id : $user,
                'title' => $title
            ]);
            
            return false;
        }
    }
    
    /**
     * Send notification to multiple users
     *
     * @param array $users Array of user IDs or User models
     * @param string $title Notification title
     * @param string $body Notification body
     * @param string $type Notification type
     * @param array $data Additional data
     * @param string|null $url URL to open when notification is clicked
     * @return array Created notifications
     */
    public static function sendMultiple(array $users, string $title, string $body, string $type = 'general', array $data = [], ?string $url = null)
    {
        $notifications = [];
        
        foreach ($users as $user) {
            $notification = self::send($user, $title, $body, $type, $data, $url);
            if ($notification) {
                $notifications[] = $notification;
            }
        }
        
        return $notifications;
    }
    
    /**
     * Send a chat message notification
     *
     * @param int|User $user User receiving the notification
     * @param string $senderName Name of message sender
     * @param string $messagePreview Preview of the message
     * @param int $chatId Chat ID
     * @param string|null $url URL to the chat
     * @return Notification|bool
     */
    public static function sendChatMessageNotification($user, string $senderName, string $messagePreview, int $chatId, ?string $url = null)
    {
        $title = "Новое сообщение от {$senderName}";
        $body = $messagePreview;
        $type = 'chat_message';
        $data = [
            'chat_id' => $chatId,
            'sender' => $senderName
        ];
        
        // Default URL to chat if not provided
        if (!$url) {
            $url = "/chats?active_chat={$chatId}";
        }
        
        return self::send($user, $title, $body, $type, $data, $url);
    }
    
    /**
     * Send a deal update notification
     *
     * @param int|User $user User receiving the notification
     * @param int $dealId ID of the deal
     * @param string $dealName Name of the deal
     * @param string $updateType Type of update
     * @param string|null $url URL to the deal
     * @return Notification|bool
     */
    public static function sendDealUpdateNotification($user, int $dealId, string $dealName, string $updateType, ?string $url = null)
    {
        $title = "Обновление сделки";
        $body = "Сделка \"{$dealName}\" была обновлена. {$updateType}";
        $type = 'deal_update';
        $data = [
            'deal_id' => $dealId,
            'update_type' => $updateType
        ];
        
        // Default URL to deal if not provided
        if (!$url) {
            $url = "/deals/{$dealId}";
        }
        
        return self::send($user, $title, $body, $type, $data, $url);
    }
    
    /**
     * Send a system notification
     *
     * @param int|User $user User receiving the notification
     * @param string $title Notification title
     * @param string $body Notification body
     * @param string|null $url URL to open
     * @return Notification|bool
     */
    public static function sendSystemNotification($user, string $title, string $body, ?string $url = null)
    {
        return self::send($user, $title, $body, 'system', [], $url);
    }
}
