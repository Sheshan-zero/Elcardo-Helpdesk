<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class KnowledgeArticle extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'module_id',
        'summary',
        'body',
        'is_published',
        'is_featured',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (KnowledgeArticle $article) {
            if (empty($article->slug)) {
                $article->slug = Str::slug($article->title);
            }
        });

        static::updating(function (KnowledgeArticle $article) {
            if ($article->isDirty('title') && empty($article->slug)) {
                $article->slug = Str::slug($article->title);
            }
        });
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }

    public function views(): HasMany
    {
        return $this->hasMany(KnowledgeArticleView::class, 'article_id');
    }

    /**
     * Scope to get only published articles
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope to get featured articles
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->where('is_published', true);
    }

    /**
     * Scope to search articles by keyword
     */
    public function scopeSearch($query, $keyword)
    {
        return $query->where(function ($q) use ($keyword) {
            $q->where('title', 'like', "%{$keyword}%")
              ->orWhere('summary', 'like', "%{$keyword}%")
              ->orWhere('body', 'like', "%{$keyword}%");
        });
    }

    /**
     * Get view count for this article
     */
    public function getViewCountAttribute(): int
    {
        return $this->views()->count();
    }

    /**
     * Record a view for this article
     */
    public function recordView(?int $userId = null): void
    {
        KnowledgeArticleView::create([
            'article_id' => $this->id,
            'user_id' => $userId,
            'viewed_at' => now(),
        ]);
    }
}
