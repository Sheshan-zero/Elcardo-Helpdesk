<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\KnowledgeArticle;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeBaseController extends Controller
{
    /**
     * Display a listing of KB articles.
     */
    public function index(Request $request): Response
    {
        $query = KnowledgeArticle::with(['module:id,name', 'creator:id,name'])
            ->withCount('views');

        // Filter by module
        if ($request->filled('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        // Filter by published status
        if ($request->filled('status')) {
            if ($request->status === 'published') {
                $query->where('is_published', true);
            } elseif ($request->status === 'draft') {
                $query->where('is_published', false);
            }
        }

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $articles = $query->orderBy('updated_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('SuperAdmin/KnowledgeBase/Index', [
            'articles' => $articles,
            'modules' => Module::active()->get(['id', 'name']),
            'filters' => $request->only(['module_id', 'status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new article.
     */
    public function create(): Response
    {
        return Inertia::render('SuperAdmin/KnowledgeBase/Create', [
            'modules' => Module::active()->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created article.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:knowledge_articles,slug',
            'module_id' => 'nullable|exists:modules,id',
            'summary' => 'required|string|max:500',
            'body' => 'required|string',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $validated['created_by_user_id'] = Auth::id();
        $validated['updated_by_user_id'] = Auth::id();

        $article = KnowledgeArticle::create($validated);

        AuditLog::record('created', $article);

        return redirect()->route('superadmin.kb.index')
            ->with('success', "Knowledge article '{$article->title}' created successfully!");
    }

    /**
     * Display the specified article.
     */
    public function show(KnowledgeArticle $article): Response
    {
        $article->load(['module', 'creator', 'updater'])
            ->loadCount('views');

        return Inertia::render('SuperAdmin/KnowledgeBase/Show', [
            'article' => $article,
        ]);
    }

    /**
     * Show the form for editing the specified article.
     */
    public function edit(KnowledgeArticle $article): Response
    {
        return Inertia::render('SuperAdmin/KnowledgeBase/Edit', [
            'article' => $article,
            'modules' => Module::active()->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified article.
     */
    public function update(Request $request, KnowledgeArticle $article): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:knowledge_articles,slug,' . $article->id,
            'module_id' => 'nullable|exists:modules,id',
            'summary' => 'required|string|max:500',
            'body' => 'required|string',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        // Update slug if title changed
        if ($validated['title'] !== $article->title && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $validated['updated_by_user_id'] = Auth::id();

        $article->update($validated);

        AuditLog::record('updated', $article, ['changes' => $article->getChanges()]);

        return redirect()->route('superadmin.kb.index')
            ->with('success', "Knowledge article '{$article->title}' updated successfully!");
    }

    /**
     * Remove the specified article.
     */
    public function destroy(KnowledgeArticle $article): RedirectResponse
    {
        $title = $article->title;
        $articleCopy = clone $article;
        $article->delete();

        AuditLog::record('deleted', $articleCopy);

        return redirect()->route('superadmin.kb.index')
            ->with('success', "Knowledge article '{$title}' deleted successfully!");
    }

    /**
     * Toggle published status.
     */
    public function togglePublished(KnowledgeArticle $article): RedirectResponse
    {
        $article->is_published = !$article->is_published;
        $article->updated_by_user_id = Auth::id();
        $article->save();

        AuditLog::record($article->is_published ? 'published' : 'unpublished', $article);

        $status = $article->is_published ? 'published' : 'unpublished';
        
        return back()->with('success', "Article {$status} successfully!");
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(KnowledgeArticle $article): RedirectResponse
    {
        $article->is_featured = !$article->is_featured;
        $article->updated_by_user_id = Auth::id();
        $article->save();

        AuditLog::record($article->is_featured ? 'featured' : 'unfeatured', $article);

        $status = $article->is_featured ? 'featured' : 'unfeatured';
        
        return back()->with('success', "Article {$status} successfully!");
    }
}
