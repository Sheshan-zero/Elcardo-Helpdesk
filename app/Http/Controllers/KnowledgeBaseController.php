<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeArticle;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeBaseController extends Controller
{
    /**
     * Display the user-facing KB portal.
     */
    public function index(Request $request): Response
    {
        $query = KnowledgeArticle::published()
            ->with('module:id,name')
            ->withCount('views');

        if ($request->filled('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Featured articles first, then by updated_at
        $articles = $query->orderByDesc('is_featured')
            ->orderByDesc('updated_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('KnowledgeBase/Index', [
            'articles' => $articles,
            'modules' => Module::active()->get(['id', 'name']),
            'filters' => $request->only(['module_id', 'search']),
        ]);
    }

    /**
     * Display a single KB article.
     */
    public function show(string $slug): Response
    {
        $article = KnowledgeArticle::published()
            ->where('slug', $slug)
            ->with(['module:id,name', 'creator:id,name'])
            ->firstOrFail();

        // Record view
        $article->recordView(Auth::id());

        // Related articles (same module)
        $related = [];
        if ($article->module_id) {
            $related = KnowledgeArticle::published()
                ->where('module_id', $article->module_id)
                ->where('id', '!=', $article->id)
                ->limit(3)
                ->get(['id', 'title', 'slug', 'summary']);
        }

        return Inertia::render('KnowledgeBase/Show', [
            'article' => $article,
            'related' => $related,
        ]);
    }

    /**
     * API endpoint: suggest KB articles for a given module.
     */
    public function suggestions(Request $request)
    {
        $request->validate(['module_id' => 'required|exists:modules,id']);

        $articles = KnowledgeArticle::published()
            ->where('module_id', $request->module_id)
            ->orderByDesc('is_featured')
            ->limit(3)
            ->get(['id', 'title', 'slug', 'summary']);

        return response()->json($articles);
    }
}
