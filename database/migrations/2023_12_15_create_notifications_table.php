<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Имя класса должно соответствовать стандартам наименования миграций Laravel
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('type')->default('general');
            $table->boolean('read')->default(false);
            $table->json('data')->nullable();
            $table->string('url')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'read', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
