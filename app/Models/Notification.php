<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;
    
    // Указываем имя таблицы явно
    protected $table = 'custom_notifications';

    protected $fillable = [
        'user_id',
        'title',
        'body',
        'type',
        'read',
        'data',
        'url'
    ];

    protected $casts = [
        'read' => 'boolean',
        'data' => 'array',
    ];

    /**
     * Get the user that owns the notification
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a new notification
     *
     * @param int $userId
     * @param string $title
     * @param string $body
     * @param string $type
     * @param array $data
     * @param string|null $url
     * @return Notification
     */
    public static function create_notification($userId, $title, $body, $type = 'general', $data = [], $url = null)
    {
        return self::create([
            'user_id' => $userId,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'read' => false,
            'data' => $data,
            'url' => $url
        ]);
    }
}
